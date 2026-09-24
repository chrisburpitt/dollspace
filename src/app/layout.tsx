// src/app/layout.tsx (UNLEASHING CENTRALISED CLIENT CONTROL)
import type { Metadata, Viewport } from "next"; 
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { touchUserPresenceHeartbeat } from "@/app/actions/presence";
import { ThemeProvider } from "@/components/ThemeProvider"; 
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false };
export const metadata: Metadata = { title: "Dollspace", description: "A Space for the Dolls, by the Dolls", icons: { icon: "/favicon.ico" } };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Silent background heartbeat tracker tick
  await touchUserPresenceHeartbeat();

  return (
    // 🚀 THE BREAKTHROUGH REMEDY:
    // Stripping out 'themeModeIsDark ? "dark" : ""' prevents the Vercel server 
    // from permanently baking a dark mode lock onto your layout tree!
    // 'suppressHydrationWarning' tells React to safely allow next-themes to handle the classes.
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-50 transition-colors duration-300`}>
        
        {/* The client provider now has full, un-blocked authority to toggle classes instantly! */}
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" // Enforce light theme as your default baseline!
          enableSystem={false} // Disable system sync so it exclusively reads your settings panel toggle click!
        >
          {children}
        </ThemeProvider>
        
        <Analytics />
      </body>
    </html>
  );
}
