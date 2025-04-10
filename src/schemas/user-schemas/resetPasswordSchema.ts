// /schemas/user-schemas/resetPasswordSchema.ts
import * as z from "zod";

export const resetPasswordSchema = z
    .object({
        code: z.string().min(6, "Verification code is required"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });
