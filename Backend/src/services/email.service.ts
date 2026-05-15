import nodemailer from "nodemailer";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { env } from "../config/env";
import { notificationLogs } from "../db/schema";

interface SendEmailInput {
  type: string;
  to: string;
  subject: string;
  body: string;
}

function createTransport() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

export async function queueEmail(input: SendEmailInput) {
  const transport = createTransport();

  const [log] = await db
    .insert(notificationLogs)
    .values({
      type: input.type,
      recipient: input.to,
      subject: input.subject,
      body: input.body,
      status: transport ? "PENDING" : "FAILED",
      attempts: 0,
      lastError: transport ? null : "SMTP is not configured in this environment.",
    })
    .returning();

  if (!transport) {
    return log;
  }

  try {
    await transport.sendMail({
      from: env.SMTP_FROM,
      to: input.to,
      subject: input.subject,
      html: input.body,
    });

    const [sent] = await db
      .update(notificationLogs)
      .set({ status: "SENT", attempts: 1, sentAt: new Date(), updatedAt: new Date(), lastError: null })
      .where(eq(notificationLogs.id, log.id))
      .returning();

    return sent;
  } catch (error) {
    const [failed] = await db
      .update(notificationLogs)
      .set({
        status: "FAILED",
        attempts: 1,
        lastError: error instanceof Error ? error.message : "Email delivery failed.",
        updatedAt: new Date(),
      })
      .where(eq(notificationLogs.id, log.id))
      .returning();

    return failed;
  }
}
