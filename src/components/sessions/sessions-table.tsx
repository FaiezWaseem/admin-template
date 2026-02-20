"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldAlert, Trash2, MonitorSmartphone } from "lucide-react";
import { revokeSession, revokeAllUserSessions } from "@/actions/sessions";

type SessionDoc = {
    id: string;
    userId: string;
    type: string;
    device: string;
    ipAddress: string;
    revoked: boolean;
    lastActiveAt: Date;
    expiresAt: Date;
    user: {
        email: string;
        name: string | null;
    }
};

interface SessionsTableProps {
    sessions: SessionDoc[];
}

export function SessionsTable({ sessions }: SessionsTableProps) {
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const handleRevoke = async (id: string) => {
        if (!confirm("Are you sure you want to revoke this session? The user will be logged out on that device.")) return;

        setIsProcessing(id);
        try {
            const res = await revokeSession(id);
            if (res.success) {
                toast.success("Session explicitly revoked.");
            } else {
                toast.error(res.error || "Failed to revoke session.");
            }
        } finally {
            setIsProcessing(null);
        }
    };

    const activeSessions = sessions.filter(s => !s.revoked && new Date(s.expiresAt) > new Date());

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Device/IP</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sessions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                No sessions found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        sessions.map((session) => {
                            const isExpired = new Date(session.expiresAt) < new Date();
                            const isActive = !session.revoked && !isExpired;

                            return (
                                <TableRow key={session.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{session.user.name || "Unknown"}</span>
                                            <span className="text-xs text-muted-foreground">{session.user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
                                            <div className="flex flex-col">
                                                <span>{session.device || "Unknown Device"}</span>
                                                <span className="text-xs text-muted-foreground">{session.ipAddress || "Unknown IP"}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {isActive ? (
                                            <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>
                                        ) : session.revoked ? (
                                            <Badge variant="destructive">Revoked</Badge>
                                        ) : (
                                            <Badge variant="secondary">Expired</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {new Date(session.lastActiveAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {isActive && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleRevoke(session.id)}
                                                disabled={isProcessing === session.id}
                                            >
                                                <ShieldAlert className="h-4 w-4 mr-2" />
                                                Revoke
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
