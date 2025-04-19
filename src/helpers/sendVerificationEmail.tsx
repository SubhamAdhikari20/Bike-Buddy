import { resend } from "@/lib/resendEmail";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";
import nodemailer from "nodemailer";
import { render } from '@react-email/components';
import React from "react";


export const sendVerificationEmail = async (
    fullName: string,
    email: string,
    otp: string
): Promise<ApiResponse> => {
    try {
        // await resend.emails.send({
        //     from: 'onboarding@resend.dev',
        //     to: email,
        //     subject: 'Bike Buddy | Verification code',
        //     react: VerificationEmail({ fullName, email, otp }),
        //   });

        const html = await render(
            <VerificationEmail fullName={fullName} email={email} otp={otp} />
        );

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        // 3) Send the email
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Bike Buddy | Verification Code",
            html
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
