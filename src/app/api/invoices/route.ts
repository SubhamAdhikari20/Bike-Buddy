// src/app/api/invoices/route.ts
import { NextResponse } from "next/server";
import { getInvoiceByTransactionId } from "@/model/Invoice";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const transactionIdParam = searchParams.get("transaction_id") || searchParams.get("transaction_uuid");;

        if (!transactionIdParam) {
            return NextResponse.json(
                { success: false, message: "Missing transactionId" },
                { status: 400 }
            );
        }
        const transactionId = transactionIdParam.toString();
        const invoice = await getInvoiceByTransactionId(transactionId);

        if (!invoice) {
            return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, invoice }, { status: 200 });
    }
    catch (error) {
        console.error("Error invoice:", error);
        return Response.json(
            { success: false, message: "Failed to fetch invoice" },
            { status: 500 }
        );
    }
}