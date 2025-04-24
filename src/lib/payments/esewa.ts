// src/lib/payments/esewa.ts
import CryptoJS from "crypto-js";

export interface ESewaPayload {
    amount: string;
    total_amount: string;
    tax_amount: string;
    transaction_uuid: string;
    product_service_charge: string;
    product_delivery_charge: string;
    product_code: string;
    success_url: string;
    failure_url: string;
    signed_field_names: string;
    signature: string;
}

export function buildESewaPayload(amount: number, transactionUuid: string): ESewaPayload {
    const total_amount = amount.toFixed(2);
    const transaction_uuid = transactionUuid;
    const product_code = process.env.ESEWA_PRODUCT_CODE!;
    // const success_url = `${process.env.ESEWA_SUCCESS_URL}`;
    // const failure_url = `${process.env.ESEWA_FAILURE_URL}`;
    const callbackUrl = `${process.env.BACKEND_URL}/api/payments/esewa/callback`;
    const success_url = callbackUrl;
    const failure_url = callbackUrl;

    const signed_field_names = "total_amount,transaction_uuid,product_code";

    const hashString =
        `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const secret = process.env.ESEWA_SECRET_KEY!;
    const signature = CryptoJS.HmacSHA256(hashString, secret)
        .toString(CryptoJS.enc.Base64);

    return {
        amount: amount.toString(),
        total_amount,
        tax_amount: "0",
        transaction_uuid,
        product_service_charge: "0",
        product_delivery_charge: "0",
        product_code,
        success_url,
        failure_url,
        signed_field_names,
        signature,
    };
}
