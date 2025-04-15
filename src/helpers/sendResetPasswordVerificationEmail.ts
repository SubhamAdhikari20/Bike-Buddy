import { resend } from "@/lib/resendEmail";
import ResetPasswordEmail from "../../emails/ResetPasswordEmail";
import { ApiResponse } from "@/types/ApiResponse";

export const sendResetPasswordVerificationEmail = async (
    fullName: string,
    email: string,
    otp: string
): Promise<ApiResponse> => {
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Bike Buddy | Verification code for reseting password',
            react: ResetPasswordEmail({ fullName, email, otp }),
        });

        return {
            success: true,
            message: "Verification email for reseting password sent  successfully"
        };
    }
    catch (error) {
        console.log("Error sending verification for reseting password email: ", error);

        return {
            success: false,
            message: "Failed to send verification for reseting password email"
        };
    }
};
