import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { env } from "../../config/env";
import { db } from "../../db";
import { hospitalApplications, passwordResetTokens, refreshTokens, users } from "../../db/schema";
import { requireAuth } from "../../middleware/auth";
import { rateLimit } from "../../middleware/rate-limit";
import { validate } from "../../middleware/validate";
import { auditLog } from "../../services/audit.service";
import { queueEmail } from "../../services/email.service";
import { ApiError } from "../../utils/api-error";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import {
  addDays,
  addMinutes,
  createOpaqueToken,
  hashPassword,
  hashToken,
  signAccessToken,
  verifyPassword,
} from "../../utils/security";
import { normalizeEmail } from "../../utils/strings";
import { changePasswordSchema, forgotPasswordSchema, loginSchema, resetPasswordSchema } from "./auth.schemas";
import { isProduction } from "../../config/env";

const router = Router();
const REFRESH_COOKIE = "halo_refresh_token";

function toPublicUser(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    contactNumber: user.contactNumber,
    role: user.role,
    status: user.status,
    hospitalId: user.hospitalId,
    lastLoginAt: user.lastLoginAt?.toISOString() || null,
  };
}

function setRefreshCookie(res: Parameters<typeof sendSuccess>[0], token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

async function createRefreshSession(user: typeof users.$inferSelect) {
  const rawToken = createOpaqueToken();
  const [record] = await db
    .insert(refreshTokens)
    .values({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: addDays(new Date(), 30),
    })
    .returning();

  return `${record.id}.${rawToken}`;
}

async function getPendingApplication(userId: string) {
  const [application] = await db
    .select({
      id: hospitalApplications.id,
      applicationId: hospitalApplications.applicationId,
      status: hospitalApplications.status,
      rejectionReason: hospitalApplications.rejectionReason,
    })
    .from(hospitalApplications)
    .where(eq(hospitalApplications.managerUserId, userId))
    .limit(1);

  return application || null;
}

router.post(
  "/login",
  rateLimit(60_000, 5),
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as ReturnType<typeof loginSchema.parse>;
    const email = normalizeEmail(body.email);
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.role, body.role)))
      .limit(1);

    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email, role, or password.");
    }

    if (user.status === "SUSPENDED") {
      throw new ApiError(403, "ACCOUNT_SUSPENDED", "This account is suspended. Contact HALO support.");
    }

    await db.update(users).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(users.id, user.id));

    const accessToken = signAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
      status: user.status,
      hospitalId: user.hospitalId,
    });
    const refreshToken = await createRefreshSession(user);
    setRefreshCookie(res, refreshToken);

    await auditLog(req, {
      action: "LOGIN",
      userId: user.id,
      hospitalId: user.hospitalId,
      metadata: { role: user.role, status: user.status },
    });

    return sendSuccess(res, {
      accessToken,
      user: toPublicUser(user),
      application: user.status === "PENDING" ? await getPendingApplication(user.id) : null,
    });
  }),
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const cookie = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    const [id, rawToken] = cookie?.split(".") || [];

    if (!id || !rawToken) {
      throw new ApiError(401, "REFRESH_REQUIRED", "Refresh token is missing.");
    }

    const [record] = await db.select().from(refreshTokens).where(eq(refreshTokens.id, id)).limit(1);
    if (!record || record.revokedAt || record.expiresAt < new Date() || record.tokenHash !== hashToken(rawToken)) {
      throw new ApiError(401, "INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired.");
    }

    const [user] = await db.select().from(users).where(eq(users.id, record.userId)).limit(1);
    if (!user || user.status === "SUSPENDED") {
      throw new ApiError(401, "INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired.");
    }

    const accessToken = signAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
      status: user.status,
      hospitalId: user.hospitalId,
    });

    return sendSuccess(res, {
      accessToken,
      user: toPublicUser(user),
      application: user.status === "PENDING" ? await getPendingApplication(user.id) : null,
    });
  }),
);

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const cookie = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    const [id] = cookie?.split(".") || [];

    if (id) {
      await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.id, id));
    }

    res.clearCookie(REFRESH_COOKIE, { path: "/" });
    await auditLog(req, { action: "LOGOUT", metadata: { refreshTokenId: id } });
    return sendSuccess(res, { ok: true });
  }),
);

router.post(
  "/forgot-password",
  rateLimit(60_000, 5),
  validate(forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (user) {
      const rawToken = createOpaqueToken();
      const [record] = await db
        .insert(passwordResetTokens)
        .values({
          userId: user.id,
          tokenHash: hashToken(rawToken),
          expiresAt: addMinutes(new Date(), 15),
        })
        .returning();
      const resetToken = `${record.id}.${rawToken}`;
      const resetUrl = `${env.WEB_ORIGIN}/reset-password?token=${encodeURIComponent(resetToken)}`;

      await queueEmail({
        type: "PASSWORD_RESET",
        to: user.email,
        subject: "Reset your HALO password",
        body: `
          <div style="font-family:'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f8fffe;border-radius:16px;border:1px solid #e0f2f1">
            <div style="text-align:center;margin-bottom:24px">
              <span style="font-size:28px;font-weight:800;color:#00838F">HALO</span>
              <span style="font-size:10px;font-weight:700;color:#fff;background:linear-gradient(135deg,#00ACC1,#1976D2);padding:2px 6px;border-radius:4px;vertical-align:super;margin-left:4px">AI</span>
            </div>
            <h2 style="color:#1a3a5c;font-size:20px;margin:0 0 8px">Password Reset Request</h2>
            <p style="color:#546E7A;font-size:14px;line-height:1.6;margin:0 0 24px">
              We received a request to reset the password for <strong>${user.email}</strong>.
              Click the button below to set a new password. This link expires in <strong>15 minutes</strong>.
            </p>
            <div style="text-align:center;margin:24px 0">
              <a href="${resetUrl}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#00ACC1,#1976D2);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px">
                Reset Password
              </a>
            </div>
            <p style="color:#90A4AE;font-size:12px;line-height:1.5;margin:24px 0 0;border-top:1px solid #e0e0e0;padding-top:16px">
              If you did not request this, you can safely ignore this email. Your password will remain unchanged.
            </p>
          </div>
        `,
      });

      await auditLog(req, { action: "PASSWORD_RESET_REQUESTED", userId: user.id });
    }

    return sendSuccess(res, {
      message: "If an account exists for this email, a reset link has been sent.",
    });
  }),
);

router.post(
  "/reset-password",
  rateLimit(60_000, 5),
  validate(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    const [id, rawToken] = req.body.token.split(".");
    if (!id || !rawToken) {
      throw new ApiError(400, "INVALID_RESET_TOKEN", "Reset token is invalid.");
    }

    const [record] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.id, id)).limit(1);
    if (!record || record.usedAt || record.expiresAt < new Date() || record.tokenHash !== hashToken(rawToken)) {
      throw new ApiError(400, "INVALID_RESET_TOKEN", "Reset token is invalid or expired.");
    }

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ passwordHash: await hashPassword(req.body.password), updatedAt: new Date() })
        .where(eq(users.id, record.userId));
      await tx.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, record.id));
      await tx.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.userId, record.userId));
    });

    await auditLog(req, { action: "PASSWORD_RESET_COMPLETED", userId: record.userId });
    return sendSuccess(res, { message: "Password reset successfully." });
  }),
);

router.patch(
  "/change-password",
  requireAuth,
  validate(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.sub)).limit(1);
    if (!user || !(await verifyPassword(req.body.currentPassword, user.passwordHash))) {
      throw new ApiError(400, "INVALID_CURRENT_PASSWORD", "Current password is incorrect.");
    }

    await db.update(users).set({ passwordHash: await hashPassword(req.body.newPassword), updatedAt: new Date() }).where(eq(users.id, user.id));
    await auditLog(req, { action: "PASSWORD_CHANGED", userId: user.id, hospitalId: user.hospitalId });
    return sendSuccess(res, { message: "Password changed successfully." });
  }),
);

export { router as authRouter, toPublicUser };
