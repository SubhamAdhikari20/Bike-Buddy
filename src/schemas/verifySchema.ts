import { z } from "zod";

export const verifyCodeValidation = z
    .string()
    .length(6, { message: "Verification code must be 6 characters long" })
    .regex(/^[0-9]+$/, { message: "Verification code must contain only digits" })

export const verifySchema = z.object({
    code: verifyCodeValidation
});