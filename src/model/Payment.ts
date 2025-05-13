// src/model/Payments.ts
import { sendNotification } from "@/helpers/sendNotification";
import prisma from "@/lib/prisma";
import { Payment, PaymentStatus } from "@prisma/client";

const fmtDate = (d: Date) => d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
});
const admins = await prisma.user.findMany({ where: { role: "admin" } })

export async function createPaymentRecord(data: {
    bookingId: number;
    transactionUuid: string;
    amount: number;
    method: string;
}): Promise<Payment> {
    return prisma.payment.create({
        data: {
            bookingId: data.bookingId,
            transactionId: data.transactionUuid,    // temporarily store the UUID here
            amount: data.amount,
            method: data.method,
            status: "pending",
        },
    });
}

/**
 * On gateway callback, update that same Payment (matched by transactionUuid)
 * then set Booking.status and paymentReference.
 */
export async function finalizePaymentWithKhalti(data: {
    transactionUuid: string;
    gatewayRef: string;
    status: PaymentStatus;
}): Promise<Payment> {

    try {
        const { updatedPayment, updatedBooking } = await prisma.$transaction(async (tx) => {
            // 1) find the pending payment
            const payment = await tx.payment.findUniqueOrThrow({
                where: { transactionId: data.transactionUuid },
            });

            // 2) update payment row
            const updatedPayment = await tx.payment.update({
                where: { id: payment.id },
                data: {
                    transactionId: data.gatewayRef,
                    status: data.status,
                },
                include: {
                    booking: true,
                },
            });

            // 3) update booking status & paymentRef
            const updatedBooking = await tx.booking.update({
                where: { id: updatedPayment.bookingId! },
                data: {
                    status: data.status === "success" ? "active" : "failed",
                    paymentReference: data.gatewayRef,
                },
                include: {
                    customer: true,
                    bike: {
                        include: { owner: true },
                    },
                },
            });

            // 4) if success: mark bike unavailable
            if (data.status === "success") {
                await tx.bike.update({
                    where: { id: updatedBooking.bikeId! },
                    data: {
                        available: false,
                    },
                });

                // 5) create invoice
                await tx.invoice.create({
                    data: {
                        customerName: updatedBooking.customer!.fullName,
                        customerContact: updatedBooking.customer!.contact,
                        ownerName: updatedBooking.bike?.owner.fullName!,
                        ownerContact: updatedBooking.bike?.owner.contact!,
                        bikeName: updatedBooking.bike?.bikeName!,
                        bikeType: updatedBooking.bike?.bikeType!,
                        startTime: updatedBooking.startTime,
                        endTime: updatedBooking.endTime,
                        pricePerDay: updatedBooking.bike?.pricePerDay!,
                        totalPrice: updatedBooking.totalPrice,
                        paymentMethod: updatedPayment.method,
                        customerId: updatedBooking.customerId!,
                        bikeId: updatedBooking.bikeId!,
                        transactionId: updatedPayment.transactionId,
                        bookingId: updatedBooking.id
                    },
                });
            }
            return { updatedPayment, updatedBooking };
        });

        // 5) Send notifications after the transaction
        if (data.status === "success" && updatedBooking) {
            try {
                await sendNotification(
                    updatedBooking.customer!.id.toString(),
                    "booking-created-customer",
                    {
                        customerName: updatedBooking.customer?.fullName,
                        ownerName: updatedBooking.bike?.owner.fullName!,
                        bikeName: updatedBooking.bike?.bikeName,
                        startTime: updatedBooking.startTime ? fmtDate(new Date(updatedBooking.startTime)) : "N/A",
                        endTime: updatedBooking.endTime ? fmtDate(new Date(updatedBooking.endTime)) : "N/A",
                        totalPrice: updatedBooking.totalPrice,
                    }
                );

                await sendNotification(
                    updatedBooking.bike!.owner.id.toString(),
                    "booking-created-owner",
                    {
                        ownerName: updatedBooking.bike?.owner.fullName!,
                        customerName: updatedBooking.customer?.fullName,
                        bikeName: updatedBooking.bike?.bikeName,
                        startTime: updatedBooking.startTime ? fmtDate(new Date(updatedBooking.startTime)) : "N/A",
                        endTime: updatedBooking.endTime ? fmtDate(new Date(updatedBooking.endTime)) : "N/A",
                        totalPrice: updatedBooking.totalPrice,
                    }
                );

                const admins = await prisma.user.findMany({ where: { role: "admin" } });
                for (const admin of admins) {
                    await sendNotification(
                        admin.id.toString(),
                        "booking-created-admin",
                        {
                            ownerName: updatedBooking.bike?.owner.fullName!,
                            customerName: updatedBooking.customer?.fullName,
                            bikeName: updatedBooking.bike?.bikeName,
                            startTime: updatedBooking.startTime ? fmtDate(new Date(updatedBooking.startTime)) : "N/A",
                            endTime: updatedBooking.endTime ? fmtDate(new Date(updatedBooking.endTime)) : "N/A",
                            totalPrice: updatedBooking.totalPrice,
                        }
                    );
                }
            }
            catch (error) {
                console.error("Knock notification error:", error);
            }
        }

        return updatedPayment;
    }
    catch (error) {
        console.error("Error finalizing payment:", error);
        throw error;
    }

}

export async function finalizePaymentWithEsewa(data: {
    transactionUuid: string;
    gatewayRef: string;
    status: PaymentStatus;
}): Promise<Payment> {

    try {
        const { updatedPayment, updatedBooking } = await prisma.$transaction(async (tx) => {
            // 1) find the pending payment
            const payment = await tx.payment.findUniqueOrThrow({
                where: { transactionId: data.transactionUuid },
            });

            // 2) update payment row
            const updatedPayment = await tx.payment.update({
                where: { id: payment.id },
                data: {
                    transactionId: data.transactionUuid,
                    status: data.status,
                },
                include: {
                    booking: true,
                },
            });

            // 3) update booking status & paymentRef
            const updatedBooking = await tx.booking.update({
                where: { id: updatedPayment.bookingId! },
                data: {
                    status: data.status === "success" ? "active" : "failed",
                    paymentReference: data.gatewayRef,
                },
                include: {
                    customer: true,
                    bike: {
                        include: { owner: true },
                    },
                },
            });

            // 4) if success: mark bike unavailable
            if (data.status === "success") {
                await tx.bike.update({
                    where: { id: updatedBooking.bikeId! },
                    data: {
                        available: false,
                    },
                });

                // 5) create invoice
                await tx.invoice.create({
                    data: {
                        customerName: updatedBooking.customer!.fullName,
                        customerContact: updatedBooking.customer!.contact,
                        ownerName: updatedBooking.bike?.owner.fullName!,
                        ownerContact: updatedBooking.bike?.owner.contact!,
                        bikeName: updatedBooking.bike?.bikeName!,
                        bikeType: updatedBooking.bike?.bikeType!,
                        startTime: updatedBooking.startTime,
                        endTime: updatedBooking.endTime,
                        pricePerDay: updatedBooking.bike?.pricePerDay!,
                        totalPrice: updatedBooking.totalPrice,
                        paymentMethod: updatedPayment.method,
                        customerId: updatedBooking.customerId!,
                        bikeId: updatedBooking.bikeId!,
                        transactionId: updatedPayment.transactionId
                    },
                });
            }
            return { updatedPayment, updatedBooking };
        });

        // 5) Send notifications after the transaction
        if (data.status === "success" && updatedBooking) {
            try {
                await sendNotification(
                    updatedBooking.customer!.id.toString(),
                    "booking-created-customer",
                    {
                        customerName: updatedBooking.customer?.fullName,
                        ownerName: updatedBooking.bike?.owner.fullName!,
                        bikeName: updatedBooking.bike?.bikeName,
                        startTime: updatedBooking.startTime ? fmtDate(new Date(updatedBooking.startTime)) : "N/A",
                        endTime: updatedBooking.endTime ? fmtDate(new Date(updatedBooking.endTime)) : "N/A",
                        totalPrice: updatedBooking.totalPrice,
                    }
                );

                await sendNotification(
                    updatedBooking.bike!.owner.id.toString(),
                    "booking-created-owner",
                    {
                        ownerName: updatedBooking.bike?.owner.fullName!,
                        customerName: updatedBooking.customer?.fullName,
                        bikeName: updatedBooking.bike?.bikeName,
                        startTime: updatedBooking.startTime ? fmtDate(new Date(updatedBooking.startTime)) : "N/A",
                        endTime: updatedBooking.endTime ? fmtDate(new Date(updatedBooking.endTime)) : "N/A",
                        totalPrice: updatedBooking.totalPrice,
                    }
                );

                const admins = await prisma.user.findMany({ where: { role: "admin" } });
                for (const admin of admins) {
                    await sendNotification(
                        admin.id.toString(),
                        "booking-created-admin",
                        {
                            ownerName: updatedBooking.bike?.owner.fullName!,
                            customerName: updatedBooking.customer?.fullName,
                            bikeName: updatedBooking.bike?.bikeName,
                            startTime: updatedBooking.startTime ? fmtDate(new Date(updatedBooking.startTime)) : "N/A",
                            endTime: updatedBooking.endTime ? fmtDate(new Date(updatedBooking.endTime)) : "N/A",
                            totalPrice: updatedBooking.totalPrice,
                        }
                    );
                }
            }
            catch (error) {
                console.error("Knock notification error:", error);
            }
        }

        return updatedPayment;
    }
    catch (error) {
        console.error("Error finalizing payment:", error);
        throw error;
    }
}

export async function getPaymentById(id: number): Promise<Payment | null> {
    return await prisma.payment.findUnique({ where: { id } });
}

export async function getAllPayments(): Promise<Payment[]> {
    return await prisma.payment.findMany();
}

export async function updatePayment(
    id: number,
    data: Partial<{
        transactionId: string;
        amount: number;
        method: string;
        status: PaymentStatus;
    }>
): Promise<Payment> {
    return await prisma.payment.update({ where: { id }, data });
}

export async function deletePayment(id: number): Promise<Payment> {
    return await prisma.payment.delete({ where: { id } });
}
