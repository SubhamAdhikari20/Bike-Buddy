// src/app/api/bookings/my-rentals/[bookingId]/[rideJourneyId]/complete/route.ts
import { NextResponse } from "next/server";
import { createRideJourney, updateRideJourney } from "@/model/RideJourney";
import { updateBooking, getBookingById } from "@/model/Booking";
import { updateBike } from "@/model/Bike";
import prisma from "@/lib/prisma";
import { db } from "@/lib/firebase";
import { ref, get, remove } from "firebase/database";
import { sendNotification } from "@/helpers/sendNotification";
import { getUserById } from "@/model/User";

export async function POST(req: Request, { params }: { params: { bookingId: string, rideJourneyId: string } }) {
    const { bookingId } = await params;
    const { rideJourneyId } = await params;
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
    const updatedRide = await updateRideJourney(id, { status: "completed", endTime: now });

    const updatedBooking = await updateBooking(Number(bookingId), { status: "completed" });

    const bike = await updateBike(Number(updatedBooking.bikeId), { available: true });
    const admins = await prisma.user.findMany({ where: { role: "admin" } })
    const customer = await getUserById(updatedBooking.customerId!);
    const owner = await getUserById(updatedBooking.ownerId!);

    const fmtDate = (d: Date) => d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    try {
        await sendNotification(
            updatedBooking.customerId!.toString(),
            "live-tracking-completed-customer",
            {
                customerName: customer?.fullName,
                bikeName: bike!.bikeName,
                startTime: updatedRide.startTime ? fmtDate(new Date(updatedRide.startTime)) : "N/A",
                endTime: updatedBooking.endTime ? fmtDate(new Date(updatedBooking.endTime)) : "N/A",
                completedTime: updatedRide.endTime ? fmtDate(new Date(updatedRide.endTime)) : "N/A",
                totalPrice: updatedBooking.totalPrice
            }
        );

        await sendNotification(
            updatedBooking.ownerId!.toString(),
            "live-tracking-completed-owner",
            {
                customerName: customer?.fullName,
                bikeName: bike!.bikeName,
                startTime: updatedRide.startTime ? fmtDate(new Date(updatedRide.startTime)) : "N/A",
                endTime: updatedBooking.endTime ? fmtDate(new Date(updatedBooking.endTime)) : "N/A",
                completedTime: updatedRide.endTime ? fmtDate(new Date(updatedRide.endTime)) : "N/A",
                totalPrice: updatedBooking.totalPrice
            }
        );

        for (const admin of admins) {
            await sendNotification(
                admin.id.toString(),
                "live-tracking-completed-admin",
                {
                    customerName: customer?.fullName,
                    ownerName: owner?.fullName,
                    bikeName: bike!.bikeName,
                    startTime: updatedRide.startTime ? fmtDate(new Date(updatedRide.startTime)) : "N/A",
                    endTime: updatedBooking.endTime ? fmtDate(new Date(updatedBooking.endTime)) : "N/A",
                    completedTime: updatedRide.endTime ? fmtDate(new Date(updatedRide.endTime)) : "N/A",
                    totalPrice: updatedBooking.totalPrice
                }
            );
        }
    }
    catch (err) {
        console.error("Knock notification error:", err);
    }

    try {
        await sendNotification(
            updatedBooking.customerId!.toString(),
            "booking-completed-customer",
            {
                customerName: customer?.fullName,
                ownerName: owner?.fullName,
                bikeName: bike!.bikeName,
                startTime: updatedBooking.startTime ? fmtDate(new Date(updatedBooking.startTime)) : "N/A",
                endTime: updatedBooking.endTime ? fmtDate(new Date(updatedBooking.endTime)) : "N/A",
                totalPrice: updatedBooking.totalPrice
            }
        );

        await sendNotification(
            updatedBooking.ownerId!.toString(),
            "booking-completed-owner",
            {
                customerName: customer?.fullName,
                ownerName: owner?.fullName,
                bikeName: bike!.bikeName,
                startTime: updatedBooking.startTime ? fmtDate(new Date(updatedBooking.startTime)) : "N/A",
                endTime: updatedBooking.endTime ? fmtDate(new Date(updatedBooking.endTime)) : "N/A",
                totalPrice: updatedBooking.totalPrice
            }
        );

        for (const admin of admins) {
            await sendNotification(
                admin.id.toString(),
                "booking-completed-admin",
                {
                    customerName: customer?.fullName,
                    ownerName: owner?.fullName,
                    bikeName: bike!.bikeName,
                    startTime: updatedRide.startTime ? fmtDate(new Date(updatedRide.startTime)) : "N/A",
                    endTime: updatedBooking.endTime ? fmtDate(new Date(updatedBooking.endTime)) : "N/A",
                    totalPrice: updatedBooking.totalPrice
                }
            );
        }
    }
    catch (err) {
        console.error("Knock notification error:", err);
    }

    return NextResponse.json({ success: true, endTime: now }, { status: 200 });
}


export async function GET(request: Request, { params }: { params: { bookingId: string, rideJourneyId: string } }) {
    const { bookingId } = await params;
    const id = Number(bookingId);
    if (!id) {
        return NextResponse.json({ success: false, message: "Invalid Booking Id" }, { status: 400 });
    }

    try {
        const booking = await getBookingById(id);

        return Response.json(
            {
                success: true,
                booking
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error retrieving booking history:", error);
        return Response.json(
            {
                success: false,
                message: "Error retrieving booking history"
            },
            { status: 500 }
        );
    }
}
