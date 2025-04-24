// src/schemas/bikeSchema.ts
import { z } from "zod";

export const bikeSchema = z.object({
    ownerId: z.number(),
    bikeName: z.string().min(1, "Bike name is required"),
    bikeType: z.enum(["city", "mountain", "electric"], {
        required_error: "Bike type is required",
    }),
    bikeDescription: z.string().min(1, "Bike description is required"),
    bikeLocation: z.string().min(1, "Bike location is required"),
    pricePerDay: z.number().positive("Price must be a positive number"),
    bikeImageUrl: z.string().optional(),
    available: z.boolean().optional(),
    // bikeImageRaw: z.instanceof(File, { message: "Image is required" }).optional(),
});
