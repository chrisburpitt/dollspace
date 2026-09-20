// src/components/GlobalHeader.tsx (REFACTORED WITH DEDICATED NOTIFICATIONS DROPDOWN)
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InlineNotificationDropdown from "./InlineNotificationDropdown"; // 🚀 Imported below

interface GlobalHeaderProps {
  currentUser: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    status: string;
  };
  notifications: any[]; // 🚀 Incoming data stream passed straight from your page.tsx layout
}

export default function GlobalHeader({ currentUser, notifications = [] }: GlobalHeaderProps) {
  const router = useRouter();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(currentUser.status || "ONLINE");

  const statusMenuRef = useRef<HTMLDivElement>(null);

  // INTERCEPTOR SYSTEM: Handles status selection drops checks
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
    try {
      await fetch("/api/user/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } catch (err) {
      console.error("Status state push failed:", err);
    }
  };
  
  return (
    <header className="w-full h-16 bg-white border-b border-gray-200 sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        
        {/* LEFT: Branding Core logo mark */}
        <Link href="/" className="font-black text-xl text-rose-500 tracking-tighter">
          Dollspace 👑
        </Link>

        {/* RIGHT: Menu Control Drawer Triggers */}
        <div className="flex items-center space-x-3 relative">
          
          {/* 🚀 WIDGET A: NOTIFICATION INLINE MODULE OVERLAY */}
          {/* Visible ONLY on desktop screens (hidden lg:block). Mobile users use the /notifications route path via crown navigation menu tray */}
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
              className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-black text-gray-700 hover:bg-gray-50 transition shadow-sm"
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
              <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-xl p-1 animate-scale-up z-50 divide-y divide-gray-50 text-left">
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
                    className={`w-full px-4 py-2.5 text-left text-xs font-black transition flex items-center space-x-2.5 ${
                      currentStatus === item.key ? "bg-rose-50 text-rose-500 font-extrabold" : "text-gray-600 hover:bg-gray-50 hover:text-rose-600"
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
          <Link 
            href="/logout" 
            className="bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-500 border border-gray-200/80 rounded-xl px-4 py-2 text-xs font-black tracking-wider transition shadow-sm"
          >
            Logout
          </Link>

        </div>
      </div>
    </header>
  );
}
