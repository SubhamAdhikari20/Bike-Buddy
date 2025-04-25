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
        const payment = await tx.payment.findUniqueOrThrow({
            where: { transactionId: data.transactionUuid },
        });

        const updated = await tx.payment.update({
            where: { id: payment.id },
            data: {
                transactionId: data.gatewayRef,
                status: data.status,
            },
            include: {
                booking: true,
            },
        });

        await tx.booking.update({
            where: { id: updated.bookingId! },
            data: {
                status: data.status === "success" ? "completed" : "failed",
                paymentReference: data.gatewayRef,
            },
        });

        if (data.status === "success") {
            await tx.bike.update({
                where: { id: updated.booking?.bikeId! },
                data: {
                    available: false,
                },
            });
        }

        return updated;
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
