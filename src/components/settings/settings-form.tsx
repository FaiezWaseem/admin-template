"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { updateSiteSettings } from "@/actions/settings";

const settingsSchema = z.object({
    site_name: z.string().min(2, "Site name must be at least 2 characters."),
    site_description: z.string().optional(),
    support_email: z.string().email("Please enter a valid email address."),
    admin_contact: z.string().optional(),
    maintenance_mode: z.boolean(),
    theme_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color"),
});

type SettingsValues = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
    initialData: Record<string, string>;
}

export function SettingsForm({ initialData }: SettingsFormProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    // Initialize form with existing DB config falling back to sensible defaults
    const form = useForm<SettingsValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            site_name: initialData.site_name || "Admin Template",
            site_description: initialData.site_description || "",
            support_email: initialData.support_email || "support@example.com",
            admin_contact: initialData.admin_contact || "",
            maintenance_mode: initialData.maintenance_mode === "true",
            theme_color: initialData.theme_color || "#3b82f6",
        },
    });

    async function onSubmit(data: SettingsValues) {
        setIsSaving(true);
        try {
            // Map data object to key-value array for the server action
            const updates = Object.entries(data).map(([key, value]) => ({
                key,
                value: typeof value === "boolean" ? String(value) : value,
            }));

            const res = await updateSiteSettings(updates);

            if (res.success) {
                toast.success("Settings updated successfully.");
                router.refresh();
            } else {
                toast.error(res.error);
            }
        } catch {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-6">
                        <div className="bg-card border rounded-lg p-6 space-y-4">
                            <h3 className="text-lg font-medium">General Information</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Basic details that identify your application to users.
                            </p>

                            <FormField
                                control={form.control}
                                name="site_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Site Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Acme Dashboard" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            This is your public-facing application name.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="site_description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Site Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="A brief description of your platform..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-card border rounded-lg p-6 space-y-4">
                            <h3 className="text-lg font-medium">Contact & Support</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Where should users direct their inquiries.
                            </p>

                            <FormField
                                control={form.control}
                                name="support_email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Support Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="support@domain.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="admin_contact"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Admin Phone (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 (555) 000-0000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="bg-card border rounded-lg p-6 space-y-4 border-l-4 border-l-orange-500">
                            <h3 className="text-lg font-medium">System State</h3>

                            <FormField
                                control={form.control}
                                name="maintenance_mode"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Maintenance Mode</FormLabel>
                                            <FormDescription>
                                                Disable access to the public site and show a maintenance page.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Configuration
                    </Button>
                </div>
            </form>
        </Form>
    );
}
