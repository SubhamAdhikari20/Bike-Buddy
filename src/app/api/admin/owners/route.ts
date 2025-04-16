// src/app/api/admin/owners/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export async function GET() {
    try {
        const owners = await prisma.user.findMany({
            where: { role: Role.owner },
        });
        return NextResponse.json(owners);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch owners" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();

        const newOwner = await prisma.user.create({
            data: {
                ...data,
                role: Role.owner,
            },
        });

        return NextResponse.json(newOwner, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create owner" },
            { status: 500 }
        );
    }
}