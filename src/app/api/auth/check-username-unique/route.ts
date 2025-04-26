import { z } from "zod";
import { usernameValidation } from "@/schemas/user-schemas/signUPSchema";
import { getUserByUsername } from "@/model/User";
// import UserModel from "@/model/UserModel";
// import databaseConnection from "@/lib/databseConnection";


const UsernameQuerySchema = z.object({
    username: usernameValidation
});

export async function GET(request: Request) {

    if (request.method != "GET") {
        return Response.json(
            {
                success: false,
                message: "Method not allowed!"
            },
            { status: 405 }
        );
    }

    // await databaseConnection();

    try {
        const { searchParams } = new URL(request.url);
        const queryParam = {
            username: searchParams.get("username")
        };
        // validate with zod
        const result = UsernameQuerySchema.safeParse(queryParam);
        // console.log(result) // TODO remove

        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [];
            return Response.json(
                {
                    success: false,
                    message: usernameErrors?.length > 0 ? usernameErrors.join(", ") : "Invalid query parameters"
                },
                { status: 400 }
            );
        }

        const { username } = result.data;

        const existingVerifiedUser = await getUserByUsername(username);

        // const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true });

        if (existingVerifiedUser && existingVerifiedUser.isVerified === true) {
            return Response.json(
                {
                    success: false,
                    message: "Username is already taken!"
                },
                { status: 400 }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Username is available"
            },
            { status: 200 }
        );

    }
    catch (error) {
        console.error("Error checking username", error);
        return Response.json(
            {
                success: false,
                message: "Error checking username"
            },
            { status: 500 }
        );

    }
}

