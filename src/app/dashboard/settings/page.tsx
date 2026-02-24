import { prisma } from "@/lib/prisma";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Site Settings | Admin Dashboard",
    description: "Configure global application settings and maintenance mode.",
};

export default async function SettingsPage() {
    // Fetch all site configuration rows
    const configs = await prisma.siteConfig.findMany();

    // Transform array into a key-value record for the form defaults
    const initialData = configs.reduce((acc, current) => {
        acc[current.key] = current.value;
        return acc;
    }, {} as Record<string, string>);

    const mediaItems = await prisma.media.findMany({
        where: { mimeType: { startsWith: "image/" } },
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
            id: true,
            url: true,
            filename: true,
            originalName: true,
            alt: true,
            mimeType: true,
            size: true,
            createdAt: true,
        },
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
                    <p className="text-muted-foreground text-sm">
                        Modify environment variables and dynamic branding elements globally.
                    </p>
                </div>
            </div>
            <SettingsTabs initialData={initialData} mediaItems={mediaItems} />
        </div>
    );
}
