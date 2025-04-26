// src/lib/payments/khalti.ts
import axios from "axios";

export interface KhaltiInitRequest {
    return_url: string;
    website_url: string;
    amount: number;
    purchase_order_id: string;
    purchase_order_name: string;
}

export interface KhaltiInitResponse {
    pidx: number;
    payment_url: string;
}


export interface KhaltiVerifyResponse {
    idx: number;
    status: string;
}


// Function to initiate Khalti Payment
export const initiateKhaltiPayment = async (req: KhaltiInitRequest): Promise<KhaltiInitResponse> => {
    const url = `${process.env.KHALTI_GATEWAY_URL}/api/v2/epayment/initiate/`;

    const payload = {
        return_url: req.return_url,
        website_url: req.website_url,
        amount: req.amount * 100,
        purchase_order_id: req.purchase_order_id,
        purchase_order_name: req.purchase_order_name,
    }

    const headersList = {
        headers:
        {
            "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`,
            "Content-Type": "application/json",
        }
    };

    try {
        const response = await axios.post<KhaltiInitResponse>(url, payload, headersList);
        return response.data;
    }
    catch (error: any) {
        console.error("Error initializing Khalti payment:", error.response?.data || error.message);
        throw new Error("Failed to initiate Khalti payment");
    }
}


export const verifyKhaltiPayment = async (pidx: number): Promise<KhaltiVerifyResponse> => {
    const url = `${process.env.KHALTI_GATEWAY_URL}/api/v2/epayment/lookup/`
    const headersList = {
        headers:
        {
            "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`,
            "Content-Type": "application/json",
        }
    };

    try {
        const response = await axios.post<KhaltiVerifyResponse>(url, { pidx }, headersList);
        return response.data;
    }
    catch (error: any) {
        console.error("Error verifying Khalti payment:", error.response?.data || error.message);
        throw new Error("Failed to verify Khalti payment");
    }
}
