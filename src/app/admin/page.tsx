// src/app/admin/page.tsx
export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
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

  // Re-query the role freshly from Neon database
  const dbUser = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { role: true, username: true }
  });

  // 🚀 FIXED: Instead of throwing an ambiguous 404, return a clear error view to identify token issues!
  if (dbUser?.role !== "ADMIN" && dbUser?.role !== "MODERATOR") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 select-none text-left">
        <div className="bg-white p-6 max-w-md w-full border border-gray-200 rounded-3xl shadow-sm space-y-3">
          <span className="text-3xl block">🛡️</span>
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wide">Access Checkpoint Failed</h2>
          <p className="text-xs text-gray-500 font-semibold leading-relaxed">
            Your account (<strong className="text-gray-700">@{dbUser?.username || currentUser.username}</strong>) is currently marked as role: <span className="bg-gray-100 px-1.5 py-0.5 rounded font-black text-[10px] text-rose-500">{dbUser?.role || "UNKNOWN"}</span>. 
          </p>
          <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
            Administrative access requires your database row enum field to be exactly <code className="bg-gray-50 border px-1 py-0.5 rounded font-bold text-gray-800 text-[10px]">ADMIN</code> or <code className="bg-gray-50 border px-1 py-0.5 rounded font-bold text-gray-800 text-[10px]">MODERATOR</code>.
          </p>
          <div className="pt-2">
            <a href="/" className="bg-gray-900 hover:bg-rose-500 text-white font-black text-[10px] px-4 py-2.5 rounded-xl uppercase tracking-wider transition block text-center shadow-sm">
              Return to Timeline
            </a>
          </div>
        </div>
      </div>
    );
  }

  const unreadMailCount = await getUnreadMailCount();

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
        <aside className="lg:col-span-3 flex flex-col gap-6 lg:sticky lg:top-20 h-fit self-start">
          <SidebarNav currentUsername={currentUser.username} unreadMailCount={unreadMailCount} />
          <div className="bg-gray-900 text-white p-4 rounded-2xl border border-black shadow-sm text-left">
            <span className="text-[10px] uppercase font-black text-rose-400 tracking-widest block">🛡️ Access Status</span>
            <p className="font-black text-xs mt-1">Authorized Command Deck</p>
          </div>
        </aside>

        <main className="lg:col-span-9 space-y-6">
          <AdminControlsClient initialUsers={serializedUsers} />
        </main>
      </div>
    </div>
  );
}
