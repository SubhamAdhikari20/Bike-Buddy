// src/app/api/bikes/owner/route.ts
import { sendNotification } from "@/helpers/sendNotification";
import prisma from "@/lib/prisma";
import { createBike, getAllBikesByOwnerId } from "@/model/Bike";
import { Rating } from "@prisma/client";

const ratingValueMap: Record<Rating, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
};

export async function POST(request: Request) {
    try {
        const { ownerId, bikeName, bikeType, bikeDescription, bikeLocation, pricePerDay, bikeImageUrl, available } = await request.json();

        const newBike = await createBike({
            ownerId,
            bikeName,
            bikeType,
            bikeDescription,
            bikeLocation,
            pricePerDay,
            bikeImageUrl,
            available: available ?? true,
        });

        try {
            await sendNotification(
                ownerId.toString(),
                "bike-add-owner",
                {
                    bikeName: bikeName,
                    pricePerDay: pricePerDay
                }
            );
        }
        catch (err) {
            console.error("Knock notification error:", err);
        }

        return Response.json({ success: true, message: "New Bike added for the rental successfully", bike: newBike }, { status: 201 });
    }
    catch (error) {
        console.error("Error creating bike listing:", error);
        return Response.json({ success: false, message: "Error creating bike listing" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        // Expect ownerId as a query parameter, e.g. /api/bikes/owner?ownerId=1
        const { searchParams } = new URL(request.url);
        const ownerIdParam = searchParams.get("ownerId");

        if (!ownerIdParam) {
            return Response.json(
                { success: false, message: "ownerId is required" },
                { status: 400 }
            );
        }
        const ownerId = Number(ownerIdParam);

        const bikes = await getAllBikesByOwnerId(ownerId);

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
                        ? reviews.reduce((sum, r) => sum + ratingValueMap[r.rating], 0) / count
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

        return Response.json({ bikes: bikesWithStats }, { status: 200 });
    }
    catch (error) {
        console.error("Error fetching bikes:", error);
        return Response.json(
            { success: false, message: "Failed to fetch bikes" },
            { status: 500 }
        );
    }
}
