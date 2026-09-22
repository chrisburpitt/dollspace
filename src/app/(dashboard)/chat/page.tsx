// src/app/chat/page.tsx (PERFECT MOBILITY HEIGHT COMPILATION)
export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";
import UnifiedMessengerClient from "./UnifiedMessengerClient";
import { getUnreadMailCount } from "@/app/actions/mailCount"; 
import { getOnlineDollsRoster } from "@/app/actions/onlineUsers"; 
import SidebarNav from "@/components/SidebarNav";
import OnlineUsersSidebar from "@/components/OnlineUsersSidebar";
import MobileNavShell from "@/components/MobileNavShell"; 
import { Role } from "@prisma/client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dollspace | Chat Lounge",
  description: "Kick off your heels and have a chat - in public or send direct messages to others in real-time.",
};

export default async function ChatPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const unreadMailCount = await getUnreadMailCount(); 
  
  const platformUsers = await prisma.user.findMany({
    where: { 
      id: { not: currentUser.id },
      status: { not: "BANNED" }
    },
    select: { id: true, username: true, displayName: true, avatarUrl: true, status: true }
  });

  // Query private DM history
  const dmHistory = await prisma.directMessage.findMany({
    where: { OR: [{ senderId: currentUser.id }, { recipientId: currentUser.id }] },
    orderBy: { createdAt: "asc" }
  });

  // Pre-fetch persistent Mod Chat history safely
  const isStaff = currentUser.role === Role.MODERATOR || currentUser.role === Role.ADMIN;
  const modHistory = isStaff 
    ? await prisma.modMessage.findMany({
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
        take: 50 
      })
    : [];

  const serializedDMs = dmHistory.map((msg) => ({
    id: msg.id,
    content: msg.content,
    createdAt: msg.createdAt.toISOString(),
    senderId: msg.senderId,
    recipientId: msg.recipientId,
    roomToken: msg.roomToken
  }));

  const serializedModHistory = modHistory.map((msg) => ({
    id: msg.id,
    content: msg.content,
    createdAt: msg.createdAt.toISOString(),
    room: "MOD_CHAT",
    user: msg.user
  }));

  return (
    // 🎯 FIX: 'overflow-hidden' and 'max-h-screen' elements lock the outermost viewport frame tight on phones
    <div className="min-h-screen max-h-screen h-screen bg-gray-50 text-gray-900 overflow-hidden flex flex-col">
      <GlobalHeader currentUser={currentUser} />
      <MobileNavShell currentUsername={currentUser.username} unreadMailCount={unreadMailCount || 0} />

      {/* 🎯 THE OVERFLOW REMEDY VIEWPORT CELL CONTAINER:
          On mobile devices, we strip 'max-w-7xl' and 'px-6' layout limits completely! 
          This makes the chat canvas perfectly full-bleed ('w-full flex-1') right down to the mobile nav bar,
          erasing that massive bottom gap entirely. On desktops, it shifts back to a beautiful centered grid. */}
      <div className="w-full max-w-none lg:max-w-7xl mx-auto px-0 lg:px-6 py-0 lg:py-8 grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 relative z-10 flex-1 overflow-hidden h-[calc(100dvh-112px)] lg:h-auto">
        
        {/* Desktop Sidebar Layout column element cards */}
        <aside className="hidden lg:block lg:col-span-3 lg:flex flex-col gap-6 lg:sticky lg:top-20 h-fit self-start">
          <SidebarNav currentUsername={currentUser.username} unreadMailCount={unreadMailCount} />
          <OnlineUsersSidebar users={await getOnlineDollsRoster()} />
        </aside>

        {/* 🎯 CORE INTERACTIVE CHAT MAIN WRAPPER CONTAINER:
            Takes up 100% of the active available screen estate space on mobile phones typesafely */}
        <main className="col-span-1 lg:col-span-9 bg-white border-0 lg:border border-gray-200 rounded-none lg:rounded-3xl overflow-hidden shadow-none lg:shadow-sm h-full flex flex-col">
          <UnifiedMessengerClient 
            currentUser={currentUser}
            platformUsers={platformUsers}
            initialDMs={serializedDMs}
            initialModMessages={serializedModHistory}
          />
        </main>
      </div>
    </div>
  );
}
