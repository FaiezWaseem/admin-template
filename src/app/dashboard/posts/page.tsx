import { prisma } from "@/lib/prisma";
import { PostsTable } from "@/components/posts/posts-table";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog Posts | Admin Dashboard",
    description: "Manage content publishing via the blog posts engine.",
};

export default async function PostsIndex() {
    const posts = await prisma.post.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
            author: {
                select: { name: true }
            }
        }
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
                    <p className="text-muted-foreground text-sm">
                        Create, edit, and publish engaging articles.
                    </p>
                </div>
            </div>

            <PostsTable posts={posts as any} />
        </div>
    );
}
