// src/api/bikes/route.ts
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        // Optional filters (e.g., location, minPrice, maxPrice)
        const location = searchParams.get("location") || undefined;
        const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
        const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;

        const bikes = await prisma.bike.findMany({
            where: {
                available: true,
                ...(location && { bikeLocation: location }),
                ...(minPrice || maxPrice) && {
                    pricePerHour: {
                        ...(minPrice ? { gte: minPrice } : {}),
                        ...(maxPrice ? { lte: maxPrice } : {}),
                    },
                },
            },
            include: {
                images: true,
                reviews: true,
                owner: true,
            },
        });
        return Response.json(
            { 
                success: true, 
                bikes
            },
            { status: 200 }
        );
    }
    catch (error) {
        console.error("Error fetching bikes:", error);
        return Response.json(
            {
                success: false,
                message: "Error fetching bikes"
            },
            { status: 500 }
        );
    }
}
