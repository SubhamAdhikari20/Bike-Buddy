// src/app/api/bikes/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma, { Prisma } from "@/lib/prisma";

const QuerySchema = z.object({
    location: z.string().optional(),
    type: z.enum(["city", "mountain", "electric"]).optional(),
    search: z.string().optional(),
    minPrice: z.preprocess((v) => parseFloat(v as string), z.number().min(0)).optional(),
    maxPrice: z.preprocess((v) => parseFloat(v as string), z.number().min(0)).optional(),
    sortBy: z.enum(["priceAsc", "priceDesc", "newest"]).default("newest"),
    page: z.preprocess((v) => parseInt(v as string), z.number().min(1)).default(1),
    pageSize: z.preprocess((v) => parseInt(v as string), z.number().min(1)).default(12),
});

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const params = QuerySchema.parse(Object.fromEntries(url.searchParams));

        // build where clause
        const where: any = { available: true };
        if (params.location) {
            where.bikeLocation = { contains: params.location };
        }
        if (params.type) {
            where.bikeType = params.type;    // your schema must have `bikeType`
        }
        if (params.minPrice !== undefined || params.maxPrice !== undefined) {
            where.pricePerDay = {
                ...(params.minPrice !== undefined ? { gte: params.minPrice } : {}),
                ...(params.maxPrice !== undefined ? { lte: params.maxPrice } : {}),
            };
        }

        // sorting
        const orderBy: Prisma.BikeOrderByWithRelationInput =
            params.sortBy === "priceAsc"
                ? { pricePerDay: "asc" }
                : params.sortBy === "priceDesc"
                    ? { pricePerDay: "desc" }
                    : { createdAt: "desc" };

        const total = await prisma.bike.count({ where });
        const bikes = await prisma.bike.findMany({
            where,
            orderBy,
            skip: (params.page - 1) * params.pageSize,
            take: params.pageSize,
        });

        return NextResponse.json({ success: true, bikes, total });
    } catch (err) {
        console.error("🛑 /api/bikes GET error:", err);
        return NextResponse.json(
            { success: false, message: "Invalid query parameters" },
            { status: 400 }
        );
    }
}

// export async function GET(req: Request) {
//     const { location, type, minPrice, maxPrice } = QuerySchema.parse(
//         Object.fromEntries(new URL(req.url).searchParams)
//     );

//     const bikes = await prisma.bike.findMany({
//         where: {
//             available: true,
//             ...(location && { bikeLocation: { contains: location } }),
//             // ...(type && { bikeType: type }),     // remove if you don’t have bikeType
//             ...(minPrice !== undefined || maxPrice !== undefined) && {
//                 pricePerDay: {
//                     ...(minPrice !== undefined ? { gte: minPrice } : {}),
//                     ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
//                 },
//             },
//         },
//         orderBy: { createdAt: "desc" },
//     });

//     return NextResponse.json({ success: true, bikes });
// }
