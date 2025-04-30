// src/app/api/bookings/my-rentals/[bookingId]/[rideJourneyId]/complete/route.ts
import { NextResponse } from "next/server";
import { createRideJourney, updateRideJourney } from "@/model/RideJourney";
import { updateBooking } from "@/model/Booking";
import prisma from "@/lib/prisma";
import { db } from "@/lib/firebase";
import { ref, get, remove } from "firebase/database";

export async function POST(req: Request, { params }: { params: { bookingId: string, rideJourneyId: string } }) {
    const { rideJourneyId } = params;
    const id = Number(rideJourneyId);
    if (!id) return NextResponse.json({ success: false, message: "Invalid rideJourneyId" }, { status: 400 });

    // 1) Fetch full path from RTDB
    const snap = await get(ref(db, `tracking/${id}`));
    const path = snap.val();  // expected { lat, lng, timestamp, ... } over time

    // 2) Persist into TrackingPaths in MySQL
    await prisma.trackingPaths.create({
        data: {
            rideJourneyId: id,
            pathJson: path,
        }
    });

    // 3) Clear RTDB
    await remove(ref(db, `tracking/${id}`));

    // 4) Mark booking completed and set endTime
    const now = new Date();
    await updateRideJourney(id, { status: "completed", endTime: now });

    await updateBooking(Number(params.bookingId), { status: "completed" });

    return NextResponse.json({ success: true, endTime: now }, { status: 200 });
}
