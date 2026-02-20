import { PageForm } from "@/components/pages/page-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Page | Admin Dashboard",
    description: "Create a new CMS page using the dynamic block builder.",
};

export default function NewPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Page</h1>
                    <p className="text-muted-foreground text-sm">
                        Draft a new page with modular structural blocks.
                    </p>
                </div>
            </div>

            <PageForm />
        </div>
    );
}
