// src/api/bikes/[id]/damages/owner/[ownerId]/[damageReportId]/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string, damageReportId: string }> }) {
    try {
        const params = await context.params;
        const damageReportId = Number(params.damageReportId);
        if (!damageReportId) {
            return NextResponse.json(
                { success: false, message: "Damage Report Id is required" },
                { status: 400 }
            );
        }

        const data = await request.json();

        const damageReport = await prisma.damageReport.update({
            where: { id: damageReportId },
            data: {
                status: data.status === "resolved" ? "resolved" : "pending",
            }
        });

        return NextResponse.json({ success: true, message: "Damage report submitted", damageReport }, { status: 200 });
    }
    catch (error) {
        console.error("Error reporting damage:", error);
        return NextResponse.json({ success: false, message: "Error reporting damage" }, { status: 500 });
    }
}
