// src/app/chat/page.tsx
export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";
import Link from "next/link";
import UnifiedMessengerClient from "./UnifiedMessengerClient";
import { getUnreadMailCount } from "@/app/actions/mailCount"; 
import { getOnlineDollsRoster } from "@/app/actions/onlineUsers";
import SidebarNav from "@/components/SidebarNav";
import OnlineUsersSidebar from "@/components/OnlineUsersSidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dollspace | Chat Lounge",
  description: "Kick off your heels and have a chat - in public or send direct messages to others in real-time.",
};

export default async function ChatPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const unreadMailCount = await getUnreadMailCount(); 
  
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
        
        {/* 🚀 LEFT COLUMN SIDEBAR PANEL (Cleaned up and consolidated down to just two simple component rows!) */}
        <aside className="lg:col-span-3 flex flex-col gap-4 lg:sticky lg:top-20 h-fit self-start">

          <SidebarNav 
            currentUsername={currentUser.username} 
            unreadMailCount={unreadMailCount} 
          />

          <OnlineUsersSidebar users={await getOnlineDollsRoster()} />
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
