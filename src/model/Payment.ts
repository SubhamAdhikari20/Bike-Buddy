// src/model/Payments.ts
import prisma from "@/lib/prisma";
import { Payment, PaymentStatus } from "@prisma/client";

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
export async function finalizePayment(data: {
    transactionUuid: string;
    gatewayRef: string;
    status: PaymentStatus;
}): Promise<Payment> {
    return await prisma.$transaction(async (tx) => {
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
                status: data.status === "success" ? "completed" : "failed",
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
                },
            });
        }
        return updatedPayment;
    });

}

export async function recordPayment(data: {
    bookingId: number;
    transactionId: string;
    amount: number;
    method: string;
    status: PaymentStatus;
}): Promise<Payment> {
    await prisma.booking.update({
        where: { id: data.bookingId },
        data: {
            status: data.status === "success" ? "completed" : "pending",
            paymentReference: data.transactionId
        },
    });
    return prisma.payment.create({ data });
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
