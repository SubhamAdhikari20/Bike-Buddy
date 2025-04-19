
import { getUserByEmail, updateUser } from "@/model/User";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function PUT(req: Request) {
    const { email } = await req.json();
    if (!email) {
        return Response.json({ message: "Email required" }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
        return Response.json({ message: "User not found" }, { status: 404 });
    }

    // generate 6‑digit OTP & expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1h from now

    await updateUser(user.id, {
        verifyCode: otp,
        verifyCodeExpiryDate: expiry,
        isVerified: false,
    });

    const emailResponse = await sendVerificationEmail(user.fullName, email, otp);
    if (!emailResponse.success) {
        return Response.json({ message: emailResponse.message }, { status: 500 });
    }

    return Response.json({ message: emailResponse.message }, { status: 200 });
}
