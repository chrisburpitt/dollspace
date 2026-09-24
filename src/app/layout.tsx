// src/app/layout.tsx (UPGRADED GLOBAL THEME CONTROLLER)
import type { Metadata, Viewport } from "next"; 
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { touchUserPresenceHeartbeat } from "@/app/actions/presence";
import { ThemeProvider } from "@/components/ThemeProvider"; // 🎯 IMPORT REFACTORED THEME PORTAL
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false };
export const metadata: Metadata = { title: "Dollspace", description: "A Space for the Dolls, by the Dolls", icons: { icon: "/favicon.ico" } };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Run silent background heartbeat tracker ticks
  await touchUserPresenceHeartbeat();

  return (
    // 🚀 THE THEME provider ACTIVATE: 
    // Passes total class management authority over to the client context engine, 
    // completely dissolving Vercel server cache traps forever!
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-50 transition-colors duration-300`}>
        
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
        >
          {children}
        </ThemeProvider>
        
        <Analytics />
      </body>
    </html>
  );
}
