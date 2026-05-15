import { z } from "zod";

export const listApplicationsQuerySchema = z.object({
  status: z.enum(["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "all"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const listHospitalsQuerySchema = z.object({
  subscription: z.enum(["TRIAL", "STARTER", "PROFESSIONAL", "ENTERPRISE", "all"]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "DEACTIVATED", "all"]).optional(),
  facilityType: z.string().optional(),
});

export const idParamsSchema = z.object({
  id: z.string().uuid(),
});

export const rejectApplicationSchema = z.object({
  reason: z.string().trim().min(10).max(1000),
});

export const updateHospitalStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "DEACTIVATED"]),
  reason: z.string().trim().min(5).max(500).optional(),
});

export const updatePlatformSettingsSchema = z.object({
  registrationEnabled: z.boolean().optional(),
  allowedFileTypes: z.array(z.string().min(3)).min(1).optional(),
  maxUploadSizeMb: z.number().int().min(1).max(25).optional(),
  defaultSubscriptionTier: z.enum(["TRIAL", "STARTER", "PROFESSIONAL", "ENTERPRISE"]).optional(),
  supportEmail: z.string().email().optional(),
  rejectionReasons: z.array(z.string().min(3)).min(1).optional(),
});

export const templateParamsSchema = z.object({
  type: z.string().min(2).max(80),
});

export const updateEmailTemplateSchema = z.object({
  subject: z.string().trim().min(3).max(200),
  body: z.string().trim().min(10),
});
