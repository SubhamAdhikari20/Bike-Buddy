import { resend } from "@/lib/resendEmail";
import ResetPasswordEmail from "../../emails/ResetPasswordEmail";
import { ApiResponse } from "@/types/ApiResponse";
import nodemailer from "nodemailer";
import { render } from '@react-email/components';
import React from "react";

export const sendResetPasswordVerificationEmail = async (
    fullName: string,
    email: string,
    otp: string
): Promise<ApiResponse> => {
    try {
        // await resend.emails.send({
        //     from: 'onboarding@resend.dev',
        //     to: email,
        //     subject: 'Bike Buddy | Verification code for reseting password',
        //     react: ResetPasswordEmail({ fullName, email, otp }),
        // });

        const html = await render(
            <ResetPasswordEmail fullName={fullName} email={email} otp={otp} />
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
            subject: "Bike Buddy | Verification Code for reseting password",
            html
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
