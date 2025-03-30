// src/api/bookings/history.ts
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return Response.json({ success: false, message: "userId is required" }, { status: 400 });
        }

        const bookings = await prisma.booking.findMany({
            where: { customerId: parseInt(userId) },
            include: { bike: true, payment: true },
        });

        return Response.json(
            {
                success: true,
                bookings
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error retrieving rental history:", error);
        return Response.json(
            {
                success: false,
                message: "Error retrieving rental history"
            },
            { status: 500 }
        );
    }
}
