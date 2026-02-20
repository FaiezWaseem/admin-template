"use client";

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
    Menu,
    X,
    FileImage
} from "lucide-react";
import { motion } from "framer-motion";

const routes = [
    {
        label: "Overview",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Users & Roles",
        icon: Users,
        href: "/dashboard/users",
        color: "text-violet-500",
    },
    {
        label: "Permissions",
        icon: ShieldCheck,
        href: "/dashboard/permissions",
        color: "text-pink-700",
    },
    {
        label: "Sessions",
        icon: ShieldCheck,
        href: "/dashboard/sessions",
        color: "text-indigo-500",
    },
    {
        label: "Activity Logs",
        icon: Activity,
        href: "/dashboard/logs",
        color: "text-orange-700",
    },
    {
        label: "Events & Routing",
        icon: Activity,
        href: "/dashboard/events",
        color: "text-amber-500",
    },
    {
        label: "Email Templates",
        icon: Mail,
        href: "/dashboard/emails",
        color: "text-emerald-500",
    },
    {
        label: "Media Manager",
        icon: FileImage,
        href: "/dashboard/media",
        color: "text-emerald-500",
    },
    {
        label: "Pages & Content",
        icon: FileText,
        href: "/dashboard/pages",
        color: "text-purple-600",
    },
    {
        label: "Email Gateway",
        icon: Mail,
        href: "/dashboard/email",
        color: "text-blue-500",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
        color: "text-slate-400",
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 border-r border-slate-800 text-white w-64 shadow-xl">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4 bg-white rounded-md flex items-center justify-center font-bold text-slate-900">
                        A
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        Admin
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-white/10 rounded-lg transition-all",
                                pathname === route.href || pathname.startsWith(route.href + '/') && route.href !== '/dashboard'
                                    ? "bg-white/10 text-white"
                                    : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                            {pathname === route.href && (
                                <motion.div
                                    layoutId="sidebar-active-indicator"
                                    className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-auto"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
