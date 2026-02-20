import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-background">
            <div className="hidden md:flex h-full border-r">
                <Sidebar />
            </div>

            <div className="flex w-0 flex-1 flex-col overflow-hidden">
                <Topbar session={session} />

                <main className="flex-1 relative overflow-y-auto focus:outline-none bg-slate-50/50 dark:bg-transparent">
                    <div className="px-4 py-6 md:px-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
