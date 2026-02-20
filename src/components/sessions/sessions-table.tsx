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
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { ShieldAlert, Trash2, MonitorSmartphone, Search } from "lucide-react";
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

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredSessions = sessions.filter((s) => {
        const matchesSearch = (s.user.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (s.user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (s.device?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (s.ipAddress?.toLowerCase() || "").includes(searchQuery.toLowerCase());

        const isExpired = new Date(s.expiresAt) < new Date();
        const isActive = !s.revoked && !isExpired;

        let derivedStatus = "active";
        if (s.revoked) derivedStatus = "revoked";
        else if (isExpired) derivedStatus = "expired";

        const matchesStatus = statusFilter === "all" || derivedStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

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
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-end items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search sessions..."
                        className="w-full pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="revoked">Revoked</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                </Select>
            </div>

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
                        {filteredSessions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                    No sessions found matching your criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSessions.map((session) => {
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
        </div>
    );
}
