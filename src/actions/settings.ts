"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ConfigUpdate = {
    key: string;
    value: string;
};

export async function updateSiteSettings(updates: ConfigUpdate[]) {
    try {
        // We update each config line by line. Since it's SQLite, an interactive transaction is fine.
        await prisma.$transaction(
            updates.map((update) =>
                prisma.siteConfig.upsert({
                    where: { key: update.key },
                    update: { value: update.value },
                    create: {
                        key: update.key,
                        value: update.value,
                        type: update.key === "maintenance_mode" ? "boolean" : "string",
                    },
                })
            )
        );

        revalidatePath("/dashboard/settings");
        revalidatePath("/", "layout"); // Ensure global revalidation for site-wide settings
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update site settings." };
    }
}
