// src/app/api/reviews/route.ts
import prisma from "@/lib/prisma";
import { createReview } from "@/model/Review";
import { getUserById } from "@/model/User";

// POST a new review
export async function POST(request: Request) {
    try {
        const { customerId, bikeId, rating, comment, rideJourneyId } = await request.json();
        const customer = await getUserById(Number(customerId));

        const review = await createReview({
            customerId,
            bikeId,
            rating,
            comment,
            customerName: customer?.fullName!,
            customerProfilePictureUrl: customer?.profilePictureUrl!,
            rideJourneyId
        });
        return Response.json({ success: true, review }, { status: 201 });
    }
    catch (error) {
        console.error("Error creating review:", error);
        return Response.json(
            { success: false, message: "Error creating review" },
            { status: 500 }
        );
    }
}


// GET all reviews with related customer and bike details
export async function GET(request: Request) {
    const url = new URL(request.url);
    const bikeId = url.searchParams.get("bikeId");
    let where = {};
    if (bikeId) {
        where = { bikeId: Number(bikeId) };
    }

    try {
        const reviews = (await prisma.review.findMany({
            where,
            select: { rating: true }
        })).map(review => ({ rating: Number(review.rating) })) as { rating: number }[];

        // compute avg to one decimal
        const avg =
            reviews.length === 0
                ? 0
                : Math.round(
                    (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10
                ) / 10;

        return Response.json({ success: true, average: avg, count: reviews.length }, { status: 200 });

    }
    catch (error) {
        console.error("Error fetching reviews:", error);
        return Response.json(
            { success: false, message: "Error fetching reviews" },
            { status: 500 }
        );
    }
}

