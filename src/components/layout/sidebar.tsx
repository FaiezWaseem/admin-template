"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Settings,
    ShieldCheck,
    Activity,
    LogOut,
    Mail,
    FileText,
    BriefcaseBusiness,
    Menu,
    X,
    FileImage,
    ChevronDown,
    ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type RouteDef = {
    label: string;
    icon: any;
    href?: string;
    color: string;
    children?: { label: string; href: string }[];
};

const routes: RouteDef[] = [
    {
        label: "Overview",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "User Management",
        icon: Users,
        color: "text-violet-500",
        children: [
            { label: "Users", href: "/dashboard/users" },
            { label: "Roles & Permissions", href: "/dashboard/permissions" },
        ]
    },
    {
        label: "Content",
        icon: FileText,
        color: "text-purple-600",
        children: [
            { label: "Pages", href: "/dashboard/pages" },
            { label: "Add New Page", href: "/dashboard/pages/new" },
            { label: "Blog Posts", href: "/dashboard/posts" },
            { label: "Write Post", href: "/dashboard/posts/new" },
        ]
    },
    {
        label: "Media Manager",
        icon: FileImage,
        href: "/dashboard/media",
        color: "text-emerald-500",
    },
    {
        label: "CRM",
        icon: BriefcaseBusiness,
        href: "/dashboard/crm",
        color: "text-orange-500",
    },
    {
        label: "Settings",
        icon: Settings,
        color: "text-slate-400",
        children: [
            { label: "General Settings", href: "/dashboard/settings" },
            { label: "Theme", href: "/dashboard/settings#theme" },
            { label: "Email Gateway", href: "/dashboard/email" },
            { label: "Sessions", href: "/dashboard/sessions" },
            { label: "Activity Logs", href: "/dashboard/logs" }
        ]
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    // Auto-open groups that contain the active path
    useEffect(() => {
        const defaultOpen: Record<string, boolean> = {};
        routes.forEach(route => {
            if (route.children) {
                const isActive = route.children.some(child => pathname === child.href || pathname.startsWith(child.href + '/'));
                if (isActive) {
                    defaultOpen[route.label] = true;
                }
            }
        });
        setOpenMenus(prev => ({ ...prev, ...defaultOpen }));
    }, [pathname]);

    const toggleMenu = (label: string) => {
        setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    return (
        <div className="space-y-4 py-4 flex h-full w-64 flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative mr-4 flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary font-bold text-sidebar-primary-foreground">
                        A
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-sidebar-foreground">
                        Admin
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => {
                        if (route.children) {
                            return (
                                <Collapsible
                                    key={route.label}
                                    open={openMenus[route.label]}
                                    onOpenChange={() => toggleMenu(route.label)}
                                >
                                    <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between rounded-lg p-3 text-sm font-medium text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                                        <div className="flex items-center">
                                            <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                            {route.label}
                                        </div>
                                        {openMenus[route.label] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="pl-10 space-y-1 mt-1">
                                        {route.children.map(child => {
                                            const isActive = pathname === child.href || (pathname.startsWith(child.href + '/') && child.href !== '/dashboard');
                                            return (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    className={cn(
                                                        "text-sm group flex p-2 w-full justify-start font-medium cursor-pointer hover:bg-white/10 rounded-lg transition-all",
                                                        isActive
                                                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                                    )}
                                                >
                                                    {child.label}
                                                    {isActive && (
                                                        <motion.div
                                                            layoutId="sidebar-active-indicator"
                                                            className="my-auto ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                        />
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </CollapsibleContent>
                                </Collapsible>
                            );
                        }

                        const isActive = pathname === route.href || (pathname.startsWith(route.href + '/') && route.href !== '/dashboard');

                        return (
                            <Link
                                key={route.label || route.href}
                                href={route.href!}
                                className={cn(
                                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-white/10 rounded-lg transition-all",
                                    isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                )}
                            >
                                <div className="flex items-center flex-1">
                                    <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                    {route.label}
                                </div>
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active-indicator"
                                        className="my-auto ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
