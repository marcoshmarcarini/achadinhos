"use client";
import { useEffect, useState } from "react";

import Image from "next/image";

export default function Footer() {
  const [display, setDisplay] = useState("flex");

  const currentHeight = window.innerHeight;

  useEffect(() => {
    const handleDisplay = () => {
      if (currentHeight > 2500) {
        setDisplay("flex");
      } else {
        setDisplay("none");
      }
    };
    handleDisplay();
  }, [currentHeight]);

  return (
    <footer
      className={` items-center justify-center gap-2 py-[25px] bottom-0 left-0 right-0`}
      style={{ display: display }}
    >
      <Image
        src={`/img/achadinhos.png`}
        width={20}
        height={20}
        alt={`Achadinhos`}
      />
      <p className={`text-[0.6rem] p-0 m-0`}>
        Desenvolvido por
        <a
          href="https://www.instagram.com/marcoshmarcarini"
          target="_blank"
          className={`text-orange-500 hover:text-orange-300 transition-colors`}
        >
          Marcos Henrique Marcarini Junior
        </a>
        . &copy; 2025
      </p>
    </footer>
  );
}
