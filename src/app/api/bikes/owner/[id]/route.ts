// src/app/api/bikes/owner/[id]/route.ts
import { updateBike, deleteBike } from "@/model/Bike";
import { uploadImage } from "@/lib/uploadImage";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const bikeId = Number(params.id);
        const data = await request.json();

        const updatedBike = await updateBike(bikeId, data);

        // const form = await request.formData();

        // // collect fields
        // const bikeName = String(form.get("bikeName") || "");
        // const bikeDescription = String(form.get("bikeDescription") || "");
        // const bikeLocation = String(form.get("bikeLocation") || "");
        // const pricePerHour = Number(form.get("pricePerHour"));
        // const available = form.get("available") === "true";

        // // upload new image if provided
        // let bikeImageUrl = String(form.get("bikeImageUrl") || "");
        // const maybeFile = form.get("image");
        // if (maybeFile instanceof File) {
        //     const buffer = Buffer.from(await maybeFile.arrayBuffer());
        //     bikeImageUrl = await uploadImage(buffer, maybeFile.name);
        // }

        // const updatedBike = await updateBike(bikeId, {
        //     bikeName,
        //     bikeDescription,
        //     bikeLocation,
        //     pricePerHour,
        //     bikeImageUrl: bikeImageUrl || undefined,
        //     available,
        // });

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
