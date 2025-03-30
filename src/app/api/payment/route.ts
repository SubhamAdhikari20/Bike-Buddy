// src/api/payment/route.ts
import prisma from "@/lib/prisma";

// This example assumes you receive a payment token from Khalti and process the payment externally.
export async function POST(request: Request) {
    try {
        const { bookingId, transactionId, amount, method, status } = await request.json();

        // Record the payment in your database
        const payment = await prisma.payment.create({
            data: {
                transactionId,
                amount,
                method,
                status,
                booking: {
                    connect: { id: bookingId },
                },
            },
        });

        // Optionally, update the booking's paymentReference or status
        await prisma.booking.update({
            where: { id: bookingId },
            data: { paymentReference: transactionId },
        });

        return Response.json({ success: true, payment }, { status: 201 });
    } catch (error) {
        console.error("Error processing payment:", error);
        return Response.json({ success: false, message: "Error processing payment" }, { status: 500 });
    }
}
