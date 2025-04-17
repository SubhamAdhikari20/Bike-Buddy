// src/app/api/auth/reset-password/route.ts
import bcrypt from "bcryptjs";
import { getUserByEmail, updateUser } from "@/model/User";

export async function PUT(request: Request) {
    try {
        const { email, password } = await request.json();
        const decodedEmail = decodeURIComponent(email);

        const user = await getUserByEmail(decodedEmail);
        if (!user) {
            return Response.json(
                { success: false, message: "User not found for this email address!" },
                { status: 404 }
            );
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await updateUser(user.id, {
            password: hashedPassword,
            verifyEmailResetPassword: null,
            verifyEmailResetPasswordExpiryDate: null,
        });

        return Response.json(
            { success: true, message: "Password has been reset successfully." },
            { status: 200 }
        );
    }
    catch (error) {
        console.error("Error while verifiy user for reseting password", error);
        return Response.json(
            {
                success: false,
                message: "Error while verifiy user for reseting password"
            },
            { status: 500 }
        );
    }
}