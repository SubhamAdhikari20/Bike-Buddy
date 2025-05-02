// src/app/api/admin/rental-report/route.ts
import { getAllInvoices } from "@/model/Invoice";

export async function GET() {
    try {
        const rentals = await getAllInvoices();
        return Response.json(rentals, { status: 200 });
    }
    catch (error) {
        return Response.json(
            { success: false, message: "Failed to fetch rental history" },
            { status: 500 }
        );
    }
}
