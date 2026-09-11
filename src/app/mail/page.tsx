// src/app/mail/page.tsx
export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";
import Link from "next/link";
import MailDashboardClient from "./MailDashboardClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dollspace | Your Mailbox",
  description: "Manage your inbox, sent items, archives, and deleted folders smoothly.",
};

export default async function MailPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

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
        {/* LEFT COLUMN: Sidebar Navigation Layout */}
        <aside className="lg:col-span-3 flex flex-col gap-6 lg:sticky lg:top-20 h-fit self-start">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <nav className="flex flex-col space-y-1">
              <Link href="/" className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-rose-600 font-semibold rounded-xl text-sm transition">🏠 Home Feed</Link>
              <Link href={`/${currentUser.username}`} className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-rose-600 font-semibold rounded-xl text-sm transition">👤 My Profile</Link>
              <Link href="/chat" className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-rose-600 font-semibold rounded-xl text-sm transition flex items-center space-x-2"><span>💬 Chat Lounge</span></Link>
              <Link href="/mail" className="px-4 py-2.5 bg-rose-50 text-rose-500 font-bold rounded-xl text-sm transition flex items-center space-x-2"><span>💌 Mailbox</span></Link>
            </nav>
          </div>
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
