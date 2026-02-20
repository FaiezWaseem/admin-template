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
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { Edit, FileText, Plus, Trash2, ArrowUpRight, Globe, Search } from "lucide-react";
import { deletePage } from "@/actions/pages";

type PageDoc = {
    id: string;
    title: string;
    slug: string;
    status: string;
    template: string;
    createdAt: Date;
    updatedAt: Date;
};

export function PagesTable({ pages }: { pages: PageDoc[] }) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredPages = pages.filter((p) => {
        const matchesSearch = (p.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.slug.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to permanently delete the page "${title}"?`)) return;

        setIsDeleting(id);
        try {
            const res = await deletePage(id);
            if (res.success) {
                toast.success(`Page deleted successfully.`);
            } else {
                toast.error(res.error || "Failed to delete the page.");
            }
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-4 rounded-md border gap-4">
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-500" />
                    <h3 className="font-medium">All Pages</h3>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search pages..."
                            className="w-full pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/dashboard/pages/new">
                            <Plus className="mr-2 h-4 w-4" /> New Page
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Template</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No pages found matching your criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPages.map((page) => (
                                <TableRow key={page.id}>
                                    <TableCell className="font-medium">{page.title}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            /{page.slug}
                                            {page.status === 'published' && (
                                                <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                                                    <ArrowUpRight className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={page.status === "published" ? "default" : (page.status === "draft" ? "secondary" : "outline")}>
                                            {page.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono text-[10px] uppercase">
                                            {page.template}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {new Date(page.updatedAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/dashboard/seo/${page.id}`}>
                                                    <Globe className="h-4 w-4 mr-1 text-blue-500" /> SEO
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/dashboard/pages/${page.id}`}>
                                                    <Edit className="h-4 w-4 mr-1" /> Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                onClick={() => handleDelete(page.id, page.title)}
                                                disabled={isDeleting === page.id}
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
        </div>
    );
}
