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
