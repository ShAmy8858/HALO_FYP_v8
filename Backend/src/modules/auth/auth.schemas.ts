import { z } from "zod";

export const loginSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "admin", "hospital"]).transform((value) => {
    if (value === "admin") return "ADMIN";
    if (value === "hospital") return "MANAGER";
    return value;
  }),
  email: z.string().min(1),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});
