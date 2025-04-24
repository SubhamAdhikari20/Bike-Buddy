// src/model/Booking.ts
import prisma from "@/lib/prisma";
import { Booking, BookingStatus } from "@prisma/client";

export async function createBooking(data: {
    customerId: number;
    bikeId: number;
    startTime: Date | string;
    endTime: Date | string;
    totalPrice: number;
    status?: BookingStatus;
}): Promise<Booking> {
    return await prisma.booking.create({
        data: {
            customerId: data.customerId,
            bikeId: data.bikeId,
            startTime: new Date(data.startTime),
            endTime: new Date(data.endTime),
            totalPrice: data.totalPrice,
            status: data.status || "pending",
        },
    });
}

export async function getBookingById(id: number): Promise<Booking | null> {
    return await prisma.booking.findUnique({ where: { id } });
}

export async function getAllBookings(): Promise<Booking[]> {
    return await prisma.booking.findMany();
}

export async function updateBooking(
    id: number,
    data: Partial<{
        startTime: Date | string;
        endTime: Date | string;
        totalPrice: number;
        status: BookingStatus;
        paymentReference: string;
    }>
): Promise<Booking> {
    const updateData = {
        ...data,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
    };
    return await prisma.booking.update({ where: { id }, data: updateData });
}

export async function deleteBooking(id: number): Promise<Booking> {
    return await prisma.booking.delete({ where: { id } });
}
