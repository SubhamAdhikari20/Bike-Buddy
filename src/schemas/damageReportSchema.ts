// src/schemas/damageReportSchema.ts
import { stat } from "fs";
import { z } from "zod";


export const damageReportSchema = z
    .object({
        customerId: z.number().optional(),
        bikeId: z.number().optional(),
        ownerId: z.number().optional(),
        description: z.string().min(1, { message: "Description is required" }),
        bookingId: z.number().optional(),
    });