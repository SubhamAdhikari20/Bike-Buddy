// src/app/api/bikes/owner/route.ts
import { createBike, getAllBikesByOwnerId } from "@/model/Bike";

export async function POST(request: Request) {
    try {
        const { ownerId, bikeName, bikeType, bikeDescription, bikeLocation, pricePerDay, bikeImageUrl, available } = await request.json();

        const newBike = await createBike({
            ownerId,
            bikeName,
            bikeType,
            bikeDescription,
            bikeLocation,
            pricePerDay,
            bikeImageUrl,
            available: available ?? true,
        });

        return Response.json({ success: true, message: "New Bike added for the rental successfully", bike: newBike }, { status: 201 });
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
        const ownerIdParam = searchParams.get("ownerId");

        if (!ownerIdParam) {
            return Response.json(
                { success: false, message: "ownerId is required" },
                { status: 400 }
            );
        }
        const ownerId = Number(ownerIdParam);

        const bikes = await getAllBikesByOwnerId(ownerId);
        return Response.json(bikes, { status: 200 });
    }
    catch (error) {
        console.error("Error fetching bikes:", error);
        return Response.json(
            { success: false, message: "Failed to fetch bikes" },
            { status: 500 }
        );
    }
}
