import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/settings/settings-form";
import { ThemePresets } from "@/components/settings/theme-presets";
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

            <SettingsForm initialData={initialData} />
            <ThemePresets />
        </div>
    );
}
