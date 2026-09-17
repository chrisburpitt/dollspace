// src/app/chat/page.tsx
export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";
import UnifiedMessengerClient from "./UnifiedMessengerClient";
import { getUnreadMailCount } from "@/app/actions/mailCount"; 
import SidebarNav from "@/components/SidebarNav";
import OnlineUsersSidebar from "@/components/OnlineUsersSidebar";
import MobileNavShell from "@/components/MobileNavShell"; 
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dollspace | Chat Lounge",
  description: "Kick off your heels and have a chat - in public or send direct messages to others in real-time.",
};

export default async function ChatPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const unreadMailCount = await getUnreadMailCount(); 
  
  // 🚀 FIXED: Filter down contacts list to EXCLUDE any banned accounts natively!
  const platformUsers = await prisma.user.findMany({
    where: { 
      id: { not: currentUser.id },
      status: { not: "BANNED" } // 🎯 Filters out any banned users
    },
    select: { id: true, username: true, displayName: true, avatarUrl: true }
  });

  // Query archival private messages logged on Neon
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
      <MobileNavShell 
        currentUsername={currentUser.username} 
        unreadMailCount={unreadMailCount || 0} 
      />

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        <aside className="hidden lg:block lg:col-span-3 lg:flex flex-col gap-6 lg:sticky lg:top-20 h-fit self-start">
          <SidebarNav currentUsername={currentUser.username} unreadMailCount={unreadMailCount} />
          {/* This sidebar layout component stays for tracking generic system online events */}
          <OnlineUsersSidebar users={platformUsers.slice(0, 10)} /> 
        </aside>

        <main className="lg:col-span-9 bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm h-[calc(100vh-140px)]">
          <UnifiedMessengerClient 
            currentUser={currentUser} // 🚀 Passes user info containing 'role'
            platformUsers={platformUsers}
            initialDMs={serializedDMs}
          />
        </main>
      </div>
    </div>
  );
}
