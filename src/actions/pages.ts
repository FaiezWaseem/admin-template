"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type PageData = {
    title: string;
    slug: string;
    content: string; // JSON string
    excerpt: string;
    status: string;
    template: string;
};

export async function createPage(data: PageData) {
    try {
        const page = await prisma.page.create({
            data: {
                title: data.title,
                slug: data.slug,
                content: data.content,
                excerpt: data.excerpt,
                status: data.status,
                template: data.template,
            },
        });
        revalidatePath("/dashboard/pages");
        return { success: true, pageId: page.id };
    } catch (error: any) {
        if (error.code === "P2002") {
            return { success: false, error: "A page with this slug already exists." };
        }
        return { success: false, error: "Failed to create page." };
    }
}

export async function updatePage(id: string, data: PageData) {
    try {
        const page = await prisma.page.update({
            where: { id },
            data: {
                title: data.title,
                slug: data.slug,
                content: data.content,
                excerpt: data.excerpt,
                status: data.status,
                template: data.template,
            },
        });
        revalidatePath("/dashboard/pages");
        revalidatePath(`/dashboard/pages/${id}`);
        revalidatePath(`/${page.slug}`); // Public path 
        return { success: true };
    } catch (error: any) {
        if (error.code === "P2002") {
            return { success: false, error: "A page with this slug already exists." };
        }
        return { success: false, error: "Failed to update page." };
    }
}

export async function deletePage(id: string) {
    try {
        await prisma.page.delete({
            where: { id },
        });
        revalidatePath("/dashboard/pages");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete page." };
    }
}
