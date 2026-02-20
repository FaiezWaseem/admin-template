"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

type Permission = {
    id: string;
    name: string;
    action: string;
    resource: string;
};

type Role = {
    id: string;
    name: string;
    permissions: {
        permission: Permission;
    }[];
};

interface PermissionsMatrixProps {
    roles: Role[];
    permissions: Permission[];
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { createRole } from "@/actions/roles";

export function PermissionsMatrix({ roles, permissions }: PermissionsMatrixProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [roleName, setRoleName] = useState("");
    const [roleDescription, setRoleDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Group permissions by resource
    const resources = Array.from(new Set(permissions.map((p) => p.resource))).sort();
    const actions = ["create", "read", "update", "delete"];

    const hasPermission = (role: Role, resource: string, action: string) => {
        return role.permissions.some(
            (rp) => rp.permission.resource === resource && rp.permission.action === action
        );
    };

    const handleCreateRole = async () => {
        if (!roleName) {
            toast.error("Role name is required.");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await createRole(roleName, roleDescription);
            if (res.success) {
                toast.success("Role created successfully.");
                setIsCreateModalOpen(false);
                setRoleName("");
                setRoleDescription("");
            } else {
                toast.error(res.error || "Failed to create role.");
            }
        } catch {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Role
                </Button>
            </div>
            <div className="rounded-md border bg-card overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px] border-r">Resource</TableHead>
                            {roles.map((role) => (
                                <TableHead key={role.id} className="text-center border-r min-w-[150px]">
                                    <div className="font-semibold text-foreground">{role.name}</div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {resources.map((resource) => (
                            <TableRow key={resource}>
                                <TableCell className="font-medium border-r bg-muted/30">
                                    {resource.charAt(0).toUpperCase() + resource.slice(1)}
                                </TableCell>
                                {roles.map((role) => (
                                    <TableCell key={role.id} className="text-center border-r p-0">
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 p-2">
                                            {actions.map((action) => {
                                                const allowed = hasPermission(role, resource, action);
                                                return (
                                                    <div
                                                        key={`${role.id}-${resource}-${action}`}
                                                        className="flex flex-col items-center justify-center p-1"
                                                        title={`${role.name} - ${action} ${resource}`}
                                                    >
                                                        <span className="text-[10px] uppercase text-muted-foreground mb-1">
                                                            {action.charAt(0)}
                                                        </span>
                                                        {allowed ? (
                                                            <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                                                <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                                            </div>
                                                        ) : (
                                                            <div className="h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                                <X className="h-3 w-3 text-slate-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Role</DialogTitle>
                        <DialogDescription>
                            Create a new organizational role. After creation, you can edit its permissions below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Role Name</label>
                            <Input
                                placeholder="e.g. Editor"
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Description (Optional)</label>
                            <Input
                                placeholder="Content editors and publishers"
                                value={roleDescription}
                                onChange={(e) => setRoleDescription(e.target.value)}
                            />
                        </div>
                        <Button disabled={isSubmitting} onClick={handleCreateRole}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Role
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
