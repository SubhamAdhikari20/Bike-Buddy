// src/api/payments/initiate/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBookingById } from "@/model/Booking";
import { buildESewaPayload } from "@/lib/payments/esewa";
import { initiateKhaltiPayment, verifyKhaltiPayment } from "@/lib/payments/khalti";
import { createPaymentRecord } from "@/model/Payment";
import { getBikeById } from "@/model/Bike";
import { paymentSchema } from "@/schemas/paymentSchema";
import prisma from "@/lib/prisma";
import crypto from "crypto";


const InitiateSchema = z.object({
    bookingId: z.number(),
    amount: z.number().positive(),
    method: z.enum(["khalti", "esewa"]),
});

export async function POST(req: Request) {
    try {
        const { bookingId, amount, method } = InitiateSchema.parse(await req.json());

        // 1) ensure booking exists & still pending
        const booking = await getBookingById(bookingId);
        if (!booking) {
            return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
        }

        if (booking.status !== "pending") {
            return NextResponse.json({ success: false, message: "Booking already processed" }, { status: 400 });
        }

        if (booking.status === "pending") {
            await prisma.payment.deleteMany({
                where: { bookingId, status: 'pending' }
            });
        }

        // 2) generate our internal transaction UUID
        const transactionUuid = crypto.randomUUID();

        // 3) record a 'pending' Payment
        await createPaymentRecord({
            bookingId,
            transactionUuid,
            amount,
            method,
        });

        // 4) build gateway payload
        if (method === "esewa") {
            const payload = buildESewaPayload(amount, transactionUuid);
            return NextResponse.json({
                success: true,
                method: "esewa",
                gatewayUrl: `${process.env.ESEWA_GATEWAY_URL}/api/epay/main/v2/form`,
                formData: payload,
            });
        }
        else {
            // For product name
            const bike = await getBikeById(booking.bikeId!);
            // --- call Khalti ---
            const initKhalti = await initiateKhaltiPayment({
                return_url: `${process.env.BACKEND_URL}/api/payments/khalti/callback`,
                website_url: process.env.FRONTEND_URL!,
                amount,
                purchase_order_id: transactionUuid,
                purchase_order_name: bike?.bikeName!,  // your product name
            });

            return NextResponse.json({
                success: true,
                method: "khalti",
                paymentUrl: initKhalti.payment_url,
            });
        }
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
}

