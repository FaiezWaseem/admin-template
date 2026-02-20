"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Save, Loader2, Globe, Search } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { upsertSEOMeta, SEOMetaData } from "@/actions/seo";
import { Badge } from "@/components/ui/badge";

const seoSchema = z.object({
    metaTitle: z.string().max(60, "Meta title should be under 60 characters for best results."),
    metaDescription: z.string().max(160, "Meta description should be under 160 characters."),
    ogTitle: z.string(),
    ogDescription: z.string(),
    ogImage: z.string().url("Must be a valid URL").or(z.literal("")),
    canonicalUrl: z.string().url("Must be a valid URL").or(z.literal("")),
    noIndex: z.boolean(),
    noFollow: z.boolean(),
    focusKeyword: z.string(),
});

type SEOMetaValues = z.infer<typeof seoSchema>;

interface SEOFormProps {
    pageId: string;
    pageTitle: string;
    pageSlug: string;
    initialData: any; // SEOMeta | null
    baseUrl: string;
}

export function SEOForm({ pageId, pageTitle, pageSlug, initialData, baseUrl }: SEOFormProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<SEOMetaValues>({
        resolver: zodResolver(seoSchema),
        defaultValues: {
            metaTitle: initialData?.metaTitle || pageTitle,
            metaDescription: initialData?.metaDescription || "",
            ogTitle: initialData?.ogTitle || pageTitle,
            ogDescription: initialData?.ogDescription || "",
            ogImage: initialData?.ogImage || "",
            canonicalUrl: initialData?.canonicalUrl || `${baseUrl}/${pageSlug}`,
            noIndex: initialData?.noIndex || false,
            noFollow: initialData?.noFollow || false,
            focusKeyword: initialData?.focusKeyword || "",
        },
    });

    const watchData = form.watch();

    async function onSubmit(data: SEOMetaValues) {
        setIsSaving(true);
        try {
            const res = await upsertSEOMeta(pageId, data);
            if (res.success) {
                toast.success("SEO Metadata saved.");
                router.refresh();
            } else {
                toast.error(res.error);
            }
        } finally {
            setIsSaving(false);
        }
    }

    const generatedUrl = `${baseUrl}/${pageSlug}`;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Configuration Form */}
            <div className="xl:col-span-2 space-y-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Standard Meta Tags */}
                        <div className="bg-card border rounded-lg p-6 space-y-4">
                            <h3 className="text-lg font-medium flex items-center gap-2"><Globe className="h-5 w-5 text-blue-500" /> Search Engine Display</h3>
                            <p className="text-sm text-muted-foreground mb-4">How this page appears on Google and Bing.</p>

                            <FormField
                                control={form.control}
                                name="metaTitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Meta Title <span className="text-muted-foreground font-normal text-xs ml-2">({field.value.length}/60)</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Page Title | Brand" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="metaDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Meta Description <span className="text-muted-foreground font-normal text-xs ml-2">({field.value.length}/160)</span></FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="A compelling summary for search results..." className="resize-none" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="canonicalUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Canonical URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://..." {...field} />
                                        </FormControl>
                                        <FormDescription>Prevents duplicate content issues.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Social / Open Graph */}
                        <div className="bg-card border rounded-lg p-6 space-y-4">
                            <h3 className="text-lg font-medium">Social Sharing (OpenGraph)</h3>
                            <p className="text-sm text-muted-foreground mb-4">How this page looks when shared on Twitter, Facebook, or LinkedIn.</p>

                            <FormField
                                control={form.control}
                                name="ogTitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>OG Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Engaging Title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="ogDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>OG Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Engaging summary for feeds..." className="resize-none" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="ogImage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>OpenGraph Image URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://.../og-default.png" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Advanced & Indexing */}
                        <div className="bg-card border rounded-lg p-6 space-y-6">
                            <h3 className="text-lg font-medium">Advanced Indexing</h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="noIndex"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel>No Index</FormLabel>
                                                <FormDescription>Hide this page from search engines.</FormDescription>
                                            </div>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="noFollow"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel>No Follow</FormLabel>
                                                <FormDescription>Stop bots from crawling links on this page.</FormDescription>
                                            </div>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="focusKeyword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Target Focus Keyword</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Next.js performance" {...field} />
                                        </FormControl>
                                        <FormDescription>Used for internal SEO grading and analytics.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Metadata
                        </Button>
                    </form>
                </Form>
            </div>

            {/* Live Preview Sidebar */}
            <div className="space-y-6">
                <div className="bg-card border rounded-lg p-6 sticky top-24">
                    <h3 className="text-lg font-medium flex items-center gap-2 mb-4"><Search className="h-4 w-4" /> Google Preview</h3>

                    <div className="bg-white dark:bg-slate-950 p-4 rounded border shadow-sm flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-[#202124] dark:text-[#bdc1c6]">
                            <span>Your Brand</span>
                            <span className="text-xs text-muted-foreground bg-muted px-1 rounded">Sponsored</span>
                        </div>
                        <div className="text-sm truncate max-w-full text-[#202124] dark:text-[#bdc1c6] font-normal leading-none mb-1">
                            {generatedUrl}
                        </div>
                        <div className="text-[20px] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer truncate leading-tight">
                            {watchData.metaTitle || pageTitle}
                        </div>
                        <div className="text-[14px] leading-[1.58] text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2 mt-1">
                            {watchData.metaDescription || "No meta description provided. Google will randomly pick text from your page."}
                        </div>
                    </div>

                    {watchData.noIndex && (
                        <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 rounded-md text-sm font-medium">
                            ⚠️ This page is marked as "No Index" and will not appear in actual search results.
                        </div>
                    )}

                    {watchData.focusKeyword && (
                        <div className="mt-4 pt-4 border-t">
                            <div className="text-sm font-medium mb-2">Keyword Grading</div>
                            <div className="flex flex-col gap-2 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">In Title:</span>
                                    {watchData.metaTitle.toLowerCase().includes(watchData.focusKeyword.toLowerCase()) ?
                                        <Badge variant="default" className="bg-emerald-500">Pass</Badge> : <Badge variant="secondary">Fail</Badge>}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">In Description:</span>
                                    {watchData.metaDescription.toLowerCase().includes(watchData.focusKeyword.toLowerCase()) ?
                                        <Badge variant="default" className="bg-emerald-500">Pass</Badge> : <Badge variant="secondary">Fail</Badge>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
