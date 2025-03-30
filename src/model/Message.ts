import prisma from "@/lib/prisma";
import { Message } from "@prisma/client";

export async function createMessage(data: {
    content: string;
    userId?: number;
}): Promise<Message> {
    return await prisma.message.create({
        data: {
            content: data.content,
            userId: data.userId,
        },
    });
}

export async function getMessageById(id: number): Promise<Message | null> {
    return await prisma.message.findUnique({ where: { id } });
}

export async function getAllMessages(): Promise<Message[]> {
    return await prisma.message.findMany();
}

export async function updateMessage(
    id: number,
    data: Partial<{
        content: string;
        userId: number;
    }>
): Promise<Message> {
    return await prisma.message.update({ where: { id }, data });
}

export async function deleteMessage(id: number): Promise<Message> {
    return await prisma.message.delete({ where: { id } });
}
