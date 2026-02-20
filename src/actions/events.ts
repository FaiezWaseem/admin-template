"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleEventActive(id: string, active: boolean) {
    try {
        await prisma.event.update({
            where: { id },
            data: { active },
        });
        revalidatePath("/dashboard/events");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to toggle event state." };
    }
}

export async function updateEventChannels(id: string, channels: string[]) {
    try {
        await prisma.event.update({
            where: { id },
            data: { channels: JSON.stringify(channels) },
        });
        revalidatePath("/dashboard/events");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update internal channels." };
    }
}
