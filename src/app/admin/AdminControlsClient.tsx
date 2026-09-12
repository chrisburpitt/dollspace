// src/app/admin/AdminControlsClient.tsx (PART 1 - REUSABLE NAV BAR INTEGRATION FIXED)
"use client";

import { useState, useTransition } from "react";
import { banUserProfile, unbanUserProfile, dispatchGlobalSystemBroadcast } from "@/app/actions/moderation";
import SubmitButton from "@/components/SubmitButton";
import Link from "next/link"; // 🚀 FIXED: Added missing Next.js navigation engine import link

export default function AdminControlsClient({ initialUsers }: { initialUsers: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [users, setUsers] = useState<any[]>(initialUsers);
  
  // Broadcast Input States
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");

  const handleBanToggle = (userId: string, currentBanState: boolean, name: string) => {
    if (currentBanState) {
      if (!confirm(`🌸 Safely lift account ban restrictions for ${name}?`)) return;
      startTransition(async () => {
        const res = await unbanUserProfile(userId);
        if (res.success) {
          setUsers((prev) => prev.map(u => u.id === userId ? { ...u, isBanned: false, banReason: null } : u));
          alert("🌸 User profile reactivated successfully!");
        }
      });
    } else {
      const reason = prompt(`🚫 Specify ban citation reason description for ${name}:`);
      if (reason === null) return; // Cancelled
      
      startTransition(async () => {
        const res = await banUserProfile(userId, reason.trim());
        if (res.success) {
          setUsers((prev) => prev.map(u => u.id === userId ? { ...u, isBanned: true, banReason: reason.trim() } : u));
          alert(`🚫 ${name} has been blacklisted and locked out of Dollspace.`);
        } else if (res.error) {
          alert(res.error);
        }
      });
    }
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastBody.trim()) return;

    startTransition(async () => {
      const res = await dispatchGlobalSystemBroadcast(broadcastSubject, broadcastBody);
      if (res.success) {
        setBroadcastSubject("");
        setBroadcastBody("");
        alert(`📢 Global Broadcast successfully transmitted out to ${res.dispatchedCount} accounts!`);
      } else if (res.error) {
        alert(res.error);
      }
    });
  };


  // src/app/admin/AdminControlsClient.tsx (PART 2 - ADMIN ENGINE SPLIT)
  return (
    <div className="space-y-6 text-left select-none animate-fade-in">
      
      {/* CARD A: DYNAMIC GLOBAL TRANSMISSION BROADCAST BAR FORM PANEL */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <span className="text-xl">📢</span>
          <h2 className="font-black text-base text-gray-900 uppercase tracking-wide">Global System Broadcast Engine</h2>
        </div>
        <p className="text-xs text-gray-400 font-semibold leading-relaxed">Type your message string layout below. Clicking dispatch will automatically clone and distribute this letter straight into every registered member's mail inbox card array simultaneously.</p>
        
        <form onSubmit={handleBroadcastSubmit} className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Broadcast Topic Title / Subject</label>
            <input 
              type="text"
              value={broadcastSubject}
              onChange={(e) => setBroadcastSubject(e.target.value)}
              placeholder="e.g. Scheduled Network Server Maintenance Window 🛠️" 
              className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-xs font-semibold focus:outline-none focus:bg-white transition" 
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Broadcast Body Content Description</label>
            <textarea 
              rows={4}
              value={broadcastBody}
              onChange={(e) => setBroadcastBody(e.target.value)}
              required
              placeholder="Type rich announcement content instructions details directly here..." 
              className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 text-xs font-semibold focus:outline-none focus:bg-white transition resize-none leading-relaxed" 
            />
          </div>
          <div className="flex justify-end">
            <SubmitButton 
              label="Transmit Broadcast Alert 🚀" 
              loadingLabel="Broadcasting Array Packages..." 
              className="bg-gray-900 hover:bg-rose-500 text-white font-black text-xs px-6 py-3 rounded-xl transition shadow-sm tracking-wide" 
            />
          </div>
        </form>
      </div>

      {/* CARD B: USER ROSTER MANAGEMENT & MODERATION ACCOUNT GRID LIST */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🛡️</span>
            <h2 className="font-black text-base text-gray-900 uppercase tracking-wide">Community Member Management Directory</h2>
          </div>
          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
            {users.length} Total Accounts
          </span>
        </div>

        <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto pr-1 space-y-1">
          {users.map((profile) => (
            <div key={profile.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1 rounded-xl hover:bg-gray-50/50 transition">
              
              <div className="flex items-center space-x-3 min-w-0">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" />
                ) : (
                  <div className="w-10 h-10 bg-rose-400 text-white rounded-full flex items-center justify-center font-black text-sm uppercase shrink-0 shadow-sm">
                    {profile.displayName.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-xs text-gray-900 truncate block">{profile.displayName}</span>
                    <span className="bg-gray-100 text-gray-400 font-black text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded">
                      {profile.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold block truncate">@{profile.username}</span>
                  {profile.isBanned && (
                    <p className="text-[10px] text-red-500 font-bold mt-0.5 italic">
                      🚫 Banned: {profile.banReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Enforcement Panel Trigger Row Row */}
              <div className="flex items-center space-x-2 shrink-0 sm:justify-end">
                <Link 
                  href={`/${profile.username}`}
                  target="_blank"
                  className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 font-black text-[10px] px-3.5 py-2 rounded-xl uppercase tracking-wider transition shadow-sm"
                >
                  View Profile 👤
                </Link>
                
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleBanToggle(profile.id, profile.isBanned, profile.displayName)}
                  className={`font-black text-[10px] px-4 py-2 rounded-xl uppercase tracking-wider transition shadow-sm border ${
                    profile.isBanned 
                      ? "bg-green-50 hover:bg-green-100 text-green-600 border-green-200" 
                      : "bg-red-50 hover:bg-red-100 text-red-500 border-red-200"
                  }`}
                >
                  {profile.isBanned ? "✅ Reactivate Account" : "🚫 Ban Profile"}
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
