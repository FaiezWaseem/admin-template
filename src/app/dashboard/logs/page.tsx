import { prisma } from "@/lib/prisma";
import { ActivityTable } from "@/components/logs/activity-table";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Activity Logs | Admin Dashboard",
    description: "System-wide activity audit trail.",
};

export default async function LogsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Check if the user is an Admin or has explicit "read" permissions for "logs"
    const roleRecord = await prisma.role.findUnique({
        where: { id: session.user.roleId },
        include: {
            permissions: {
                include: { permission: true }
            }
        }
    });

    const isAuthorizedForOthers = roleRecord?.name === "Admin" || roleRecord?.permissions.some(
        rp => rp.permission.resource === "logs" && rp.permission.action === "read"
    );

    const logs = await prisma.activityLog.findMany({
        where: isAuthorizedForOthers ? {} : { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: { name: true, email: true },
            },
        },
        take: 200, // Show last 200 events for performance
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
                    <p className="text-muted-foreground text-sm">
                        Audit trail of all administrative and user actions across the system.
                    </p>
                </div>
            </div>

            <ActivityTable logs={logs as any} />
        </div>
    );
}
