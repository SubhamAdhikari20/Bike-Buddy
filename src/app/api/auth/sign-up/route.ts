// src/api/sign-up/route.ts
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { createUser, getUserByEmail, getUserByUsername } from "@/model/User";
// import databaseConnection from "@/lib/databseConnection";
// import UserModel from "@/model/UserModel";

export const POST = async (req: Request) => {
    // await databaseConnection();

    try {
        const { fullName, username, email, password, contact, role } = await req.json();

        const existingUserVerifiedByUsername = await getUserByUsername(username);

        // const existingUserVerifiedByUsername = await UserModel.findOne({
        //     username,
        //     isVerified: false
        // });

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

        // const existingUserByEmail = await UserModel.findOne({ email });

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
                const salt = bcrypt.genSaltSync(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                const expiryDate = new Date()
                expiryDate.setHours(expiryDate.getHours() + 1);

                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = otp;
                existingUserByEmail.verifyCodeExpiryDate = expiryDate;
                
                // await existingUserByEmail.save();
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
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = await createUser({
                fullName,
                username,
                email,
                password: hashedPassword,
                contact,
                profilePictureUrl: "",
                verifyCode: otp,
                verifyCodeExpiryDate: expiryDate,
                isVerified: false,
                role
            });
            // const newUser = new UserModel({
            //     fullName,
            //     username,
            //     email,
            //     password: hashedPassword,
            //     contact,
            //     verifyCode: otp,
            //     verifyCodeExpiryDate: expiryDate,
            //     isVerified: false
            // });

            // await newUser.save();

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