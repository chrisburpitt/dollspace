import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { touchUserPresenceHeartbeat } from "@/app/actions/presence";
import "./globals.css";

export default async function RootLayout({ children }: LayoutProps<"/">) {

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dollspace",
  description: "A Space for the Dolls, by the Dolls",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Fires instantly in the background thread on every single page render view hit
  await touchUserPresenceHeartbeat();
  
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}