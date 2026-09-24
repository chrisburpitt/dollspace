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
    isDarkMode?: boolean; // 🎯 Ensure dynamic preference hydration mapping passes down
  };
  notifications?: any[];
  onStatusChange?: (newStatus: string) => void; 
}

export default function GlobalHeader({ currentUser, notifications = [], onStatusChange }: GlobalHeaderProps) {
  const router = useRouter();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(currentUser?.status || "ONLINE");
  
  useEffect(() => {
    if (currentUser?.status) {
      setCurrentStatus(currentUser.status);
    }
  }, [currentUser?.status]);

  // 🚀 THE THEME UNLOCK HYDRATION ENGINE:
  // Intercepts the user preference variables live in the client viewport browser memory!
  // This physically overrides stuck Vercel layout caches, manually ripping away the 'dark' 
  // class identifier token from your HTML node elements the exact millisecond the switch drops!
  useEffect(() => {
    if (!currentUser) return;
    
    // Check if dark mode evaluates to true on the database record
    const shouldBeDark = currentUser.isDarkMode === true;
    
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [currentUser?.isDarkMode]);

  const statusMenuRef = useRef<HTMLDivElement>(null);
  const normalizedUserRole = currentUser?.role?.toUpperCase() || "";

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
    
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
	
    try {
      await updateUserStatusAction(newStatus);
      router.refresh();
    } catch (err) {
      console.error("Status state push action failed:", err);
    }
  };

  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 py-4 px-6 shadow-sm sticky top-0 z-50 transition-colors duration-300 text-left">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        
        {/* LEFT: Branding Core logo mark */}
        <Link href="/" className="font-black text-xl text-rose-500 tracking-tighter hover:scale-[1.01] transition">
          Dollspace <span className="text-gray-900 dark:text-white transition-colors duration-300">👑</span>
        </Link>

        {/* RIGHT: Menu Control Drawer Triggers */}
        <div className="flex items-center space-x-3 relative">
          
          {/* ADMINISTRATIVE ICON LINK */}
          {(normalizedUserRole === "ADMIN" || normalizedUserRole === "MODERATOR") && (
            <Link
              href="/admin"
              className="p-2.5 rounded-xl border border-purple-200 text-purple-600 bg-purple-50 hover:bg-purple-100 transition text-sm flex items-center justify-center shadow-xs animate-scale-up cursor-pointer"
              title="Admin Command Panel"
            >
              <span>🛡️</span>
            </Link>
          )}
          
          {/* WIDGET A: NOTIFICATION CENTER DROPDOWN BAR BUTTON */}
          <div className="hidden lg:block relative">
            <InlineNotificationDropdown 
              currentUserId={currentUser.id} 
              notifications={notifications} 
            />
          </div>

          {/* WIDGET B: LIVE STATUS SELECTOR DROPDOWN BUTTON */}
          <div className="relative" ref={statusMenuRef}>
            <button 
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="flex items-center space-x-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-xs font-black text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition shadow-sm cursor-pointer"
			>
              <span>
                {currentStatus === "ONLINE" && "🟢"}
                {currentStatus === "AWAY" && "🟡"}
                {currentStatus === "BUSY" && "🔴"}
                {currentStatus === "OFFLINE" && "⚫"}
              </span>
              <span className="capitalize">{currentStatus.toLowerCase().replace("_", " ")}</span>
              <span className="text-[10px] text-gray-400">▼</span>
            </button>

            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl p-1 animate-scale-up z-50 divide-y divide-gray-50 dark:divide-gray-900 text-left">
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
                        ? "bg-rose-50 dark:bg-rose-950/30 text-rose-500 font-extrabold" 
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-rose-600"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* LOGOUT SECURE ACTION LINK TRIGGER */}
          <button 
            type="button"
            onClick={async () => {
              await logoutUser();
            }}
            className="bg-gray-50 dark:bg-gray-950 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-600 dark:text-gray-400 hover:text-red-500 border border-gray-200/80 dark:border-gray-800 rounded-xl px-4 py-2 text-xs font-black tracking-wider transition shadow-sm cursor-pointer"
		  >
            Logout
          </button>

        </div>
      </div>
    </header>
  );
}
