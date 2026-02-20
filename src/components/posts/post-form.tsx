"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Trash2, Save, Loader2, GripVertical, Image as ImageIcon, Type, Heading1 } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { createPost, updatePost, PostData } from "@/actions/posts";

const blockSchema = z.object({
    id: z.string(),
    type: z.enum(["h1", "h2", "p", "image"]),
    content: z.string(),
});

const postSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters."),
    slug: z.string().min(2, "Slug must be at least 2 characters.").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens allowed."),
    excerpt: z.string().optional(),
    featuredImg: z.string().optional(),
    status: z.enum(["draft", "published", "archived"]),
    blocks: z.array(blockSchema),
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
        content: string; // JSON
    };
}

export function PostForm({ initialData }: PostFormProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    let parsedBlocks = [];
    try {
        if (initialData?.content) {
            parsedBlocks = JSON.parse(initialData.content);
        }
    } catch (e) {
        parsedBlocks = [];
    }

    const form = useForm<PostFormValues>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            title: initialData?.title || "",
            slug: initialData?.slug || "",
            excerpt: initialData?.excerpt || "",
            featuredImg: initialData?.featuredImg || "",
            status: (initialData?.status as any) || "draft",
            blocks: parsedBlocks.length > 0 ? parsedBlocks : [{ id: crypto.randomUUID(), type: "p", content: "" }],
        },
    });

    const { fields, append, remove, swap } = useFieldArray({
        control: form.control,
        name: "blocks",
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
                content: JSON.stringify(data.blocks),
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

    const addBlock = (type: "h1" | "h2" | "p" | "image") => {
        append({ id: crypto.randomUUID(), type, content: "" });
    };

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

                        {/* Block Editor Area */}
                        <div className="bg-card border rounded-lg p-6 space-y-4">
                            <div>
                                <h3 className="text-lg font-medium">Post Body</h3>
                                <p className="text-sm text-muted-foreground mb-4">Write your article dynamically using sequential blocks.</p>
                            </div>

                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-start border rounded-md p-3 relative group animate-in fade-in">
                                        <div className="flex-none p-2 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground mt-6">
                                            <GripVertical className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <FormField
                                                control={form.control}
                                                name={`blocks.${index}.content`}
                                                render={({ field: blockField }) => (
                                                    <FormItem>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                                                                {field.type === 'h1' ? 'Header 1' : field.type === 'h2' ? 'Header 2' : field.type === 'image' ? 'Image URL' : 'Paragraph'}
                                                            </Badge>
                                                            <div className="flex gap-1">
                                                                {index > 0 && (
                                                                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => swap(index, index - 1)}>↑</Button>
                                                                )}
                                                                {index < fields.length - 1 && (
                                                                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => swap(index, index + 1)}>↓</Button>
                                                                )}
                                                                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-600" onClick={() => remove(index)}>
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <FormControl>
                                                            {field.type === "p" ? (
                                                                <Textarea placeholder="Paragraph text..." className="resize-none min-h-[100px]" {...blockField} />
                                                            ) : (
                                                                <Input placeholder={field.type === 'image' ? 'https://example.com/image.jpg' : 'Heading text...'} {...blockField} />
                                                            )}
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-2 pt-4 border-t border-dashed">
                                <Button type="button" variant="outline" size="sm" onClick={() => addBlock("h2")}>
                                    <Heading1 className="h-4 w-4 mr-2" /> Add Heading
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => addBlock("p")}>
                                    <Type className="h-4 w-4 mr-2" /> Add Text
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => addBlock("image")}>
                                    <ImageIcon className="h-4 w-4 mr-2" /> Add Image
                                </Button>
                            </div>
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
