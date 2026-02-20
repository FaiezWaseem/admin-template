import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/users/profile-form";
import { UserCircle } from "lucide-react";

export const metadata = {
    title: "Profile Settings | Admin Dashboard",
    description: "Manage your account settings and preferences.",
};

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    // Fetch fresh user data from DB to ensure accuracy
    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            accounts: true,
        }
    });

    if (!dbUser) {
        redirect("/login");
    }

    // Check if user authenticates via credentials or OAuth
    const provider = dbUser.accounts.length > 0 ? dbUser.accounts[0].provider : "credentials";

    const userData = {
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
        provider: provider,
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <UserCircle className="h-8 w-8 text-indigo-500" />
                    Profile Settings
                </h1>
                <p className="text-muted-foreground">
                    Manage your personal account details, avatar, and password.
                </p>
            </div>

            <ProfileForm user={userData} />
        </div>
    );
}
