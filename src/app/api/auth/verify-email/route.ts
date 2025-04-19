
import { getUserByEmail, updateUser } from "@/model/User";

export async function POST(req: Request) {
    const { email, code } = await req.json();
    if (!email || !code) {
        return Response.json({ message: "Email and code required" }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
        return Response.json({ message: "User not found" }, { status: 404 });
    }
    if (user.verifyCode !== code || (user.verifyCodeExpiryDate! < new Date())) {
        return Response.json({ message: "Invalid or expired code" }, { status: 400 });
    }

    await updateUser(user.id, {
        isVerified: true,
        verifyCode: null,
        verifyCodeExpiryDate: null,
    });

    return Response.json({ message: "Email verified" }, { status: 200 });
}
