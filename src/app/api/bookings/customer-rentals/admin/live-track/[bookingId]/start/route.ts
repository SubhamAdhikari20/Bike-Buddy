// src/app/api/bookings/customer-rentals/admin/live-track/[bookingId]/start/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, context: { params: Promise<{ bookingId: string }> }) {
    try {
        const params = await context.params
        const { bookingId } = params;
        const bookingID = Number(bookingId);
        if (!bookingID) return NextResponse.json({ success: false, message: "Invalid bookingId" }, { status: 400 });

        const rideJourney = await prisma.rideJourney.findFirst({
            where: { bookingId: bookingID, status: "active" },
            orderBy: [{ createdAt: "desc" }, { updatedAt: "desc" }],
            include: {
                booking: true,
                customer: true,
                bike: true,
            },
        });

        return NextResponse.json({ success: true, rideJourneyData: rideJourney, message: `rideJourneyId: ${rideJourney}` }, { status: 200 });
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
