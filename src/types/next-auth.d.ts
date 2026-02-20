import "next-auth";
import "next-auth/jwt";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface User {
        roleId?: string;
        role?: string;
        status?: string;
    }

    interface Session {
        user: {
            id: string;
            roleId?: string;
            role?: string;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        roleId?: string;
        role?: string;
    }
}
