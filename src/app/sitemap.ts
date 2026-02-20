import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Fetch all published pages
    const pages = await prisma.page.findMany({
        where: { status: 'published' },
        include: { seoMeta: true },
        orderBy: { updatedAt: 'desc' },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const pageRoutes: MetadataRoute.Sitemap = pages.map((page) => ({
        url: `${baseUrl}/${page.slug}`,
        lastModified: page.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: page.slug === 'home' || page.slug === 'index' ? 1 : 0.8,
    }));

    return [
        {
            url: `${baseUrl}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        ...pageRoutes,
    ];
}
