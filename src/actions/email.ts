"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function updateEmailConfig(updates: { key: string; value: string }[]) {
    try {
        await prisma.$transaction(
            updates.map((update) =>
                prisma.siteConfig.upsert({
                    where: { key: update.key },
                    update: { value: update.value },
                    create: { key: update.key, value: update.value, type: "string" },
                })
            )
        );
        revalidatePath("/dashboard/email");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update email settings." };
    }
}

export async function testEmailGateway(to: string) {
    try {
        const res = await sendEmail({
            to,
            subject: "Test Email from Admin Dashboard",
            body: "This is a test email sent from the newly configured Email Gateway. If you are receiving this, the credentials are valid!",
        });

        if (res.success) {
            return { success: true, message: `Test email sent via ${res.provider || 'mock'} provider.` };
        }
        return { success: false, error: "Failed to dispatch email." };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}
