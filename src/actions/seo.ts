"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type SEOMetaData = {
    metaTitle: string;
    metaDescription: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    canonicalUrl: string;
    noIndex: boolean;
    noFollow: boolean;
    focusKeyword: string;
};

export async function upsertSEOMeta(pageId: string, data: SEOMetaData) {
    try {
        await prisma.sEOMeta.upsert({
            where: { pageId },
            update: data,
            create: {
                pageId,
                ...data,
            },
        });

        // Revalidate the dashboard SEO view and the public page view
        const page = await prisma.page.findUnique({ where: { id: pageId }, select: { slug: true } });
        revalidatePath(`/dashboard/seo/${pageId}`);
        if (page?.slug) {
            revalidatePath(`/${page.slug}`);
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update SEO metadata." };
    }
}
