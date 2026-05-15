import crypto from "crypto";
import { Router } from "express";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "../../db";
import {
  emailTemplates,
  hospitalApplications,
  hospitalDocuments,
  hospitals,
  notificationLogs,
  platformSettings,
  sessionAuditLogs,
  subscriptionPayments,
  users,
} from "../../db/schema";
import { requireAuth, requireRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { auditLog } from "../../services/audit.service";
import { queueEmail } from "../../services/email.service";
import { ApiError } from "../../utils/api-error";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import { slugify } from "../../utils/strings";
import {
  idParamsSchema,
  listApplicationsQuerySchema,
  listHospitalsQuerySchema,
  rejectApplicationSchema,
  templateParamsSchema,
  updateEmailTemplateSchema,
  updateHospitalStatusSchema,
  updatePlatformSettingsSchema,
} from "./admin.schemas";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

const defaultSettings = {
  id: "global",
  registrationEnabled: true,
  allowedFileTypes: [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  maxUploadSizeMb: 5,
  defaultSubscriptionTier: "TRIAL" as const,
  supportEmail: "support@halo.pk",
  rejectionReasons: [
    "Invalid or expired license",
    "Missing required documents",
    "Unable to verify facility details",
    "Duplicate registration",
  ],
};

const defaultTemplates: Record<string, { subject: string; body: string }> = {
  PASSWORD_RESET: {
    subject: "Reset your HALO password",
    body: "<p>Hello,</p><p>Use the provided token to reset your HALO password.</p>",
  },
  REGISTRATION_APPROVAL: {
    subject: "Your HALO hospital registration was approved",
    body: "<p>Congratulations. Your hospital instance is now active.</p>",
  },
  REGISTRATION_REJECTION: {
    subject: "Your HALO hospital registration needs attention",
    body: "<p>Your application was rejected.</p><p>Reason: {{reason}}</p>",
  },
  HOSPITAL_DEACTIVATED: {
    subject: "HALO hospital instance deactivated",
    body: "<p>Your hospital instance has been deactivated.</p>",
  },
};

function codeForHospital() {
  return `HALO-${crypto.randomInt(100000, 999999)}`;
}

async function getOrCreateSettings() {
  const [settings] = await db.select().from(platformSettings).where(eq(platformSettings.id, "global")).limit(1);
  if (settings) return settings;

  const [created] = await db.insert(platformSettings).values(defaultSettings).returning();
  return created;
}

async function getOrCreateTemplate(type: string) {
  const normalizedType = type.toUpperCase();
  const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.type, normalizedType)).limit(1);
  if (template) return template;

  const fallback = defaultTemplates[normalizedType] || {
    subject: `${normalizedType.replace(/_/g, " ")} notification`,
    body: "<p>HALO notification</p>",
  };

  const [created] = await db
    .insert(emailTemplates)
    .values({ type: normalizedType, subject: fallback.subject, body: fallback.body })
    .returning();
  return created;
}

router.get(
  "/dashboard",
  asyncHandler(async (_req, res) => {
    const [hospitalCount] = await db.select({ value: count() }).from(hospitals);
    const [activeHospitalCount] = await db
      .select({ value: count() })
      .from(hospitals)
      .where(eq(hospitals.status, "ACTIVE"));
    const [userCount] = await db.select({ value: count() }).from(users);
    const [pendingApplicationCount] = await db
      .select({ value: count() })
      .from(hospitalApplications)
      .where(and(eq(hospitalApplications.status, "SUBMITTED")));

    const applications = await db
      .select()
      .from(hospitalApplications)
      .orderBy(desc(hospitalApplications.createdAt))
      .limit(5);

    // Recent activity from audit logs
    const recentActivity = await db
      .select({
        id: sessionAuditLogs.id,
        action: sessionAuditLogs.action,
        userId: sessionAuditLogs.userId,
        hospitalId: sessionAuditLogs.hospitalId,
        metadata: sessionAuditLogs.metadata,
        createdAt: sessionAuditLogs.createdAt,
      })
      .from(sessionAuditLogs)
      .orderBy(desc(sessionAuditLogs.createdAt))
      .limit(5);

    return sendSuccess(res, {
      totals: {
        hospitals: Number(hospitalCount.value),
        activeHospitals: Number(activeHospitalCount.value),
        users: Number(userCount.value),
        appointments: 0,
        pendingApplications: Number(pendingApplicationCount.value),
      },
      recentApplications: applications,
      recentActivity,
      trends: {
        hospitals: "+0 this month",
        appointments: "0 until appointment modules are enabled",
      },
    });
  }),
);

router.get(
  "/applications",
  validate(listApplicationsQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const { status, page, limit } = req.query as unknown as ReturnType<typeof listApplicationsQuerySchema.parse>;
    let query = db.select().from(hospitalApplications).$dynamic();

    if (status && status !== "all") {
      query = query.where(eq(hospitalApplications.status, status));
    }

    const applications = await query
      .orderBy(desc(hospitalApplications.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return sendSuccess(res, { applications }, { page, limit });
  }),
);

router.get(
  "/applications/:id",
  validate(idParamsSchema, "params"),
  asyncHandler(async (req, res) => {
    const [application] = await db
      .select()
      .from(hospitalApplications)
      .where(eq(hospitalApplications.id, req.params.id))
      .limit(1);
    if (!application) {
      throw new ApiError(404, "APPLICATION_NOT_FOUND", "Application was not found.");
    }

    const documents = await db
      .select()
      .from(hospitalDocuments)
      .where(eq(hospitalDocuments.applicationId, application.id))
      .orderBy(desc(hospitalDocuments.uploadedAt));

    return sendSuccess(res, { application, documents });
  }),
);

router.post(
  "/applications/:id/approve",
  validate(idParamsSchema, "params"),
  asyncHandler(async (req, res) => {
    const [application] = await db
      .select()
      .from(hospitalApplications)
      .where(eq(hospitalApplications.id, req.params.id))
      .limit(1);
    if (!application) {
      throw new ApiError(404, "APPLICATION_NOT_FOUND", "Application was not found.");
    }
    if (!["SUBMITTED", "UNDER_REVIEW"].includes(application.status)) {
      throw new ApiError(409, "APPLICATION_NOT_REVIEWABLE", "Only submitted applications can be approved.");
    }

    const documents = await db
      .select({ id: hospitalDocuments.id })
      .from(hospitalDocuments)
      .where(eq(hospitalDocuments.applicationId, application.id));
    if (documents.length < 2) {
      throw new ApiError(400, "DOCUMENTS_REQUIRED", "This application needs at least two uploaded documents.");
    }

    const settings = await getOrCreateSettings();
    const hospitalCode = codeForHospital();
    const slug = `${slugify(application.hospitalName)}-${hospitalCode.slice(-4).toLowerCase()}`;

    const [hospital] = await db.transaction(async (tx) => {
      const [createdHospital] = await tx
        .insert(hospitals)
        .values({
          hospitalCode,
          slug,
          name: application.hospitalName,
          facilityType: application.facilityType,
          licenseNumber: application.licenseNumber,
          businessEmail: application.businessEmail,
          phone: application.phone,
          province: application.province,
          city: application.city,
          postalCode: application.postalCode,
          address: application.address,
          status: "ACTIVE",
          subscriptionTier: settings.defaultSubscriptionTier,
          activatedAt: new Date(),
        })
        .returning();

      await tx
        .update(users)
        .set({ status: "ACTIVE", hospitalId: createdHospital.id, updatedAt: new Date() })
        .where(eq(users.id, application.managerUserId));
      await tx
        .update(hospitalApplications)
        .set({ status: "APPROVED", reviewedAt: new Date(), reviewedBy: req.user!.sub, updatedAt: new Date() })
        .where(eq(hospitalApplications.id, application.id));
      await tx
        .update(hospitalDocuments)
        .set({ status: "VERIFIED" })
        .where(eq(hospitalDocuments.applicationId, application.id));

      return [createdHospital];
    });

    await auditLog(req, {
      action: "APPLICATION_APPROVED",
      userId: req.user!.sub,
      hospitalId: hospital.id,
      metadata: { applicationId: application.applicationId, hospitalCode },
    });
    await queueEmail({
      type: "REGISTRATION_APPROVAL",
      to: application.managerEmail,
      subject: "Your HALO hospital registration was approved",
      body: `<p>${application.hospitalName} is now active on HALO.</p><p>Hospital ID: <strong>${hospitalCode}</strong></p>`,
    });

    return sendSuccess(res, { hospital });
  }),
);

router.post(
  "/applications/:id/reject",
  validate(idParamsSchema, "params"),
  validate(rejectApplicationSchema),
  asyncHandler(async (req, res) => {
    const [application] = await db
      .select()
      .from(hospitalApplications)
      .where(eq(hospitalApplications.id, req.params.id))
      .limit(1);
    if (!application) {
      throw new ApiError(404, "APPLICATION_NOT_FOUND", "Application was not found.");
    }

    const [updated] = await db
      .update(hospitalApplications)
      .set({
        status: "REJECTED",
        rejectionReason: req.body.reason,
        reviewedAt: new Date(),
        reviewedBy: req.user!.sub,
        updatedAt: new Date(),
      })
      .where(eq(hospitalApplications.id, application.id))
      .returning();

    await db.update(users).set({ status: "SUSPENDED", updatedAt: new Date() }).where(eq(users.id, application.managerUserId));
    await auditLog(req, {
      action: "APPLICATION_REJECTED",
      userId: req.user!.sub,
      metadata: { applicationId: application.applicationId, reason: req.body.reason },
    });
    await queueEmail({
      type: "REGISTRATION_REJECTION",
      to: application.managerEmail,
      subject: "Your HALO hospital registration was rejected",
      body: `<p>Your application was rejected.</p><p>Reason: ${req.body.reason}</p>`,
    });

    return sendSuccess(res, { application: updated });
  }),
);

router.get(
  "/hospitals",
  validate(listHospitalsQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const { status, subscription, facilityType } = req.query as unknown as ReturnType<typeof listHospitalsQuerySchema.parse>;
    let query = db.select().from(hospitals).$dynamic();

    const conditions = [];
    if (status && status !== "all") conditions.push(eq(hospitals.status, status));
    if (subscription && subscription !== "all") conditions.push(eq(hospitals.subscriptionTier, subscription));
    if (facilityType) conditions.push(eq(hospitals.facilityType, facilityType));
    if (conditions.length) query = query.where(and(...conditions));

    const rows = await query.orderBy(desc(hospitals.createdAt));
    return sendSuccess(res, { hospitals: rows });
  }),
);

router.patch(
  "/hospitals/:id/status",
  validate(idParamsSchema, "params"),
  validate(updateHospitalStatusSchema),
  asyncHandler(async (req, res) => {
    const [hospital] = await db
      .update(hospitals)
      .set({
        status: req.body.status,
        deactivatedAt: req.body.status === "DEACTIVATED" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(hospitals.id, req.params.id))
      .returning();
    if (!hospital) {
      throw new ApiError(404, "HOSPITAL_NOT_FOUND", "Hospital was not found.");
    }

    await auditLog(req, {
      action: "HOSPITAL_STATUS_UPDATED",
      userId: req.user!.sub,
      hospitalId: hospital.id,
      metadata: { status: req.body.status, reason: req.body.reason },
    });

    return sendSuccess(res, { hospital });
  }),
);

router.get(
  "/platform-settings",
  asyncHandler(async (_req, res) => {
    const settings = await getOrCreateSettings();
    return sendSuccess(res, { settings });
  }),
);

router.patch(
  "/platform-settings",
  validate(updatePlatformSettingsSchema),
  asyncHandler(async (req, res) => {
    const current = await getOrCreateSettings();
    const [settings] = await db
      .update(platformSettings)
      .set({
        registrationEnabled: req.body.registrationEnabled ?? current.registrationEnabled,
        allowedFileTypes: req.body.allowedFileTypes ?? current.allowedFileTypes,
        maxUploadSizeMb: req.body.maxUploadSizeMb ?? current.maxUploadSizeMb,
        defaultSubscriptionTier: req.body.defaultSubscriptionTier ?? current.defaultSubscriptionTier,
        supportEmail: req.body.supportEmail ?? current.supportEmail,
        rejectionReasons: req.body.rejectionReasons ?? current.rejectionReasons,
        updatedAt: new Date(),
      })
      .where(eq(platformSettings.id, "global"))
      .returning();

    await auditLog(req, { action: "PLATFORM_SETTINGS_UPDATED", userId: req.user!.sub });
    return sendSuccess(res, { settings });
  }),
);

router.get(
  "/email-templates/:type",
  validate(templateParamsSchema, "params"),
  asyncHandler(async (req, res) => {
    const template = await getOrCreateTemplate(req.params.type);
    return sendSuccess(res, { template });
  }),
);

router.patch(
  "/email-templates/:type",
  validate(templateParamsSchema, "params"),
  validate(updateEmailTemplateSchema),
  asyncHandler(async (req, res) => {
    const type = req.params.type.toUpperCase();
    await getOrCreateTemplate(type);
    const [template] = await db
      .update(emailTemplates)
      .set({ subject: req.body.subject, body: req.body.body, updatedAt: new Date() })
      .where(eq(emailTemplates.type, type))
      .returning();

    await auditLog(req, { action: "EMAIL_TEMPLATE_UPDATED", userId: req.user!.sub, metadata: { type } });
    return sendSuccess(res, { template });
  }),
);

router.get(
  "/notifications/failed",
  asyncHandler(async (_req, res) => {
    const failed = await db
      .select()
      .from(notificationLogs)
      .where(eq(notificationLogs.status, "FAILED"))
      .orderBy(desc(notificationLogs.createdAt));
    return sendSuccess(res, { notifications: failed });
  }),
);

router.post(
  "/notifications/:id/retry",
  validate(idParamsSchema, "params"),
  asyncHandler(async (req, res) => {
    const [notification] = await db.select().from(notificationLogs).where(eq(notificationLogs.id, req.params.id)).limit(1);
    if (!notification) {
      throw new ApiError(404, "NOTIFICATION_NOT_FOUND", "Notification was not found.");
    }

    const [updated] = await db
      .update(notificationLogs)
      .set({
        status: "RETRYING",
        attempts: notification.attempts + 1,
        updatedAt: new Date(),
      })
      .where(eq(notificationLogs.id, notification.id))
      .returning();

    await auditLog(req, { action: "NOTIFICATION_RETRY_REQUESTED", userId: req.user!.sub, metadata: { id: updated.id } });
    return sendSuccess(res, { notification: updated });
  }),
);

// GET /api/admin/notifications/counts — real-time counts for header badge
router.get(
  "/notifications/counts",
  asyncHandler(async (_req, res) => {
    const [pendingApps] = await db
      .select({ value: count() })
      .from(hospitalApplications)
      .where(eq(hospitalApplications.status, "SUBMITTED"));

    const [pendingPayments] = await db
      .select({ value: count() })
      .from(subscriptionPayments)
      .where(eq(subscriptionPayments.status, "PENDING_REVIEW"));

    const total = Number(pendingApps.value) + Number(pendingPayments.value);

    return sendSuccess(res, {
      pendingApplications: Number(pendingApps.value),
      pendingPayments: Number(pendingPayments.value),
      total,
    });
  }),
);

// GET /api/admin/documents/:id/download — download uploaded document with proper headers
router.get(
  "/documents/:id/download",
  validate(idParamsSchema, "params"),
  asyncHandler(async (req, res) => {
    const [doc] = await db
      .select()
      .from(hospitalDocuments)
      .where(eq(hospitalDocuments.id, req.params.id))
      .limit(1);

    if (!doc) {
      throw new ApiError(404, "DOCUMENT_NOT_FOUND", "Document was not found.");
    }

    if (!doc.secureUrl) {
      throw new ApiError(404, "FILE_NOT_AVAILABLE", "File is not available for download. (Development mode — no cloud storage configured)");
    }

    // Fetch the file from cloud storage and stream it back
    const response = await fetch(doc.secureUrl);
    if (!response.ok) {
      throw new ApiError(502, "DOWNLOAD_FAILED", "Failed to fetch document from storage.");
    }

    const contentType = doc.mimeType || response.headers.get("content-type") || "application/octet-stream";
    const safeFileName = doc.originalFileName.replace(/[^a-zA-Z0-9._-]/g, "_");

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${safeFileName}"`);

    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  }),
);

export { router as adminRouter };
