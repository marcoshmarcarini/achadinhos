"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Login(){
    const {data: session} = useSession();

    if(session){
        return(
            <div>
                <span>Ola, {session.user?.email}</span>
                <button onClick={() => signOut()}>Logout</button>
            </div>
        )
    }
    return(
        <div>
            <button onClick={() => signIn()}>Login</button>
        </div>
    )
}
