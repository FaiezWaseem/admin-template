"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import bcrypt from "bcryptjs";

export async function createUser(data: any) {
    try {
        const existing = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existing) {
            return { success: false, error: "Email already exists" };
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                roleId: data.roleId,
                status: "active",
            },
        });

        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

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

export async function updateUser(userId: string, data: { name: string; email: string; roleId: string; status: string }) {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { success: false, error: "User not found" };

        const role = await prisma.role.findUnique({ where: { id: data.roleId } });
        if (!role) return { success: false, error: "Invalid role selected" };

        if (data.email !== user.email) {
            const existing = await prisma.user.findUnique({ where: { email: data.email } });
            if (existing) return { success: false, error: "Email already exists" };
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                email: data.email,
                roleId: data.roleId,
                status: data.status,
            },
        });

        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message || "Failed to update user" };
    }
}

export async function setUserStatus(userId: string, status: "active" | "suspended" | "disabled") {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { status },
        });
        revalidatePath("/dashboard/users");
        return { success: true };
    } catch {
        return { success: false, error: "Failed to update user status" };
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
