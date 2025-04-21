// src/app/api/auth/edit-profile/[id]/route.ts
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { updateUser, getUserByEmail, getUserByUsername, deleteUser, getUserById } from "@/model/User";

export async function PUT(request: Request, context: { params: { id: string } }) {
    const { id } = await context.params;
    const userId = Number(id);

    let data: {
        fullName?: string;
        username?: string;
        email?: string;
        contact?: string;
        profilePictureUrl?: string;
    };

    try {
        data = await request.json();
        const userById = await getUserById(userId);

        if (!userById) {
            return Response.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        // Changing Email
        let existingUserByEmail;
        if (data.email && data.email !== userById.email) {
            existingUserByEmail = await getUserByEmail(data.email);
            if (existingUserByEmail && existingUserByEmail.id !== userId) {
                return Response.json(
                    { success: false, message: "Email is already in use" },
                    { status: 400 }
                );
            }
        }

        // Changing Username
        let otp: string | null | undefined;
        let existingUserByUsername;
        if (data.username && data.username !== userById.username) {
            existingUserByUsername = await getUserByUsername(data.username);
            if (existingUserByUsername && existingUserByUsername.id !== userId) {
                return Response.json(
                    { success: false, message: "Username is already taken" },
                    { status: 400 }
                );
            }

            // If the username is not taken
            otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiryDate = new Date();
            expiryDate.setMinutes(expiryDate.getMinutes() + 10);

            userById.verifyCode = otp;
            userById.verifyCodeExpiryDate = expiryDate;
            userById.isVerified = false;
        }

        // Perform the update
        const updatedUser = await updateUser(userId, {
            fullName: data.fullName,
            username: data.username,
            email: data.email,
            contact: data.contact,
            profilePictureUrl: data.profilePictureUrl,
            verifyCode: userById.verifyCode,
            verifyCodeExpiryDate: userById.verifyCodeExpiryDate,
            isVerified: userById.isVerified,
        });


        // if OTP was generated, send the email
        if (otp) {
            // send verfication email
            const emailResponse = await sendVerificationEmail(updatedUser.fullName, updatedUser.email, otp);

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
        }

        return Response.json(
            {
                success: true,
                message: otp ?
                    "Username changed — please check your email for a verification code before logging in again."
                    : "Profile updated successfully.",
                user: updatedUser,
            },
            { status: 200 }
        );
    }
    catch (error) {
        console.error("Error updating user details: ", error);
        return Response.json(
            {
                success: false,
                message: "Error updating user details"
            },
            {
                status: 500
            }
        );
    }
};

export async function DELETE(request: Request, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;
        const userId = Number(id);

        await deleteUser(userId);
        return Response.json({ success: true, message: "User Account deleted successfully" }, { status: 200 });
    }
    catch (error) {
        console.error("Error deleting bike:", error);
        return Response.json(
            { success: false, message: "Failed to delete user account" },
            { status: 500 }
        );
    }
};

export async function GET(request: Request, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;
        const userId = Number(id);
        const user = await getUserById(userId);
        if (!user) {
            return Response.json({ success: false, message: "User not found" }, { status: 404 });
        }
        return Response.json({ success: true, user }, { status: 200 });
    }
    catch (error) {
        console.error("Error fetching user data:", error);
        return Response.json(
            { success: false, message: "Failed to fetch user data" },
            { status: 500 }
        );
    }
}