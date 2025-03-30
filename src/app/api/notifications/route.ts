// src/api/notifications/route.ts
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return Response.json({ success: false, message: "userId is required" }, { status: 400 });
        }

        const notifications = await prisma.notification.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { createdAt: "desc" },
        });

        return Response.json({ success: true, notifications }, { status: 200 });
    } 
    catch (error) {
        console.error("Error retrieving notifications:", error);
        return Response.json({ success: false, message: "Error retrieving notifications" }, { status: 500 });
    }
}
