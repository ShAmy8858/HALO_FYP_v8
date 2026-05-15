import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 120_000);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 300_000);

/**
 * In-memory sliding-window rate limiter.
 * @param windowMs – Time window in milliseconds (default 60 000 = 1 min)
 * @param max – Max requests per window (default 5)
 */
export function rateLimit(windowMs = 60_000, max = 5) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const entry = store.get(key) || { timestamps: [] };

    // Remove timestamps outside the window
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

    if (entry.timestamps.length >= max) {
      const retryAfterMs = windowMs - (now - entry.timestamps[0]);
      throw new ApiError(
        429,
        "RATE_LIMIT_EXCEEDED",
        `Too many requests. Please try again in ${Math.ceil(retryAfterMs / 1000)} seconds.`,
      );
    }

    entry.timestamps.push(now);
    store.set(key, entry);
    next();
  };
}
