// src/app/api/auth/authOptions.ts
import FacebookProvider from "next-auth/providers/facebook";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { NextAuthOptions } from "next-auth";

interface ExtendedToken extends JWT {
  accessToken?: string;
}

interface ExtendedSession extends Session {
  accessToken?: string;
}

enum SessionStrategy {
  JWT = "jwt",
}

export const authOptions: NextAuthOptions = {
  providers: [
    FacebookProvider({
      clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "public_profile,email," +
            "pages_show_list,pages_read_engagement,pages_manage_posts",
        },
      },
    }),
  ],
  session: {
    strategy: SessionStrategy.JWT,
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        (token as ExtendedToken).accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      (session as ExtendedSession).accessToken = (
        token as ExtendedToken
      ).accessToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET!,
  pages: {
    signIn: "/admin",
  },
};
