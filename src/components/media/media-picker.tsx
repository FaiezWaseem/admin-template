"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, ImageIcon, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type MediaPickerItem = {
    id: string;
    url: string;
    filename: string;
    originalName: string;
    alt: string;
    mimeType: string;
    size: number;
    createdAt?: Date;
};

type Props = {
    items: MediaPickerItem[];
    value?: string;
    onSelect: (url: string) => void;
    onClear?: () => void;
    triggerLabel?: string;
    title?: string;
    description?: string;
};

export function MediaPicker({
    items,
    value,
    onSelect,
    onClear,
    triggerLabel = "Choose from Media Library",
    title = "Select Media",
    description = "Pick an image from the media manager.",
}: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<string>(value || "");

    const imageItems = useMemo(
        () =>
            items.filter((item) => item.mimeType.startsWith("image/")).filter((item) => {
                const q = query.toLowerCase();
                if (!q) return true;
                return (
                    item.filename.toLowerCase().includes(q) ||
                    item.originalName.toLowerCase().includes(q) ||
                    (item.alt || "").toLowerCase().includes(q) ||
                    item.url.toLowerCase().includes(q)
                );
            }),
        [items, query]
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div className="flex flex-wrap gap-2">
                <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        {triggerLabel}
                    </Button>
                </DialogTrigger>
                {value && onClear && (
                    <Button type="button" variant="ghost" onClick={onClear}>
                        <X className="mr-2 h-4 w-4" />
                        Clear
                    </Button>
                )}
                <Button type="button" variant="ghost" asChild>
                    <Link href="/dashboard/media" target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Media Manager
                    </Link>
                </Button>
            </div>

            <DialogContent className="max-w-5xl p-0">
                <DialogHeader className="border-b p-6 pb-4">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                    <div className="relative mt-3">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search images..."
                            className="pl-9"
                        />
                    </div>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-auto p-6">
                    {imageItems.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                            No images found. Upload images in `/dashboard/media`.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                            {imageItems.map((item) => {
                                const active = selected === item.url;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setSelected(item.url)}
                                        className={cn(
                                            "group relative overflow-hidden rounded-lg border bg-card text-left transition",
                                            active && "border-primary ring-2 ring-primary/20"
                                        )}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={item.url}
                                            alt={item.alt || item.filename}
                                            className="h-32 w-full object-cover"
                                        />
                                        <div className="space-y-1 p-2">
                                            <p className="truncate text-xs font-medium">{item.originalName}</p>
                                            <p className="truncate text-[11px] text-muted-foreground">
                                                {item.alt || item.filename}
                                            </p>
                                        </div>
                                        {active && (
                                            <span className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                                                <Check className="h-4 w-4" />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t p-6 pt-4">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            if (!selected) return;
                            onSelect(selected);
                            setOpen(false);
                        }}
                        disabled={!selected}
                    >
                        Use Selected Image
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
