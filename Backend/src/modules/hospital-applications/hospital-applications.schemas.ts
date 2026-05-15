import { z } from "zod";

const optionalText = z.string().trim().optional().nullable();

export const createHospitalApplicationSchema = z.object({
  hospitalName: z.string().trim().min(2).max(160),
  facilityType: z.string().trim().min(2).max(80),
  licenseNumber: z.string().trim().min(2).max(80),
  businessEmail: z.string().email(),
  phone: z.string().trim().min(3).max(40),
  province: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(2).max(20),
  address: optionalText,
  managerFirstName: z.string().trim().min(1).max(80).optional(),
  managerLastName: z.string().trim().min(1).max(80).optional(),
  managerName: z.string().trim().min(2).max(160).optional(),
  managerEmail: z.string().email(),
  managerContactNumber: z.string().trim().min(3).max(40),
  managerPassword: z.string().min(8),
});

export const updateHospitalApplicationSchema = createHospitalApplicationSchema.partial().omit({
  managerPassword: true,
});

export const submitApplicationParamsSchema = z.object({
  id: z.string().uuid(),
});

export const uploadDocumentParamsSchema = z.object({
  id: z.string().uuid(),
});

export const statusParamsSchema = z.object({
  applicationId: z.string().min(4).max(40),
});

export const deactivateHospitalSchema = z.object({
  reason: z.string().trim().min(10).max(500),
  confirmation: z.literal(true),
});
