// src/app/chat/page.tsx (THE ACCSOLUTE VIEWPORT HEIGHT REMEDY)
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

  // ⏱️ CALCULATE THE 10-MINUTE ACTIVE WINDOW TO WEED OUT STALE USER ACCOUNTS
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  
  // 🎯 THE FILTRATION GATEWAY: 
  // Forces your private lines sidebar list to load ONLY users who are currently active!
  // It completely filters out "OFFLINE" states or users whose heartbeat window has expired.
  const platformUsers = await prisma.user.findMany({
    where: { 
      id: { not: currentUser.id },
      isBanned: false,
      lastActive: { gte: tenMinutesAgo },
      status: { in: ["ONLINE", "AWAY", "BUSY"] }
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
    <div className="w-screen h-[100dvh] min-h-[100dvh] max-h-[100dvh] bg-gray-50 text-gray-900 overflow-hidden flex flex-col antialiased">
      <GlobalHeader currentUser={currentUser} />
      <MobileNavShell currentUsername={currentUser.username} unreadMailCount={unreadMailCount || 0} />

      {/* 🎯 THE OVERFLOW CONTROLLER: We adjust 'py-0 lg:py-6' to ensure it starts crisp on desktop cells */}
      <div className="w-full max-w-none lg:max-w-7xl mx-auto px-0 lg:px-6 py-0 lg:py-6 relative z-10 flex-1 min-h-0 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 pb-14 lg:pb-0">
        
        {/* 🎯 THE DESKTOP FIX: 
            We change 'lg:top-20' to 'lg:top-0' or remove excessive artificial padding limits.
            This brings your SidebarNav card straight up to align flat with your chat lounge console! */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6 lg:sticky lg:top-0 h-full max-h-full overflow-y-auto pr-1">
          <SidebarNav currentUsername={currentUser.username} unreadMailCount={unreadMailCount} />
          <OnlineUsersSidebar users={await getOnlineDollsRoster()} />
        </aside>

        {/* Dynamic client panel area box locks precisely inside its container grid boundary layout */}
        <main className="col-span-1 lg:col-span-9 bg-white border-0 lg:border border-gray-200 rounded-none lg:rounded-3xl overflow-hidden shadow-none lg:shadow-sm h-full flex flex-col min-h-0">
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
