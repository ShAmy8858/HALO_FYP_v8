import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import { verifyAccessToken } from "../utils/security";
import type { UserRole } from "../db/schema";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    throw new ApiError(401, "AUTH_REQUIRED", "Authentication is required.");
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    throw new ApiError(401, "INVALID_TOKEN", "Your session is invalid or expired.");
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "AUTH_REQUIRED", "Authentication is required.");
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "FORBIDDEN", "You do not have permission to perform this action.");
    }

    next();
  };
}
