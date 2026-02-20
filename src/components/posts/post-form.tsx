"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createPost, updatePost, PostData } from "@/actions/posts";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

const postSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters."),
    slug: z.string().min(2, "Slug must be at least 2 characters.").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens allowed."),
    excerpt: z.string().optional(),
    featuredImg: z.string().optional(),
    status: z.enum(["draft", "published", "archived"]),
    content: z.string().min(1, "Post content cannot be empty."),
});

type PostFormValues = z.infer<typeof postSchema>;

interface PostFormProps {
    initialData?: null | {
        id: string;
        title: string;
        slug: string;
        excerpt: string;
        featuredImg: string;
        status: string;
        content: string; // HTML string now
    };
}

export function PostForm({ initialData }: PostFormProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    let initialHtml = "";
    if (initialData?.content) {
        try {
            // legacy catch in case they had blocks before
            const parsed = JSON.parse(initialData.content);
            if (Array.isArray(parsed)) {
                initialHtml = parsed.map((p: any) => {
                    if (p.type === 'h1') return `<h1>${p.content}</h1>`;
                    if (p.type === 'h2') return `<h2>${p.content}</h2>`;
                    if (p.type === 'image') return `<img src="${p.content}" />`;
                    return `<p>${p.content}</p>`;
                }).join("");
            } else {
                initialHtml = initialData.content;
            }
        } catch {
            initialHtml = initialData.content;
        }
    }

    const form = useForm<PostFormValues>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            title: initialData?.title || "",
            slug: initialData?.slug || "",
            excerpt: initialData?.excerpt || "",
            featuredImg: initialData?.featuredImg || "",
            status: (initialData?.status as any) || "draft",
            content: initialHtml,
        },
    });

    const handleTitleBlur = () => {
        if (!initialData && !form.getValues("slug")) {
            const title = form.getValues("title");
            const generatedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            form.setValue("slug", generatedSlug);
        }
    };

    async function onSubmit(data: PostFormValues) {
        setIsSaving(true);
        try {
            const payload: PostData = {
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt || "",
                featuredImg: data.featuredImg || "",
                status: data.status,
                content: data.content,
            };

            let res;
            if (initialData) {
                res = await updatePost(initialData.id, payload);
            } else {
                res = await createPost(payload);
            }

            if (res.success) {
                toast.success(initialData ? "Post updated." : "Post created.");
                router.push("/dashboard/posts");
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
                <div className="flex flex-col md:flex-row gap-6">

                    {/* Main Content Area */}
                    <div className="flex-1 space-y-6">
                        <div className="bg-card border rounded-lg p-6 space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Post Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="The Future of AI..." {...field} onBlur={(e) => { field.onBlur(); handleTitleBlur(); }} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="excerpt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Excerpt / Summary</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Brief description to display on blog index..." className="resize-none" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="featuredImg"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Featured Image URL (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com/cover.jpg" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Rich Text Editor Area */}
                        <div className="bg-card border rounded-lg p-6 space-y-4">
                            <div>
                                <h3 className="text-lg font-medium">Post Body</h3>
                                <p className="text-sm text-muted-foreground mb-4">Write your article using the rich text editor.</p>
                            </div>

                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <RichTextEditor value={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="flex-none w-full md:w-[300px] space-y-6">
                        <div className="bg-card border rounded-lg p-6 space-y-4 sticky top-24">
                            <h3 className="text-lg font-medium">Publishing</h3>

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft - Not visible</SelectItem>
                                                <SelectItem value="published">Published</SelectItem>
                                                <SelectItem value="archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL Slug</FormLabel>
                                        <FormControl>
                                            <Input placeholder="my-blog-post" {...field} />
                                        </FormControl>
                                        <FormDescription>The URL path for this post</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full mt-6" disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {initialData ? "Save Changes" : "Create Post"}
                            </Button>
                        </div>
                    </div>

                </div>
            </form>
        </Form>
    );
}
