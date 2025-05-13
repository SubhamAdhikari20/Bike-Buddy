// src/app/api/bookings/my-rentals/payment-history/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const customerId = Number(searchParams.get("customerId"));

        if (!customerId) {
            console.error("User Id is required");
            return NextResponse.json({ success: false, message: "Required user id" }, { status: 400 });
        }
        const paymentsHistory = await prisma.invoice.findMany({
            where: { customerId: customerId }
        });
        return NextResponse.json({ success: true, paymentsHistory: paymentsHistory }, { status: 200 });
    }
    catch (error) {
        return NextResponse.json(
            { success: false, message: "Failed to fetch payment history" },
            { status: 500 }
        );
    }
}
