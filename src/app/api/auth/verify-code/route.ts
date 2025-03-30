import { z } from "zod";
import { usernameValidation } from "@/schemas/user-schemas/signUPSchema";
import { getUserByUsername } from "@/model/User";

export async function POST(request: Request) {
    try {
        const { username, code } = await request.json();

        const decodedUsername = decodeURIComponent(username);

        const user = await getUserByUsername(decodedUsername);

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found!"
                },
                { status: 500 }
            );
        }

        const isCodeValid = user.verifyCode === code;
        
        const expiryDate = user.verifyCodeExpiryDate ? new Date(user.verifyCodeExpiryDate) : null;
        const isCodeNotExpired = expiryDate ? expiryDate > new Date() : false;

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;

            return Response.json(
                {
                    success: true,
                    message: "Account verified successfully"
                },
                { status: 200 }
            );
        }
        else if (!isCodeNotExpired) {
            return Response.json(
                {
                    success: false,
                    message: "Verification code has expired!"
                },
                { status: 400 }
            );
        }
        else {
            return Response.json(
                {
                    success: false,
                    message: "Incorrect Verification Code!"
                },
                { status: 400 }
            );
        }



    }
    catch (error) {
        console.error("Error while verifiy user", error);
        return Response.json(
            {
                success: false,
                message: "Error while verifiy user"
            },
            { status: 500 }
        );
    }
}