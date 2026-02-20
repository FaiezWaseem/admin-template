"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const userAuthSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

type FormData = z.infer<typeof userAuthSchema>;

export function UserAuthForm() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(userAuthSchema),
    });

    async function onSubmit(data: FormData) {
        try {
            const signInResult = await signIn("credentials", {
                email: data.email.toLowerCase(),
                password: data.password,
                redirect: false,
            });

            if (!signInResult?.ok) {
                return toast.error("Invalid credentials.");
            }

            toast.success("Successfully logged in.");

            // Force refresh to update session data in UI correctly
            router.push("/dashboard");
            router.refresh();

        } catch (error) {
            toast.error("Something went wrong.");
        }
    }

    return (
        <div className={cn("grid gap-6")}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="email">
                            Email
                        </Label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isSubmitting}
                            {...register("email")}
                        />
                        {errors?.email && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="password">
                            Password
                        </Label>
                        <Input
                            id="password"
                            placeholder="Password"
                            type="password"
                            autoComplete="current-password"
                            disabled={isSubmitting}
                            {...register("password")}
                        />
                        {errors?.password && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.password.message}
                            </p>
                        )}
                    </div>
                    <button
                        className={cn(buttonVariants())}
                        disabled={isSubmitting}
                    >
                        {isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Sign In with Email
                    </button>
                </div>
            </form>
        </div>
    );
}
