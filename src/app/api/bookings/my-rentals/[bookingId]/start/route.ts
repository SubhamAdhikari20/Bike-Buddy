// src/app/api/bookings/my-rentals/[bookingId]/start/route.ts
import { NextResponse } from "next/server";
import { createRideJourney, updateRideJourney } from "@/model/RideJourney";
import { getBookingById } from "@/model/Booking";
import { sendNotification } from "@/helpers/sendNotification";
import { getBikeById } from "@/model/Bike";
import { getUserById } from "@/model/User";
import prisma from "@/lib/prisma";

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

    const bike = await getBikeById(booking.bikeId!);
    const admins = await prisma.user.findMany({ where: { role: "admin" } })
    const customer = await getUserById(booking.customerId!);
    const owner = await getUserById(booking.ownerId!);

    const fmtDate = (d: Date) => d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    try {
        await sendNotification(
            booking.customerId!.toString(),
            "live-tracking-customer",
            {
                bikeName: bike!.bikeName,
                startTime: rideData.startTime ? fmtDate(new Date(rideData.startTime)) : "N/A",
                endTime: booking.endTime ? fmtDate(new Date(booking.endTime)) : "N/A",
                totalPrice: booking.totalPrice
            }
        );

        await sendNotification(
            booking.ownerId!.toString(),
            "live-tracking-owner",
            {
                customerName: customer?.fullName,
                bikeName: bike!.bikeName,
                startTime: rideData.startTime ? fmtDate(new Date(rideData.startTime)) : "N/A",
                endTime: booking.endTime ? fmtDate(new Date(booking.endTime)) : "N/A",
                totalPrice: booking.totalPrice
            }
        );

        for (const admin of admins) {
            await sendNotification(
                admin.id.toString(),
                "live-tracking-started-admin",
                {
                    customerName: customer?.fullName,
                    ownerName: owner?.fullName,
                    bikeName: bike!.bikeName,
                    startTime: rideData.startTime ? fmtDate(new Date(rideData.startTime)) : "N/A",
                    endTime: booking.endTime ? fmtDate(new Date(booking.endTime)) : "N/A",
                    totalPrice: booking.totalPrice
                }
            );
        }

    }
    catch (err) {
        console.error("Knock notification error:", err);
    }


    return NextResponse.json({ success: true, rideData: rideData }, { status: 200 });
}
