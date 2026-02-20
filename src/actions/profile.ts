"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/logger";

interface ProfileData {
    name: string;
    email: string;
    image?: string;
    password?: string;
    currentPassword?: string;
}

export async function updateProfile(data: ProfileData) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) throw new Error("User not found");

        // Validate email uniqueness if changing email
        if (data.email !== user.email) {
            const existing = await prisma.user.findUnique({
                where: { email: data.email }
            });
            if (existing) {
                return { success: false, error: "Email is already in use by another account." };
            }
        }

        const updateData: any = {
            name: data.name,
            email: data.email,
            image: data.image
        };

        // Handle Password Change if requested
        if (data.password && data.currentPassword) {
            // Check current password first
            if (!user.password) {
                return { success: false, error: "Account uses OAuth. Cannot set local password." };
            }

            const isValid = await bcrypt.compare(data.currentPassword, user.password);
            if (!isValid) {
                return { success: false, error: "Current password is incorrect." };
            }

            // Hash new password
            updateData.password = await bcrypt.hash(data.password, 10);
        } else if (data.password && !data.currentPassword) {
            return { success: false, error: "Current password is required to set a new password." };
        }

        await prisma.user.update({
            where: { id: user.id },
            data: updateData
        });

        await logActivity(
            session.user.id,
            "UPDATE_PROFILE",
            `User updated their personal profile settings.`,
            { name: data.name, email: data.email }
        );

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/profile");
        return { success: true };

    } catch (error: any) {
        return { success: false, error: error.message || "Failed to update profile." };
    }
}
