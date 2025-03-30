// src/services/notificationService.ts
import prisma from './../lib/prisma';
import { sendNotification } from "./../helpers/sendNotification";

export async function sendAndStoreNotification(userId: number, workflowKey: string, title: string, message: string): Promise<void> {
    try {
        // Convert userId to string since Knock requires a string ID
        const recipientId = userId.toString();

        // Send Knock Notification using the helper function
        await sendNotification(recipientId, workflowKey, { message });

        // Store Notification in DB
        await prisma.notification.create({
            data: {
                userId: userId,
                title: title,
                message: message,
                type: workflowKey, // Workflow Key acts as Notification Type
            },
        });

        console.log("Notification stored in DB!");
    } catch (error) {
        console.error("Error sending/storing notification:", error);
    }
}
