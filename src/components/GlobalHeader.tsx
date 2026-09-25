"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InlineNotificationDropdown from "./InlineNotificationDropdown";
import { logoutUser } from "@/app/actions/auth"; 
import { updateUserStatusAction } from "@/app/actions/presence"; 

interface GlobalHeaderProps {
  currentUser: {
    id: string;
    status: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string | null;
    role?: string; 
  };
  notifications?: any[];
  onStatusChange?: (newStatus: string) => void; 
}

export default function GlobalHeader({ currentUser, notifications = [], onStatusChange }: GlobalHeaderProps) {
  const router = useRouter();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(currentUser?.status || "ONLINE");
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const normalizedUserRole = currentUser?.role?.toUpperCase() || "";

  useEffect(() => {
    if (currentUser?.status) {
      setCurrentStatus(currentUser.status);
    }
  }, [currentUser?.status]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusChange = async (newStatus: string) => {
    setCurrentStatus(newStatus);
    setShowStatusMenu(false);
    if (onStatusChange) onStatusChange(newStatus);
	
    try {
      await updateUserStatusAction(newStatus);
      router.refresh();
    } catch (err) {
      console.error("Status state push action failed:", err);
    }
  };

  return (
    <header className="w-full bg-white border-b border-rose-100 text-gray-900 py-3 px-2 sm:px-6 shadow-sm sticky top-0 z-50 text-left transition-all duration-300">
      <div className="max-w-7xl mx-auto h-full px-2 sm:px-6 flex items-center justify-between gap-1.5 sm:gap-3">
      
        {/* LEFT BRANDING: Pushed beautifully toward the left border edge on phones */}
        <Link href="/" className="font-black text-lg sm:text-xl text-rose-500 tracking-tighter hover:scale-[1.02] transition active:scale-95 duration-200 shrink-0">
          Dollspace 👑
        </Link>

        {/* RIGHT ACTIONS MODULE: Gains maximum room to keep status buttons and logout text items linear */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 relative shrink-0">
          
          {/* STAFF Command Portal Link */}
          {(normalizedUserRole === "ADMIN" || normalizedUserRole === "MODERATOR") && (
            <Link
              href="/admin"
              className="p-2.5 rounded-xl border border-purple-200 text-purple-600 bg-purple-50 hover:bg-purple-100 transition text-sm flex items-center justify-center shadow-xs animate-scale-up cursor-pointer"
              title="Admin Command Panel"
            >
              <span>🛡️</span>
            </Link>
          )}
          
          {/* Notification Button Module Component */}
          <div className="hidden lg:block relative">
            <InlineNotificationDropdown 
              currentUserId={currentUser.id} 
              notifications={notifications} 
            />
          </div>

          {/* DYNAMIC PRESENTATION SELECTOR BUTTON */}
          <div className="relative" ref={statusMenuRef}>
            <button 
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="flex items-center space-x-2 bg-rose-50/40 border border-rose-100 rounded-xl px-4 py-2 text-xs font-black text-gray-700 hover:bg-rose-50 transition shadow-xs cursor-pointer"
			>
              <span>
                {currentStatus === "ONLINE" && "🟢"}
                {currentStatus === "AWAY" && "🟡"}
                {currentStatus === "BUSY" && "🔴"}
                {currentStatus === "OFFLINE" && "⚫"}
              </span>
              <span className="capitalize font-extrabold text-rose-600">{currentStatus.toLowerCase().replace("_", " ")}</span>
              <span className="text-[10px] text-rose-300">▼</span>
            </button>

            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-rose-100 rounded-xl shadow-xl p-1 animate-scale-up z-50 divide-y divide-rose-50 text-left">
                {[
                  { key: "ONLINE", icon: "🟢", label: "Online" },
                  { key: "AWAY", icon: "🟡", label: "Away" },
                  { key: "BUSY", icon: "🔴", label: "Busy" },
                  { key: "OFFLINE", icon: "⚫", label: "Appear Offline" }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleStatusChange(item.key)}
                    className={`w-full px-4 py-2.5 text-left text-xs font-black transition flex items-center space-x-2.5 cursor-pointer ${
                      currentStatus === item.key 
                        ? "bg-rose-50 text-rose-500 font-extrabold" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-rose-600"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SECURE LOGOUT CONTROL LINK */}
          <button 
            type="button"
            onClick={async () => { await logoutUser(); }}
            className="bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-xl px-4 py-2 text-xs font-black tracking-wider transition shadow-xs cursor-pointer"
		  >
            Logout
          </button>

        </div>
      </div>
    </header>
  );
}
