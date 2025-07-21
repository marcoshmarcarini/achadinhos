import FacebookProvider from "next-auth/providers/facebook";
import { JWT } from "next-auth/jwt";
import NextAuth, { Session } from "next-auth";

interface ExtendedToken extends JWT {
  accessToken?: string;
}

interface ExtendedSession extends Session {
  accessToken?: string;
}

enum SessionStrategy {
  JWT = "jwt",
}



export const authOptions = {
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
    async jwt({
      token,
      account,
    }: {
      token: JWT;
      account: any;
    }) {
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
      session: ExtendedSession;
      token: JWT;
      user: unknown;
    }) {
      session.accessToken = (token as ExtendedToken).accessToken;
      console.log(user);
      return session as unknown as ExtendedSession;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/admin/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
