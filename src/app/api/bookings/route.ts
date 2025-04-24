// src/api/bookings/route.ts
import { createBooking } from "@/model/Booking"

export async function POST(request: Request) {
    try {
        const { customerId, bikeId, startTime, endTime, totalPrice } = await request.json();

        // Create the booking
        const booking = await createBooking({
            customerId,
            bikeId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            totalPrice,
            status: "pending",
        });

        return Response.json(
            {
                success: true,
                booking
            },
            { status: 201 }
        );
    }
    catch (error) {
        console.error("Error creating booking:", error);
        return Response.json(
            {
                success: false,
                message: "Error creating booking"
            }, { status: 500 }
        );
    }
}
