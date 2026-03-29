import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.adminUser.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.active) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isSuperAdmin: user.isSuperAdmin,
          allowedPages: user.allowedPages as string[],
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isSuperAdmin = (user as { isSuperAdmin?: boolean }).isSuperAdmin;
        token.allowedPages = (user as { allowedPages?: string[] }).allowedPages;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as { id?: string; isSuperAdmin?: boolean; allowedPages?: string[] };
        u.id = token.id as string;
        u.isSuperAdmin = token.isSuperAdmin as boolean;
        u.allowedPages = token.allowedPages as string[];
      }
      return session;
    },
  },
};
