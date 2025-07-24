import { getServerSession } from "next-auth";
import { authOptions } from "../src/app/api/auth/[...nextauth]/route";

const serverAuthOptions = {
  callbacks: {
    session: async ({ session, token } : any) => {
      // Implementação da lógica de sessão aqui
    },
  },
};

export function auth() {
  return getServerSession(serverAuthOptions);
}