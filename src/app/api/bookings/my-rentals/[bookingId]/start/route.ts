// src/app/api/bookings/my-rentals/[bookingId]/start/route.ts
import { NextResponse } from "next/server";
import { createRideJourney, updateRideJourney } from "@/model/RideJourney";
import { getBookingById } from "@/model/Booking";

export async function POST(req: Request, { params }: { params: { bookingId: string } }) {
    const { bookingId } = await params;
    const id = Number(bookingId);
    if (!id) return NextResponse.json({ success: false, message: "Invalid bookingId" }, { status: 400 });

    // Fetch booking to get bikeId & customerId
    // const booking = await prisma.booking.findUnique({ where:{id:bookingId}});
    const booking = await getBookingById(id);
    if (!booking) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    // 1) Mark booking active and set startTime
    const now = new Date();

    const rideData = await createRideJourney({
        startTime: now,
        endTime: null,
        status: "active",
        customerId: booking.customerId!,
        bikeId: booking.bikeId!,
        bookingId: booking.id
    });

    return NextResponse.json({ success: true, rideData: rideData }, { status: 200 });
}
