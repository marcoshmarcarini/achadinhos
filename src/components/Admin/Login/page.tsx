"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import styles from "./Login.module.css";

export default function Login() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className={styles.container}>
        <span className={styles.text}>Olá, {session.user?.name}</span>
        <button onClick={() => signOut({ callbackUrl: "/" })} className={styles.buttonLogout}>
          Logout
        </button>
      </div>
    );
  }
  return (
    <div className={styles.container}>
      <button
        onClick={() => signIn("facebook", { callbackUrl: "/admin" })}
        className={styles.buttonLogin}
      >
        Login
      </button>
    </div>
  );
}
