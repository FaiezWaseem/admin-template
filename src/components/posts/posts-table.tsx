"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Edit, BookOpen, Plus, Trash2, ArrowUpRight, Globe } from "lucide-react";
import { deletePost } from "@/actions/posts";
import { format } from "date-fns";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

type PostDoc = {
    id: string;
    title: string;
    slug: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    author: {
        name: string | null;
    } | null;
};

export function PostsTable({ posts }: { posts: PostDoc[] }) {
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const [postToDelete, setPostToDelete] = useState<{ id: string, title: string } | null>(null);

    const executeDelete = async () => {
        if (!postToDelete) return;
        const { id, title } = postToDelete;
        setIsDeletingId(id);
        try {
            const res = await deletePost(id);
            if (res.success) {
                toast.success(`Post deleted successfully.`);
            } else {
                toast.error(res.error || "Failed to delete the post.");
            }
        } finally {
            setIsDeletingId(null);
            setPostToDelete(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-card p-4 rounded-md border">
                <h3 className="font-medium flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-500" /> All Blog Posts
                </h3>
                <Button asChild>
                    <Link href="/dashboard/posts/new">
                        <Plus className="mr-2 h-4 w-4" /> Write Post
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Published Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {posts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No blog posts found. Write one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            posts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell className="font-medium">{post.title}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            /blog/{post.slug}
                                            {post.status === 'published' && (
                                                <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                                                    <ArrowUpRight className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {post.author?.name || "Unknown Author"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={post.status === "published" ? "default" : (post.status === "draft" ? "secondary" : "outline")}>
                                            {post.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {format(new Date(post.createdAt), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/dashboard/posts/${post.id}`}>
                                                    <Edit className="h-4 w-4 mr-1" /> Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                onClick={() => setPostToDelete({ id: post.id, title: post.title })}
                                                disabled={isDeletingId === post.id}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <ConfirmDeleteDialog
                isOpen={!!postToDelete}
                onOpenChange={(open) => !open && setPostToDelete(null)}
                onConfirm={executeDelete}
                isDeleting={!!isDeletingId && isDeletingId === postToDelete?.id}
                title={`Delete "${postToDelete?.title}"?`}
                description="This blog post will be permanently deleted along with its SEO meta data."
            />
        </div>
    );
}
