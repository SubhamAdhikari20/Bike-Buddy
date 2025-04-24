// src/api/payments/esewa/failure/route.ts
import { NextResponse } from "next/server";
import { deleteBooking } from "@/model/Booking";
import { finalizePayment } from "@/model/Payment";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const uuid = url.searchParams.get("txUuid")!; // our transactionUuid

    await finalizePayment({
        transactionUuid: uuid,
        gatewayRef: "ESW_FAIL",
        status: "failed",
    });

    

    return NextResponse.redirect(`${process.env.WEBISTE_URL}/payment/receipt?status=failed`);
}
