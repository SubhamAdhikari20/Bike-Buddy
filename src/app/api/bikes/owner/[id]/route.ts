// src/app/api/bikes/owner/[id]/route.ts
import prisma from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const bikeId = Number(params.id);
        const body = await request.json();
        // Use the body data (e.g., bikeName, bikeDescription, etc.) to update the bike record.
        const updatedBike = await prisma.bike.update({
            where: { id: bikeId },
            data: { ...body },
            include: { images: true },
        });
        return Response.json({ success: true, bike: updatedBike });
    } catch (error) {
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
        const deletedBike = await prisma.bike.delete({
            where: { id: bikeId },
        });
        return Response.json({ success: true, bike: deletedBike });
    } catch (error) {
        console.error("Error deleting bike:", error);
        return Response.json(
            { success: false, message: "Failed to delete bike" },
            { status: 500 }
        );
    }
}
