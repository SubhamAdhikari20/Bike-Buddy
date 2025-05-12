import prisma from "@/lib/prisma";
import { Bike, BikeType } from "@prisma/client";

export async function createBike(data: {
    ownerId: number;
    bikeName: string;
    bikeType: BikeType;
    bikeDescription: string;
    bikeLocation: string;
    pricePerDay: number | string; // Accept number or string convertible to Decimal
    bikeImageUrl?: string;
    available?: boolean;
}): Promise<Bike> {
    return await prisma.bike.create({
        data: {
            ownerId: data.ownerId,
            bikeName: data.bikeName,
            bikeType: data.bikeType,
            bikeDescription: data.bikeDescription,
            bikeLocation: data.bikeLocation,
            pricePerDay: data.pricePerDay,
            bikeImageUrl: data.bikeImageUrl,
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

export async function getAllBikesByOwnerId(ownerId: number): Promise<Bike[]> {
    return await prisma.bike.findMany({
        where: { ownerId: ownerId },
        orderBy: [{ createdAt: "desc" }, { updatedAt: "desc" }]
    });
}

export async function updateBike(
    id: number,
    data: Partial<{
        bikeName: string;
        bikeType: BikeType;
        bikeDescription: string;
        bikeLocation: string;
        pricePerDay: number | string;
        bikeImageUrl: string;
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
