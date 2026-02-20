import NextAuth from "next-auth";
import { type NextAuthConfig } from "next-auth";

// We extract the minimal config needed for the edge middleware.
// We cannot use prisma adapter directly in middleware edge runtime.
const authConfig = {
    providers: [],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");

            if (isAuthRoute) {
                if (isLoggedIn) {
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
                return true;
            }

            // Redirect users from root to dashboard
            if (nextUrl.pathname === "/") {
                if (isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl));
                return false;
            }

            // Protect dashboard routes
            if (!isLoggedIn && nextUrl.pathname.startsWith("/dashboard")) {
                return false;
            }

            return true;
        },
    },
} satisfies NextAuthConfig;

const { auth } = NextAuth(authConfig);

export default function proxy(request: any) {
    // @ts-ignore
    return auth(request);
}

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
