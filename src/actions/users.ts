"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, roleId: string) {
    try {
        const role = await prisma.role.findUnique({
            where: { id: roleId },
        });

        if (!role) {
            throw new Error("Invalid role selected");
        }

        await prisma.user.update({
            where: { id: userId },
            data: { roleId },
        });

        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteUser(userId: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { status: "deleted" },
        });
        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete user" };
    }
}
