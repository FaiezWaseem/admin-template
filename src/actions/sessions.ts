"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function revokeSession(sessionId: string) {
    try {
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            throw new Error("Session not found");
        }

        // Mark the session as revoked in the DB
        await prisma.session.update({
            where: { id: sessionId },
            data: { revoked: true },
        });

        // If it's a JWT, we also add it to our revoked tokens list
        // so the callback can check it quickly without scanning all sessions
        if (session.type === "jwt") {
            await prisma.revokedToken.upsert({
                where: { token: session.token },
                update: {},
                create: {
                    token: session.token,
                    expiresAt: session.expiresAt,
                }
            });
        }

        revalidatePath("/dashboard/sessions");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function revokeAllUserSessions(userId: string) {
    try {
        const activeSessions = await prisma.session.findMany({
            where: { userId, revoked: false }
        });

        // Mark all as revoked
        await prisma.session.updateMany({
            where: { userId },
            data: { revoked: true },
        });

        // Create revoked token entries for all valid JWTs
        const revokedTokensData = activeSessions
            .filter((s) => s.type === "jwt")
            .map((s) => ({
                token: s.token,
                expiresAt: s.expiresAt,
            }));

        if (revokedTokensData.length > 0) {
            await prisma.revokedToken.createMany({
                data: revokedTokensData,
            });
        }

        revalidatePath("/dashboard/sessions");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}
