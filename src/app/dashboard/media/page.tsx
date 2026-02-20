import { prisma } from "@/lib/prisma";
import { MediaLibrary } from "@/components/media/media-library";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Media Manager | Admin Dashboard",
    description: "Upload and manage images and assets globally.",
};

export default async function MediaPage() {
    const folders = await prisma.mediaFolder.findMany({
        orderBy: { name: "asc" },
    });

    const mediaItems = await prisma.media.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">Media Library</h1>
                    <p className="text-muted-foreground text-sm flex items-center gap-2">
                        Upload, browse, and organize system-wide assets and images.
                    </p>
                </div>
            </div>

            <MediaLibrary folders={folders} items={mediaItems} />
        </div>
    );
}
