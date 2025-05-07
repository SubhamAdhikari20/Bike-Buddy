// src/app/api/bikes/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getBikeById, updateBike, deleteBike } from "@/model/Bike";
import prisma from "@/lib/prisma";
import { Rating } from "@prisma/client";

const ratingValueMap: Record<Rating, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
};

export async function GET(request: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;
        const bikeId = Number(id);
        const bike = await getBikeById(bikeId);
        if (!bike) {
            return NextResponse.json({ success: false, message: "Bike not found" }, { status: 404 });
        }

        const reviews = await prisma.review.findMany({
            where: { bikeId: bikeId },
            orderBy: { createdAt: "desc" },
            include: {
                customer: {
                    select: {
                        fullName: true,
                        profilePictureUrl: true,
                    },
                },
            },
        });

        const reviewCount = reviews.length;
        const avgRating = reviewCount > 0 ? Math.round((reviews.reduce((sum, r) => sum + ratingValueMap[r.rating], 0) / reviewCount) * 10) / 10 : 0;

        // return NextResponse.json({ success: true, bike }, { status: 200 });
        return NextResponse.json(
            {
                success: true,
                bike: {
                    ...bike,
                    avgRating,
                    reviewCount,
                    reviews: reviews.map((r) => ({
                        id: r.id,
                        rating: r.rating,
                        comment: r.comment,
                        createdAt: r.createdAt,
                        customer: {
                            id: r.customerId,
                            fullName: r.customer?.fullName || "Anonymous",
                            profilePictureUrl: r.customer?.profilePictureUrl ?? null,
                        },
                    })),
                },
            },
            { status: 200 }
        );
    }
    catch (error) {
        console.error("Error fetching bike data:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch bike data" },
            { status: 500 }
        );
    }
}