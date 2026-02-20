"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createFolder(name: string) {
    if (!name || name.trim() === "") {
        return { success: false, error: "Folder name cannot be empty." };
    }

    try {
        const folder = await prisma.mediaFolder.create({
            data: {
                name: name.trim(),
            },
        });
        revalidatePath("/dashboard/media");
        return { success: true, folder };
    } catch (error) {
        return { success: false, error: "Failed to create folder." };
    }
}

export async function deleteFolder(id: string) {
    try {
        await prisma.mediaFolder.delete({
            where: { id },
        });
        revalidatePath("/dashboard/media");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete folder. It may contain files." };
    }
}

export async function getFolders() {
    try {
        const folders = await prisma.mediaFolder.findMany({
            orderBy: { name: "asc" },
        });
        return folders;
    } catch (error) {
        console.error("Failed to fetch folders:", error);
        return [];
    }
}
