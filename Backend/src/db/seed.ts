import { eq } from "drizzle-orm";
import { db, closeDb } from ".";
import { env } from "../config/env";
import { emailTemplates, platformSettings, sessionAuditLogs, users } from "./schema";
import { hashPassword } from "../utils/security";
import { normalizeEmail } from "../utils/strings";

const templates = [
  {
    type: "PASSWORD_RESET",
    subject: "Reset your HALO password",
    body: "<p>Hello,</p><p>Use the secure reset token to change your HALO password.</p>",
  },
  {
    type: "REGISTRATION_APPROVAL",
    subject: "Your HALO registration was approved",
    body: "<p>Congratulations. Your HALO hospital tenant is active.</p>",
  },
  {
    type: "REGISTRATION_REJECTION",
    subject: "Your HALO registration was rejected",
    body: "<p>Your application was rejected.</p><p>Reason: {{reason}}</p>",
  },
  {
    type: "HOSPITAL_DEACTIVATED",
    subject: "HALO hospital instance deactivated",
    body: "<p>Your hospital instance was deactivated.</p>",
  },
];

async function seed() {
  const adminEmail = normalizeEmail(env.ADMIN_EMAIL);
  const [existingAdmin] = await db.select({ id: users.id }).from(users).where(eq(users.email, adminEmail)).limit(1);

  let adminId: string;

  if (!existingAdmin) {
    const [admin] = await db.insert(users).values({
      firstName: env.ADMIN_FIRST_NAME,
      lastName: env.ADMIN_LAST_NAME,
      email: adminEmail,
      contactNumber: null,
      passwordHash: await hashPassword(env.ADMIN_PASSWORD),
      role: "ADMIN",
      status: "ACTIVE",
    }).returning();
    adminId = admin.id;
    console.log(`[seed] Created admin account ${adminEmail}`);
  } else {
    adminId = existingAdmin.id;
    console.log(`[seed] Admin account already exists: ${adminEmail}`);
  }

  await db
    .insert(platformSettings)
    .values({
      id: "global",
      registrationEnabled: true,
      allowedFileTypes: [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/heic",
        "image/heif",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      maxUploadSizeMb: 5,
      defaultSubscriptionTier: "TRIAL",
      supportEmail: "support@halo.pk",
      rejectionReasons: [
        "Invalid or expired license",
        "Missing required documents",
        "Unable to verify facility details",
        "Duplicate registration",
      ],
      paymentMethods: {
        methods: [
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
        ],
      },
    })
    .onConflictDoNothing();

  for (const template of templates) {
    await db.insert(emailTemplates).values(template).onConflictDoNothing();
  }

  // --- Seed sample audit logs for Admin Dashboard "Recent Activity" ---
  const sampleAuditLogs = [
    {
      action: "PLATFORM_CONFIG_UPDATED",
      userId: adminId,
      metadata: { field: "registration_enabled", value: true },
    },
    {
      action: "EMAIL_TEMPLATE_UPDATED",
      userId: adminId,
      metadata: { template: "REGISTRATION_APPROVAL" },
    },
    {
      action: "LOGIN",
      userId: adminId,
      metadata: { role: "ADMIN", status: "ACTIVE" },
    },
    {
      action: "PLATFORM_SEED",
      userId: adminId,
      metadata: { description: "Initial platform seed completed" },
    },
    {
      action: "LOGIN",
      userId: adminId,
      metadata: { role: "ADMIN", status: "ACTIVE" },
    },
  ];

  for (const log of sampleAuditLogs) {
    await db.insert(sessionAuditLogs).values({
      action: log.action,
      userId: log.userId,
      hospitalId: null,
      ipAddress: "127.0.0.1",
      userAgent: "HALO-Seed/1.0",
      metadata: log.metadata,
    });
  }

  console.log("[seed] Inserted sample audit logs for dashboard activity");
  console.log("[seed] HALO API seed complete");
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void closeDb();
  });
