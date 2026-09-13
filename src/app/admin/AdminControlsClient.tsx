// src/app/admin/AdminControlsClient.tsx (PART 1 - FIXED ADMIN INTERFACE CONTROLS)
"use client";

import { useState, useTransition } from "react";
import { banUserProfile, unbanUserProfile, dispatchGlobalSystemBroadcast } from "@/app/actions/moderation";
import SubmitButton from "@/components/SubmitButton";
import Link from "next/link";

interface AdminControlsClientProps {
  initialUsers: any[];
  currentUserId: string; // 🚀 FIXED: Added missing typesafe id tracker string to interface props mapping
}

export default function AdminControlsClient({ initialUsers, currentUserId }: AdminControlsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [users, setUsers] = useState<any[]>(initialUsers);
  
  // Broadcast Input States
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");

  const handleBanToggle = (userId: string, currentBanState: boolean, name: string) => {
    if (userId === currentUserId) return; // Guard safe block
    
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


  // src/app/admin/AdminControlsClient.tsx (PART 2 - THREE PIECE SPLIT)
  
  // 🚀 NEW INTERACTIVE EVENT HANDLERS
  const handleRoleChange = (userId: string, currentRole: string, newRole: string, name: string) => {
    if (userId === currentUserId) return; // Guard protection block
    
    // Normalise short choice strings over to system database schema enums
    const validatedSchemaEnum = newRole === "MOD" ? "MODERATOR" : (newRole as "USER" | "ADMIN");

    if (!confirm(`🌸 Migrate authority clearance tier for ${name} from ${currentRole} to ${newRole}?`)) return;

    startTransition(async () => {
      const { administrativeUpdateUserRole } = await import("@/app/actions/moderation");
      const res = await administrativeUpdateUserRole(userId, validatedSchemaEnum);
      if (res.success) {
        setUsers((prev) => prev.map(u => u.id === userId ? { ...u, role: validatedSchemaEnum } : u));
        alert(`🌸 ${name} has been successfully migrated to role tier: ${newRole}!`);
      } else if (res.error) {
        alert(res.error);
      }
    });
  };

  const handleFullAccountPurgeClick = (userId: string, name: string) => {
    if (!confirm(`🚨 CRITICAL ACTION: Are you absolutely certain you want to PERMANENTLY DELETE ${name}'s entire profile?\n\nThis will instantly purge all their posts, photos, messages, and albums completely from Dollspace forever.`)) return;

    startTransition(async () => {
      const { administrativeDeleteUser } = await import("@/app/actions/moderation");
      const res = await administrativeDeleteUser(userId);
      if (res.success) {
        setUsers((prev) => prev.filter(u => u.id !== userId));
        alert(`🗑️ ${name}'s account data records have been completely purged from the core cluster database.`);
      } else if (res.error) {
        alert(res.error);
      }
    });
  };

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


      {/* src/app/admin/AdminControlsClient.tsx (PART 3 - THREE PIECE SPLIT) */}
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

        <div className="divide-y divide-gray-100 max-h-[550px] overflow-y-auto pr-1 space-y-2">
          {users.map((profile) => {
            const isSelf = profile.id === currentUserId;
            const mappedRoleDisplay = profile.role === "MODERATOR" ? "MOD" : profile.role;

            return (
              <div key={profile.id} className="py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-2 rounded-2xl hover:bg-gray-50/60 transition border border-transparent hover:border-gray-100/50">
                
                {/* MEMBER DETAILS LEFT BLOCK */}
                <div className="flex items-center space-x-3 min-w-0">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 bg-rose-400 text-white rounded-full flex items-center justify-center font-black text-sm uppercase shrink-0 shadow-sm">
                      {profile.displayName.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 text-left">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-black text-xs text-gray-900 truncate block leading-none">{profile.displayName}</span>
                      <span className={`font-black text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm border ${
                        profile.role === "ADMIN" ? "bg-purple-50 text-purple-600 border-purple-100" :
                        profile.role === "MODERATOR" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-gray-50 text-gray-400 border-gray-100"
                      }`}>
                        {mappedRoleDisplay}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold block truncate mt-0.5">@{profile.username}</span>
                    {profile.isBanned && (
                      <p className="text-[10px] text-red-500 font-bold mt-1 italic leading-none">
                        🚫 Banned: {profile.banReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* ADMINISTRATIVE CONTROLS CONTROLLER TOOLBAR ACTIONS */}
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  
                  {/* LIVE ROLE MIGRATION DROPDOWN SELECT ENGINE */}
                  <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1.5 rounded-xl border border-gray-100 shadow-inner">
                    <span className="text-[9px] uppercase font-black text-gray-400 pl-1 tracking-wider">Role:</span>
                    <select
                      value={mappedRoleDisplay}
                      disabled={isPending || isSelf}
                      onChange={(e) => handleRoleChange(profile.id, mappedRoleDisplay, e.target.value, profile.displayName)}
                      className="bg-transparent text-xs font-black text-gray-700 focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="USER">User</option>
                      <option value="MOD">Mod</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  <Link 
                    href={`/${profile.username}`}
                    target="_blank"
                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-black text-[10px] px-3 py-2 rounded-xl uppercase tracking-wider transition shadow-sm"
                  >
                    View 👤
                  </Link>
                  
                  <button
                    type="button"
                    disabled={isPending || isSelf}
                    onClick={() => handleBanToggle(profile.id, profile.isBanned, profile.displayName)}
                    className={`font-black text-[10px] px-3 py-2 rounded-xl uppercase tracking-wider transition shadow-sm border ${
                      isSelf ? "hidden" :
                      profile.isBanned 
                        ? "bg-green-50 hover:bg-green-100 text-green-600 border-green-200" 
                        : "bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200"
                    }`}
                  >
                    {profile.isBanned ? "Unban" : "Ban"}
                  </button>

                  {/* HARD PERMANENT INSTANT USER DIRECTORY ACCOUNT PURGE BUTTON */}
                  <button
                    type="button"
                    disabled={isPending || isSelf}
                    onClick={() => handleFullAccountPurgeClick(profile.id, profile.displayName)}
                    className={`font-black text-[10px] px-3 py-2 rounded-xl uppercase tracking-wider transition shadow-sm border bg-red-50 hover:bg-red-500 hover:text-white text-red-500 border-red-100 hover:border-red-600 ${
                      isSelf ? "hidden" : "block"
                    }`}
                  >
                    Purge 🗑️
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
