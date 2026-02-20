"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Activity, ShieldAlert, Key, User, Settings, Database, Server, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

type ActivityLog = {
    id: string;
    userId: string;
    action: string;
    resource: string;
    details: string;
    ipAddress: string;
    createdAt: Date;
    user: {
        name: string | null;
        email: string | null;
    };
};

export function ActivityTable({ logs }: { logs: ActivityLog[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [resourceFilter, setResourceFilter] = useState("all");

    // Extract unique resources for filter options
    const uniqueResources = Array.from(new Set(logs.map(l => l.resource || "System"))).sort();

    const filteredLogs = logs.filter((log) => {
        const matchesSearch = (log.user.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (log.user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (log.ipAddress?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (log.action.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (log.details?.toLowerCase() || "").includes(searchQuery.toLowerCase());

        const matchesResource = resourceFilter === "all" || (log.resource || "System") === resourceFilter;
        return matchesSearch && matchesResource;
    });

    const getIconForResource = (resource: string) => {
        const lowerRes = resource.toLowerCase();
        if (lowerRes.includes('user') || lowerRes.includes('auth')) return <User className="h-4 w-4 text-violet-500" />;
        if (lowerRes.includes('role') || lowerRes.includes('permission')) return <ShieldAlert className="h-4 w-4 text-pink-500" />;
        if (lowerRes.includes('setting') || lowerRes.includes('config')) return <Settings className="h-4 w-4 text-slate-500" />;
        if (lowerRes.includes('session') || lowerRes.includes('token')) return <Key className="h-4 w-4 text-amber-500" />;
        if (lowerRes.includes('media') || lowerRes.includes('file')) return <Database className="h-4 w-4 text-indigo-500" />;
        return <Activity className="h-4 w-4 text-emerald-500" />;
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-end items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search logs..."
                        className="w-full pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={resourceFilter} onValueChange={setResourceFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="All Resources" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Resources</SelectItem>
                        {uniqueResources.map(res => (
                            <SelectItem key={res} value={res}>{res}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[180px]">Timestamp</TableHead>
                            <TableHead>User / IP</TableHead>
                            <TableHead>Event</TableHead>
                            <TableHead className="hidden md:table-cell">Resource</TableHead>
                            <TableHead className="hidden lg:table-cell">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No activity logs recorded yet matching your criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                                        {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{log.user.name || log.user.email}</div>
                                        <div className="text-xs text-muted-foreground font-mono">{log.ipAddress || 'Unknown IP'}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getIconForResource(log.resource)}
                                            <span className="font-medium uppercase text-xs tracking-wider">
                                                {log.action.replace(/_/g, " ")}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground">
                                        {log.resource || "System"}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell max-w-sm">
                                        <div className="text-xs truncate font-mono bg-muted/50 p-1.5 rounded" title={log.details}>
                                            {log.details || "{}"}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
