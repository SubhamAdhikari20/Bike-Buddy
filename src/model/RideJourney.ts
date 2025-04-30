// src/model/RideJourney.ts
import prisma from "@/lib/prisma";
import { RideJourney, RideJourneyStatus } from "@prisma/client";

export async function createRideJourney(data: {
    startTime: Date | string;
    endTime: Date | string | null;
    status?: RideJourneyStatus;
    customerId: number;
    bikeId: number;
    bookingId: number;
}): Promise<RideJourney> {
    return await prisma.rideJourney.create({
        data: {
            startTime: new Date(data.startTime),
            endTime: data.endTime ? new Date(data.endTime) : null,
            status: data.status || "active",
            customerId: data.customerId,
            bikeId: data.bikeId,
            bookingId: data.bookingId,
        },
    });

    // booking table insert after payment (userdetails ), bike id [pass], booking create
    /// after that update bike table set availability to 0 where bike id == passed bike id 
}

export async function updateRideJourney(
    id: number,
    data: Partial<{
        startTime: Date | string;
        endTime: Date | string;
        status: RideJourneyStatus;
    }>
): Promise<RideJourney> {
    const updateData = {
        ...data,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
    };
    return await prisma.rideJourney.update({ where: { id }, data: updateData });
}
