"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRole(name: string, description: string) {
    try {
        const existing = await prisma.role.findFirst({
            where: { name },
        });
        if (existing) {
            return { success: false, error: "Role name already exists" };
        }

        await prisma.role.create({
            data: {
                name,
                description,
            },
        });

        revalidatePath("/dashboard/permissions");
        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function updateRole(roleId: string, data: { name: string; description?: string }) {
    try {
        const role = await prisma.role.findUnique({ where: { id: roleId } });
        if (!role) return { success: false, error: "Role not found" };
        if (role.name === "Admin") return { success: false, error: "Admin role cannot be renamed" };

        const normalizedName = data.name.trim();
        if (!normalizedName) return { success: false, error: "Role name is required" };

        const existing = await prisma.role.findFirst({
            where: {
                name: normalizedName,
                NOT: { id: roleId },
            },
        });
        if (existing) return { success: false, error: "Role name already exists" };

        await prisma.role.update({
            where: { id: roleId },
            data: {
                name: normalizedName,
                description: data.description?.trim() ?? "",
            },
        });

        revalidatePath("/dashboard/permissions");
        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message || "Failed to update role" };
    }
}

export async function deleteRole(roleId: string) {
    try {
        const role = await prisma.role.findUnique({
            where: { id: roleId },
            include: {
                _count: {
                    select: { users: true },
                },
            },
        });

        if (!role) return { success: false, error: "Role not found" };
        if (role.name === "Admin") return { success: false, error: "Admin role cannot be deleted" };
        if (role._count.users > 0) {
            return { success: false, error: "Cannot delete a role assigned to users. Reassign users first." };
        }

        await prisma.role.delete({ where: { id: roleId } });

        revalidatePath("/dashboard/permissions");
        revalidatePath("/dashboard/users");
        return { success: true };
    } catch {
        return { success: false, error: "Failed to delete role." };
    }
}

export async function toggleRolePermission(roleId: string, permissionId: string) {
    try {
        const existing = await prisma.rolePermission.findUnique({
            where: {
                roleId_permissionId: {
                    roleId,
                    permissionId,
                },
            },
        });

        if (existing) {
            await prisma.rolePermission.delete({
                where: { id: existing.id },
            });
        } else {
            await prisma.rolePermission.create({
                data: {
                    roleId,
                    permissionId,
                },
            });
        }

        revalidatePath("/dashboard/permissions");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to toggle permission." };
    }
}
