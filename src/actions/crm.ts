"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type CRMContactInput = {
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    company?: string;
    jobTitle?: string;
    status?: string;
    source?: string;
    notes?: string;
};

export type CRMDealInput = {
    title: string;
    contactId?: string;
    stage?: string;
    value?: number;
    currency?: string;
    expectedClose?: string;
    description?: string;
};

export async function createCRMContact(data: CRMContactInput) {
    try {
        await prisma.cRMContact.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName || "",
                email: data.email,
                phone: data.phone || "",
                company: data.company || "",
                jobTitle: data.jobTitle || "",
                status: data.status || "lead",
                source: data.source || "manual",
                notes: data.notes || "",
            },
        });
        revalidatePath("/dashboard/crm");
        return { success: true };
    } catch (error: any) {
        if (error?.code === "P2002") {
            return { success: false, error: "A contact with this email already exists." };
        }
        return { success: false, error: "Failed to create contact." };
    }
}

export async function updateCRMContactStatus(contactId: string, status: string) {
    try {
        await prisma.cRMContact.update({
            where: { id: contactId },
            data: { status },
        });
        revalidatePath("/dashboard/crm");
        return { success: true };
    } catch {
        return { success: false, error: "Failed to update contact status." };
    }
}

export async function deleteCRMContact(contactId: string) {
    try {
        await prisma.cRMContact.delete({
            where: { id: contactId },
        });
        revalidatePath("/dashboard/crm");
        return { success: true };
    } catch {
        return { success: false, error: "Failed to delete contact." };
    }
}

export async function createCRMDeal(data: CRMDealInput) {
    try {
        await prisma.cRMDeal.create({
            data: {
                title: data.title,
                contactId: data.contactId || null,
                stage: data.stage || "lead",
                value: Number.isFinite(data.value) ? Number(data.value) : 0,
                currency: data.currency || "USD",
                expectedClose: data.expectedClose ? new Date(data.expectedClose) : null,
                description: data.description || "",
            },
        });
        revalidatePath("/dashboard/crm");
        return { success: true };
    } catch {
        return { success: false, error: "Failed to create deal." };
    }
}

export async function updateCRMDealStage(dealId: string, stage: string) {
    try {
        await prisma.cRMDeal.update({
            where: { id: dealId },
            data: { stage },
        });
        revalidatePath("/dashboard/crm");
        return { success: true };
    } catch {
        return { success: false, error: "Failed to update deal stage." };
    }
}

export async function deleteCRMDeal(dealId: string) {
    try {
        await prisma.cRMDeal.delete({
            where: { id: dealId },
        });
        revalidatePath("/dashboard/crm");
        return { success: true };
    } catch {
        return { success: false, error: "Failed to delete deal." };
    }
}
