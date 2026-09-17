// src/app/layout.tsx
import type { Metadata, Viewport } from "next"; // 🚀 Added Viewport type tracking
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

// 🚀 1. INDEPENDENT VIEWPORT EXPORT: Keeps layout configs clean and tells Android Chrome to scale content at a true 1:1 mobile layout ratio!
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// 🚀 2. CLEAN METADATA CONFIGURATION: Merged flawlessly and free from nested bracket trailing comma errors
export const metadata: Metadata = {
  title: "Dollspace",
  description: "A Space for the Dolls, by the Dolls",
  icons: {
    icon: "/favicon.ico",
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  
  // 🚀 SILENT HEARTBEAT TRACKER PASSTHROUGH LAYER
  // Fires instantly in the background thread on every single page render hit
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
