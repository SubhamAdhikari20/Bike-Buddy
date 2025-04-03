import { z } from "zod";


export const loginSchema = z.object({
    // Identifier = Username OR Email
    identifier: z.string().min(3, { message: "Username or Email is required" }),
    password: z.string().min(1, { message: "Password is required" })
});