import { PostForm } from "@/components/posts/post-form";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Edit Post | Admin Dashboard",
    description: "Modify an existing blog post.",
};

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;

    const post = await prisma.post.findUnique({
        where: { id: resolvedParams.id },
    });

    if (!post) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
                    <p className="text-muted-foreground text-sm">
                        Modify an existing article and update its blocks.
                    </p>
                </div>
            </div>

            <PostForm initialData={post} />
        </div>
    );
}
