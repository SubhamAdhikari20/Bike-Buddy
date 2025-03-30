import prisma from "@/lib/prisma";
import { Notification } from "@prisma/client";

export async function createNotification(data: {
    userId: number;
    title: string;
    message: string;
    type: string;
    isRead?: boolean;
}): Promise<Notification> {
    return await prisma.notification.create({
        data: {
            userId: data.userId,
            title: data.title,
            message: data.message,
            type: data.type,
            isRead: data.isRead ?? false,
        },
    });
}

export async function getNotificationById(id: number): Promise<Notification | null> {
    return await prisma.notification.findUnique({ where: { id } });
}

export async function getAllNotifications(): Promise<Notification[]> {
    return await prisma.notification.findMany();
}

export async function updateNotification(
    id: number,
    data: Partial<{
        title: string;
        message: string;
        type: string;
        isRead: boolean;
    }>
): Promise<Notification> {
    return await prisma.notification.update({ where: { id }, data });
}

export async function deleteNotification(id: number): Promise<Notification> {
    return await prisma.notification.delete({ where: { id } });
}
