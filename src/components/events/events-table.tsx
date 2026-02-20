"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { toggleEventActive, updateEventChannels } from "@/actions/events";
import { Checkbox } from "@/components/ui/checkbox";

type EventDoc = {
    id: string;
    name: string;
    displayName: string;
    description: string;
    active: boolean;
    channels: string; // JSON string
};

export function EventsTable({ events }: { events: EventDoc[] }) {
    const handleToggleActive = async (id: string, checked: boolean) => {
        const res = await toggleEventActive(id, checked);
        if (!res.success) toast.error("Failed to update event status.");
        else toast.success("Event status updated.");
    };

    const handleChannelChange = async (event: EventDoc, channel: string, checked: boolean) => {
        let currentChannels: string[] = [];
        try {
            currentChannels = JSON.parse(event.channels);
        } catch {
            currentChannels = [];
        }

        if (checked && !currentChannels.includes(channel)) {
            currentChannels.push(channel);
        } else if (!checked) {
            currentChannels = currentChannels.filter((c) => c !== channel);
        }

        const res = await updateEventChannels(event.id, currentChannels);
        if (!res.success) toast.error("Failed to update channels.");
        else toast.success("Routing channels updated.");
    };

    const availableChannels = ["email", "in_app", "webhook"];

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>System Name</TableHead>
                        <TableHead>Routing Channels</TableHead>
                        <TableHead className="text-right">Active</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {events.map((event) => {
                        let activeChannels: string[] = [];
                        try {
                            activeChannels = JSON.parse(event.channels);
                        } catch {
                            activeChannels = [];
                        }

                        return (
                            <TableRow key={event.id}>
                                <TableCell>
                                    <div className="font-medium">{event.displayName}</div>
                                    <div className="text-xs text-muted-foreground">{event.description}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-mono bg-muted/50 text-[10px]">
                                        {event.name}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-4">
                                        {availableChannels.map((ch) => (
                                            <div key={ch} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`${event.id}-${ch}`}
                                                    checked={activeChannels.includes(ch)}
                                                    onCheckedChange={(checked: boolean | "indeterminate") =>
                                                        handleChannelChange(event, ch, checked === true)
                                                    }
                                                />
                                                <label
                                                    htmlFor={`${event.id}-${ch}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {ch.toUpperCase()}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Switch
                                        checked={event.active}
                                        onCheckedChange={(checked) => handleToggleActive(event.id, checked)}
                                    />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
