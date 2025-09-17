"use client";

import { useEffect, useState } from "react";

export default function Telegram() {

    const [telegram, setTelegram] = useState([]);

  useEffect(() => {
    const fetchTop10 = async () => {
      const res = await fetch("/api/shopee/top10", { method: "POST" });
      const data = await res.json();
      console.log("✅ Top 10 JSON:", data.top10);
      console.log("✅ Mensagens Telegram:", data.telegram);
      setTelegram(data.telegram);
    };
    fetchTop10();
  }, []);

  return(
    <>
        <h1>Telegram</h1>
        <p>{telegram}</p>
    </>
  )
}
