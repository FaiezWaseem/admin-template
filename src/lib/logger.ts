import { prisma } from "@/lib/prisma";

export async function logActivity(
    userId: string,
    action: string,
    resource: string = "",
    details: any = {},
    ipAddress: string = ""
) {
    try {
        await prisma.activityLog.create({
            data: {
                userId,
                action,
                resource,
                details: typeof details === "string" ? details : JSON.stringify(details),
                ipAddress,
            },
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
}
