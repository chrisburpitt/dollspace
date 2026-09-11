// src/app/chat/page.tsx
export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";
import Link from "next/link";
import UnifiedMessengerClient from "./UnifiedMessengerClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dollspace | Messenger Lounge",
  description: "Kick off your heels and have a chat - in public or send direct messages to others in real-time.",
};

export default async function ChatPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  // 1. Pull down all registered platform users to fill your inbox contact selector cards
  const platformUsers = await prisma.user.findMany({
    where: { id: { not: currentUser.id } },
    select: { id: true, username: true, displayName: true, avatarUrl: true }
  });

  // 2. Query all existing archival private messages logged on Neon
  const dmHistory = await prisma.directMessage.findMany({
    where: {
      OR: [
        { senderId: currentUser.id },
        { recipientId: currentUser.id }
      ]
    },
    orderBy: { createdAt: "asc" }
  });

  const serializedDMs = dmHistory.map((msg) => ({
    id: msg.id,
    content: msg.content,
    createdAt: msg.createdAt.toISOString(),
    senderId: msg.senderId,
    recipientId: msg.recipientId,
    roomToken: msg.roomToken
  }));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <GlobalHeader currentUser={currentUser} />

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Main App Sidebar Navigation Links */}
        <aside className="lg:col-span-3 flex flex-col gap-6 lg:sticky lg:top-20 h-fit self-start">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <nav className="flex flex-col space-y-1">
              <Link href="/" className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-rose-600 font-semibold rounded-xl text-sm transition">
                🏠 Home Feed
              </Link>
              <Link href={`/${currentUser.username}`} className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-rose-600 font-semibold rounded-xl text-sm transition">
                👤 My Profile
              </Link>
              <Link href="/chat" className="px-4 py-2.5 bg-rose-50 text-rose-500 font-bold rounded-xl text-sm transition flex items-center space-x-2">
                💬 Messenger Lounge
              </Link>
			  <Link href="/mail" className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-rose-600 font-semibold rounded-xl text-sm transition flex items-center space-x-2">
                <span>💌 Internal  Mail</span>
              </Link>
            </nav>
          </div>
        </aside>

        {/* RIGHT FULL WINDOW CONTAINER VIEW PORTAL */}
        <main className="lg:col-span-9 bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm h-[calc(100vh-140px)]">
          <UnifiedMessengerClient 
            currentUser={currentUser}
            platformUsers={platformUsers}
            initialDMs={serializedDMs}
          />
        </main>

      </div>
    </div>
  );
}
