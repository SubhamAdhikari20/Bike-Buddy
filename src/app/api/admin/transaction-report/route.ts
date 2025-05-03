// src/app/api/admin/transaction-report/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getAllPayments } from "@/model/Payment";

export async function GET(request: NextRequest) {
    try {
        const rentals = await getAllPayments();
        return NextResponse.json(rentals, { status: 200 });
    }
    catch (error) {
        return NextResponse.json(
            { success: false, message: "Failed to fetch transaction history" },
            { status: 500 }
        );
    }
}
