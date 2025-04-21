import { Message } from "@/model/UserModel";
import { User } from "@prisma/client";


export interface ApiResponse {
    success: boolean;
    message: string;
    user?: User;
    // isAcceptingMessages?: boolean;
    // messages?: Array<Message>;
}