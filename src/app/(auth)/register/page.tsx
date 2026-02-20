import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Register",
    description: "Create a new account",
};

export default function RegisterPage() {
    return (
        <>
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Create an account
                </h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email below to create your account
                </p>
            </div>

            <div className="grid gap-6">
                <p className="text-sm text-center text-muted-foreground border border-dashed rounded-lg p-4">
                    Registration is temporarily disabled. Please contact your administrator.
                </p>
            </div>

            <p className="px-8 text-center text-sm text-muted-foreground">
                <Link
                    href="/login"
                    className="hover:text-brand underline underline-offset-4"
                >
                    Already have an account? Sign In
                </Link>
            </p>
        </>
    );
}
