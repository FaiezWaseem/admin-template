"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
    Trash2,
    Save,
    Loader2,
    GripVertical,
    Image as ImageIcon,
    Type,
    Heading1,
    Heading2,
    LayoutTemplate,
    Minus,
    Quote,
    List,
    MousePointerClick,
    Sparkles,
    Plus,
} from "lucide-react";

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
import { createPage, updatePage, PageData } from "@/actions/pages";

const BLOCK_TYPES = [
    "h1",
    "h2",
    "p",
    "image",
    "button",
    "quote",
    "divider",
    "list",
    "cta",
    "hero",
] as const;

type BlockType = (typeof BLOCK_TYPES)[number];

const blockSchema = z.object({
    id: z.string(),
    type: z.enum(BLOCK_TYPES),
    content: z.string(),
});

const pageSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters."),
    slug: z
        .string()
        .min(2, "Slug must be at least 2 characters.")
        .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens allowed."),
    excerpt: z.string().optional(),
    status: z.enum(["draft", "published", "archived"]),
    template: z.string().min(1, "Template is required"),
    blocks: z.array(blockSchema),
});

type PageFormValues = z.infer<typeof pageSchema>;

type BlockPreset = {
    type: BlockType;
    label: string;
    hint: string;
    icon: any;
    defaultContent: string;
    category: "Basic" | "Layout" | "Marketing";
};

const BLOCK_PRESETS: BlockPreset[] = [
    { type: "h1", label: "Heading 1", hint: "Main page heading", icon: Heading1, defaultContent: "Page Title", category: "Basic" },
    { type: "h2", label: "Heading 2", hint: "Section heading", icon: Heading2, defaultContent: "Section Title", category: "Basic" },
    { type: "p", label: "Paragraph", hint: "Body copy", icon: Type, defaultContent: "Add paragraph content here...", category: "Basic" },
    { type: "image", label: "Image", hint: "Image URL", icon: ImageIcon, defaultContent: "https://example.com/image.jpg", category: "Basic" },
    { type: "button", label: "Button", hint: "Label | URL", icon: MousePointerClick, defaultContent: "Learn More | /", category: "Basic" },
    { type: "list", label: "Feature List", hint: "One item per line", icon: List, defaultContent: "Fast setup\nRole-based access\nAudit logs", category: "Layout" },
    { type: "divider", label: "Divider", hint: "Visual separator", icon: Minus, defaultContent: "---", category: "Layout" },
    { type: "quote", label: "Quote", hint: "Quote or testimonial", icon: Quote, defaultContent: "\"This is excellent\" - Customer", category: "Marketing" },
    { type: "cta", label: "CTA Banner", hint: "Title | Text | Button | URL", icon: Sparkles, defaultContent: "Start today | Launch faster with our platform | Get Started | /register", category: "Marketing" },
    { type: "hero", label: "Hero Section", hint: "Title | Subtitle | CTA | URL", icon: LayoutTemplate, defaultContent: "Build Faster | Create modern internal tools in days | Explore Dashboard | /dashboard", category: "Marketing" },
];

const BLOCK_META: Record<BlockType, { label: string; multiline?: boolean; placeholder: string }> = {
    h1: { label: "Header 1", placeholder: "Main heading..." },
    h2: { label: "Header 2", placeholder: "Section heading..." },
    p: { label: "Paragraph", multiline: true, placeholder: "Paragraph text..." },
    image: { label: "Image URL", placeholder: "https://example.com/image.jpg" },
    button: { label: "Button", placeholder: "Label | /path-or-url" },
    quote: { label: "Quote", multiline: true, placeholder: "\"Quote\" - Author" },
    divider: { label: "Divider", placeholder: "---" },
    list: { label: "List", multiline: true, placeholder: "Item one\nItem two\nItem three" },
    cta: { label: "CTA Banner", multiline: true, placeholder: "Title | Text | Button label | /url" },
    hero: { label: "Hero Section", multiline: true, placeholder: "Title | Subtitle | CTA label | /url" },
};

interface PageFormProps {
    initialData?: null | {
        id: string;
        title: string;
        slug: string;
        excerpt: string;
        status: string;
        template: string;
        content: string;
    };
}

export function PageForm({ initialData }: PageFormProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    let parsedBlocks: Array<{ id: string; type: BlockType; content: string }> = [];
    try {
        if (initialData?.content) {
            parsedBlocks = JSON.parse(initialData.content);
        }
    } catch {
        parsedBlocks = [];
    }

    const form = useForm<PageFormValues>({
        resolver: zodResolver(pageSchema),
        defaultValues: {
            title: initialData?.title || "",
            slug: initialData?.slug || "",
            excerpt: initialData?.excerpt || "",
            status: (initialData?.status as any) || "draft",
            template: initialData?.template || "default",
            blocks:
                parsedBlocks.length > 0
                    ? parsedBlocks
                    : [{ id: crypto.randomUUID(), type: "h1", content: "Page Title" }],
        },
    });

    const { fields, append, remove, swap } = useFieldArray({
        control: form.control,
        name: "blocks",
    });

    const handleTitleBlur = () => {
        if (!initialData && !form.getValues("slug")) {
            const title = form.getValues("title");
            const generatedSlug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            form.setValue("slug", generatedSlug);
        }
    };

    async function onSubmit(data: PageFormValues) {
        setIsSaving(true);
        try {
            const payload: PageData = {
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt || "",
                status: data.status,
                template: data.template,
                content: JSON.stringify(data.blocks),
            };

            const res = initialData
                ? await updatePage(initialData.id, payload)
                : await createPage(payload);

            if (res.success) {
                toast.success(initialData ? "Page updated." : "Page created.");
                router.push("/dashboard/pages");
            } else {
                toast.error(res.error);
            }
        } catch {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsSaving(false);
        }
    }

    const addBlock = (type: BlockType, content = "") => {
        append({ id: crypto.randomUUID(), type, content });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex flex-col gap-6 md:flex-row">
                    <div className="flex-1 space-y-6">
                        <div className="space-y-4 rounded-lg border bg-card p-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Page Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="About Us"
                                                {...field}
                                                onBlur={(e) => {
                                                    field.onBlur();
                                                    handleTitleBlur();
                                                }}
                                            />
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
                                            <Textarea
                                                placeholder="Brief description for SEO and embeds..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4 rounded-lg border bg-card p-6">
                            <div>
                                <h3 className="text-lg font-medium">Page Builder</h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Add components and arrange them in sequence, similar to a lightweight Elementor workflow.
                                </p>
                            </div>

                            <div className="rounded-xl border bg-muted/40 p-4">
                                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                                    <Plus className="h-4 w-4 text-primary" />
                                    Component Library
                                </div>
                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                    {(["Basic", "Layout", "Marketing"] as const).map((category) => (
                                        <div key={category} className="space-y-2">
                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                {category}
                                            </p>
                                            {BLOCK_PRESETS.filter((preset) => preset.category === category).map((preset) => {
                                                const Icon = preset.icon;
                                                return (
                                                    <Button
                                                        key={preset.type}
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-auto w-full justify-start p-3 text-left"
                                                        onClick={() => addBlock(preset.type, preset.defaultContent)}
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <Icon className="mt-0.5 h-4 w-4 text-primary" />
                                                            <div>
                                                                <div className="text-sm font-medium leading-none">
                                                                    {preset.label}
                                                                </div>
                                                                <div className="mt-1 text-xs text-muted-foreground">
                                                                    {preset.hint}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {fields.map((field, index) => {
                                    const meta = BLOCK_META[field.type as BlockType] ?? {
                                        label: field.type,
                                        placeholder: "Content...",
                                    };
                                    const presetHint = BLOCK_PRESETS.find((preset) => preset.type === field.type)?.hint;

                                    return (
                                        <div
                                            key={field.id}
                                            className="group relative flex items-start gap-2 rounded-md border p-3 animate-in fade-in"
                                        >
                                            <div className="mt-6 flex-none cursor-grab p-2 text-muted-foreground/50 hover:text-foreground">
                                                <GripVertical className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`blocks.${index}.content`}
                                                    render={({ field: blockField }) => (
                                                        <FormItem>
                                                            <div className="mb-1 flex items-center justify-between">
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="font-mono text-[10px] uppercase"
                                                                >
                                                                    {meta.label}
                                                                </Badge>
                                                                <div className="flex gap-1">
                                                                    {index > 0 && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-6 w-6 p-0"
                                                                            onClick={() => swap(index, index - 1)}
                                                                        >
                                                                            ↑
                                                                        </Button>
                                                                    )}
                                                                    {index < fields.length - 1 && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-6 w-6 p-0"
                                                                            onClick={() => swap(index, index + 1)}
                                                                        >
                                                                            ↓
                                                                        </Button>
                                                                    )}
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                                                                        onClick={() => remove(index)}
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <FormControl>
                                                                {meta.multiline ? (
                                                                    <Textarea
                                                                        placeholder={meta.placeholder}
                                                                        className="min-h-[100px] resize-none"
                                                                        {...blockField}
                                                                    />
                                                                ) : (
                                                                    <Input placeholder={meta.placeholder} {...blockField} />
                                                                )}
                                                            </FormControl>
                                                            {presetHint && (
                                                                <p className="text-xs text-muted-foreground">{presetHint}</p>
                                                            )}
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex flex-wrap gap-2 border-t border-dashed pt-4">
                                <Button type="button" variant="outline" size="sm" onClick={() => addBlock("h1", "New Heading")}>
                                    <Heading1 className="mr-2 h-4 w-4" /> Add H1
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => addBlock("h2", "Section Title")}>
                                    <Heading2 className="mr-2 h-4 w-4" /> Add Heading
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => addBlock("p", "Paragraph content...")}>
                                    <Type className="mr-2 h-4 w-4" /> Add Text
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => addBlock("image", "https://example.com/image.jpg")}>
                                    <ImageIcon className="mr-2 h-4 w-4" /> Add Image
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => addBlock("button", "Learn More | /")}>
                                    <MousePointerClick className="mr-2 h-4 w-4" /> Add Button
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex-none space-y-6 md:w-[300px]">
                        <div className="sticky top-24 space-y-4 rounded-lg border bg-card p-6">
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
                                            <Input placeholder="about-us" {...field} />
                                        </FormControl>
                                        <FormDescription>The URL path for this page</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="template"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Page Template</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select template" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="default">Default Width</SelectItem>
                                                <SelectItem value="full-width">Full Width Canvas</SelectItem>
                                                <SelectItem value="landing">Landing Page</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="mt-6 w-full" disabled={isSaving}>
                                {isSaving ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                {initialData ? "Save Changes" : "Create Page"}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
}
