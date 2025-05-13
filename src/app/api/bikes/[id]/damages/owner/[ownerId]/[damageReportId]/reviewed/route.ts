// src/api/bikes/[id]/damages/owner/[ownerId]/[damageReportId]/reviewed/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { sendNotification } from "@/helpers/sendNotification";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string, ownerId: string, damageReportId: string }> }) {
    try {
        const params = await context.params;
        const ownerId = Number(params.ownerId);
        const damageReportId = Number(params.damageReportId);
        if (!damageReportId) {
            return NextResponse.json(
                { success: false, message: "Damage Report Id is required" },
                { status: 400 }
            );
        }

        const data = await request.json();

        const damageReports = await prisma.damageReport.update({
            where: { id: damageReportId },
            data: {
                status: data.status === "reviewed" ? "reviewed" : "pending",
            }
        });

        const owner = await prisma.user.findUnique({ where: { id: ownerId } });
        const customer = await prisma.user.findUnique({ where: { id: damageReports.customerId! } });

        if (damageReports) {
            await sendNotification(
                customer!.id.toString(),
                "damage-reviewed-customer",
                {
                    customerName: customer?.fullName,
                    ownerName: owner?.fullName,
                }
            );
            await sendNotification(
                ownerId.toString(),
                "damage-reviewed-owner",
                {
                    ownerName: owner?.fullName,
                    customerName: customer?.fullName,
                }
            );
        }


        return NextResponse.json({ success: true, message: "Damage report submitted", damageReports }, { status: 200 });
    }
    catch (error) {
        console.error("Error reporting damage:", error);
        return NextResponse.json({ success: false, message: "Error reporting damage" }, { status: 500 });
    }
}
