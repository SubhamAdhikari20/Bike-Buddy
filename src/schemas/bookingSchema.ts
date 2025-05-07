// src/schemas/bookingSchema.ts
import { z } from "zod";

// export const bookingSchema = z.object({
//     customerId: z.number(),
//     bikeId: z.number(),
//     startTime: z.string(), // ISO date string; convert to Date in API
//     endTime: z.string(),   // ISO date string; convert to Date in API
//     totalPrice: z.number().positive(),
// });

export const bookingSchema = z
    .object({
        customerId: z.number(),
        bikeId: z.number(),
        ownerId: z.number(),
        startTime: z.string().refine((s) => !isNaN(Date.parse(s)), { message: "Invalid start date" }),
        endTime: z.string().refine((s) => !isNaN(Date.parse(s)), { message: "Invalid end date" }),
        totalPrice: z.number().positive(),
    })
    .refine((o) => Date.parse(o.endTime) > Date.parse(o.startTime), {
        message: "End date must be after start date",
        path: ["endTime"],
    });