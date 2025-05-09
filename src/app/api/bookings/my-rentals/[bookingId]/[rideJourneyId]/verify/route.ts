// // src/app/api/bookings/my-rentals/[bookingId]/[rideJourneyId]/verify/route.ts
// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";


// export async function GET(request: Request, { params }: { params: { bookingId: string; rideJourneyId: string } }) {
//     const { bookingId, rideJourneyId } = await params;

//     try {
//         const rideJourney = await prisma.rideJourney.findUnique({
//             where: { id: Number(rideJourneyId), bookingId: Number(bookingId) },
//             include: { booking: { include: { bike: true, customer: true } } },
//         });

//         if (!rideJourney || !rideJourney.isActive) {
//             return NextResponse.json({ success: false, message: "Ride not active or not found" }, { status: 404 });
//         }

//         const user = session.user;
//         const isCustomer = rideJourney.booking.customerId === user.id;
//         const isOwner = rideJourney.booking.bike.ownerId === user.id;
//         const isAdmin = user.role === "ADMIN"; // Assuming role is in session

//         if (isCustomer || isOwner || isAdmin) {
//             return NextResponse.json({ success: true }, { status: 200 });
//         }

//         return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
//     } catch (error) {
//         console.error("Error verifying access:", error);
//         return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
//     }
// }