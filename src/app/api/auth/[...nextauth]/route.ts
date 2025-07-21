import NextAuth, { AuthOptions } from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

// Extendendo o token e a sessão com o accessToken
interface ExtendedToken extends JWT {
  accessToken?: string;
}

interface ExtendedSession extends Session {
  accessToken?: string;
}

export const authOptions: AuthOptions = {
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
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }) {
      // Aqui você não precisa forçar o tipo
      if (account?.access_token) {
        (token as ExtendedToken).accessToken = account.access_token;
      }
      return token;
    },

    async session({ session, token }) {
      (session as ExtendedSession).accessToken = (token as ExtendedToken).accessToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/admin/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
