"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export type PostData = {
    title: string;
    slug: string;
    excerpt?: string;
    status: string;
    content: string; // JSON string
    featuredImg?: string;
};

export async function createPost(data: PostData) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        const existing = await prisma.post.findUnique({
            where: { slug: data.slug },
        });

        if (existing) {
            return { success: false, error: "A post with this slug already exists." };
        }

        await prisma.post.create({
            data: {
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt || "",
                status: data.status,
                content: data.content,
                featuredImg: data.featuredImg || "",
                authorId: session.user.id,
            },
        });

        revalidatePath("/dashboard/posts");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to create post." };
    }
}

export async function updatePost(id: string, data: Partial<PostData>) {
    try {
        if (data.slug) {
            const existing = await prisma.post.findUnique({
                where: { slug: data.slug },
            });
            if (existing && existing.id !== id) {
                return { success: false, error: "A post with this slug already exists." };
            }
        }

        await prisma.post.update({
            where: { id },
            data: {
                ...data,
                excerpt: data.excerpt ?? undefined,
                featuredImg: data.featuredImg ?? undefined,
            },
        });

        revalidatePath("/dashboard/posts");
        revalidatePath(`/dashboard/posts/${id}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update post." };
    }
}

export async function deletePost(id: string) {
    try {
        await prisma.post.delete({
            where: { id },
        });

        revalidatePath("/dashboard/posts");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete post." };
    }
}
