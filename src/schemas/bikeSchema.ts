// src/schemas/bikeSchema.ts
import { z } from "zod";

export const bikeSchema = z.object({
    ownerId: z.number(),
    bikeName: z.string().min(1, "Bike name is required"),
    bikeDescription: z.string().min(1, "Bike description is required"),
    bikeLocation: z.string().min(1, "Bike location is required"),
    pricePerHour: z.number().positive(),
    available: z.boolean().optional(),
});
