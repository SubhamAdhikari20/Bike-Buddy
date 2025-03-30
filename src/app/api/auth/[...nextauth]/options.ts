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
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                
                try {
                    const user = await getUserByEmailOrUsername(credentials.email, credentials.username);
                    
                    // const user = await UserModel.findOne({
                    //     $or: [
                    //         { email: credentials.identifier },
                    //         { username: credentials.identifier },

                    //     ]
                    // });

                    if (!user) {
                        throw new Error("No user found with this email or username");
                    }

                    if (!user.isVerified) {
                        throw new Error("Please, verifiy yyour account before login");
                    }

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
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.username = user.username;
            } 
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.username = token.username;
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
    secret: process.env.NEXTAUTH_SECRET
}
