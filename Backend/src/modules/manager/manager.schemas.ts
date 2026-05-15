import { z } from "zod";

export const deactivateHospitalSchema = z.object({
  reason: z.string().trim().min(10).max(500),
  confirmation: z.literal(true),
});
