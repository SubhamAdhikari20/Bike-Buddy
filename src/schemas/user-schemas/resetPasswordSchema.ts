// /schemas/user-schemas/resetPasswordSchema.ts
import * as z from "zod";

export const newPasswordValidation = z     // New Password validation
    .string()
    .min(8, { message: "Password must be atleast 8 characters long" })
    .max(20, { message: "Password must not exceed 20 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/, { message: "Password must contain atleast 1 uppercase, 1 lowercase, 1 digit and 1 special character" });

export const confirmNewPasswordValidation = z     // Confirm New Password validation
    .string()
    .min(8, { message: "Confirm Password must be atleast 8 characters long" })
    .max(20, { message: "Confirm Password must not exceed 20 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/, { message: "Confirm Password must contain atleast 1 uppercase, 1 lowercase, 1 digit and 1 special character" });

export const resetPasswordSchema = z.object({
    password: newPasswordValidation,
    confirmPassword: confirmNewPasswordValidation,
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

