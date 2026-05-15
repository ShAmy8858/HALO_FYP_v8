import multer from "multer";
import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import {
  hospitalApplications,
  hospitalDocuments,
  hospitals,
  platformSettings,
  users,
} from "../../db/schema";
import { validate } from "../../middleware/validate";
import { auditLog } from "../../services/audit.service";
import { uploadHospitalDocument } from "../../services/upload.service";
import { ApiError } from "../../utils/api-error";
import { asyncHandler } from "../../utils/async-handler";
import { sendCreated, sendSuccess } from "../../utils/response";
import { createApplicationId, hashPassword } from "../../utils/security";
import { normalizeEmail, splitFullName } from "../../utils/strings";
import { getEffectiveAllowedDocumentMimes, resolveDocumentMimeType } from "../../utils/upload-mime";
import {
  createHospitalApplicationSchema,
  statusParamsSchema,
  submitApplicationParamsSchema,
  updateHospitalApplicationSchema,
  uploadDocumentParamsSchema,
} from "./hospital-applications.schemas";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
/** Full registration: files validated and uploaded before any DB user/application is created. */
const registrationUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
  { name: "registrationCertificate", maxCount: 1 },
  { name: "medicalLicense", maxCount: 1 },
  { name: "additionalDocument", maxCount: 1 },
]);
const allowedStatusesForSubmit = ["DRAFT", "REJECTED"] as const;

async function getSettings() {
  const [settings] = await db.select().from(platformSettings).where(eq(platformSettings.id, "global")).limit(1);
  return settings;
}

function managerNames(body: { managerName?: string; managerFirstName?: string; managerLastName?: string }) {
  if (body.managerFirstName || body.managerLastName) {
    return {
      firstName: body.managerFirstName || "Hospital",
      lastName: body.managerLastName || "Manager",
    };
  }

  return splitFullName(body.managerName || "Hospital Manager");
}

function publicStatus(application: typeof hospitalApplications.$inferSelect) {
  return {
    applicationId: application.applicationId,
    hospitalName: application.hospitalName,
    status: application.status,
    submittedAt: application.submittedAt,
    reviewedAt: application.reviewedAt,
    rejectionReason: application.status === "REJECTED" ? application.rejectionReason : null,
  };
}

router.post(
  "/register-complete",
  registrationUpload,
  asyncHandler(async (req, res) => {
    const fileMap = req.files as Record<string, Express.Multer.File[]> | undefined;
    const regFile = fileMap?.registrationCertificate?.[0];
    const medFile = fileMap?.medicalLicense?.[0];
    const extraFile = fileMap?.additionalDocument?.[0];

    if (!regFile || !medFile) {
      throw new ApiError(
        400,
        "DOCUMENTS_REQUIRED",
        "Registration certificate and medical license files are required.",
      );
    }

    const body = createHospitalApplicationSchema.parse(req.body);
    const settings = await getSettings();
    if (settings && !settings.registrationEnabled) {
      throw new ApiError(403, "REGISTRATION_DISABLED", "Hospital registration is temporarily disabled.");
    }

    const managerEmail = normalizeEmail(body.managerEmail);
    const businessEmail = normalizeEmail(body.businessEmail);

    const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, managerEmail)).limit(1);
    if (existingUser) {
      throw new ApiError(409, "MANAGER_EMAIL_EXISTS", "A user already exists for this manager email.");
    }

    const [existingHospital] = await db
      .select({ id: hospitals.id })
      .from(hospitals)
      .where(eq(hospitals.licenseNumber, body.licenseNumber))
      .limit(1);
    const [existingApplication] = await db
      .select({ id: hospitalApplications.id })
      .from(hospitalApplications)
      .where(eq(hospitalApplications.licenseNumber, body.licenseNumber))
      .limit(1);

    if (existingHospital || existingApplication) {
      throw new ApiError(409, "LICENSE_ALREADY_EXISTS", "This license number is already registered or under review.");
    }

    const maxUploadSizeMb = settings?.maxUploadSizeMb || 5;
    const allowedTypes = getEffectiveAllowedDocumentMimes(settings?.allowedFileTypes);
    const maxBytes = maxUploadSizeMb * 1024 * 1024;

    function validateFile(file: Express.Multer.File): string {
      const resolved = resolveDocumentMimeType(file.mimetype, file.originalname);
      if (!allowedTypes.includes(resolved)) {
        throw new ApiError(400, "UNSUPPORTED_FILE_TYPE", `Unsupported document type for "${file.originalname}".`);
      }
      if (file.size > maxBytes) {
        throw new ApiError(400, "FILE_TOO_LARGE", `Each file must be ${maxUploadSizeMb}MB or smaller.`);
      }
      return resolved;
    }

    const regMime = validateFile(regFile);
    const medMime = validateFile(medFile);
    const extraMime = extraFile ? validateFile(extraFile) : null;

    const regStorage = await uploadHospitalDocument(regFile);
    const medStorage = await uploadHospitalDocument(medFile);
    const extraStorage = extraFile ? await uploadHospitalDocument(extraFile) : null;

    const names = managerNames(body);
    const now = new Date();

    const application = await db.transaction(async (tx) => {
      const [manager] = await tx
        .insert(users)
        .values({
          firstName: names.firstName,
          lastName: names.lastName,
          email: managerEmail,
          contactNumber: body.managerContactNumber,
          passwordHash: await hashPassword(body.managerPassword),
          role: "MANAGER",
          status: "PENDING",
        })
        .returning();

      const [app] = await tx
        .insert(hospitalApplications)
        .values({
          applicationId: createApplicationId(),
          status: "SUBMITTED",
          hospitalName: body.hospitalName,
          facilityType: body.facilityType,
          licenseNumber: body.licenseNumber,
          businessEmail,
          phone: body.phone,
          province: body.province,
          city: body.city,
          postalCode: body.postalCode,
          address: body.address || null,
          managerFirstName: names.firstName,
          managerLastName: names.lastName,
          managerEmail,
          managerContactNumber: body.managerContactNumber,
          managerUserId: manager.id,
          submittedAt: now,
          updatedAt: now,
        })
        .returning();

      await tx.insert(hospitalDocuments).values({
        applicationId: app.id,
        documentType: "registration_certificate",
        originalFileName: regFile.originalname,
        mimeType: regMime,
        sizeBytes: regFile.size,
        storageProvider: regStorage.storageProvider,
        storageKey: regStorage.storageKey,
        secureUrl: regStorage.secureUrl,
      });

      await tx.insert(hospitalDocuments).values({
        applicationId: app.id,
        documentType: "medical_license",
        originalFileName: medFile.originalname,
        mimeType: medMime,
        sizeBytes: medFile.size,
        storageProvider: medStorage.storageProvider,
        storageKey: medStorage.storageKey,
        secureUrl: medStorage.secureUrl,
      });

      if (extraFile && extraStorage && extraMime) {
        await tx.insert(hospitalDocuments).values({
          applicationId: app.id,
          documentType: "additional_verification",
          originalFileName: extraFile.originalname,
          mimeType: extraMime,
          sizeBytes: extraFile.size,
          storageProvider: extraStorage.storageProvider,
          storageKey: extraStorage.storageKey,
          secureUrl: extraStorage.secureUrl,
        });
      }

      return app;
    });

    await auditLog(req, {
      action: "APPLICATION_SUBMITTED",
      userId: application.managerUserId,
      metadata: { applicationId: application.applicationId },
    });

    return sendCreated(res, { application });
  }),
);

router.post(
  "/",
  validate(createHospitalApplicationSchema),
  asyncHandler(async (req, res) => {
    const settings = await getSettings();
    if (settings && !settings.registrationEnabled) {
      throw new ApiError(403, "REGISTRATION_DISABLED", "Hospital registration is temporarily disabled.");
    }

    const body = req.body as ReturnType<typeof createHospitalApplicationSchema.parse>;
    const managerEmail = normalizeEmail(body.managerEmail);
    const businessEmail = normalizeEmail(body.businessEmail);

    const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, managerEmail)).limit(1);
    if (existingUser) {
      throw new ApiError(409, "MANAGER_EMAIL_EXISTS", "A user already exists for this manager email.");
    }

    const [existingHospital] = await db
      .select({ id: hospitals.id })
      .from(hospitals)
      .where(eq(hospitals.licenseNumber, body.licenseNumber))
      .limit(1);
    const [existingApplication] = await db
      .select({ id: hospitalApplications.id })
      .from(hospitalApplications)
      .where(eq(hospitalApplications.licenseNumber, body.licenseNumber))
      .limit(1);

    if (existingHospital || existingApplication) {
      throw new ApiError(409, "LICENSE_ALREADY_EXISTS", "This license number is already registered or under review.");
    }

    const names = managerNames(body);
    const [application] = await db.transaction(async (tx) => {
      const [manager] = await tx
        .insert(users)
        .values({
          firstName: names.firstName,
          lastName: names.lastName,
          email: managerEmail,
          contactNumber: body.managerContactNumber,
          passwordHash: await hashPassword(body.managerPassword),
          role: "MANAGER",
          status: "PENDING",
        })
        .returning();

      const [created] = await tx
        .insert(hospitalApplications)
        .values({
          applicationId: createApplicationId(),
          status: "DRAFT",
          hospitalName: body.hospitalName,
          facilityType: body.facilityType,
          licenseNumber: body.licenseNumber,
          businessEmail,
          phone: body.phone,
          province: body.province,
          city: body.city,
          postalCode: body.postalCode,
          address: body.address || null,
          managerFirstName: names.firstName,
          managerLastName: names.lastName,
          managerEmail,
          managerContactNumber: body.managerContactNumber,
          managerUserId: manager.id,
        })
        .returning();

      return [created];
    });

    await auditLog(req, {
      action: "APPLICATION_DRAFT_CREATED",
      userId: application.managerUserId,
      metadata: { applicationId: application.applicationId },
    });

    return sendCreated(res, { application });
  }),
);

router.patch(
  "/:id",
  validate(submitApplicationParamsSchema, "params"),
  validate(updateHospitalApplicationSchema),
  asyncHandler(async (req, res) => {
    const [application] = await db
      .select()
      .from(hospitalApplications)
      .where(eq(hospitalApplications.id, req.params.id))
      .limit(1);
    if (!application) {
      throw new ApiError(404, "APPLICATION_NOT_FOUND", "Application was not found.");
    }
    if (application.status !== "DRAFT") {
      throw new ApiError(409, "APPLICATION_LOCKED", "Only draft applications can be edited.");
    }

    const body = req.body as ReturnType<typeof updateHospitalApplicationSchema.parse>;
    const names = managerNames({
      managerName: body.managerName,
      managerFirstName: body.managerFirstName,
      managerLastName: body.managerLastName,
    });

    const [updated] = await db
      .update(hospitalApplications)
      .set({
        hospitalName: body.hospitalName ?? application.hospitalName,
        facilityType: body.facilityType ?? application.facilityType,
        licenseNumber: body.licenseNumber ?? application.licenseNumber,
        businessEmail: body.businessEmail ? normalizeEmail(body.businessEmail) : application.businessEmail,
        phone: body.phone ?? application.phone,
        province: body.province ?? application.province,
        city: body.city ?? application.city,
        postalCode: body.postalCode ?? application.postalCode,
        address: body.address ?? application.address,
        managerFirstName: body.managerName || body.managerFirstName ? names.firstName : application.managerFirstName,
        managerLastName: body.managerName || body.managerLastName ? names.lastName : application.managerLastName,
        managerEmail: body.managerEmail ? normalizeEmail(body.managerEmail) : application.managerEmail,
        managerContactNumber: body.managerContactNumber ?? application.managerContactNumber,
        updatedAt: new Date(),
      })
      .where(eq(hospitalApplications.id, application.id))
      .returning();

    await auditLog(req, { action: "APPLICATION_DRAFT_UPDATED", userId: application.managerUserId });
    return sendSuccess(res, { application: updated });
  }),
);

router.post(
  "/:id/documents",
  validate(uploadDocumentParamsSchema, "params"),
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, "FILE_REQUIRED", "Document file is required.");
    }

    const [application] = await db
      .select()
      .from(hospitalApplications)
      .where(eq(hospitalApplications.id, req.params.id))
      .limit(1);
    if (!application) {
      throw new ApiError(404, "APPLICATION_NOT_FOUND", "Application was not found.");
    }
    if (application.status !== "DRAFT") {
      throw new ApiError(409, "APPLICATION_LOCKED", "Only draft applications can accept document uploads.");
    }

    const settings = await getSettings();
    const allowedTypes = getEffectiveAllowedDocumentMimes(settings?.allowedFileTypes);
    const resolvedMime = resolveDocumentMimeType(req.file.mimetype, req.file.originalname);

    if (!allowedTypes.includes(resolvedMime)) {
      throw new ApiError(400, "UNSUPPORTED_FILE_TYPE", "Unsupported document type.");
    }

    const maxUploadSizeMb = settings?.maxUploadSizeMb || 5;
    if (req.file.size > maxUploadSizeMb * 1024 * 1024) {
      throw new ApiError(400, "FILE_TOO_LARGE", `File must be ${maxUploadSizeMb}MB or smaller.`);
    }

    const storage = await uploadHospitalDocument(req.file);
    const [document] = await db
      .insert(hospitalDocuments)
      .values({
        applicationId: application.id,
        documentType: String(req.body.documentType || "verification"),
        originalFileName: req.file.originalname,
        mimeType: resolvedMime,
        sizeBytes: req.file.size,
        storageProvider: storage.storageProvider,
        storageKey: storage.storageKey,
        secureUrl: storage.secureUrl,
      })
      .returning();

    await auditLog(req, {
      action: "APPLICATION_DOCUMENT_UPLOADED",
      userId: application.managerUserId,
      metadata: { applicationId: application.applicationId, documentId: document.id },
    });

    return sendCreated(res, { document });
  }),
);

router.post(
  "/:id/submit",
  validate(submitApplicationParamsSchema, "params"),
  asyncHandler(async (req, res) => {
    const [application] = await db
      .select()
      .from(hospitalApplications)
      .where(eq(hospitalApplications.id, req.params.id))
      .limit(1);
    if (!application) {
      throw new ApiError(404, "APPLICATION_NOT_FOUND", "Application was not found.");
    }
    if (!allowedStatusesForSubmit.includes(application.status as any)) {
      throw new ApiError(409, "APPLICATION_ALREADY_SUBMITTED", "This application has already been submitted.");
    }

    const docs = await db
      .select({ id: hospitalDocuments.id })
      .from(hospitalDocuments)
      .where(eq(hospitalDocuments.applicationId, application.id));
    if (docs.length < 2) {
      throw new ApiError(400, "DOCUMENTS_REQUIRED", "Upload at least two verification documents before submitting.");
    }

    const [submitted] = await db
      .update(hospitalApplications)
      .set({ status: "SUBMITTED", submittedAt: new Date(), updatedAt: new Date() })
      .where(eq(hospitalApplications.id, application.id))
      .returning();

    await auditLog(req, {
      action: "APPLICATION_SUBMITTED",
      userId: application.managerUserId,
      metadata: { applicationId: application.applicationId },
    });

    return sendSuccess(res, { application: submitted });
  }),
);

router.get(
  "/status/:applicationId",
  validate(statusParamsSchema, "params"),
  asyncHandler(async (req, res) => {
    const [application] = await db
      .select()
      .from(hospitalApplications)
      .where(eq(hospitalApplications.applicationId, req.params.applicationId.toUpperCase()))
      .limit(1);
    if (!application) {
      throw new ApiError(404, "APPLICATION_NOT_FOUND", "No application was found for this ID.");
    }

    return sendSuccess(res, { application: publicStatus(application) });
  }),
);

export { router as hospitalApplicationsRouter };
