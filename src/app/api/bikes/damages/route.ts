// src/api/bikes/damages/route.ts
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { bikeId, customerId, description } = await request.json();

        // For simplicity, store damage report as a Message entry. You could create a separate model if needed.
        const damageReport = await prisma.message.create({
            data: {
                content: `Damage Report for Bike ${bikeId}: ${description}`,
                user: { connect: { id: customerId } },
            },
        });

        return Response.json({ success: true, damageReport }, { status: 201 });
    } 
    catch (error) {
        console.error("Error reporting damage:", error);
        return Response.json({ success: false, message: "Error reporting damage" }, { status: 500 });
    }
}
