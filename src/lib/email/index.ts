import { prisma } from "../prisma";

export interface SendEmailOptions {
    to: string;
    subject: string;
    body: string;
    html?: string;
}

export async function sendEmail({ to, subject, body, html }: SendEmailOptions) {
    // Fetch active provider from site config
    const providerConfig = await prisma.siteConfig.findUnique({
        where: { key: "email_provider" },
    });
    const provider = providerConfig?.value || "mock"; // mock, smtp, sendgrid, ses

    console.log(`[Email Gateway] Using provider: ${provider}`);
    console.log(`[Email Gateway] Sending email to ${to} | Subject: ${subject}`);

    if (provider === "mock") {
        // Just log it in development
        console.log(`[Email Gateway] Body: ${body}`);
        return { success: true, message: "Mock email sent successfully." };
    }

    // Real implementations would go here using nodemailer or @sendgrid/mail
    // We simulate success for now.
    return { success: true, provider };
}
