// src/api/reviews/route.ts
import prisma from "@/lib/prisma";

// GET all reviews with related customer and bike details
export async function GET(request: Request) {
    try {
        const reviews = await prisma.review.findMany({
            include: {
                customer: true,
                bike: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return Response.json({ success: true, reviews }, { status: 200 });
    }
    catch (error) {
        console.error("Error fetching reviews:", error);
        return Response.json(
            { success: false, message: "Error fetching reviews" },
            { status: 500 }
        );
    }
}

// POST a new review
export async function POST(request: Request) {
    try {
        const { customerId, bikeId, rating, comment } = await request.json();

        // Optionally validate inputs with Zod here

        const review = await prisma.review.create({
            data: {
                customerId,
                bikeId,
                rating,
                comment,
            },
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
