import multer from "multer";
import { Router } from "express";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "../../db";
import {
  hospitals,
  platformSettings,
  subscriptionPayments,
  users,
} from "../../db/schema";
import { requireAuth, requireRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { auditLog } from "../../services/audit.service";
import { queueEmail } from "../../services/email.service";
import { uploadHospitalDocument } from "../../services/upload.service";
import { ApiError } from "../../utils/api-error";
import { asyncHandler } from "../../utils/async-handler";
import { sendCreated, sendSuccess } from "../../utils/response";
import {
  reviewPaymentParamsSchema,
  reviewPaymentSchema,
  submitPaymentSchema,
} from "./subscription.schemas";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ─── Shared plan definitions ──────────────────────────────────────
const PLANS = [
  {
    tier: "STARTER" as const,
    name: "Starter",
    price: 4999,
    period: "/month",
    description: "Perfect for small clinics and solo-specialty hospitals.",
    features: [
      "Up to 2 Departments",
      "500 Appointments/month",
      "Basic Analytics",
      "Email Notifications",
      "Standard Support",
    ],
  },
  {
    tier: "PROFESSIONAL" as const,
    name: "Professional",
    price: 14999,
    period: "/month",
    popular: true,
    description: "Built for growing multi-department hospitals.",
    features: [
      "Up to 10 Departments",
      "3,000 Appointments/month",
      "Advanced Analytics",
      "SMS + Email Notifications",
      "Walk-in Queue System",
      "Priority Support",
    ],
  },
  {
    tier: "ENTERPRISE" as const,
    name: "Enterprise",
    price: 29999,
    period: "/month",
    description: "For hospital networks and large-scale health systems.",
    features: [
      "Unlimited Departments",
      "Unlimited Appointments",
      "Real-time BI Dashboards",
      "Multi-Hospital Console",
      "API Access & Integrations",
      "Dedicated Account Manager",
      "SLA Guarantee",
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// MANAGER ROUTES
// ═══════════════════════════════════════════════════════════════════

// GET /api/subscription/plans — available plans + payment methods
// Fallback payment methods so the UI always has options even if DB is empty
const DEFAULT_PAYMENT_METHODS = [
  {
    type: "easypaisa",
    label: "Easypaisa",
    accountTitle: "HALO Health Technologies",
    accountNumber: "0300-1234567",
    details: "Send to Easypaisa account and upload screenshot",
  },
  {
    type: "jazzcash",
    label: "JazzCash",
    accountTitle: "HALO Health Technologies",
    accountNumber: "0301-9876543",
    details: "Send to JazzCash account and upload screenshot",
  },
  {
    type: "hbl",
    label: "HBL (Habib Bank Limited)",
    accountTitle: "HALO Health Technologies Pvt Ltd",
    accountNumber: "PK36HABB0012345678901234",
    details: "Branch: Islamabad Blue Area | SWIFT: HABORPKAXXX",
  },
];

router.get(
  "/plans",
  requireAuth,
  requireRole("MANAGER"),
  asyncHandler(async (_req, res) => {
    const [settings] = await db
      .select({ paymentMethods: platformSettings.paymentMethods })
      .from(platformSettings)
      .where(eq(platformSettings.id, "global"))
      .limit(1);

    const methods = settings?.paymentMethods?.methods;
    return sendSuccess(res, {
      plans: PLANS,
      paymentMethods: methods && methods.length > 0 ? methods : DEFAULT_PAYMENT_METHODS,
    });
  }),
);

// GET /api/subscription/status — current payment status for manager's hospital
router.get(
  "/status",
  requireAuth,
  requireRole("MANAGER"),
  asyncHandler(async (req, res) => {
    if (!req.user!.hospitalId) {
      throw new ApiError(404, "HOSPITAL_NOT_FOUND", "No hospital assigned.");
    }

    const [hospital] = await db
      .select({ subscriptionTier: hospitals.subscriptionTier })
      .from(hospitals)
      .where(eq(hospitals.id, req.user!.hospitalId))
      .limit(1);

    const [latestPayment] = await db
      .select()
      .from(subscriptionPayments)
      .where(eq(subscriptionPayments.hospitalId, req.user!.hospitalId))
      .orderBy(desc(subscriptionPayments.createdAt))
      .limit(1);

    return sendSuccess(res, {
      subscriptionTier: hospital?.subscriptionTier || "TRIAL",
      latestPayment: latestPayment || null,
    });
  }),
);

// POST /api/subscription/payment — submit payment receipt
router.post(
  "/payment",
  requireAuth,
  requireRole("MANAGER"),
  upload.single("receipt"),
  asyncHandler(async (req, res) => {
    if (!req.user!.hospitalId) {
      throw new ApiError(404, "HOSPITAL_NOT_FOUND", "No hospital assigned.");
    }
    if (!req.file) {
      throw new ApiError(400, "RECEIPT_REQUIRED", "Payment receipt screenshot is required.");
    }

    // Parse body fields (they come as strings from multipart)
    const body = submitPaymentSchema.parse({
      selectedPlan: req.body.selectedPlan,
      bankReference: req.body.bankReference,
      paymentMethod: req.body.paymentMethod,
      amount: req.body.amount ? Number(req.body.amount) : undefined,
    });

    // Check no pending payment exists
    const [existing] = await db
      .select({ id: subscriptionPayments.id })
      .from(subscriptionPayments)
      .where(
        and(
          eq(subscriptionPayments.hospitalId, req.user!.hospitalId),
          eq(subscriptionPayments.status, "PENDING_REVIEW"),
        ),
      )
      .limit(1);

    if (existing) {
      throw new ApiError(409, "PAYMENT_PENDING", "A payment receipt is already under review.");
    }

    // Upload to Cloudinary
    const storage = await uploadHospitalDocument(req.file);

    const [payment] = await db
      .insert(subscriptionPayments)
      .values({
        hospitalId: req.user!.hospitalId,
        submittedBy: req.user!.sub,
        selectedPlan: body.selectedPlan,
        receiptUrl: storage.secureUrl || "",
        storageKey: storage.storageKey,
        bankReference: body.bankReference || null,
        paymentMethod: body.paymentMethod || null,
        amount: body.amount || null,
      })
      .returning();

    await auditLog(req, {
      action: "SUBSCRIPTION_PAYMENT_SUBMITTED",
      userId: req.user!.sub,
      hospitalId: req.user!.hospitalId,
      metadata: { paymentId: payment.id, plan: body.selectedPlan },
    });

    // Notify all admin users about the new payment receipt
    const admins = await db
      .select({ email: users.email, firstName: users.firstName })
      .from(users)
      .where(eq(users.role, "ADMIN"));

    const [hospital] = await db
      .select({ name: hospitals.name })
      .from(hospitals)
      .where(eq(hospitals.id, req.user!.hospitalId))
      .limit(1);

    for (const admin of admins) {
      await queueEmail({
        type: "PAYMENT_RECEIPT_SUBMITTED",
        to: admin.email,
        subject: `New Payment Receipt — ${hospital?.name || "Hospital"} (${body.selectedPlan})`,
        body: `<p>A new payment receipt has been submitted by <strong>${hospital?.name || "a hospital"}</strong> for the <strong>${body.selectedPlan}</strong> plan.</p><p>Amount: PKR ${(body.amount || 0).toLocaleString()}</p><p>Please review it in the HALO Admin Console under Payment Reviews.</p>`,
      });
    }

    return sendCreated(res, { payment });
  }),
);

// ═══════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════════

// GET /api/subscription/admin/payments — list all payment receipts
router.get(
  "/admin/payments",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (_req, res) => {
    const payments = await db
      .select({
        id: subscriptionPayments.id,
        hospitalId: subscriptionPayments.hospitalId,
        hospitalName: hospitals.name,
        submittedBy: subscriptionPayments.submittedBy,
        managerName: users.firstName,
        managerLastName: users.lastName,
        managerEmail: users.email,
        selectedPlan: subscriptionPayments.selectedPlan,
        receiptUrl: subscriptionPayments.receiptUrl,
        bankReference: subscriptionPayments.bankReference,
        paymentMethod: subscriptionPayments.paymentMethod,
        amount: subscriptionPayments.amount,
        status: subscriptionPayments.status,
        adminNotes: subscriptionPayments.adminNotes,
        reviewedAt: subscriptionPayments.reviewedAt,
        createdAt: subscriptionPayments.createdAt,
      })
      .from(subscriptionPayments)
      .innerJoin(hospitals, eq(subscriptionPayments.hospitalId, hospitals.id))
      .innerJoin(users, eq(subscriptionPayments.submittedBy, users.id))
      .orderBy(desc(subscriptionPayments.createdAt));

    return sendSuccess(res, { payments });
  }),
);

// POST /api/subscription/admin/payments/:id/review — approve/reject
router.post(
  "/admin/payments/:id/review",
  requireAuth,
  requireRole("ADMIN"),
  validate(reviewPaymentParamsSchema, "params"),
  validate(reviewPaymentSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as ReturnType<typeof reviewPaymentSchema.parse>;

    const [payment] = await db
      .select()
      .from(subscriptionPayments)
      .where(eq(subscriptionPayments.id, req.params.id))
      .limit(1);

    if (!payment) {
      throw new ApiError(404, "PAYMENT_NOT_FOUND", "Payment record not found.");
    }
    if (payment.status !== "PENDING_REVIEW") {
      throw new ApiError(409, "ALREADY_REVIEWED", "This payment has already been reviewed.");
    }

    await db
      .update(subscriptionPayments)
      .set({
        status: body.action,
        adminNotes: body.adminNotes || null,
        reviewedBy: req.user!.sub,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptionPayments.id, payment.id));

    // If approved, update hospital subscription tier
    if (body.action === "APPROVED") {
      await db
        .update(hospitals)
        .set({
          subscriptionTier: payment.selectedPlan,
          updatedAt: new Date(),
        })
        .where(eq(hospitals.id, payment.hospitalId));
    }

    const [manager] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, payment.submittedBy))
      .limit(1);

    if (manager) {
      await queueEmail({
        type: body.action === "APPROVED" ? "PAYMENT_APPROVAL" : "PAYMENT_REJECTION",
        to: manager.email,
        subject: body.action === "APPROVED" ? "Your HALO Subscription is Active" : "Your HALO Subscription Payment Needs Attention",
        body: body.action === "APPROVED" 
          ? `<p>Your payment for the <strong>${payment.selectedPlan}</strong> plan has been approved. Your dashboard is now active!</p>`
          : `<p>Your payment receipt was rejected.</p>${body.adminNotes ? `<p>Reason: ${body.adminNotes}</p>` : ''}<p>Please try uploading a clear receipt again.</p>`,
      });
    }

    await auditLog(req, {
      action: body.action === "APPROVED" ? "SUBSCRIPTION_PAYMENT_APPROVED" : "SUBSCRIPTION_PAYMENT_REJECTED",
      userId: req.user!.sub,
      hospitalId: payment.hospitalId,
      metadata: { paymentId: payment.id, plan: payment.selectedPlan, notes: body.adminNotes },
    });

    return sendSuccess(res, { status: body.action });
  }),
);

export { router as subscriptionRouter };
