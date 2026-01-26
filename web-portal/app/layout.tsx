import type { Metadata } from "next";
import { Outfit, JetBrains_Mono, Sora, Fira_Code } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
});

export const metadata: Metadata = {
  title: "Gated Community System",
  description: "Visitor & Estate Management System",
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} ${sora.variable} ${firaCode.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
