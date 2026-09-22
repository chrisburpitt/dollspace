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
  const themeModeIsDark = sessionUser?.isDarkMode === true;

  // Silent background heartbeat tracker tick
  await touchUserPresenceHeartbeat();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${
        themeModeIsDark ? "dark" : ""
      }`} // 🎯 Keeps the HTML dark tag prefix active globally
    >
      {/* 🎯 THE ACCSOLUTE THEME COHESION FIX: 
          Instead of cutting between conditional strings, we specify flat baseline traits 
          and append native 'dark:' variants. This forces the entire platform, sub-apps, 
          and main page containers to read the state and switch colors together! */}
      <body className="antialiased overflow-x-hidden w-full max-w-full min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-50 transition-colors duration-300">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
