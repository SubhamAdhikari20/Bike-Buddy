// src/api/bikes/[id]/damages/owner/[ownerId]/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export const GET = async (request: NextRequest, context: { params: Promise<{ id: string, ownerId: string }> }) => {
    try {
        const params = await context.params;
        const ownerId = Number(params.ownerId);
        if (!ownerId) {
            return Response.json(
                { success: false, message: "Owner Id is required" },
                { status: 400 }
            );
        }

        const bikeId = Number(params.id);
        if (!bikeId) {
            return Response.json(
                { success: false, message: "Bike Id is required" },
                { status: 400 }
            );
        }
        const reports = await prisma.damageReport.findMany({
            where: {
                bikeId,
                ownerId
            },
            include: {
                bike: {
                    include: { owner: true },
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
