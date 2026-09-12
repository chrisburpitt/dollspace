// src/app/admin/page.tsx
export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";
import SidebarNav from "@/components/SidebarNav";
import { getUnreadMailCount } from "@/app/actions/mailCount";
import AdminControlsClient from "./AdminControlsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dollspace | Admin Moderation Center",
  description: "Secure administrative deck to manage platform bans, blocks, and broadcast alerts.",
};

export default async function AdminPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  // Strict Server Check Checkpoint: Re-query role explicitly from Neon database
  const dbUser = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { role: true }
  });

  if (dbUser?.role !== "ADMIN" && dbUser?.role !== "MODERATOR") {
    notFound(); // Bounce unauthorized users with a clean 404 router mismatch block
  }

  const unreadMailCount = await getUnreadMailCount();

  // Load the list of accounts to display inside the administrative console list
  const userRegistryList = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      role: true,
      isBanned: true,
      banReason: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });

  const serializedUsers = userRegistryList.map(u => ({
    ...u,
    createdAt: u.createdAt.toISOString()
  }));

  const validatedHeaderUser = {
    id: currentUser.id,
    status: currentUser.status || "ONLINE"
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <GlobalHeader currentUser={validatedHeaderUser} />

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT COLUMN: Unified Sidebar Nav */}
        <aside className="lg:col-span-3 flex flex-col gap-6 lg:sticky lg:top-20 h-fit self-start">
          <SidebarNav currentUsername={currentUser.username} unreadMailCount={unreadMailCount} />
          
          {/* Admin Indicator Badge */}
          <div className="bg-gray-900 text-white p-4 rounded-2xl border border-black shadow-sm text-left">
            <span className="text-[10px] uppercase font-black text-rose-400 tracking-widest block">🛡️ Access Status</span>
            <p className="font-black text-xs mt-1">Authorized Command Deck</p>
            <p className="text-[11px] text-gray-400 font-medium leading-relaxed mt-0.5">Your modifications update down to global database arrays instantly.</p>
          </div>
        </aside>

        {/* RIGHT CORE COSOLE: Renders Interactive Management Views */}
        <main className="lg:col-span-9 space-y-6">
          <AdminControlsClient initialUsers={serializedUsers} />
        </main>

      </div>
    </div>
  );
}
