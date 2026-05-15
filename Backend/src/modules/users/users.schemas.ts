import { z } from "zod";

export const updateMeSchema = z.object({
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().min(1).max(80).optional(),
  email: z.string().email().optional(),
  contactNumber: z.string().min(3).max(40).nullable().optional(),
});
