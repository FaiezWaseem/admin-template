"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Save, Send, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateEmailConfig, testEmailGateway } from "@/actions/email";

const emailSchema = z.object({
    email_provider: z.string(),
    smtp_host: z.string().optional(),
    smtp_port: z.string().optional(),
    smtp_user: z.string().optional(),
    smtp_pass: z.string().optional(),
    sendgrid_api_key: z.string().optional(),
    from_address: z.string().email("Valid From address required"),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export function EmailConfigForm({ initialData }: { initialData: Record<string, string> }) {
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testEmailAddr, setTestEmailAddr] = useState("");

    const form = useForm<EmailFormValues>({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email_provider: initialData.email_provider || "mock",
            smtp_host: initialData.smtp_host || "",
            smtp_port: initialData.smtp_port || "587",
            smtp_user: initialData.smtp_user || "",
            smtp_pass: initialData.smtp_pass || "",
            sendgrid_api_key: initialData.sendgrid_api_key || "",
            from_address: initialData.from_address || "noreply@example.com",
        },
    });

    const activeProvider = form.watch("email_provider");

    async function onSubmit(data: EmailFormValues) {
        setIsSaving(true);
        try {
            const updates = Object.entries(data).map(([key, value]) => ({
                key,
                value: value || "", // default empty strings for optional fields
            }));
            const res = await updateEmailConfig(updates);
            if (res.success) {
                toast.success("Email configuration updated.");
            } else {
                toast.error(res.error);
            }
        } finally {
            setIsSaving(false);
        }
    }

    async function onTest() {
        if (!testEmailAddr) {
            toast.error("Please enter a test email address.");
            return;
        }
        setIsTesting(true);
        try {
            const res = await testEmailGateway(testEmailAddr);
            if (res.success) {
                toast.success(res.message);
            } else {
                toast.error(res.error || "Failed to send test email.");
            }
        } finally {
            setIsTesting(false);
        }
    }

    return (
        <div className="space-y-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-card border rounded-lg p-6 space-y-4">
                        <h3 className="text-lg font-medium">Gateway Selection</h3>
                        <FormField
                            control={form.control}
                            name="email_provider"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Provider Adapter</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a provider" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="mock">Mock / Development Log</SelectItem>
                                            <SelectItem value="smtp">Custom SMTP Server</SelectItem>
                                            <SelectItem value="sendgrid">SendGrid API</SelectItem>
                                            <SelectItem value="ses">Amazon SES</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>Choose how emails are dispatched globally.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="from_address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Global From Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="noreply@domain.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {activeProvider === "smtp" && (
                        <div className="bg-card border rounded-lg p-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="text-lg font-medium">SMTP Credentials</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="smtp_host"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SMTP Host</FormLabel>
                                            <FormControl><Input placeholder="smtp.mailtrap.io" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="smtp_port"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Port</FormLabel>
                                            <FormControl><Input placeholder="587" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="smtp_user"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl><Input placeholder="user..." {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="smtp_pass"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    {activeProvider === "sendgrid" && (
                        <div className="bg-card border rounded-lg p-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="text-lg font-medium">SendGrid Settings</h3>
                            <FormField
                                control={form.control}
                                name="sendgrid_api_key"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>API Key</FormLabel>
                                        <FormControl><Input type="password" placeholder="SG.xxxxxxx" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {activeProvider === "ses" && (
                        <div className="bg-card border rounded-lg p-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="text-lg font-medium">Amazon SES Settings</h3>
                            <p className="text-sm text-muted-foreground">SES configuration is managed via external AWS environment variables or IAM Roles. Ensure `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are injected into your environment.</p>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Configuration
                        </Button>
                    </div>
                </form>
            </Form>

            <div className="bg-secondary/30 border border-teal-500/30 rounded-lg p-6 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 py-8">
                <div className="flex-1">
                    <h4 className="text-lg font-semibold flex items-center gap-2"><Send className="h-5 w-5 text-teal-500" /> Dispatch Test Email</h4>
                    <p className="text-sm text-muted-foreground mt-1">Verify that your gateway settings are correct before relying on them for user registration workflows.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Input
                        type="email"
                        placeholder="test@example.com"
                        className="bg-background max-w-[250px]"
                        value={testEmailAddr}
                        onChange={(e) => setTestEmailAddr(e.target.value)}
                    />
                    <Button variant="secondary" onClick={onTest} disabled={isTesting || !testEmailAddr}>
                        {isTesting ? "Sending..." : "Send Test"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
