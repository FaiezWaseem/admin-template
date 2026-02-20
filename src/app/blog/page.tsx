import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Blog Engine Demo | Admin Dashboard",
    description: "Read the latest updates and articles from the team.",
};

export default async function BlogIndex() {
    const posts = await prisma.post.findMany({
        where: { status: "published" },
        orderBy: { createdAt: "desc" },
        include: {
            author: {
                select: { name: true, image: true }
            }
        }
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Simple Public Header */}
            <header className="border-b bg-white dark:bg-slate-950">
                <div className="container mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="font-bold tracking-tight text-xl flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-indigo-500" />
                        Admin Blog
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                            Dashboard
                        </Link>
                        <Button asChild size="sm">
                            <Link href="/login">Sign In</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-5xl px-4 py-12">
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3">Latest Updates</h1>
                    <p className="text-lg text-muted-foreground">Discover articles, tutorials, and engineering deep dives.</p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <div key={post.id} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white dark:bg-slate-950 p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                            <div>
                                {post.featuredImg && (
                                    <div className="mb-4 aspect-video overflow-hidden rounded-xl bg-muted">
                                        <img src={post.featuredImg} alt={post.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                    </div>
                                )}
                                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                                    <time dateTime={post.createdAt.toISOString()}>{format(new Date(post.createdAt), "MMMM d, yyyy")}</time>
                                    <span>•</span>
                                    <span>{post.author?.name || "Anonymous"}</span>
                                </div>
                                <h3 className="mb-2 text-xl font-bold leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    <Link href={`/blog/${post.slug}`}>
                                        <span className="absolute inset-0" />
                                        {post.title}
                                    </Link>
                                </h3>
                                {post.excerpt && (
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                )}
                            </div>
                            <div className="mt-6 flex items-center font-medium text-indigo-600 dark:text-indigo-400 text-sm">
                                Read Article <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    ))}

                    {posts.length === 0 && (
                        <div className="col-span-full py-24 text-center border-2 border-dashed rounded-2xl">
                            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-foreground">No posts found</h3>
                            <p className="text-muted-foreground mt-1 text-sm">Authors haven't publicly published any articles yet.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
