import { PostForm } from "@/components/posts/post-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Write Post | Admin Dashboard",
    description: "Draft a new blog post using the block builder.",
};

export default function NewPost() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Write Post</h1>
                    <p className="text-muted-foreground text-sm">
                        Draft a new blog article with modular structural blocks.
                    </p>
                </div>
            </div>

            <PostForm />
        </div>
    );
}
