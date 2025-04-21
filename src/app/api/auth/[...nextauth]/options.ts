// src/api/(auth)/[...nextauth]/options.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { getUserByEmailOrUsername } from "@/model/User";
// import UserModel from "@/model/UserModel";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                identifier: { label: "Username or Email", type: "text" },
                password: { label: "Password", type: "password" },
                role: { label: "Role", type: "text" }
            },
            async authorize(credentials: any): Promise<any> {

                try {
                    const user = await getUserByEmailOrUsername(credentials?.identifier);

                    // const user = await UserModel.findOne({
                    //     $or: [
                    //         { email: credentials.identifier },
                    //         { username: credentials.identifier },

                    //     ]
                    // });

                    if (!user) {
                        throw new Error("No user found with this email or username");
                    }

                    // Check that the provided role matches the stored role
                    if (credentials?.role !== user.role) {
                        throw new Error("Role does not match");
                    }

                    // if (!user.isVerified) {
                    //     throw new Error("Could not determine your user profile. Please, verifiy your account before login");
                    // }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

                    if (isPasswordCorrect) {
                        return user
                    }
                    else {
                        throw new Error("Incorrecct password!");
                    }
                }
                catch (error: any) {
                    throw new Error(error);
                }
            }
        }),

        GoogleProvider({
            clientId: `${process.env.GOOGLE_CLIENT_ID}`,
            clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id?.toString();
                token.isVerified = user.isVerified;
                token.fullName = user.fullName;
                token.username = user.username;
                token.email = user.email;
                token.role = user.role;
                token.contact = user.contact
                token.profilePictureUrl = user.profilePictureUrl
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.isVerified = token.isVerified;
                session.user.fullName = token.fullName;
                session.user.username = token.username;
                session.user.email = token.email;
                session.user.role = token.role;
                session.user.contact = token.contact
                session.user.profilePictureUrl = token.profilePictureUrl
            }
            return session;
        },
    },
    pages: {
        signIn: "/sign-in"
    },
    session: {
        strategy: "jwt"
    },
    secret: `${process.env.NEXTAUTH_SECRET}`
}
