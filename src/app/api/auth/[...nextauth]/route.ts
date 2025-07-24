import NextAuth from "next-auth";
import { authOptions } from "../authOptions"; // <-- novo caminho

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };