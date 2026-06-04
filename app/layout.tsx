import type { Metadata } from "next";
import { Geist, Geist_Mono, Fredoka } from "next/font/google";
import PWAInstall from "@/components/PWAInstall";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "WizLingo – Reading & Speaking Skills Platform",
  description: "AI-powered reading and speaking practice for Grade I–X by Edvanta",
  manifest: "/manifest.json",
  themeColor: "#F97316",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WizLingo",
  },
  icons: {
    icon: [
      { url: "/wiziingo-logo.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
      { url: "/icons/icon-512x512.png", sizes: "512x512" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fredoka.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <PWAInstall />
      </body>
    </html>
  );
}
