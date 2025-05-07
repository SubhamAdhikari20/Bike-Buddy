// src/app/api/bikes/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma, { Prisma } from "@/lib/prisma";
import { Rating } from "@prisma/client";

const ratingToNumber: Record<Rating, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
};

const QuerySchema = z.object({
    bikeName: z.string().optional(),
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
        if (params.bikeName) {
            where.bikeName = { contains: params.bikeName };
        }
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


        // compute avg/count
        const bikeIds = bikes.map((b) => b.id);
        const allReviews = await prisma.review.findMany({
            where: { bikeId: { in: bikeIds } },
            select: { bikeId: true, rating: true },
        });

        const statsMap = bikeIds.reduce<Record<number, { avg: number; count: number }>>(
            (acc, id) => {
                const reviews = allReviews.filter((r) => r.bikeId === id);
                const count = reviews.length;
                const avg =
                    count > 0
                        ? reviews.reduce((sum, r) => sum + ratingToNumber[r.rating], 0) / count
                        : 0;
                acc[id] = { avg: Math.round(avg * 10) / 10, count };
                return acc;
            },
            {}
        );

        const bikesWithStats = bikes.map((b) => ({
            ...b,
            avgRating: statsMap[b.id].avg,
            reviewCount: statsMap[b.id].count,
        }));

        // const stats = await prisma.review.groupBy({
        //     by: ["bikeId"],
        //     where: { bikeId: { in: bikes.map((b) => b.id) } },
        //     _avg: { rating: true },
        //     _count: { _all: true },
        // });

        // const statsMap = Object.fromEntries(
        //     stats.map(s => [s.bikeId, {
        //         avg: Number(s._avg?.rating ?? 0),
        //         count: s._count?._all,
        //     }])
        // );

        // const bikesWithStats = bikes.map(b => ({
        //     ...b,
        //     avgRating: statsMap[b.id]?.avg ?? 0,
        //     reviewCount: statsMap[b.id]?.count ?? 0,
        // }));

        return NextResponse.json({ success: true, bikes: bikesWithStats, total });
    } catch (err) {
        console.error("🛑 /api/bikes GET error:", err);
        return NextResponse.json(
            { success: false, message: "Invalid query parameters" },
            { status: 400 }
        );
    }
}

