import { prisma } from "@/lib/prisma";
import { SessionsTable } from "@/components/sessions/sessions-table";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Session Control | Admin Dashboard",
    description: "View and manage active user sessions across all devices.",
};

export default async function SessionsPage() {
    const sessions = await prisma.session.findMany({
        orderBy: { lastActiveAt: "desc" },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
        take: 100, // For demo, only fetch top 100 most recent sessions
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Active Sessions</h1>
                    <p className="text-muted-foreground text-sm">
                        Monitor and forcefully revoke active user sessions and API tokens.
                    </p>
                </div>
            </div>

            <SessionsTable sessions={sessions} />
        </div>
    );
}
