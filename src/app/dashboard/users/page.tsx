import { prisma } from "@/lib/prisma";
import { UsersTable } from "@/components/users/users-table";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Users Management | Admin Dashboard",
    description: "Manage users, assign roles, and set access levels.",
};

export default async function UsersPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            role: {
                select: { id: true, name: true },
            },
        },
    });

    const roles = await prisma.role.findMany({
        orderBy: { name: "asc" },
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground text-sm">
                        Manage your team members and their account permissions here.
                    </p>
                </div>
            </div>

            <UsersTable users={users} roles={roles} />
        </div>
    );
}
