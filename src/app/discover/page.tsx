// src/app/discover/page.tsx
export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";
import Link from "next/link";
import DiscoverDashboardClient from "./DiscoverDashboardClient";
import { Metadata } from "next";
import { getUnreadMailCount } from "@/app/actions/mailCount";
import { getOnlineDollsRoster } from "@/app/actions/onlineUsers";
import SidebarNav from "@/components/SidebarNav";
import OnlineUsersSidebar from "@/components/OnlineUsersSidebar";

export const metadata: Metadata = {
  title: "Dollspace | Discover Your Community",
  description: "Search username handles, filter identities, and find creators globally.",
};

export default async function DiscoverPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  
  const unreadMailCount = await getUnreadMailCount(); 

  const validatedHeaderUser = {
    id: currentUser.id,
    status: currentUser.status || "ONLINE"
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <GlobalHeader currentUser={validatedHeaderUser} />

      {/* Main Structural Layout Wrapper */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">        
        {/* 🚀 LEFT COLUMN SIDEBAR PANEL (Cleaned up and consolidated) */}
        <aside className="lg:col-span-3 flex flex-col gap-4 lg:sticky lg:top-20 h-fit self-start">
          <SidebarNav 
            currentUsername={currentUser.username} 
            unreadMailCount={unreadMailCount} 
          />
          <OnlineUsersSidebar users={await getOnlineDollsRoster()} />
        </aside>

        {/* RIGHT CORE PANELS: High Speed Search Controller Rendering Canvas */}
        <main className="lg:col-span-9 space-y-6">
          <DiscoverDashboardClient currentUserId={currentUser.id} />
        </main>

      </div>
    </div>
  );
}
