import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "MANAGER"]);
export const userStatusEnum = pgEnum("user_status", ["PENDING", "ACTIVE", "SUSPENDED"]);
export const applicationStatusEnum = pgEnum("application_status", [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
]);
export const hospitalStatusEnum = pgEnum("hospital_status", ["ACTIVE", "SUSPENDED", "DEACTIVATED"]);
export const documentStatusEnum = pgEnum("document_status", ["UPLOADED", "VERIFIED", "REJECTED"]);
export const subscriptionTierEnum = pgEnum("subscription_tier", ["TRIAL", "STARTER", "PROFESSIONAL", "ENTERPRISE"]);
export const paymentStatusEnum = pgEnum("payment_status", ["PENDING_REVIEW", "APPROVED", "REJECTED"]);
export const notificationStatusEnum = pgEnum("notification_status", ["PENDING", "SENT", "FAILED", "RETRYING"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const hospitals = pgTable(
  "hospitals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    hospitalCode: varchar("hospital_code", { length: 32 }).notNull(),
    slug: varchar("slug", { length: 160 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    facilityType: varchar("facility_type", { length: 80 }).notNull(),
    licenseNumber: varchar("license_number", { length: 80 }).notNull(),
    businessEmail: varchar("business_email", { length: 160 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    province: varchar("province", { length: 80 }).notNull(),
    city: varchar("city", { length: 80 }).notNull(),
    postalCode: varchar("postal_code", { length: 20 }).notNull(),
    address: text("address"),
    status: hospitalStatusEnum("status").default("ACTIVE").notNull(),
    subscriptionTier: subscriptionTierEnum("subscription_tier").default("TRIAL").notNull(),
    activatedAt: timestamp("activated_at", { withTimezone: true }),
    deactivatedAt: timestamp("deactivated_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    codeIdx: uniqueIndex("hospitals_code_idx").on(table.hospitalCode),
    slugIdx: uniqueIndex("hospitals_slug_idx").on(table.slug),
    licenseIdx: uniqueIndex("hospitals_license_idx").on(table.licenseNumber),
    statusIdx: index("hospitals_status_idx").on(table.status),
  }),
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    firstName: varchar("first_name", { length: 80 }).notNull(),
    lastName: varchar("last_name", { length: 80 }).notNull(),
    email: varchar("email", { length: 160 }).notNull(),
    contactNumber: varchar("contact_number", { length: 40 }),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull(),
    status: userStatusEnum("status").default("PENDING").notNull(),
    hospitalId: uuid("hospital_id").references(() => hospitals.id, { onDelete: "set null" }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
    roleIdx: index("users_role_idx").on(table.role),
    hospitalIdx: index("users_hospital_idx").on(table.hospitalId),
  }),
);

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("refresh_tokens_user_idx").on(table.userId),
    tokenIdx: uniqueIndex("refresh_tokens_hash_idx").on(table.tokenHash),
  }),
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    resetUserIdx: index("password_reset_tokens_user_idx").on(table.userId),
    resetHashIdx: uniqueIndex("password_reset_tokens_hash_idx").on(table.tokenHash),
  }),
);

export const hospitalApplications = pgTable(
  "hospital_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    applicationId: varchar("application_id", { length: 40 }).notNull(),
    status: applicationStatusEnum("status").default("DRAFT").notNull(),
    hospitalName: varchar("hospital_name", { length: 160 }).notNull(),
    facilityType: varchar("facility_type", { length: 80 }).notNull(),
    licenseNumber: varchar("license_number", { length: 80 }).notNull(),
    businessEmail: varchar("business_email", { length: 160 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    province: varchar("province", { length: 80 }).notNull(),
    city: varchar("city", { length: 80 }).notNull(),
    postalCode: varchar("postal_code", { length: 20 }).notNull(),
    address: text("address"),
    managerFirstName: varchar("manager_first_name", { length: 80 }).notNull(),
    managerLastName: varchar("manager_last_name", { length: 80 }).notNull(),
    managerEmail: varchar("manager_email", { length: 160 }).notNull(),
    managerContactNumber: varchar("manager_contact_number", { length: 40 }).notNull(),
    managerUserId: uuid("manager_user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
    rejectionReason: text("rejection_reason"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (table) => ({
    appIdIdx: uniqueIndex("hospital_applications_app_id_idx").on(table.applicationId),
    licenseIdx: uniqueIndex("hospital_applications_license_idx").on(table.licenseNumber),
    managerEmailIdx: index("hospital_applications_manager_email_idx").on(table.managerEmail),
    statusIdx: index("hospital_applications_status_idx").on(table.status),
  }),
);

export const hospitalDocuments = pgTable(
  "hospital_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    applicationId: uuid("application_id").notNull().references(() => hospitalApplications.id, { onDelete: "cascade" }),
    documentType: varchar("document_type", { length: 80 }).notNull(),
    originalFileName: varchar("original_file_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 120 }).notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    storageProvider: varchar("storage_provider", { length: 40 }).notNull(),
    storageKey: text("storage_key").notNull(),
    secureUrl: text("secure_url"),
    status: documentStatusEnum("status").default("UPLOADED").notNull(),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    applicationIdx: index("hospital_documents_application_idx").on(table.applicationId),
  }),
);

export const sessionAuditLogs = pgTable(
  "session_audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    hospitalId: uuid("hospital_id").references(() => hospitals.id, { onDelete: "set null" }),
    action: varchar("action", { length: 80 }).notNull(),
    ipAddress: varchar("ip_address", { length: 80 }),
    userAgent: text("user_agent"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    auditUserIdx: index("session_audit_logs_user_idx").on(table.userId),
    auditActionIdx: index("session_audit_logs_action_idx").on(table.action),
  }),
);

export const platformSettings = pgTable("platform_settings", {
  id: text("id").default("global").primaryKey(),
  registrationEnabled: boolean("registration_enabled").default(true).notNull(),
  allowedFileTypes: jsonb("allowed_file_types").$type<string[]>().notNull(),
  maxUploadSizeMb: integer("max_upload_size_mb").default(5).notNull(),
  defaultSubscriptionTier: subscriptionTierEnum("default_subscription_tier").default("TRIAL").notNull(),
  supportEmail: varchar("support_email", { length: 160 }).default("support@halo.pk").notNull(),
  rejectionReasons: jsonb("rejection_reasons").$type<string[]>().notNull(),
  paymentMethods: jsonb("payment_methods").$type<{
    methods: {
      type: string;
      label: string;
      accountTitle: string;
      accountNumber: string;
      details?: string;
    }[];
  }>(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const emailTemplates = pgTable(
  "email_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: varchar("type", { length: 80 }).notNull(),
    subject: varchar("subject", { length: 200 }).notNull(),
    body: text("body").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    templateTypeIdx: uniqueIndex("email_templates_type_idx").on(table.type),
  }),
);

export const notificationLogs = pgTable(
  "notification_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: varchar("type", { length: 80 }).notNull(),
    recipient: varchar("recipient", { length: 160 }).notNull(),
    subject: varchar("subject", { length: 200 }).notNull(),
    body: text("body").notNull(),
    status: notificationStatusEnum("status").default("PENDING").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    lastError: text("last_error"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    notificationStatusIdx: index("notification_logs_status_idx").on(table.status),
  }),
);

export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type UserStatus = (typeof userStatusEnum.enumValues)[number];
export type ApplicationStatus = (typeof applicationStatusEnum.enumValues)[number];
export type HospitalStatus = (typeof hospitalStatusEnum.enumValues)[number];
export type SubscriptionTier = (typeof subscriptionTierEnum.enumValues)[number];
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];

export const subscriptionPayments = pgTable(
  "subscription_payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    hospitalId: uuid("hospital_id").notNull().references(() => hospitals.id, { onDelete: "cascade" }),
    submittedBy: uuid("submitted_by").notNull().references(() => users.id, { onDelete: "restrict" }),
    selectedPlan: subscriptionTierEnum("selected_plan").notNull(),
    receiptUrl: text("receipt_url").notNull(),
    storageKey: text("storage_key").notNull(),
    bankReference: varchar("bank_reference", { length: 120 }),
    paymentMethod: varchar("payment_method", { length: 80 }),
    amount: integer("amount"),
    status: paymentStatusEnum("status").default("PENDING_REVIEW").notNull(),
    adminNotes: text("admin_notes"),
    reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    hospitalIdx: index("subscription_payments_hospital_idx").on(table.hospitalId),
    statusIdx: index("subscription_payments_status_idx").on(table.status),
  }),
);
