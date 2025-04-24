// src/api/payments/esewa/callback/route.ts
import { NextResponse } from "next/server";
import { finalizePayment } from "@/model/Payment";

export async function GET(req: Request) {
    const base64 = new URL(req.url).searchParams.get("data");
    if (!base64) {
        console.error("Missing eSewa data payload");
        return NextResponse.json({ success: false, message: "Missing eSewa data payload" }, { status: 400 });
    }

    let payload: {
        transaction_uuid: string;
        transaction_code: string;
        status: "COMPLETE" | "FAILED";
        total_amount: number;
    };

    try {
        const jsonString = Buffer.from(base64, "base64").toString("utf-8");
        payload = JSON.parse(jsonString);
    }
    catch (err) {
        console.error("Invalid eSewa payload", err);
        return NextResponse.json({ success: false, message: "Bad payload" }, { status: 400 });
    }

    // finalize (upsert payment & update booking)
    await finalizePayment({
        transactionUuid: payload.transaction_uuid,
        gatewayRef: payload.transaction_code,
        status: payload.status === "COMPLETE" ? "success" : "failed",
    });

    const result = payload.status === "COMPLETE" ? "success" : "failed";
    return NextResponse.redirect(`${process.env.FRONTEND_URL}/payment/receipt?status=${result}`);
}

