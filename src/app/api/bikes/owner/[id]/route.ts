// src/app/api/bikes/owner/[id]/route.ts
import { sendNotification } from "@/helpers/sendNotification";
import { updateBike, deleteBike, getBikeById } from "@/model/Bike";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const bikeId = await Number(params.id);
        const data = await request.json();

        const updatedBike = await updateBike(bikeId, data);

        try {
            await sendNotification(
                data.ownerId.toString(),
                "bike-update-owner",
                {
                    bikeName: data.bikeName,
                    pricePerDay: data.pricePerDay
                }
            );
        }
        catch (err) {
            console.error("Knock notification error:", err);
        }

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
        const bikeId = Number(await params.id);
        const bike = await getBikeById(bikeId);
        await deleteBike(bikeId);

        try {
            await sendNotification(
                bike!.ownerId.toString(),
                "bike-delete-owner",
                {
                    bikeName: bike!.bikeName
                }
            );
        }

        catch (err) {
            console.error("Knock notification error:", err);
        }
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
