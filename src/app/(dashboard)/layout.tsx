import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

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
        <div className="min-h-screen bg-muted/40">
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-muted/40 p-4 md:p-8">
                {children}
            </main>
        </div>
    );
}
