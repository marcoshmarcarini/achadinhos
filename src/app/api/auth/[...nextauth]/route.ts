import FacebookProvider from "next-auth/providers/facebook";
import { JWT } from "next-auth/jwt";
import { Session, Account } from "next-auth";
import NextAuth from "next-auth";

interface ExtendedToken extends JWT {
  accessToken?: string;
}

interface ExtendedSession extends Session {
  accessToken?: string;
}

enum SessionStrategy {
  JWT = "jwt",
}

const handler = NextAuth({
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
    async jwt({ token, account }: { token: JWT; account: Account | null }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token as ExtendedToken;
    },

    async session({
      session,
      token,
      user,
    }: {
      session: Session;
      token: JWT;
      user: unknown;
    }) {
      (session as ExtendedSession).accessToken = (
        token as ExtendedToken
      ).accessToken;
      console.log(user);
      return session as ExtendedSession;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/admin/login",
  },
});

export { handler as GET, handler as POST };
