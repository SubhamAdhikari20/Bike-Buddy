import prisma from "@/lib/prisma";
import { Bike } from "@prisma/client";

export async function createBike(data: {
    ownerId: number;
    bikeName: string;
    bikeDescription: string;
    bikeLocation: string;
    pricePerHour: number | string; // Accept number or string convertible to Decimal
    available?: boolean;
}): Promise<Bike> {
    return await prisma.bike.create({
        data: {
            ownerId: data.ownerId,
            bikeName: data.bikeName,
            bikeDescription: data.bikeDescription,
            bikeLocation: data.bikeLocation,
            pricePerHour: data.pricePerHour,
            available: data.available ?? true,
        },
    });
}

export async function getBikeById(id: number): Promise<Bike | null> {
    return await prisma.bike.findUnique({ where: { id } });
}

export async function getAllBikes(): Promise<Bike[]> {
    return await prisma.bike.findMany();
}

export async function updateBike(
    id: number,
    data: Partial<{
        bikeName: string;
        bikeDescription: string;
        bikeLocation: string;
        pricePerHour: number | string;
        available: boolean;
    }>
): Promise<Bike> {
    return await prisma.bike.update({
        where: { id },
        data,
    });
}

export async function deleteBike(id: number): Promise<Bike> {
    return await prisma.bike.delete({ where: { id } });
}
