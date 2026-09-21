// src/app/layout.tsx
import type { Metadata, Viewport } from "next"; 
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { touchUserPresenceHeartbeat } from "@/app/actions/presence";
import { getCurrentUser } from "@/app/actions/auth"; // 🎯 1. IMPORT SESSION CHECKER
import BanGuardModal from "@/components/BanGuardModal"; // 🎯 2. IMPORT POPUP MODAL WIDGET
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
  
  // 🚀 SILENT HEARTBEAT TRACKER PASSTHROUGH LAYER
  // Fires instantly in the background thread on every single page render hit
  await touchUserPresenceHeartbeat();

  // 🎯 3. RESOLVE AUTHENTICATION STATUS ON INITIAL LAYOUT RENDER
  const userSession = await getCurrentUser();

  // 🚨 4. THE POPUP INTERCEPT ROUTINE:
  // If the user's status flag is checked as banned, this completely intercepts the view 
  // tree, hides the sub-level pages, and renders your appeal popup window.
  const isUserBanned = userSession && "isBanned" in userSession && userSession.isBanned;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="antialiased overflow-x-hidden w-full max-w-full bg-gray-50">
        {isUserBanned ? (
          <>
            {/* Renders the non-dismissible popup over a blurred backdrop placeholder layout */}
            <BanGuardModal banData={userSession} />
            <div className="blur-md pointer-events-none opacity-40 select-none max-h-screen overflow-hidden">
              {children}
            </div>
          </>
        ) : (
          // Otherwise, render standard access paths seamlessly
          children
        )}
        <Analytics />
      </body>
    </html>
  );
}
