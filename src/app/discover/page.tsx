// src/app/discover/page.tsx
export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";
import Link from "next/link";
import DiscoverDashboardClient from "./DiscoverDashboardClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dollspace | Discover Community",
  description: "Search username handles, filter identities, and find creators globally.",
};

export default async function DiscoverPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const validatedHeaderUser = {
    id: currentUser.id,
    status: currentUser.status || "ONLINE"
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <GlobalHeader currentUser={validatedHeaderUser} />

      {/* Main Structural Layout Wrapper */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">        
        {/* LEFT COLUMN: Sidebar Navigation Layout */}
        <aside className="lg:col-span-3 flex flex-col gap-6 lg:sticky lg:top-20 h-fit self-start">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <nav className="flex flex-col space-y-1">
              <Link href="/" className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-rose-600 font-semibold rounded-xl text-sm transition">🏠 Home Feed</Link>
              <Link href={`/${currentUser.username}`} className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-rose-60050 font-semibold rounded-xl text-sm transition">👤 My Profile</Link>
              <Link href="/chat" className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-rose-600 font-semibold rounded-xl text-sm transition flex items-center space-x-2"><span>💬 Chat Lounge</span></Link>
              <Link href="/mail" className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-rose-600 font-semibold rounded-xl text-sm transition flex items-center space-x-2"><span>💌 Mailbox</span></Link>
              <Link href="/discover" className="px-4 py-2.5 bg-rose-50 text-rose-500 font-bold rounded-xl text-sm transition flex items-center space-x-2"><span>🔍 Find Friends</span></Link>
            </nav>
          </div>
        </aside>

        {/* RIGHT CORE PANELS: High Speed Search Controller Rendering Canvas */}
        <main className="lg:col-span-9 space-y-6">
          <DiscoverDashboardClient currentUserId={currentUser.id} />
        </main>

      </div>
    </div>
  );
}
