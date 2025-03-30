import { z } from "zod";


export const loginSchema = z.object({
    username: z.string(),
    email: z.string(),
    password: z.string()
});