"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Building2, Handshake, Plus, Trash2, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    createCRMContact,
    createCRMDeal,
    deleteCRMContact,
    deleteCRMDeal,
    updateCRMContactStatus,
    updateCRMDealStage,
} from "@/actions/crm";

type ContactRow = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    jobTitle: string;
    status: string;
    source: string;
    createdAt: Date;
};

type DealRow = {
    id: string;
    title: string;
    stage: string;
    value: number;
    currency: string;
    expectedClose: Date | null;
    createdAt: Date;
    contact: null | { id: string; firstName: string; lastName: string; email: string };
};

export function CRMWorkspace({
    contacts,
    deals,
}: {
    contacts: ContactRow[];
    deals: DealRow[];
}) {
    const [contactForm, setContactForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        jobTitle: "",
        status: "lead",
        source: "manual",
        notes: "",
    });
    const [dealForm, setDealForm] = useState({
        title: "",
        contactId: "none",
        stage: "lead",
        value: "",
        currency: "USD",
        expectedClose: "",
        description: "",
    });
    const [busyId, setBusyId] = useState<string | null>(null);
    const [isSavingContact, setIsSavingContact] = useState(false);
    const [isSavingDeal, setIsSavingDeal] = useState(false);

    const totalPipeline = deals
        .filter((d) => d.stage !== "lost")
        .reduce((sum, d) => sum + Number(d.value || 0), 0);
    const wonDeals = deals.filter((d) => d.stage === "won");

    async function handleCreateContact() {
        setIsSavingContact(true);
        try {
            const res = await createCRMContact(contactForm);
            if (!res.success) {
                toast.error(res.error || "Failed to create contact");
                return;
            }
            toast.success("Contact created");
            setContactForm({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                company: "",
                jobTitle: "",
                status: "lead",
                source: "manual",
                notes: "",
            });
        } finally {
            setIsSavingContact(false);
        }
    }

    async function handleCreateDeal() {
        setIsSavingDeal(true);
        try {
            const res = await createCRMDeal({
                ...dealForm,
                contactId: dealForm.contactId === "none" ? undefined : dealForm.contactId,
                value: Number(dealForm.value || 0),
            });
            if (!res.success) {
                toast.error(res.error || "Failed to create deal");
                return;
            }
            toast.success("Deal created");
            setDealForm({
                title: "",
                contactId: "none",
                stage: "lead",
                value: "",
                currency: "USD",
                expectedClose: "",
                description: "",
            });
        } finally {
            setIsSavingDeal(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" /> Contacts
                    </div>
                    <p className="mt-2 text-2xl font-semibold">{contacts.length}</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Handshake className="h-4 w-4" /> Open Deals
                    </div>
                    <p className="mt-2 text-2xl font-semibold">
                        {deals.filter((d) => !["won", "lost"].includes(d.stage)).length}
                    </p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" /> Pipeline Value
                    </div>
                    <p className="mt-2 text-2xl font-semibold">
                        ${totalPipeline.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Won deals: {wonDeals.length}
                    </p>
                </div>
            </div>

            <Tabs defaultValue="contacts" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="contacts">Contacts</TabsTrigger>
                    <TabsTrigger value="deals">Deals</TabsTrigger>
                </TabsList>

                <TabsContent value="contacts" className="space-y-4">
                    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                        <div className="space-y-3 rounded-lg border bg-card p-4">
                            <h3 className="font-medium">Add Contact</h3>
                            <Input placeholder="First name" value={contactForm.firstName} onChange={(e) => setContactForm((s) => ({ ...s, firstName: e.target.value }))} />
                            <Input placeholder="Last name" value={contactForm.lastName} onChange={(e) => setContactForm((s) => ({ ...s, lastName: e.target.value }))} />
                            <Input placeholder="Email" type="email" value={contactForm.email} onChange={(e) => setContactForm((s) => ({ ...s, email: e.target.value }))} />
                            <Input placeholder="Phone" value={contactForm.phone} onChange={(e) => setContactForm((s) => ({ ...s, phone: e.target.value }))} />
                            <Input placeholder="Company" value={contactForm.company} onChange={(e) => setContactForm((s) => ({ ...s, company: e.target.value }))} />
                            <Input placeholder="Job title" value={contactForm.jobTitle} onChange={(e) => setContactForm((s) => ({ ...s, jobTitle: e.target.value }))} />
                            <div className="grid grid-cols-2 gap-2">
                                <Select value={contactForm.status} onValueChange={(v) => setContactForm((s) => ({ ...s, status: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lead">Lead</SelectItem>
                                        <SelectItem value="qualified">Qualified</SelectItem>
                                        <SelectItem value="customer">Customer</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input placeholder="Source" value={contactForm.source} onChange={(e) => setContactForm((s) => ({ ...s, source: e.target.value }))} />
                            </div>
                            <Textarea placeholder="Notes" value={contactForm.notes} onChange={(e) => setContactForm((s) => ({ ...s, notes: e.target.value }))} />
                            <Button
                                onClick={handleCreateContact}
                                disabled={isSavingContact || !contactForm.firstName || !contactForm.email}
                                className="w-full"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Contact
                            </Button>
                        </div>

                        <div className="rounded-lg border bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Company</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contacts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                                No contacts yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : contacts.map((contact) => (
                                        <TableRow key={contact.id}>
                                            <TableCell className="font-medium">
                                                {[contact.firstName, contact.lastName].filter(Boolean).join(" ")}
                                                {contact.jobTitle && <p className="text-xs text-muted-foreground">{contact.jobTitle}</p>}
                                            </TableCell>
                                            <TableCell>{contact.email}</TableCell>
                                            <TableCell>{contact.company || "-"}</TableCell>
                                            <TableCell>
                                                <Select
                                                    value={contact.status}
                                                    onValueChange={async (value) => {
                                                        setBusyId(contact.id);
                                                        const res = await updateCRMContactStatus(contact.id, value);
                                                        setBusyId(null);
                                                        res.success ? toast.success("Status updated") : toast.error(res.error || "Failed");
                                                    }}
                                                >
                                                    <SelectTrigger className="h-8 w-[140px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="lead">Lead</SelectItem>
                                                        <SelectItem value="qualified">Qualified</SelectItem>
                                                        <SelectItem value="customer">Customer</SelectItem>
                                                        <SelectItem value="inactive">Inactive</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell><Badge variant="outline">{contact.source}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-600"
                                                    disabled={busyId === contact.id}
                                                    onClick={async () => {
                                                        if (!confirm(`Delete contact ${contact.email}?`)) return;
                                                        setBusyId(contact.id);
                                                        const res = await deleteCRMContact(contact.id);
                                                        setBusyId(null);
                                                        res.success ? toast.success("Contact deleted") : toast.error(res.error || "Failed");
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="deals" className="space-y-4">
                    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                        <div className="space-y-3 rounded-lg border bg-card p-4">
                            <h3 className="font-medium">Add Deal</h3>
                            <Input placeholder="Deal title" value={dealForm.title} onChange={(e) => setDealForm((s) => ({ ...s, title: e.target.value }))} />
                            <Select value={dealForm.contactId} onValueChange={(v) => setDealForm((s) => ({ ...s, contactId: v }))}>
                                <SelectTrigger><SelectValue placeholder="Link contact" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No contact</SelectItem>
                                    {contacts.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {[c.firstName, c.lastName].filter(Boolean).join(" ")} ({c.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="grid grid-cols-2 gap-2">
                                <Select value={dealForm.stage} onValueChange={(v) => setDealForm((s) => ({ ...s, stage: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lead">Lead</SelectItem>
                                        <SelectItem value="qualified">Qualified</SelectItem>
                                        <SelectItem value="proposal">Proposal</SelectItem>
                                        <SelectItem value="negotiation">Negotiation</SelectItem>
                                        <SelectItem value="won">Won</SelectItem>
                                        <SelectItem value="lost">Lost</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input placeholder="USD" value={dealForm.currency} onChange={(e) => setDealForm((s) => ({ ...s, currency: e.target.value.toUpperCase() }))} />
                            </div>
                            <Input placeholder="Value" type="number" value={dealForm.value} onChange={(e) => setDealForm((s) => ({ ...s, value: e.target.value }))} />
                            <Input type="date" value={dealForm.expectedClose} onChange={(e) => setDealForm((s) => ({ ...s, expectedClose: e.target.value }))} />
                            <Textarea placeholder="Description" value={dealForm.description} onChange={(e) => setDealForm((s) => ({ ...s, description: e.target.value }))} />
                            <Button onClick={handleCreateDeal} disabled={isSavingDeal || !dealForm.title} className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Deal
                            </Button>
                        </div>

                        <div className="rounded-lg border bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Deal</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Stage</TableHead>
                                        <TableHead>Value</TableHead>
                                        <TableHead>Expected Close</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {deals.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                                No deals yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : deals.map((deal) => (
                                        <TableRow key={deal.id}>
                                            <TableCell className="font-medium">{deal.title}</TableCell>
                                            <TableCell>{deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}`.trim() || deal.contact.email : "-"}</TableCell>
                                            <TableCell>
                                                <Select
                                                    value={deal.stage}
                                                    onValueChange={async (value) => {
                                                        setBusyId(deal.id);
                                                        const res = await updateCRMDealStage(deal.id, value);
                                                        setBusyId(null);
                                                        res.success ? toast.success("Stage updated") : toast.error(res.error || "Failed");
                                                    }}
                                                >
                                                    <SelectTrigger className="h-8 w-[150px]"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="lead">Lead</SelectItem>
                                                        <SelectItem value="qualified">Qualified</SelectItem>
                                                        <SelectItem value="proposal">Proposal</SelectItem>
                                                        <SelectItem value="negotiation">Negotiation</SelectItem>
                                                        <SelectItem value="won">Won</SelectItem>
                                                        <SelectItem value="lost">Lost</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>{deal.currency} {deal.value.toLocaleString()}</TableCell>
                                            <TableCell>{deal.expectedClose ? new Date(deal.expectedClose).toLocaleDateString() : "-"}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-600"
                                                    disabled={busyId === deal.id}
                                                    onClick={async () => {
                                                        if (!confirm(`Delete deal "${deal.title}"?`)) return;
                                                        setBusyId(deal.id);
                                                        const res = await deleteCRMDeal(deal.id);
                                                        setBusyId(null);
                                                        res.success ? toast.success("Deal deleted") : toast.error(res.error || "Failed");
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
