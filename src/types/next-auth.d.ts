import "next-auth"
import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface User {
        id?: string;
        isVerified?: boolean;
        fullName?: string;
        username?: string;
        email?: string;
        role?: string;
        contact?: string;
        profilePictureUrl?: string;
    }

    interface Session {
        user: {
            id?: string;
            isVerified?: boolean;
            fullName?: string;
            username?: string;
            email?: string;
            role?: string;
            contact?: string;
            profilePictureUrl?: string;
        } & DefaultSession["user"]
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        isVerified?: boolean;
        fullName?: string;
        username?: string;
        email?: string;
        contact?: string;
        role?: string;
        profilePictureUrl?: string;
    }
}