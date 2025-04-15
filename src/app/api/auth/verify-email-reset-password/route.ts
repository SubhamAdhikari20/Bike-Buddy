// src/app/api/auth/verify-email-reset-password/route.ts
import { getUserByEmail } from "@/model/User";

export async function POST(request: Request) {
    if (request.method !== "POST") {
        return Response.json(
            {
                success: false,
                message: "Method not allowed!",
            },
            { status: 405 }
        );
    }

    try {
        const { email, code } = await request.json();
        const decodedEmail = decodeURIComponent(email);
        const user = await getUserByEmail(decodedEmail);

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found for this email address!"
                },
                { status: 500 }
            );
        }

        const isCodeValid = user.verifyEmailResetPassword === code;

        const expiryDate = user.verifyEmailResetPasswordExpiryDate ? new Date(user.verifyEmailResetPasswordExpiryDate) : null;
        const isCodeNotExpired = expiryDate ? expiryDate > new Date() : false;

        if (isCodeValid && isCodeNotExpired) {
            return Response.json(
                {
                    success: true,
                    message: "Email Address verified successfully for reseting password."
                },
                { status: 200 }
            );
        }
        else if (!isCodeNotExpired) {
            return Response.json(
                {
                    success: false,
                    message: "Verification code for reseting password has expired!"
                },
                { status: 400 }
            );
        }
        else {
            return Response.json(
                {
                    success: false,
                    message: "Incorrect Verification Codefor reseting password!"
                },
                { status: 400 }
            );
        }



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