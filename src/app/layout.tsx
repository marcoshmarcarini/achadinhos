import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SessionWrapper from "@/components/SessionWrapper/page";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Nav from "@/components/Theme/Nav/page";
import Footer from "@/components/Theme/footer/page";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Achadinhos do Marquinhos",
  description: "Ofertas selecionadas da Shopee.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionWrapper>
          <Nav />
          {children}
          <Analytics />
          <Footer />
        </SessionWrapper>
      </body>
    </html>
  );
}
