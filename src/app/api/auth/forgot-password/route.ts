// src/app/api/auth/forgot-password/route.ts
import { sendResetPasswordVerificationEmail } from "@/helpers/sendResetPasswordVerificationEmail";
import { getUserByEmail, updateUser } from "@/model/User";

export const POST = async (req: Request) => {
    try {
        const { email } = await req.json();

        const user = await getUserByEmail(email);

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid email address. User not availabale!"
                },
                {
                    status: 400
                }
            );
        }

        // send verfication email for reseting password
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryDate = new Date()
        expiryDate.setHours(expiryDate.getHours() + 1);

        await updateUser(user?.id, {
            verifyEmailResetPassword: otp,
            verifyEmailResetPasswordExpiryDate: expiryDate
        });

        const emailResponse = await sendResetPasswordVerificationEmail(user?.fullName, email, otp);

        if (!emailResponse.success) {
            return Response.json(
                {
                    success: false,
                    message: emailResponse.message
                },
                {
                    status: 500
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Password reset instructions have been sent to your email"
            },
            {
                status: 201
            }
        );
    }
    catch (error) {
        console.error("Error sending verification email code for reseting password to the user: ", error);
        return Response.json(
            {
                success: false,
                message: "Error sending verification email code for reseting password to the user"
            },
            {
                status: 500
            }
        );
    }
}