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
