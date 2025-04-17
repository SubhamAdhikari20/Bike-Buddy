import { NextResponse } from "next/server";
import { getUserByEmail, updateUser } from "@/model/User";

export async function PUT(req: Request) {
    const { email, code } = await req.json();
    if (!email || !code) {
        return NextResponse.json({ message: "Email and code required" }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    if (user.verifyCode !== code || (user.verifyCodeExpiryDate! < new Date())) {
        return NextResponse.json({ message: "Invalid or expired code" }, { status: 400 });
    }

    await updateUser(user.id, {
        isVerified: true,
        verifyCode: null,
        verifyCodeExpiryDate: null,
    });

    return NextResponse.json({ message: "Email verified" }, { status: 200 });
}
