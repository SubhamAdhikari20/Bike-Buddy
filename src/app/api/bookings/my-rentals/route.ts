// src/app/api/bookings/my-rentals/route.ts
import { NextResponse } from 'next/server';
import { getBookingByCustomerId } from "@/model/Booking";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const customerId = Number(searchParams.get("customerId"));

        if (!customerId) {
            console.error("User Td is missing");
            return NextResponse.json({ success: false, message: "Missing user id" }, { status: 400 });
        }

        const rentals = await getBookingByCustomerId(customerId);

        return NextResponse.json({ success: true, rentals }, { status: 200 });
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
