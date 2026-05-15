import type { Request } from "express";
import { db } from "../db";
import { sessionAuditLogs } from "../db/schema";

interface AuditInput {
  action: string;
  userId?: string | null;
  hospitalId?: string | null;
  metadata?: Record<string, unknown>;
}

export async function auditLog(req: Request, input: AuditInput) {
  await db.insert(sessionAuditLogs).values({
    action: input.action,
    userId: input.userId || null,
    hospitalId: input.hospitalId || null,
    ipAddress: req.ip,
    userAgent: req.header("user-agent") || null,
    metadata: input.metadata,
  });
}
