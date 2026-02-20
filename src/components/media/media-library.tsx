"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Trash2, DownloadCloud, FileImage, Loader2, Copy, Folder, FolderPlus, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadMedia, deleteMedia, updateMediaAlt } from "@/actions/media";
import { createFolder, deleteFolder } from "@/actions/folders";
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
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

type FolderItem = {
    id: string;
    name: string;
};

type MediaItem = {
    id: string;
    filename: string;
    originalName: string;
    url: string;
    mimeType: string;
    size: number;
    alt: string;
    folderId: string | null;
    createdAt: Date;
};

interface MediaLibraryProps {
    folders: FolderItem[];
    items: MediaItem[];
}

export function MediaLibrary({ folders, items }: MediaLibraryProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [newFolderName, setNewFolderName] = useState("");
    const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    // Dialog state for File Deletion
    const [fileToDeleteId, setFileToDeleteId] = useState<string | null>(null);

    // Dialog state for Folder Deletion
    const [folderToDeleteId, setFolderToDeleteId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredItems = items.filter(item => item.folderId === currentFolderId);
    const currentFolder = folders.find(f => f.id === currentFolderId);

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
            if (currentFolderId) {
                formData.append("folderId", currentFolderId);
            }

            const res = await uploadMedia(formData);
            if (res.success) {
                toast.success("File uploaded successfully.");
            } else {
                toast.error(res.error || "Upload failed.");
            }
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const executeDelete = async () => {
        if (!fileToDeleteId) return;
        const id = fileToDeleteId;
        setDeletingId(id);
        const res = await deleteMedia(id);
        if (res.success) {
            toast.success("File deleted.");
        } else {
            toast.error("Failed to delete the file.");
        }
        setDeletingId(null);
        setFileToDeleteId(null);
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        setIsCreatingFolder(true);
        const res = await createFolder(newFolderName);
        if (res.success) {
            toast.success("Folder created.");
            setNewFolderName("");
            setIsFolderDialogOpen(false);
        } else {
            toast.error(res.error || "Failed to create folder.");
        }
        setIsCreatingFolder(false);
    };

    const executeDeleteFolder = async () => {
        if (!folderToDeleteId) return;
        const id = folderToDeleteId;
        setDeletingId(id);
        const res = await deleteFolder(id);
        if (res.success) {
            toast.success("Folder deleted.");
            if (currentFolderId === id) setCurrentFolderId(null);
        } else {
            toast.error(res.error || "Failed to delete folder.");
        }
        setDeletingId(null);
        setFolderToDeleteId(null);
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

            {/* Header / Upload Widget */}
            <div className="bg-card border rounded-lg p-6 flex flex-col items-center justify-center text-center gap-4 shadow-sm">
                <div className="bg-primary/10 p-4 rounded-full">
                    <DownloadCloud className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-medium">
                        {currentFolder ? `Upload to ${currentFolder.name}` : "Upload Media to Root"}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        Max size 5MB. Images will be stored in this directory.
                    </p>
                </div>
                <div className="flex items-center gap-3 mt-2">
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
                    <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileImage className="mr-2 h-4 w-4" />}
                        Select Image
                    </Button>

                    {!currentFolderId && (
                        <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <FolderPlus className="h-4 w-4 mr-2" /> New Folder
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Folder</DialogTitle>
                                    <DialogDescription>
                                        Organize your media assets cleanly using directory folders.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <Input
                                        placeholder="e.g. Products 2024"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsFolderDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleCreateFolder} disabled={!newFolderName.trim() || isCreatingFolder}>
                                        {isCreatingFolder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {/* Folder Navigation Path */}
            <div className="flex items-center gap-2 mb-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className={`text-muted-foreground hover:text-foreground ${!currentFolderId ? 'font-bold text-foreground bg-muted/50' : ''}`}
                    onClick={() => setCurrentFolderId(null)}
                >
                    <Folder className="h-4 w-4 mr-2 text-indigo-500" />
                    Root Directory
                </Button>

                {currentFolder && (
                    <>
                        <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium px-2 py-1 bg-muted/50 rounded flex items-center gap-2">
                            {currentFolder.name}
                        </span>
                    </>
                )}
            </div>

            {/* Grid display mode */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">

                {/* Render Folders (only show in root) */}
                {!currentFolderId && folders.map((folder) => (
                    <div
                        key={folder.id}
                        className="group relative border rounded-lg bg-card hover:bg-muted/50 overflow-hidden h-32 flex flex-col justify-center items-center shadow-sm cursor-pointer transition-all animate-in zoom-in-95 duration-200"
                        onClick={() => setCurrentFolderId(folder.id)}
                    >
                        <Folder className="h-10 w-10 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="font-medium truncate px-4 text-sm text-center w-full">{folder.name}</span>

                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFolderToDeleteId(folder.id);
                                }}
                                disabled={deletingId === folder.id}
                            >
                                {deletingId === folder.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                            </Button>
                        </div>
                    </div>
                ))}

                {/* Render Files */}
                {filteredItems.map((item) => (
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
                                    onClick={() => setFileToDeleteId(item.id)}
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

                {/* Empty states */}
                {(!currentFolderId && folders.length === 0 && filteredItems.length === 0) && (
                    <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-card/50">
                        Library is empty. Upload some assets or create a Folder!
                    </div>
                )}

                {(currentFolderId && filteredItems.length === 0) && (
                    <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-card/50">
                        This folder is empty. Upload items here!
                    </div>
                )}
            </div>

            {/* Global Delete Confirmations */}
            <ConfirmDeleteDialog
                isOpen={!!fileToDeleteId}
                onOpenChange={(open) => !open && setFileToDeleteId(null)}
                onConfirm={executeDelete}
                isDeleting={!!deletingId && deletingId === fileToDeleteId}
                title="Delete Media File?"
                description="This file will be permanently removed from storage and disconnected from any Posts."
            />

            <ConfirmDeleteDialog
                isOpen={!!folderToDeleteId}
                onOpenChange={(open) => !open && setFolderToDeleteId(null)}
                onConfirm={executeDeleteFolder}
                isDeleting={!!deletingId && deletingId === folderToDeleteId}
                title="Delete Folder?"
                description="This folder will be permanently removed. WARNING: The folder must be completely empty first!"
            />
        </div>
    );
}
