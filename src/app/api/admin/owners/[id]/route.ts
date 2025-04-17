// src/app/api/admin/owners/[id]/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    try {
        const deleted = await prisma.user.delete({
            where: { id: Number(params.id) },
        });

        return NextResponse.json({
            success: true,
            message: `Owner ${deleted.fullName} deleted successfully.`,
        });
    } catch (error) {
        console.error("Error deleting owner:", error);
        return NextResponse.json(
            { success: false, message: "Failed to delete owner" },
            { status: 500 }
        );
    }
}