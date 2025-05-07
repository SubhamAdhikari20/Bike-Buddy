// src/helpers/sendNotification.ts
import knock from "@/lib/knock";

export async function sendNotification(
    recipientId: string, // Knock user ID
    workflowKey: string, // Knock workflow key
    data: Record<string, any> // Additional data for the notification
) {
    try {
        const response = await knock.workflows.trigger(workflowKey, {
            recipients: [recipientId],
            data: data,
        });

        console.log("Notification sent:", response);
        return response;
    }
    catch (error) {
        console.error("Error sending notification:", error);
        throw error;
    }
}
