import prisma from "@/lib/prisma";
import { Payment } from "@prisma/client";

export async function createPayment(data: {
    bookingId: number;
    transactionId: string;
    amount: number;
    method: string;
    status: string;
}): Promise<Payment> {
    return await prisma.payment.create({
        data: {
            bookingId: data.bookingId,
            transactionId: data.transactionId,
            amount: data.amount,
            method: data.method,
            status: data.status,
        },
    });
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
        status: string;
    }>
): Promise<Payment> {
    return await prisma.payment.update({ where: { id }, data });
}

export async function deletePayment(id: number): Promise<Payment> {
    return await prisma.payment.delete({ where: { id } });
}
