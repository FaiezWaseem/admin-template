import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const page = await prisma.page.findUnique({
        where: { slug },
    });

    if (!page || page.status !== "published") {
        return { title: "Page Not Found" };
    }

    return {
        title: page.title,
        description: page.excerpt,
    };
}

export default async function DynamicSlugPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Exclude dashboard, api, and other core routes
    if (slug === "dashboard" || slug === "login" || slug === "register") {
        notFound();
    }

    const page = await prisma.page.findUnique({
        where: { slug },
    });

    if (!page || page.status !== "published") {
        notFound();
    }

    let blocks = [];
    try {
        blocks = JSON.parse(page.content);
    } catch {
        blocks = [];
    }

    return (
        <div className={`min-h-screen ${page.template === 'full-width' ? 'w-full' : 'container mx-auto max-w-4xl py-12 px-4'}`}>
            <main className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {blocks.map((block: any) => {
                    switch (block.type) {
                        case "h1":
                            return <h1 key={block.id} className="text-4xl font-extrabold tracking-tight lg:text-5xl">{block.content}</h1>;
                        case "h2":
                            return <h2 key={block.id} className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">{block.content}</h2>;
                        case "p":
                            return <p key={block.id} className="leading-7 [&:not(:first-child)]:mt-6">{block.content}</p>;
                        case "image":
                            return (
                                <div key={block.id} className="my-8 rounded-xl overflow-hidden shadow-lg border">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={block.content} alt="Dynamic Block" className="w-full h-auto object-cover" />
                                </div>
                            );
                        default:
                            return null;
                    }
                })}

                {blocks.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        This page has no content.
                    </div>
                )}

            </main>
        </div>
    );
}
