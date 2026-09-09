// src/app/chat/page.tsx
export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import FullScreenChat from "./ChatStatus"; // Your interactive client chat workspace
import GlobalHeader from "@/components/GlobalHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dollspace | Live Chatroom",
  description: "Chat in real-time with the DOLLS",
};

export default async function ChatPage() {
  // 1. SECURE VISITOR SESSION CHECK
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Dynamic Global Header with Dropdown Status Controls */}
      <GlobalHeader currentUser={currentUser} />

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
              <Link href="/chat" className="px-4 py-2.5 bg-rose-50 text-rose-500 font-bold rounded-xl text-sm transition flex items-center space-x-2">
                <span>💬 Live Chatroom</span>
              </Link>
            </nav>
          </div>
        </aside>

        {/* CENTER COLUMN: The Dynamic Real-Time Chat Frame Component (Takes 9 columns) */}
        <main className="lg:col-span-9">
          {/* 🚀 CASCADES VERIFIED ACCOUNT DETAILS STRAIGHT DOWNSTREAM TO PARTYKIT */}
          <FullScreenChat currentUser={currentUser} roomId="dollspace-main-lounge" />
        </main>

      </div>
    </div>
  );
}
