import { prisma } from "@/lib/prisma";
import { EmailConfigForm } from "@/components/email/email-config-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Email Gateway | Admin Dashboard",
    description: "Configure unified email dispatch including SMTP, SendGrid, and SES.",
};

export default async function EmailPage() {
    const configs = await prisma.siteConfig.findMany({
        where: {
            key: {
                in: [
                    "email_provider",
                    "smtp_host",
                    "smtp_port",
                    "smtp_user",
                    "smtp_pass",
                    "sendgrid_api_key",
                    "from_address"
                ]
            }
        }
    });

    const initialData = configs.reduce((acc, current) => {
        acc[current.key] = current.value;
        return acc;
    }, {} as Record<string, string>);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Email Gateway</h1>
                    <p className="text-muted-foreground text-sm">
                        Configure system-wide email delivery providers and test connectivity.
                    </p>
                </div>
            </div>

            <EmailConfigForm initialData={initialData} />
        </div>
    );
}
