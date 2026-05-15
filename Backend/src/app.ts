import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { adminRouter } from "./modules/admin/admin.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { hospitalApplicationsRouter } from "./modules/hospital-applications/hospital-applications.routes";
import { managerRouter } from "./modules/manager/manager.routes";
import { subscriptionRouter } from "./modules/subscription/subscription.routes";
import { usersRouter } from "./modules/users/users.routes";
import { errorHandler, notFound } from "./middleware/error";

/** Localhost + RFC1918 private IPv4 (Vite “Network” URLs like http://192.168.x.x:8080). */
function isPrivateLanHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1" || h === "::1") return true;
  const parts = h.split(".");
  if (parts.length !== 4) return false;
  const a = Number(parts[0]);
  const b = Number(parts[1]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  if (a === 10) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

function isAllowedDevOrigin(origin: string) {
  try {
    const url = new URL(origin);
    if (url.protocol !== "http:") return false;
    return isPrivateLanHostname(url.hostname);
  } catch {
    return false;
  }
}

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        if (origin === env.WEB_ORIGIN || (env.NODE_ENV !== "production" && isAllowedDevOrigin(origin))) {
          callback(null, true);
          return;
        }

        callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.get("/health", (_req, res) => {
    res.json({ success: true, data: { service: "halo-api", status: "ok" } });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/hospital-applications", hospitalApplicationsRouter);
  app.use("/api/manager", managerRouter);
  app.use("/api/subscription", subscriptionRouter);
  app.use("/api/admin", adminRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
