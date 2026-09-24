// src/app/layout.tsx (GLOBAL REAL-TIME THEME & PRESENCE SYNCHRONIZATION)
import type { Metadata, Viewport } from "next"; 
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { getCurrentUser } from "@/app/actions/auth"; 
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
  // Fetch session parameters fresh from Neon PostgreSQL
  const sessionUser = await getCurrentUser();
  
  // 🎯 THE CORE THEME TRUTH: Detects your active database column parameters!
  const themeModeIsDark = sessionUser?.isDarkMode === true;

  // Silent background heartbeat tracker tick
  await touchUserPresenceHeartbeat();

  return (
    // 🚀 THE THEME UNLOCK: 
    // Dynamically appends the "dark" selector class matching your database row state, 
    // allowing Tailwind's 'dark:' variants to switch colors seamlessly across components!
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${
        themeModeIsDark ? "dark" : ""
      }`} 
    >
      <body className="antialiased overflow-x-hidden w-full max-w-full min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-50 transition-colors duration-300">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
