import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({});

async function main() {
    console.log("🌱 Seeding database...");

    // ─── Permissions ────────────────────────────────────
    const resources = [
        "users",
        "roles",
        "sessions",
        "settings",
        "pages",
        "seo",
        "media",
        "events",
        "email",
    ];
    const actions = ["create", "read", "update", "delete"];

    const permissions = [];
    for (const resource of resources) {
        for (const action of actions) {
            const perm = await prisma.permission.upsert({
                where: { resource_action: { resource, action } },
                update: {},
                create: {
                    name: `${resource}:${action}`,
                    resource,
                    action,
                },
            });
            permissions.push(perm);
        }
    }
    console.log(`  ✅ Created ${permissions.length} permissions`);

    // ─── Roles ──────────────────────────────────────────
    const adminRole = await prisma.role.upsert({
        where: { name: "Admin" },
        update: {},
        create: {
            name: "Admin",
            description: "Full system access — can manage all resources and settings",
        },
    });

    const editorRole = await prisma.role.upsert({
        where: { name: "Editor" },
        update: {},
        create: {
            name: "Editor",
            description: "Can manage content, media, pages, and SEO",
        },
    });

    const viewerRole = await prisma.role.upsert({
        where: { name: "Viewer" },
        update: {},
        create: {
            name: "Viewer",
            description: "Read-only access to dashboard and content",
        },
    });
    console.log("  ✅ Created roles: Admin, Editor, Viewer");

    // ─── Assign Permissions to Roles ────────────────────
    // Admin: all permissions
    for (const perm of permissions) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: adminRole.id,
                    permissionId: perm.id,
                },
            },
            update: {},
            create: {
                roleId: adminRole.id,
                permissionId: perm.id,
            },
        });
    }

    // Editor: content-related permissions
    const editorResources = ["pages", "seo", "media", "events"];
    const editorPerms = permissions.filter((p) =>
        editorResources.includes(p.resource)
    );
    for (const perm of editorPerms) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: editorRole.id,
                    permissionId: perm.id,
                },
            },
            update: {},
            create: {
                roleId: editorRole.id,
                permissionId: perm.id,
            },
        });
    }

    // Viewer: read-only on all resources
    const viewerPerms = permissions.filter((p) => p.action === "read");
    for (const perm of viewerPerms) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: viewerRole.id,
                    permissionId: perm.id,
                },
            },
            update: {},
            create: {
                roleId: viewerRole.id,
                permissionId: perm.id,
            },
        });
    }
    console.log("  ✅ Assigned permissions to roles");

    // ─── Admin User ─────────────────────────────────────
    const hashedPassword = await bcrypt.hash("admin123", 12);

    await prisma.user.upsert({
        where: { email: "admin@admin.com" },
        update: {},
        create: {
            name: "Admin User",
            email: "admin@admin.com",
            password: hashedPassword,
            status: "active",
            roleId: adminRole.id,
        },
    });
    console.log("  ✅ Created admin user (admin@admin.com / admin123)");

    // ─── Default Site Config ────────────────────────────
    const defaults: { key: string; value: string; type: string }[] = [
        { key: "site_name", value: "Admin Dashboard", type: "string" },
        { key: "site_description", value: "Modern admin dashboard template", type: "string" },
        { key: "site_logo", value: "/logo.svg", type: "string" },
        { key: "site_favicon", value: "/favicon.ico", type: "string" },
        { key: "maintenance_mode", value: "false", type: "boolean" },
        { key: "primary_color", value: "#6366f1", type: "string" },
        { key: "email_provider", value: "smtp", type: "string" },
        { key: "storage_provider", value: "local", type: "string" },
    ];

    for (const config of defaults) {
        await prisma.siteConfig.upsert({
            where: { key: config.key },
            update: {},
            create: config,
        });
    }
    console.log("  ✅ Created default site config");

    // ─── Sample Events ─────────────────────────────────
    const sampleEvents = [
        {
            name: "user.registered",
            displayName: "New User Registration",
            description: "Triggered when a new user registers",
            trigger: "automatic",
            channels: JSON.stringify(["email", "in_app"]),
        },
        {
            name: "user.login",
            displayName: "User Login",
            description: "Triggered on successful login",
            trigger: "automatic",
            channels: JSON.stringify(["in_app"]),
        },
        {
            name: "payment.failed",
            displayName: "Payment Failure",
            description: "Triggered when a payment fails",
            trigger: "automatic",
            channels: JSON.stringify(["email", "in_app", "webhook"]),
        },
    ];

    for (const event of sampleEvents) {
        await prisma.event.upsert({
            where: { name: event.name },
            update: {},
            create: event,
        });
    }
    console.log("  ✅ Created sample events");

    console.log("\n🎉 Seeding complete!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
