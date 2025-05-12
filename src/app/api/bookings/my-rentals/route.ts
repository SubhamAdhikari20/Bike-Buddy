// src/app/api/bookings/my-rentals/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getBookingByCustomerId } from "@/model/Booking";
import prisma from "@/lib/prisma";
import { Rating } from "@prisma/client";

const ratingToNumber: Record<Rating, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const customerId = Number(searchParams.get("customerId"));

        if (!customerId) {
            console.error("User Id is missing");
            return NextResponse.json({ success: false, message: "Missing user id" }, { status: 400 });
        }

        // const rentals = await getBookingByCustomerId(customerId);
        const rentals = await prisma.booking.findMany({
            where: { customerId: customerId, status: "active" },
            include: {
                bike: {
                    include: {
                        owner: true
                    }
                },
                customer: true
            },
            orderBy: [{ createdAt: "desc" }, { updatedAt: "desc" }]
        });

        // compute avg/count
        const bikeIds = rentals?.filter((rental) => rental.bike !== null).map((rental) => rental.bike!.id);
        const allReviews = await prisma.review.findMany({
            where: { bikeId: { in: bikeIds } },
            select: { bikeId: true, rating: true },
        });

        const statsMap = bikeIds!.reduce<Record<number, { avg: number; count: number }>>(
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

        const rentalWithBikeStats = rentals?.map((rental) => ({
            ...rental,
            bike: {
                ...rental.bike!,
                avgRating: statsMap[rental.bike!.id]?.avg ?? 0,
                reviewCount: statsMap[rental.bike!.id]?.count ?? 0,
            },
        }));

        return NextResponse.json({ success: true, rentals: rentalWithBikeStats }, { status: 200 });
    }
    catch (error) {
        console.error("Error retrieving rentals per user:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error retrieving rental per user"
            },
            { status: 500 }
        );
    }
}
