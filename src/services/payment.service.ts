import prisma from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

export const completePayment = async (
    bookingId: number,
    transactionId: string,
    method: "khalti" | "esewa"
) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Update Booking
        const booking = await tx.booking.update({
            where: { id: bookingId },
            data: {
                status: "active",
                paymentReference: transactionId
            }
        });

        // 2. Create Payment Record
        const payment = await tx.payment.create({
            data: {
                transactionId,
                amount: booking.totalPrice,
                method,
                status: "success",
                bookingId
            }
        });

        // 3. Mark Bike as Unavailable
        await tx.bike.update({
            where: { id: booking.bikeId },
            data: { available: false }
        });

        return { booking, payment };
    });
};

export const failPayment = async (bookingId: number) => {
    return await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "failed" }
    });
};