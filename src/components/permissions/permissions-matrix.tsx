"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Loader2, Pencil, Plus, Shield, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createRole, deleteRole, toggleRolePermission, updateRole } from "@/actions/roles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type Permission = {
    id: string;
    name: string;
    action: string;
    resource: string;
};

type Role = {
    id: string;
    name: string;
    description?: string;
    permissions: {
        permission: Permission;
    }[];
};

interface PermissionsMatrixProps {
    roles: Role[];
    permissions: Permission[];
}

const ACTIONS = ["create", "read", "update", "delete"] as const;

export function PermissionsMatrix({ roles, permissions }: PermissionsMatrixProps) {
    const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id ?? "");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
    const [roleName, setRoleName] = useState("");
    const [roleDescription, setRoleDescription] = useState("");
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [busyPermissionId, setBusyPermissionId] = useState<string | null>(null);

    const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? roles[0];

    const resources = useMemo(
        () => Array.from(new Set(permissions.map((p) => p.resource))).sort(),
        [permissions]
    );

    const hasPermission = (resource: string, action: string) => {
        if (!selectedRole) return false;
        return selectedRole.permissions.some(
            (rp) => rp.permission.resource === resource && rp.permission.action === action
        );
    };

    const handleCreateRole = async () => {
        if (!roleName.trim()) {
            toast.error("Role name is required.");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await createRole(roleName.trim(), roleDescription.trim());
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

            <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                <div className="rounded-lg border bg-card">
                    <div className="border-b p-4">
                        <h3 className="text-sm font-semibold">Roles</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Select a role to edit its resource permissions.
                        </p>
                    </div>
                    <div className="max-h-[70vh] space-y-2 overflow-auto p-3">
                        {roles.map((role) => {
                            const active = role.id === selectedRole?.id;
                            const permissionCount = role.permissions.length;
                            return (
                                <div
                                    key={role.id}
                                    className={cn(
                                        "w-full rounded-lg border p-3 text-left transition hover:bg-muted/40",
                                        active && "border-primary bg-primary/5 ring-1 ring-primary/20"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRoleId(role.id)}
                                            className="flex min-w-0 flex-1 items-center gap-2 text-left"
                                        >
                                            <Shield className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                                            <span className="truncate font-medium">{role.name}</span>
                                        </button>
                                        <div className="flex items-center gap-1">
                                            <Badge variant={active ? "default" : "secondary"}>{permissionCount}</Badge>
                                            {role.name !== "Admin" && (
                                                <>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => {
                                                            setEditingRole(role);
                                                            setRoleName(role.name);
                                                            setRoleDescription((role as any).description || "");
                                                            setIsEditRoleModalOpen(true);
                                                        }}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-red-600 hover:text-red-700"
                                                        onClick={async () => {
                                                            if (!confirm(`Delete role "${role.name}"? Users must be reassigned first.`)) return;
                                                            const res = await deleteRole(role.id);
                                                            if (res.success) {
                                                                toast.success("Role deleted.");
                                                                if (selectedRoleId === role.id && roles.length > 1) {
                                                                    const fallback = roles.find((r) => r.id !== role.id);
                                                                    if (fallback) setSelectedRoleId(fallback.id);
                                                                }
                                                            } else {
                                                                toast.error(res.error || "Failed to delete role.");
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {"description" in role && role.description ? (
                                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                            {role.description}
                                        </p>
                                    ) : (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {permissionCount} assigned permission{permissionCount === 1 ? "" : "s"}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-lg border bg-card">
                    {!selectedRole ? (
                        <div className="p-6 text-sm text-muted-foreground">
                            No roles found. Create a role to begin editing permissions.
                        </div>
                    ) : (
                        <>
                            <div className="border-b p-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="text-base font-semibold">
                                            Resource Editor: {selectedRole.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Click an action pill to enable/disable access for this role.
                                        </p>
                                    </div>
                                    <Badge variant={selectedRole.name === "Admin" ? "default" : "outline"}>
                                        {selectedRole.name === "Admin" ? "Protected Role" : "Editable"}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-3 p-4">
                                {resources.map((resource) => (
                                    <div key={resource} className="rounded-lg border p-4">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-medium capitalize">{resource}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Configure CRUD access for this resource.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                                            {ACTIONS.map((action) => {
                                                const permissionDef = permissions.find(
                                                    (p) => p.resource === resource && p.action === action
                                                );

                                                if (!permissionDef) {
                                                    return (
                                                        <div
                                                            key={`${resource}-${action}`}
                                                            className="flex items-center justify-between rounded-md border border-dashed px-3 py-2 opacity-50"
                                                        >
                                                            <span className="text-sm capitalize">{action}</span>
                                                            <X className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                    );
                                                }

                                                const allowed = hasPermission(resource, action);
                                                const isAdmin = selectedRole.name === "Admin";

                                                return (
                                                    <button
                                                        key={permissionDef.id}
                                                        type="button"
                                                        disabled={isAdmin || busyPermissionId === permissionDef.id}
                                                        onClick={async () => {
                                                            if (isAdmin) {
                                                                toast.error("Cannot modify Super Admin permissions.");
                                                                return;
                                                            }
                                                            setBusyPermissionId(permissionDef.id);
                                                            const res = await toggleRolePermission(selectedRole.id, permissionDef.id);
                                                            setBusyPermissionId(null);
                                                            if (res.success) {
                                                                toast.success(`Permission ${allowed ? "removed" : "added"}.`);
                                                            } else {
                                                                toast.error(res.error || "Failed to update permission.");
                                                            }
                                                        }}
                                                        className={cn(
                                                            "flex items-center justify-between rounded-md border px-3 py-2 text-left transition",
                                                            allowed
                                                                ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200"
                                                                : "hover:bg-muted/50",
                                                            isAdmin && "cursor-not-allowed opacity-60"
                                                        )}
                                                        title={`${selectedRole.name} - ${action} ${resource}`}
                                                    >
                                                        <span className="text-sm capitalize">{action}</span>
                                                        {busyPermissionId === permissionDef.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : allowed ? (
                                                            <Check className="h-4 w-4" />
                                                        ) : (
                                                            <X className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Role</DialogTitle>
                        <DialogDescription>
                            Create a new organizational role. After creation, select it from the list and edit resources.
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

            <Dialog open={isEditRoleModalOpen} onOpenChange={setIsEditRoleModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Role</DialogTitle>
                        <DialogDescription>
                            Update the role name and description.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Role Name</label>
                            <Input value={roleName} onChange={(e) => setRoleName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input value={roleDescription} onChange={(e) => setRoleDescription(e.target.value)} />
                        </div>
                        <Button
                            disabled={isSubmitting || !editingRole}
                            onClick={async () => {
                                if (!editingRole) return;
                                setIsSubmitting(true);
                                const res = await updateRole(editingRole.id, {
                                    name: roleName,
                                    description: roleDescription,
                                });
                                setIsSubmitting(false);
                                if (res.success) {
                                    toast.success("Role updated.");
                                    setIsEditRoleModalOpen(false);
                                    setEditingRole(null);
                                } else {
                                    toast.error(res.error || "Failed to update role.");
                                }
                            }}
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Role
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
