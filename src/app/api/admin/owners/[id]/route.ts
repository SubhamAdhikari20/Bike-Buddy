// src/app/api/admin/owners/[id]/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
    _: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.user.delete({
            where: { id: Number(params.id) },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete owner" },
            { status: 500 }
        );
    }
}