import { prisma } from "@/lib/prisma";
import { PermissionsMatrix } from "@/components/permissions/permissions-matrix";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Roles & Permissions | Admin Dashboard",
    description: "View and manage system roles and resource permissions.",
};

export default async function PermissionsPage() {
    const roles = await prisma.role.findMany({
        orderBy: { name: "asc" },
        include: {
            permissions: {
                include: {
                    permission: true,
                },
            },
        },
    });

    const permissions = await prisma.permission.findMany();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Permissions Matrix</h1>
                    <p className="text-muted-foreground text-sm">
                        Overview of access control levels across different system roles.
                    </p>
                </div>
            </div>

            <PermissionsMatrix roles={roles} permissions={permissions} />
        </div>
    );
}
