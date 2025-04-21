// src/app/api/bikes/owner/[id]/route.ts
import { updateBike, deleteBike } from "@/model/Bike";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const bikeId = Number(params.id);
        const data = await request.json();

        const updatedBike = await updateBike(bikeId, data);
        return Response.json({ success: true, message: "Bike updated successfully", bike: updatedBike }, { status: 200 });
    }
    catch (error) {
        console.error("Error updating bike:", error);
        return Response.json(
            { success: false, message: "Failed to update bike" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const bikeId = Number(params.id);
        await deleteBike(bikeId);
        return Response.json({ success: true, message: "Bike deleted successfully" }, { status: 200 });
    }
    catch (error) {
        console.error("Error deleting bike:", error);
        return Response.json(
            { success: false, message: "Failed to delete bike" },
            { status: 500 }
        );
    }
}
