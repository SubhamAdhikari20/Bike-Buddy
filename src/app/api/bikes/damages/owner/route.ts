// src/api/bikes/damages/owner/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export const GET = async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const ownerIdParam = searchParams.get("ownerId");
        const ownerId = Number(ownerIdParam);
        if (!ownerId) {
            return Response.json(
                { success: false, message: "Owner Id is required" },
                { status: 400 }
            );
        }

        const reports = await prisma.damageReport.findMany({
            where: {
                ownerId
            },
            include: {
                bike: {
                    include: { owner: true, bookings: true },
                },
                customer: true,
                images: true
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ success: true, reports }, { status: 200 });
    }
    catch (error) {
        console.error("Error fetching damgre reports:", error);
        return Response.json(
            { success: false, message: "Failed to damgre reports" },
            { status: 500 }
        );
    }
};