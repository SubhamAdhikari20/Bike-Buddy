// src/app/api/admin/rental-report/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { deleteInvoiceById } from "@/model/Invoice";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const invoiceId = Number(id);
        const deleted = await deleteInvoiceById(invoiceId);

        return NextResponse.json({
            success: true,
            message: "Rental history deleted successfully.",
            deleted
        }, { status: 200 });
    }
    catch (error) {
        console.error("Error deleting rental history:", error);
        return NextResponse.json(
            { success: false, message: "Failed to delete rental history" },
            { status: 500 }
        );
    }
}