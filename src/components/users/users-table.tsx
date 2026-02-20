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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Loader2, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { updateUserRole, deleteUser, createUser } from "@/actions/users";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

type User = {
    id: string;
    name: string | null;
    email: string | null;
    status: string;
    role: { id: string; name: string };
};

type Role = {
    id: string;
    name: string;
};

interface UsersTableProps {
    users: User[];
    roles: Role[];
}

export function UsersTable({ users, roles }: UsersTableProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedRole, setSelectedRole] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createData, setCreateData] = useState({ name: "", email: "", password: "", roleId: roles[0]?.id || "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter out deleted users for the table
    const activeUsers = users.filter((u) => u.status !== "deleted");

    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredUsers = activeUsers.filter((u) => {
        const matchesSearch = (u.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (u.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "all" || u.role.id === roleFilter;
        const matchesStatus = statusFilter === "all" || u.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setSelectedRole(user.role.id);
        setIsEditModalOpen(true);
    };

    const handleCreateUser = async () => {
        if (!createData.email || !createData.password || !createData.roleId) {
            toast.error("Please fill all required fields.");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await createUser(createData);
            if (res.success) {
                toast.success("User created successfully.");
                setIsCreateModalOpen(false);
                setCreateData({ name: "", email: "", password: "", roleId: roles[0]?.id || "" });
            } else {
                toast.error(res.error || "Failed to create user.");
            }
        } catch {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveRole = async () => {
        if (!selectedUser) return;
        setIsSubmitting(true);
        try {
            const res = await updateUserRole(selectedUser.id, selectedRole);
            if (res.success) {
                toast.success("User role updated successfully.");
                setIsEditModalOpen(false);
            } else {
                toast.error(res.error || "Failed to update role.");
            }
        } catch {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const executeDelete = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        try {
            const res = await deleteUser(userToDelete.id);
            if (res.success) {
                toast.success("User deactivated.");
            } else {
                toast.error(res.error || "Failed to deactivate user.");
            }
        } finally {
            setIsDeleting(false);
            setUserToDelete(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search users..."
                            className="w-full pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            {roles.map((r) => (
                                <SelectItem key={r.id} value={r.id}>
                                    {r.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No users found matching your search.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role.name === "Admin" ? "default" : "secondary"}>
                                            {user.role.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === "active" ? "outline" : "destructive"}>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                                                    Copy ID
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => openEditModal(user)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit Role
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600" onClick={() => setUserToDelete(user)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Deactivate
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User Role</DialogTitle>
                        <DialogDescription>
                            Change the system role for {selectedUser?.email}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button disabled={isSubmitting} onClick={handleSaveRole}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                            Create a new user account and assign them a role.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                                placeholder="John Doe"
                                value={createData.name}
                                onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                placeholder="john@example.com"
                                value={createData.email}
                                onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="password"
                                placeholder="******"
                                value={createData.password}
                                onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Role</label>
                            <Select value={createData.roleId} onValueChange={(val) => setCreateData({ ...createData, roleId: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button disabled={isSubmitting} onClick={handleCreateUser}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create User
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmDeleteDialog
                isOpen={!!userToDelete}
                onOpenChange={(open) => !open && setUserToDelete(null)}
                onConfirm={executeDelete}
                isDeleting={isDeleting}
                title={`Deactivate "${userToDelete?.email}"?`}
                description="This user will be permanently deactivated and their session tokens immediately revoked."
            />
        </div>
    );
}
