import { prisma } from "../prisma";
import { sendEmail } from "../email";

export async function dispatchEvent(
    eventName: string,
    payload: Record<string, any>,
    userId?: string
) {
    try {
        const event = await prisma.event.findUnique({
            where: { name: eventName },
        });

        if (!event || !event.active) {
            console.log(`[Event Bus] Event ${eventName} is disabled or unknown.`);
            return;
        }

        const channels: string[] = JSON.parse(event.channels || "[]");

        // Log the notification in the database for tracking/history
        const notification = await prisma.notification.create({
            data: {
                eventId: event.id,
                userId,
                channel: channels.join(", "),
                subject: `Triggered: ${event.displayName}`,
                body: `Payload: ${JSON.stringify(payload)}`,
                metadata: JSON.stringify(payload),
                status: "pending",
            },
        });

        // Process configured channels
        if (channels.includes("email") && userId) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user && user.email) {
                await sendEmail({
                    to: user.email,
                    subject: event.displayName,
                    body: `An event occurred: ${JSON.stringify(payload)}`,
                });
            }
        }

        // Mark as sent
        await prisma.notification.update({
            where: { id: notification.id },
            data: { status: "sent", sentAt: new Date() },
        });

        console.log(`[Event Bus] Dispatched ${eventName} successfully to ${channels.join(", ")}`);
    } catch (error) {
        console.error(`[Event Bus] Failed to dispatch ${eventName}:`, error);
    }
}
