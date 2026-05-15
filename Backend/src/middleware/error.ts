import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod";
import { ApiError } from "../utils/api-error";

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, "NOT_FOUND", `Route ${req.method} ${req.path} was not found.`));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Please correct the highlighted fields.",
        details: error.flatten(),
      },
    });
  }

  if (error instanceof MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: {
          code: "FILE_TOO_LARGE",
          message: "One or more files exceed the maximum upload size. Reduce file size and try again.",
        },
      });
    }
    return res.status(400).json({
      success: false,
      error: {
        code: "UPLOAD_ERROR",
        message: error.message,
      },
    });
  }

  console.error(error);
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong. Please try again later.",
    },
  });
}
