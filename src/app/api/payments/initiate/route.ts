// src/api/payments/initiate/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { buildESewaPayload } from "@/lib/payments/esewa";
import { initiateKhaltiPayment } from "@/lib/payments/khalti";
import { paymentSchema } from "@/schemas/paymentSchema";
import { createPaymentRecord } from "@/model/Payment";

const InitiateSchema = z.object({
    bookingId: z.number(),
    amount: z.number().positive(),
    method: z.enum(["khalti", "esewa"]),
});

export async function POST(req: Request) {
    try {
        const { bookingId, amount, method } = InitiateSchema.parse(await req.json());

        // 1) ensure booking exists & still pending
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking) {
            return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
        }

        if (booking.status !== "pending") {
            return NextResponse.json({ success: false, message: "Booking already processed" }, { status: 400 });
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
            const { paymentUrl } = await initiateKhaltiPayment(bookingId, amount);
            return NextResponse.json({ success: true, method: "khalti", paymentUrl });
        }
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
}
