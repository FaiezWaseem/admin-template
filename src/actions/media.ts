"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function uploadMedia(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };

    // For safety, only allow images in this demo
    if (!file.type.startsWith("image/")) {
        return { success: false, error: "Only image files are allowed in this demo." };
    }

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
        const filename = `${Date.now()}-${safeName}`;
        const uploadDir = join(process.cwd(), "public", "uploads");

        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);

        const url = `/uploads/${filename}`;

        const folderId = formData.get("folderId") as string | null;

        const media = await prisma.media.create({
            data: {
                filename,
                originalName: file.name,
                url,
                mimeType: file.type,
                size: file.size,
                alt: file.name,
                ...(folderId ? { folderId } : {}),
            },
        });

        revalidatePath("/dashboard/media");
        return { success: true, mediaId: media.id };
    } catch (error) {
        console.error("Upload error:", error);
        return { success: false, error: "Failed to persist uploaded file." };
    }
}

export async function deleteMedia(id: string) {
    try {
        const media = await prisma.media.findUnique({ where: { id } });
        if (!media) return { success: false, error: "Media not found." };

        // Try deleting the physical file
        try {
            if (media.url.startsWith("/uploads/")) {
                const filepath = join(process.cwd(), "public", media.url);
                if (existsSync(filepath)) {
                    await unlink(filepath);
                }
            }
        } catch (e) {
            console.error("File deletion error:", e);
        }

        await prisma.media.delete({ where: { id } });
        revalidatePath("/dashboard/media");

        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete media record." };
    }
}

export async function updateMediaAlt(id: string, alt: string) {
    try {
        await prisma.media.update({
            where: { id },
            data: { alt }
        });
        revalidatePath("/dashboard/media");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update metadata" };
    }
}
