// src/model/Booking.ts
import prisma from "@/lib/prisma";
import { Bike, Booking, BookingStatus, User } from "@prisma/client";

export async function createBooking(data: {
    customerId: number;
    ownerId: number;
    bikeId: number;
    startTime: Date | string;
    endTime: Date | string;
    totalPrice: number;
    status?: BookingStatus;
}): Promise<Booking> {
    return await prisma.booking.create({
        data: {
            customerId: data.customerId,
            ownerId: data.ownerId,
            bikeId: data.bikeId,
            startTime: new Date(data.startTime),
            endTime: new Date(data.endTime),
            totalPrice: data.totalPrice,
            status: data.status || "pending",
        },
    });

    // booking table insert after payment (userdetails ), bike id [pass], booking create
    /// after that update bike table set availability to 0 where bike id == passed bike id 
}

export async function getBookingById(id: number): Promise<Booking | null> {
    return await prisma.booking.findUnique({ where: { id } });
}

type BookingWithStats = Booking & {
    bike: (Bike & { owner: User }) | null;
    customer: User | null;
};

export async function getBookingByCustomerId(customerId: number): Promise<BookingWithStats[] | null> {
    return await prisma.booking.findMany({
        where: { customerId: customerId, status: "active" },
        include: {
            bike: {
                include: {
                    owner: true
                }
            },
            customer: true
        },
    });
}

// export async function getBookingByOwnerId(ownerId: number): Promise<Booking[] | null> {
//     return await prisma.booking.findMany({
//         where: { ownerId: ownerId, status: "active" },
//         include: {
//             bike: {
//                 include: {
//                     customer: true
//                 }
//             },
//             owner: true
//         },
//     });
// }

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
