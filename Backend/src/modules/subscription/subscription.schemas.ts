import { z } from "zod";

export const submitPaymentSchema = z.object({
  selectedPlan: z.enum(["STARTER", "PROFESSIONAL", "ENTERPRISE"]),
  bankReference: z.string().trim().max(120).optional(),
  paymentMethod: z.string().trim().max(80).optional(),
  amount: z.coerce.number().int().positive().optional(),
});

export const reviewPaymentSchema = z.object({
  action: z.enum(["APPROVED", "REJECTED"]),
  adminNotes: z.string().trim().max(500).optional(),
});

export const reviewPaymentParamsSchema = z.object({
  id: z.string().uuid(),
});
