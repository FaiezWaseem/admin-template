import { prisma } from "@/lib/prisma";
import { SEOForm } from "@/components/seo/seo-form";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "SEO Manager | Admin Dashboard",
    description: "Configure per-page custom SEO, OpenGraph data, and indexing rules.",
};

export default async function SEOMetaPage({ params }: { params: Promise<{ pageId: string }> }) {
    const { pageId } = await params;

    const page = await prisma.page.findUnique({
        where: { id: pageId },
        include: { seoMeta: true },
    });

    if (!page) {
        notFound();
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">SEO Manager</h1>
                    <p className="text-muted-foreground text-sm">
                        Optimizing metadata for: <span className="font-semibold text-foreground">/{page.slug}</span>
                    </p>
                </div>
            </div>

            <SEOForm
                pageId={page.id}
                pageTitle={page.title}
                pageSlug={page.slug}
                initialData={page.seoMeta}
                baseUrl={baseUrl}
            />
        </div>
    );
}
