// src/api/auth/send-verification-email/route.ts
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { updateUser, getUserByEmail, getUserByUsername } from "@/model/User";

export const PUT = async (req: Request) => {

    try {
        const { username, email } = await req.json();

        const existingUserVerifiedByUsername = await getUserByUsername(username);

        if (existingUserVerifiedByUsername && existingUserVerifiedByUsername.isVerified === false) {
            return Response.json(
                {
                    success: false,
                    message: "Username is already taken"
                },
                {
                    status: 400
                }
            );
        }

        const existingUserByEmail = await getUserByEmail(email);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json(
                    {
                        success: false,
                        message: "User already exists with this email"
                    },
                    {
                        status: 400
                    }
                );
            }
            else {
                const expiryDate = new Date()
                expiryDate.setHours(expiryDate.getHours() + 1);

                existingUserByEmail.verifyCode = otp;
                existingUserByEmail.verifyCodeExpiryDate = expiryDate;

            }
            return Response.json(
                {
                    success: false,
                    message: "Email is already taken"
                },
                {
                    status: 400
                }
            );
        }
        else {
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = await updateUser(, {
                verifyCode: otp,
                verifyCodeExpiryDate: expiryDate,
                isVerified: false
            });
        }

        // send verfication email
        const emailResponse = await sendVerificationEmail(fullName, email, otp);

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
                message: "User signed up successfully. Please verify your email"
            },
            {
                status: 201
            }
        );
    }
    catch (error) {
        console.error("Error signing up the user: ", error);
        return Response.json(
            {
                success: false,
                message: "Error signing up the user"
            },
            {
                status: 500
            }
        );
    }
};