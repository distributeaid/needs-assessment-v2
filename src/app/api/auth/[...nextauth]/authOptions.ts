import type { JWT } from "next-auth/jwt";

import CredentialsProvider from "next-auth/providers/credentials";

import { NextAuthOptions, DefaultSession, DefaultUser } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          },
        );
        const data = await res.json();
        if (res.ok && data.user && data.accessToken) {
          return {
            id: data.user.id.toString(),
            email: data.user.email,
            accessToken: data.accessToken,
          } as DefaultUser & { accessToken?: string };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: (DefaultUser & { accessToken?: string }) | null;
    }) {
      if (user) {
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }: { session: DefaultSession; token: JWT }) {
      session.user = {
        ...session.user,
        accessToken: token.accessToken,
      } as DefaultSession["user"] & { accessToken?: string };
      return session;
    },
  },
  pages: {
    signIn: `/login`,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
