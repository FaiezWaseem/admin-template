import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OverviewCharts } from "@/components/dashboard/overview-charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, FileText, Image as ImageIcon, Key, PlusCircle, Settings, FileUp } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function DashboardPage() {
    const session = await auth();

    // Fetch aggregate stats
    const [userCount, pageCount, mediaCount, sessionCount, recentActivity] = await Promise.all([
        prisma.user.count({ where: { status: "active" } }),
        prisma.page.count({ where: { status: "published" } }),
        prisma.media.count(),
        prisma.session.count({ where: { revoked: false } }),
        prisma.activityLog.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { name: true, email: true } } }
        })
    ]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Welcome back, {session?.user?.name || "User"}. Here is what's happening today.
                    </p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Users className="h-4 w-4 text-violet-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userCount}</div>
                        <p className="text-xs text-muted-foreground">Total registered platform accounts</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Published Pages</CardTitle>
                        <FileText className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pageCount}</div>
                        <p className="text-xs text-muted-foreground">Live content pages and posts</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Media Assets</CardTitle>
                        <ImageIcon className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mediaCount}</div>
                        <p className="text-xs text-muted-foreground">Uploaded files in library</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                        <Key className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sessionCount}</div>
                        <p className="text-xs text-muted-foreground">Currently authenticated clients</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Chart Area */}
                <Card className="col-span-4 lg:col-span-4 flex flex-col">
                    <CardHeader>
                        <CardTitle>Platform Traffic</CardTitle>
                        <CardDescription>
                            Unique visitors over the last 7 days.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pl-2">
                        <OverviewCharts />
                    </CardContent>
                </Card>

                {/* Info Column */}
                <div className="col-span-3 flex flex-col gap-4">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Direct jumps to common tasks.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-2">
                            <Link href="/dashboard/users" className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors text-sm">
                                <PlusCircle className="h-4 w-4 text-violet-500" />
                                <span>Add User</span>
                            </Link>
                            <Link href="/dashboard/pages/new" className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors text-sm">
                                <FileText className="h-4 w-4 text-emerald-500" />
                                <span>Write Page</span>
                            </Link>
                            <Link href="/dashboard/media" className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors text-sm">
                                <FileUp className="h-4 w-4 text-indigo-500" />
                                <span>Upload Media</span>
                            </Link>
                            <Link href="/dashboard/settings" className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors text-sm">
                                <Settings className="h-4 w-4 text-slate-500" />
                                <span>Preferences</span>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="flex-1">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Latest events from across the system.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((log) => (
                                        <div key={log.id} className="flex items-start gap-3">
                                            <div className="mt-0.5 rounded-full bg-slate-100 dark:bg-slate-800 p-1.5 flex shrink-0 items-center justify-center">
                                                <Activity className="h-3 w-3 text-slate-500" />
                                            </div>
                                            <div className="grid gap-1 flex-1">
                                                <div className="text-sm font-medium leading-none flex gap-2 justify-between">
                                                    <span className="truncate max-w-[12rem]">{log.user.name || log.user.email}</span>
                                                    <span className="text-xs text-muted-foreground shrink-0">
                                                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {log.action.replace(/_/g, " ")} {log.resource ? `on ${log.resource}` : ""}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-muted-foreground text-center py-4">No recent activity detected.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
