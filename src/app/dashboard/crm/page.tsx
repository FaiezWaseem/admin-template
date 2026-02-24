import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CRMWorkspace } from "@/components/crm/crm-workspace";

export const metadata: Metadata = {
    title: "CRM | Admin Dashboard",
    description: "Manage contacts and deals with a lightweight CRM workspace.",
};

export default async function CRMPage() {
    const prismaAny = prisma as any;

    if (!prismaAny.cRMContact || !prismaAny.cRMDeal) {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">CRM</h1>
                    <p className="text-sm text-muted-foreground">
                        Prisma Client is out of date for the new CRM models.
                    </p>
                </div>
                <div className="rounded-lg border bg-card p-6">
                    <p className="text-sm">
                        Run the following commands, then reload this page:
                    </p>
                    <pre className="mt-3 rounded-md bg-muted p-3 text-xs overflow-auto">
{`npx prisma migrate dev --name add-crm-module
npx prisma generate`}
                    </pre>
                </div>
            </div>
        );
    }

    const [contacts, deals] = await Promise.all([
        prismaAny.cRMContact.findMany({
            orderBy: { createdAt: "desc" },
        }),
        prismaAny.cRMDeal.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                contact: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        }),
    ]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">CRM</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage leads, contacts, and pipeline deals from one workspace.
                    </p>
                </div>
            </div>

            <CRMWorkspace contacts={contacts} deals={deals} />
        </div>
    );
}
