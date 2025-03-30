// src/schemas/bookingSchema.ts
import { z } from "zod";

export const bookingSchema = z.object({
    customerId: z.number(),
    bikeId: z.number(),
    startTime: z.string(), // ISO date string; convert to Date in API
    endTime: z.string(),   // ISO date string; convert to Date in API
    totalPrice: z.number().positive(),
});
