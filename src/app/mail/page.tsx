// src/app/mail/page.tsx
export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";
import MailDashboardClient from "./MailDashboardClient";
import { getUnreadMailCount } from "@/app/actions/mailCount"; 
import { getOnlineDollsRoster } from "@/app/actions/onlineUsers";
import SidebarNav from "@/components/SidebarNav";
import OnlineUsersSidebar from "@/components/OnlineUsersSidebar";
import MobileNavShell from "@/components/MobileNavShell"; 
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dollspace | Your Mailbox",
  description: "Manage your inbox, sent items, archives, and deleted folders smoothly.",
};

export default async function MailPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const unreadMailCount = await getUnreadMailCount(); 
  
  const registeredUsers = await prisma.user.findMany({
    where: { id: { not: currentUser.id } },
    select: { username: true, displayName: true }
  });

  const mailRecords = await prisma.internalMail.findMany({
    where: {
      OR: [
        { senderId: currentUser.id },
        { recipientId: currentUser.id }
      ]
    },
    include: {
      sender: { select: { username: true, displayName: true, avatarUrl: true } },
      recipient: { select: { username: true, displayName: true, avatarUrl: true } },
      attachments: { select: { id: true, url: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const serializedMails = mailRecords.map(m => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    attachments: m.attachments || []
  }));

  return (
    /* 🚀 FIXED RESPONSIVE WRAPPER LAYOUT LAYER: Converts to standard layout tracking blocks on desktop monitors to match your chat page exactly! */
    <div className="fixed inset-0 w-screen h-screen max-h-screen overflow-hidden bg-gray-50 flex flex-col text-gray-900 select-none lg:static lg:w-full lg:h-auto lg:max-h-none lg:overflow-visible lg:min-h-screen">
      
      {/* Structural Headers fit neatly on top */}
      <div className="w-full shrink-0">
        <GlobalHeader currentUser={currentUser} />
        <MobileNavShell 
          currentUsername={currentUser.username} 
          unreadMailCount={unreadMailCount || 0} 
        />
      </div>

      {/* 🚀 THE PERFECTLY ALIGNED GRID CELL: Added 'lg:px-6 lg:py-8 lg:h-[calc(100vh-140px)]' to match your chat page spacing exactly */}
      <div className="w-full max-w-7xl mx-auto px-4 pt-4 pb-4 flex-1 min-h-0 h-full grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden mb-16 lg:mb-0 lg:px-6 lg:py-8 lg:h-[calc(100vh-140px)] lg:max-h-none lg:overflow-visible relative z-10">
        
        {/* LEFT FIXED DESKTOP COLUMN PANEL */}
        <aside className="hidden lg:block lg:col-span-3 lg:flex flex-col gap-6 lg:sticky lg:top-20 h-fit self-start shrink-0">
          <SidebarNav 
            currentUsername={currentUser.username} 
            unreadMailCount={unreadMailCount} 
          />
          <OnlineUsersSidebar users={await getOnlineDollsRoster()} />
        </aside>

        {/* RIGHT FLEXIBLE CONTAINER HUB (Inherits full height parameters cleanly) */}
        <main className="col-span-1 lg:col-span-9 bg-white border border-gray-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm h-full max-h-full min-h-0 flex flex-col lg:h-[calc(100vh-140px)]">
          <MailDashboardClient 
            currentUser={currentUser} 
            initialMails={serializedMails}
            registeredUsers={registeredUsers}
          />
        </main>

      </div>
    </div>
  );
}
