// src/lib/payments/esewa.ts
import CryptoJS from "crypto-js";

export interface KhaltiPayload {
    return_url: string;
    website_url: string;
    amount: string;
    purchase_order_id: string;
    purchase_order_name: string;

}

export function buildESewaPayload(amount: number): KhaltiPayload {
    const return_url = `${process.env.FRONTEND_URL}/api/payments/esewa/success`;
    const website_url = `${process.env.FRONTEND_URL}`;
    const purchase_order_id = process.env.ESEWA_PRODUCT_CODE!;
    const purchase_order_name = process.env.ESEWA_PRODUCT_CODE!;


    // const hashString =
    //     `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    // const secret = process.env.ESEWA_SECRET_KEY!;
    // const signature = CryptoJS.HmacSHA256(hashString, secret)
    //     .toString(CryptoJS.enc.Base64);

    return {
        amount: amount.toString(),
        return_url,
        website_url,
        purchase_order_id,
        purchase_order_name
    };
}


export async function initiateKhaltiPayment(
    bookingId: number,
    amount: number
): Promise<{ paymentUrl: string }> {
    // e.g. call Khalti’s server‐side endpoint:
    const res = await fetch(`${process.env.BACKEND_URL}/api/payments/khalti/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, amount }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return { paymentUrl: json.paymentUrl };
}
