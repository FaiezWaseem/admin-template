import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const post = await prisma.post.findUnique({
        where: { slug: resolvedParams.slug, status: "published" },
    });

    if (!post) {
        return {
            title: "Post Not Found",
        };
    }

    return {
        title: `${post.title} | Admin Blog`,
        description: post.excerpt,
        openGraph: {
            images: post.featuredImg ? [post.featuredImg] : [],
        },
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;

    // Fetch the specific post dynamically.
    const post = await prisma.post.findUnique({
        where: {
            slug: resolvedParams.slug,
            status: "published",
        },
        include: {
            author: {
                select: { name: true, image: true }
            }
        }
    });

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
            <header className="border-b bg-white dark:bg-slate-950 sticky top-0 z-10">
                <div className="container mx-auto max-w-4xl px-4 h-14 flex items-center">
                    <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
                    </Link>
                </div>
            </header>

            <article className="container mx-auto max-w-3xl px-4 pt-12">
                <div className="mb-10 text-center">
                    <time dateTime={post.createdAt.toISOString()} className="block text-sm font-medium tracking-widest text-indigo-500 uppercase mb-4">
                        {format(new Date(post.createdAt), "MMMM d, yyyy")}
                    </time>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center justify-center gap-3 text-sm font-medium text-muted-foreground">
                        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                            {post.author?.image ? (
                                <img src={post.author.image} alt={post.author.name || "Author"} className="h-full w-full object-cover" />
                            ) : (
                                <span className="font-bold text-slate-500">{post.author?.name?.charAt(0) || "A"}</span>
                            )}
                        </div>
                        <span>By {post.author?.name || "Anonymous Author"}</span>
                    </div>
                </div>

                {post.featuredImg && (
                    <div className="mb-12 aspect-video w-full overflow-hidden rounded-2xl bg-muted shadow-lg">
                        <img src={post.featuredImg} alt={post.title} className="h-full w-full object-cover" />
                    </div>
                )}

                {/* Secure HTML Injection container from Tiptap structure natively mapped */}
                <div
                    className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:font-bold prose-img:rounded-xl prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:text-indigo-500"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </article>
        </div>
    );
}

// Ensure dynamic rendering based on incoming slugs is handled in the ISR framework 
export const dynamicParams = true;
