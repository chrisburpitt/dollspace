// src/app/mail/page.tsx
export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";
import Link from "next/link";
import MailDashboardClient from "./MailDashboardClient";
import { getUnreadMailCount } from "@/app/actions/mailCount"; 
import { getOnlineDollsRoster } from "@/app/actions/onlineUsers";
import SidebarNav from "@/components/SidebarNav";
import OnlineUsersSidebar from "@/components/OnlineUsersSidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dollspace | Your Mailbox",
  description: "Manage your inbox, sent items, archives, and deleted folders smoothly.",
};

export default async function MailPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const unreadMailCount = await getUnreadMailCount(); 
  
  // Fetch all potential platform users to power our smart quick compose lookups list
  const registeredUsers = await prisma.user.findMany({
    where: { id: { not: currentUser.id } },
    select: { username: true, displayName: true }
  });

  // Pull down every internal mail relating to this identity profile token
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

  // Serialize records cleanly across server boundaries
  const serializedMails = mailRecords.map(m => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    attachments: m.attachments || []
  }));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <GlobalHeader currentUser={currentUser} />

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 🚀 LEFT COLUMN SIDEBAR PANEL (Cleaned up and consolidated) */}
        <aside className="lg:col-span-3 flex flex-col gap-4 lg:sticky lg:top-20 h-fit self-start">
          <SidebarNav 
            currentUsername={currentUser.username} 
            unreadMailCount={unreadMailCount} 
          />
          <OnlineUsersSidebar users={await getOnlineDollsRoster()} />
        </aside>

        {/* RIGHT CORE DASHBOARD COMPONENT HUB */}
        <main className="lg:col-span-9 bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm h-[calc(100vh-140px)]">
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
