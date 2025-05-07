// src/app/api/reviews/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { createReview } from "@/model/Review";
import { getUserById } from "@/model/User";
import { Rating as RatingEnum } from "@prisma/client";

// POST a new review
export async function POST(request: NextRequest) {
    try {
        const { customerId, bikeId, rating, comment, rideJourneyId, reviewBikeImageUrl } = await request.json();
        const customer = await getUserById(Number(customerId));

        const review = await createReview({
            customerId,
            bikeId,
            rating,
            comment,
            customerName: customer?.fullName!,
            customerProfilePictureUrl: customer?.profilePictureUrl!,
            rideJourneyId,
            reviewBikeImageUrl
        });
        return NextResponse.json({ success: true, review }, { status: 201 });
    }
    catch (error) {
        console.error("Error creating review:", error);
        return NextResponse.json(
            { success: false, message: "Error creating review" },
            { status: 500 }
        );
    }
}


const RATING_TO_NUM: Record<RatingEnum, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
};


// GET all reviews (and include customer info) for a given bike
export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const bikeIdParam = url.searchParams.get("bikeId");
    if (!bikeIdParam) {
        return NextResponse.json(
            { success: false, message: "Missing bikeId parameter" },
            { status: 400 }
        );
    }
    const bikeId = Number(bikeIdParam);
    if (isNaN(bikeId)) {
        return NextResponse.json(
            { success: false, message: "Invalid bikeId" },
            { status: 400 }
        );
    }

    try {
        const raw = await prisma.review.findMany({
            where: { bikeId },
            orderBy: { createdAt: "desc" },
            include: {
                customer: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePictureUrl: true,
                    },
                },
            },
        });

        // map enum -> number
        const reviews = raw.map(r => ({
            ...r,
            rating: RATING_TO_NUM[r.rating],
        }));

        // compute avg to one decimal
        const avg =
            reviews.length === 0
                ? 0
                : Math.round(
                    (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10
                ) / 10;

        return NextResponse.json({ success: true, reviews, average: avg }, { status: 200 });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json(
            { success: false, message: "Error fetching reviews" },
            { status: 500 }
        );
    }
}


// // GET all reviews with related customer and bike details
// export async function GET(request: NextRequest) {
//     const url = new URL(request.url);
//     const bikeId = url.searchParams.get("bikeId");
//     let where = {};
//     if (bikeId) {
//         where = { bikeId: Number(bikeId) };
//     }

//     try {
//         const reviews = (await prisma.review.findMany({
//             where,
//             select: { rating: true }
//         })).map(review => ({ rating: Number(review.rating) })) as { rating: number }[];

//         // compute avg to one decimal
//         const avg =
//             reviews.length === 0
//                 ? 0
//                 : Math.round(
//                     (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10
//                 ) / 10;

//         return NextResponse.json({ success: true, average: avg, count: reviews.length }, { status: 200 });

//     }
//     catch (error) {
//         console.error("Error fetching reviews:", error);
//         return NextResponse.json(
//             { success: false, message: "Error fetching reviews" },
//             { status: 500 }
//         );
//     }
// }

