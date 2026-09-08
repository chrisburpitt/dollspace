// src/app/chat/page.tsx
import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import FullScreenChat from "./ChatStatus"; // Imports your interactive client chat wrapper
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dollspace | Live Chatroom",
  description: "Chat in real-time with the DOLLS",
};

export default async function ChatPage() {
  // 1. SECURE SESSION CHECK: Verify cryptographic token from HTTP-Only cookies
  const currentUser = await getCurrentUser();

  // If session is empty, immediately bounce them to log in
  if (!currentUser) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Top Header Navigation Bar */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tight text-blue-600 hover:opacity-90">
            Dollspace
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-gray-500">Status: Secure WebSocket Layer</span>
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </header>

      {/* Responsive Multi-Column Desktop Grid Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Sidebar Navigation Panel Links (Takes 3 columns) */}
        <aside className="lg:col-span-3 flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <nav className="flex flex-col space-y-1">
              <Link href="/" className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 font-semibold rounded-xl text-sm transition">
                🏠 Home Feed
              </Link>
              <Link href={`/${currentUser.username}`} className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 font-semibold rounded-xl text-sm transition">
                👤 My Profile
              </Link>
              <Link href="/chat" className="px-4 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl text-sm transition flex items-center space-x-2">
                <span>💬 Live Chatroom</span>
              </Link>
            </nav>
          </div>
        </aside>

        {/* CENTER COLUMN: The Dynamic Real-Time Chat Frame Component (Takes 9 columns) */}
        <main className="lg:col-span-9">
          {/* 🚀 FIXED PROP PASSING HERE: Explicitly cascading database details downstream */}
          <FullScreenChat currentUser={currentUser} roomId="dollspace-main-lounge" />
        </main>

      </div>
    </div>
  );
}
