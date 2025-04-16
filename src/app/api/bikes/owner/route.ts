// src/api/bikes/owner/route.ts
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { ownerId, bikeName, bikeDescription, bikeLocation, pricePerHour, available } = await request.json();

        const bike = await prisma.bike.create({
            data: {
                ownerId,
                bikeName,
                bikeDescription,
                bikeLocation,
                pricePerHour,
                available: available ?? true,
            },
        });

        return Response.json({ success: true, bike }, { status: 201 });
    }
    catch (error) {
        console.error("Error creating bike listing:", error);
        return Response.json({ success: false, message: "Error creating bike listing" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        // Expect ownerId as a query parameter, e.g. /api/bikes/owner?ownerId=1
        const { searchParams } = new URL(request.url);
        const ownerId = searchParams.get("ownerId");
        if (!ownerId) {
            return Response.json(
                { success: false, message: "ownerId is required" },
                { status: 400 }
            );
        }

        const bikes = await prisma.bike.findMany({
            where: { ownerId: parseInt(ownerId) },
            orderBy: { createdAt: "desc" },
            include: { images: true }, // Include images if needed
        });
        return Response.json(bikes);
    } catch (error) {
        console.error("Error fetching bikes:", error);
        return Response.json(
            { success: false, message: "Failed to fetch bikes" },
            { status: 500 }
        );
    }
}
