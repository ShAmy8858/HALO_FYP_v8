import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { hospitals, users } from "../../db/schema";
import { requireAuth, requireRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { auditLog } from "../../services/audit.service";
import { queueEmail } from "../../services/email.service";
import { ApiError } from "../../utils/api-error";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import { deactivateHospitalSchema } from "./manager.schemas";

const router = Router();

router.get(
  "/hospital",
  requireAuth,
  requireRole("MANAGER"),
  asyncHandler(async (req, res) => {
    if (!req.user!.hospitalId) {
      throw new ApiError(404, "HOSPITAL_NOT_FOUND", "No hospital assigned to this manager.");
    }

    const [hospital] = await db
      .select()
      .from(hospitals)
      .where(eq(hospitals.id, req.user!.hospitalId))
      .limit(1);

    if (!hospital) {
      throw new ApiError(404, "HOSPITAL_NOT_FOUND", "Hospital not found.");
    }

    return sendSuccess(res, { hospital });
  }),
);

router.post(
  "/hospital/deactivate",
  requireAuth,
  requireRole("MANAGER"),
  validate(deactivateHospitalSchema),
  asyncHandler(async (req, res) => {
    if (req.user!.status !== "ACTIVE" || !req.user!.hospitalId) {
      throw new ApiError(403, "HOSPITAL_NOT_ACTIVE", "Only active hospital managers can deactivate a hospital.");
    }

    const [hospital] = await db
      .update(hospitals)
      .set({ status: "DEACTIVATED", deactivatedAt: new Date(), updatedAt: new Date() })
      .where(eq(hospitals.id, req.user!.hospitalId))
      .returning();
    await db.update(users).set({ status: "SUSPENDED", updatedAt: new Date() }).where(eq(users.id, req.user!.sub));

    await auditLog(req, {
      action: "HOSPITAL_DEACTIVATED",
      userId: req.user!.sub,
      hospitalId: req.user!.hospitalId,
      metadata: { reason: req.body.reason },
    });
    await queueEmail({
      type: "HOSPITAL_DEACTIVATED",
      to: req.user!.email,
      subject: "Your HALO hospital instance has been deactivated",
      body: `<p>Your hospital instance was deactivated.</p><p>Reason: ${req.body.reason}</p>`,
    });

    return sendSuccess(res, { hospital });
  }),
);

export { router as managerRouter };
