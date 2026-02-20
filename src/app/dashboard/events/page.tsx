import { prisma } from "@/lib/prisma";
import { EventsTable } from "@/components/events/events-table";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Events & Notifications | Admin Dashboard",
    description: "Configure system event triggers and global notification routing.",
};

export default async function EventsPage() {
    const events = await prisma.event.findMany({
        orderBy: { name: "asc" },
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Events</h1>
                    <p className="text-muted-foreground text-sm">
                        Control which internal events are active and how they notify users (Email, In-App, or Webhooks).
                    </p>
                </div>
            </div>

            <EventsTable events={events} />
        </div>
    );
}
