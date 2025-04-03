import { resend } from "@/lib/resendEmail";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";


export const sendVerificationEmail = async (
    fullName: string, 
    email: string, 
    otp: string
): Promise<ApiResponse> => {
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Bike Buddy | Verification code',
            react: VerificationEmail({ fullName, email, otp }),
          });

        return {
            success: true,
            message: "Verification email sent  successfully"
        };
    } 
    catch (error) {
        console.log("Error sending verification email: ", error);
        
        return {
            success: false,
            message: "Failed to send verification email"
        };
    }
};
