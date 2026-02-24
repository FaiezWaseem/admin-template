"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Save, Loader2, User, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/actions/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MediaPicker, type MediaPickerItem } from "@/components/media/media-picker";

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Invalid email address."),
    image: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional().refine((val) => !val || val.length >= 8, {
        message: "Password must be at least 8 characters if provided."
    }),
    confirmPassword: z.string().optional()
}).refine((data) => {
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "New passwords don't match.",
    path: ["confirmPassword"]
}).refine((data) => {
    if (data.newPassword && !data.currentPassword) {
        return false;
    }
    return true;
}, {
    message: "Current password is required to set a new password.",
    path: ["currentPassword"]
});

type ProfileValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
    user: {
        name: string | null;
        email: string | null;
        image: string | null;
        provider?: string; // e.g. "credentials" vs "github"
    };
    mediaItems: MediaPickerItem[];
}

export function ProfileForm({ user, mediaItems }: ProfileFormProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user.name || "",
            email: user.email || "",
            image: user.image || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const isOAuth = user.provider !== "credentials" && user.provider !== undefined;
    const currentImage = form.watch("image") || user.image || "";

    async function onSubmit(data: ProfileValues) {
        setIsSaving(true);
        try {
            const res = await updateProfile({
                name: data.name,
                email: data.email,
                image: data.image,
                password: data.newPassword,
                currentPassword: data.currentPassword,
            });

            if (res.success) {
                toast.success("Profile updated successfully.");
                // Clear password fields on success
                form.setValue("currentPassword", "");
                form.setValue("newPassword", "");
                form.setValue("confirmPassword", "");
                router.refresh(); // Reload to refresh server-side UI elements like user nav
            } else {
                toast.error(res.error);
            }
        } catch {
            toast.error("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    }

    const initials = user.name ? user.name.split(" ").map(n => n[0]).join("") : "U";

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">

                {/* Personal Information Card */}
                <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                    <div className="border-b bg-muted/30 px-6 py-4 flex items-center gap-2">
                        <User className="h-5 w-5 text-indigo-500" />
                        <h3 className="font-semibold text-lg">Personal Information</h3>
                    </div>
                    <div className="p-6 space-y-6">

                        <div className="flex items-center gap-6 mb-8">
                            <Avatar className="h-20 w-20 border">
                                <AvatarImage src={currentImage} />
                                <AvatarFallback className="text-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-3">
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Avatar Image URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://example.com/avatar.png" {...field} />
                                            </FormControl>
                                            <FormDescription>Paste a URL or choose from Media Library.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <MediaPicker
                                    items={mediaItems}
                                    value={currentImage}
                                    onSelect={(url) => form.setValue("image", url, { shouldDirty: true, shouldValidate: true })}
                                    onClear={() => form.setValue("image", "", { shouldDirty: true, shouldValidate: true })}
                                    title="Select Profile Image"
                                    description="Choose an image from your uploaded media assets for your profile avatar."
                                    triggerLabel="Choose Avatar"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="john@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Password Change Card */}
                {!isOAuth && (
                    <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                        <div className="border-b bg-muted/30 px-6 py-4 flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-rose-500" />
                            <h3 className="font-semibold text-lg">Change Password</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <p className="text-sm text-muted-foreground mb-4">Leave these fields blank if you do not wish to change your password.</p>

                            <FormField
                                control={form.control}
                                name="currentPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm New Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {isOAuth && (
                    <p className="text-sm text-muted-foreground italic">
                        Your account is linked to an external provider ({user.provider}). Password changes are disabled.
                    </p>
                )}

                <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Profile Changes
                </Button>
            </form>
        </Form>
    );
}
