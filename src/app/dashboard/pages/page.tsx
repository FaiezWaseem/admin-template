import { prisma } from "@/lib/prisma";
import { PagesTable } from "@/components/pages/pages-table";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pages | Admin Dashboard",
    description: "Manage custom content pages and their dynamic blocks.",
};

export default async function PagesIndex() {
    const pages = await prisma.page.findMany({
        orderBy: { updatedAt: "desc" },
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
                    <p className="text-muted-foreground text-sm">
                        Create and edit content blocks via the dynamic CMS builder.
                    </p>
                </div>
            </div>

            <PagesTable pages={pages} />
        </div>
    );
}
