// src/app/api/bikes/[id]/route.ts
import { getBikeById, updateBike, deleteBike } from "@/model/Bike";
export async function GET(request: Request, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;
        const bikeId = Number(id);
        const bike = await getBikeById(bikeId);
        if (!bike) {
            return Response.json({ success: false, message: "Bike not found" }, { status: 404 });
        }
        return Response.json({ success: true, bike }, { status: 200 });
    }
    catch (error) {
        console.error("Error fetching bike data:", error);
        return Response.json(
            { success: false, message: "Failed to fetch bike data" },
            { status: 500 }
        );
    }
}