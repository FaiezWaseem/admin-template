import { prisma } from "@/lib/prisma";
import { PageForm } from "@/components/pages/page-form";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Edit Page | Admin Dashboard",
    description: "Modify an existing CMS page.",
};

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const page = await prisma.page.findUnique({
        where: { id },
    });

    if (!page) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit "{page.title}"</h1>
                    <p className="text-muted-foreground text-sm">
                        Modify the content blocks and publishing state.
                    </p>
                </div>
            </div>

            <PageForm initialData={page} />
        </div>
    );
}
