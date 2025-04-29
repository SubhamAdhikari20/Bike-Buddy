// src/api/payments/khalti/callback/route.ts
import { NextResponse } from "next/server";
import { finalizePaymentWithKhalti } from "@/model/Payment";
import { verifyKhaltiPayment } from "@/lib/payments/khalti";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const pidx = url.searchParams.get("pidx");
    const gatewayRef = url.searchParams.get("transaction_id")  // Khalti’s txn id
        ?? url.searchParams.get("txnId");
    const purchase_order_id = url.searchParams.get("purchase_order_id");
    const statusRaw = url.searchParams.get("status");         // e.g. "Completed"

    if (!pidx || !gatewayRef || !purchase_order_id || !statusRaw) {
        console.error("Missing Khalti callback params", { pidx, gatewayRef, purchase_order_id, statusRaw });
        return NextResponse.json({ success: false, message: "Missing Khalti callback parameters" }, { status: 400 });
    }

    // 2) verify with Khalti’s lookup endpoint
    // let lookup;
    // try {
    //   lookup = await verifyKhaltiPayment(Number(pidx));
    // } catch (e) {
    //   console.error("Khalti lookup failed for pidx=", pidx, e);
    //   return NextResponse.json({ success: false, message: "Failed to verify payment" }, { status: 502 });
    // }

    // const isSuccess = lookup.status === "Completed" || statusRaw === "Completed";

    // 3) map to our status
    const isSuccess = statusRaw === "Completed";
    const status = isSuccess ? "success" : "failed";

    // 4) finalize
    try {
        await finalizePaymentWithKhalti({
            transactionUuid: purchase_order_id,  // the UUID you generated earlier
            gatewayRef,
            status,
        });
    }
    catch (e) {
        console.error("Error finalizing payment:", e);
        return NextResponse.json({ success: false, message: "Failed to finalize payment" }, { status: 500 });
    }

    // 5) send user back to receipt page
    return NextResponse.redirect(
        `${process.env.FRONTEND_URL}/payment/receipt?status=${status}&transaction_id=${gatewayRef}`,
    );
}
