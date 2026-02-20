"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Trash2, DownloadCloud, FileImage, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadMedia, deleteMedia, updateMediaAlt } from "@/actions/media";
import { Input } from "@/components/ui/input";

type MediaItem = {
    id: string;
    filename: string;
    originalName: string;
    url: string;
    mimeType: string;
    size: number;
    alt: string;
    createdAt: Date;
};

export function MediaLibrary({ items }: { items: MediaItem[] }) {
    const [isUploading, setIsUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File exceeds 5MB limit.");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await uploadMedia(formData);
            if (res.success) {
                toast.success("File uploaded successfully.");
            } else {
                toast.error(res.error || "Upload failed.");
            }
        } finally {
            setIsUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this asset?")) return;

        setDeletingId(id);
        const res = await deleteMedia(id);
        if (res.success) {
            toast.success("File deleted.");
        } else {
            toast.error("Failed to delete the file.");
        }
        setDeletingId(null);
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success("URL copied to clipboard!");
    };

    const handleAltBlur = async (id: string, text: string, original: string) => {
        if (text === original) return;
        const res = await updateMediaAlt(id, text);
        if (res.success) toast.success("Alt text updated.");
    };

    return (
        <div className="space-y-6">
            <div className="bg-card border rounded-lg p-8 border-dashed flex flex-col items-center justify-center text-center gap-4 animate-in fade-in">
                <div className="bg-primary/10 p-4 rounded-full">
                    <DownloadCloud className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-medium">Upload Media</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        Drag and drop images here, or click to browse your local filesystem. (Max 5MB)
                    </p>
                </div>
                <div>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleUpload}
                    />
                    <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileImage className="mr-2 h-4 w-4" />}
                        Select Image
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                {items.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg bg-card/50">
                        No media files found. Upload some to get started!
                    </div>
                ) : items.map((item) => (
                    <div key={item.id} className="group relative border rounded-lg bg-card overflow-hidden h-64 flex flex-col shadow-sm transition-all hover:shadow-md animate-in zoom-in-95 duration-200">
                        <div className="relative flex-1 bg-muted/50 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={item.url}
                                alt={item.alt || item.filename}
                                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button variant="secondary" size="sm" onClick={() => copyToClipboard(item.url)}>
                                    <Copy className="h-4 w-4 mr-2" /> URL
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(item.id)}
                                    disabled={deletingId === item.id}
                                >
                                    {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="p-3 bg-card border-t text-xs">
                            <div className="font-medium truncate mb-2" title={item.filename}>{item.filename}</div>
                            <div className="flex items-center justify-between text-muted-foreground mb-2">
                                <span>{(item.size / 1024).toFixed(1)} KB</span>
                                <span className="uppercase">{item.mimeType.split('/')[1]}</span>
                            </div>
                            <Input
                                className="h-8 text-xs"
                                defaultValue={item.alt || ""}
                                placeholder="Alt text..."
                                onBlur={(e) => handleAltBlur(item.id, e.target.value, item.alt)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
