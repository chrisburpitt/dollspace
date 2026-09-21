// src/app/layout.tsx
import type { Metadata, Viewport } from "next"; 
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { touchUserPresenceHeartbeat } from "@/app/actions/presence";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Dollspace",
  description: "A Space for the Dolls, by the Dolls",
  icons: {
    icon: "/favicon.ico",
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  
  // SILENT HEARTBEAT TRACKER PASSTHROUGH LAYER
  await touchUserPresenceHeartbeat();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="antialiased overflow-x-hidden w-full max-w-full bg-gray-50">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
