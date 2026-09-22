// src/app/layout.tsx (GLOBAL REAL-TIME THEME & PRESENCE SYNCHRONIZATION)
import type { Metadata, Viewport } from "next"; 
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { getCurrentUser } from "@/app/actions/auth"; // 🎯 1. IMPORT AUTH HANDSHAKE PIPELINE
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
  // 🚀 2. FETCH SESSION COLUMNS FRESH FROM NEON POSTGRESQL ON EVERY MOUNT
  const sessionUser = await getCurrentUser();
  const themeModeIsDark = sessionUser?.isDarkMode === true;

  // SILENT HEARTBEAT TRACKER PASSTHROUGH LAYER
  await touchUserPresenceHeartbeat();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${
        themeModeIsDark ? "dark" : ""
      }`} // 🎯 3. APPLY THE THEME CLASS AT THE GRAPHICAL CORE EDGE BOUNDARY
    >
      <body className={`antialiased overflow-x-hidden w-full max-w-full min-h-screen transition-colors duration-300 ${
        themeModeIsDark ? "bg-gray-950 text-gray-50" : "bg-gray-50 text-gray-900"
      }`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
