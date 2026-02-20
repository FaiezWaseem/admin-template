"use client";

import { usePathname } from "next/navigation";
import { UserNav } from "./user-nav";
import { Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Session } from "next-auth";

interface TopbarProps {
    session: Session | null;
}

export function Topbar({ session }: TopbarProps) {
    const pathname = usePathname();

    // Simple Breadcrumb logic from pathname
    const segments = pathname.split("/").filter(Boolean);
    const currentPath = segments.length > 1
        ? segments[segments.length - 1].charAt(0).toUpperCase() + segments[segments.length - 1].slice(1)
        : "Overview";

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4 md:hidden">
                <Button variant="ghost" size="icon" className="shrink-0 md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </div>

            <div className="flex-1 flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight hidden md:flex">
                    {currentPath}
                </h2>

                <div className="flex items-center space-x-4 ml-auto">
                    {/* Global Search - Visual Only for now */}
                    <div className="relative hidden md:flex w-full max-w-sm items-center">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="w-full rounded-lg bg-background pl-8 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-sm md:w-[200px] lg:w-[300px]"
                        />
                    </div>

                    <UserNav session={session} />
                </div>
            </div>
        </header>
    );
}
