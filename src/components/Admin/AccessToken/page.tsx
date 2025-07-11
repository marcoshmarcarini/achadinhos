'use client'
import { useSession, signIn, signOut } from "next-auth/react";

export default function AccessToken() {
  const { data } = useSession();
  const accessToken = data?.accessToken ?? "Não disponível";

  console.log(data)
  console.log(accessToken)

  return <div>Access Token: {accessToken}</div>;

}
