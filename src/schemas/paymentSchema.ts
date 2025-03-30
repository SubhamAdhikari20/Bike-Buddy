// src/schemas/paymentSchema.ts
import { z } from "zod";

export const paymentSchema = z.object({
    bookingId: z.number(),
    transactionId: z.string(),
    amount: z.number().positive(),
    method: z.string().min(1, "Payment method is required"),
    status: z.string().min(1, "Payment status is required"),
});
