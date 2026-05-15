import { Router } from "express";
import { and, eq, ne } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { auditLog } from "../../services/audit.service";
import { ApiError } from "../../utils/api-error";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import { normalizeEmail } from "../../utils/strings";
import { toPublicUser } from "../auth/auth.routes";
import { updateMeSchema } from "./users.schemas";

const router = Router();

router.use(requireAuth);

router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.sub)).limit(1);
    if (!user) {
      throw new ApiError(404, "USER_NOT_FOUND", "User was not found.");
    }

    return sendSuccess(res, { user: toPublicUser(user) });
  }),
);

router.patch(
  "/me",
  validate(updateMeSchema),
  asyncHandler(async (req, res) => {
    const [currentUser] = await db.select().from(users).where(eq(users.id, req.user!.sub)).limit(1);
    if (!currentUser) {
      throw new ApiError(404, "USER_NOT_FOUND", "User was not found.");
    }

    const nextEmail = req.body.email ? normalizeEmail(req.body.email) : undefined;
    if (nextEmail && nextEmail !== currentUser.email) {
      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, nextEmail), ne(users.id, currentUser.id)))
        .limit(1);
      if (existing) {
        throw new ApiError(409, "EMAIL_ALREADY_EXISTS", "This email is already in use.");
      }
    }

    const [updated] = await db
      .update(users)
      .set({
        firstName: req.body.firstName ?? currentUser.firstName,
        lastName: req.body.lastName ?? currentUser.lastName,
        email: nextEmail ?? currentUser.email,
        contactNumber: req.body.contactNumber ?? currentUser.contactNumber,
        updatedAt: new Date(),
      })
      .where(eq(users.id, currentUser.id))
      .returning();

    await auditLog(req, { action: "PROFILE_UPDATED", userId: updated.id, hospitalId: updated.hospitalId });
    return sendSuccess(res, { user: toPublicUser(updated) });
  }),
);

export { router as usersRouter };
