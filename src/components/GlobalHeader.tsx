// src/components/GlobalHeader.tsx (PART 1 - CLICK OUTSIDE UPGRADE)
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface GlobalHeaderProps {
  currentUser: {
    id: string;
    status: string;
  };
}

export default function GlobalHeader({ currentUser }: GlobalHeaderProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(currentUser.status || "ONLINE");

  // 🚀 FIXED: Initialize references to track container boundaries on screen
  const notificationRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  // 🚀 INTERCEPTOR SYSTEM: Listens globally to mouse taps and closes dropdowns if outside ref containers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // 🎯 Dropdown A Close Check: Did they click outside the notification card container?
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      // 🎯 Dropdown B Close Check: Did they click outside the status menu container?
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false);
      }
    }

    // Bind listener on mount
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind and clear listener cleanly on component dismount
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
  
  // src/components/GlobalHeader.tsx (PART 2 - EDGE ALIGNMENT SUCCESS)
  return (
    <header className="w-full h-16 bg-white border-b border-gray-200 sticky top-0 z-40 select-none">
      
      {/* 🚀 INTERNAL CONTAINER WRAPPER: Matches the max-width and edge paddings of the rest of the site perfectly! */}
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        
        {/* LEFT: Branding Core logo mark */}
        <Link href="/" className="font-black text-xl text-rose-500 tracking-tighter">
          Dollspace 👑
        </Link>

        {/* RIGHT: Menu Control Drawer Triggers Console Panel */}
        <div className="flex items-center space-x-3 relative">
          
          {/* WIDGET A: NOTIFICATION CENTER DROPDOWN BAR BUTTON */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowStatusMenu(false);
              }}
              className={`p-2.5 rounded-xl border transition relative text-sm ${
                showNotifications ? "bg-rose-50 border-rose-200 text-rose-500" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              🔔
            </button>

            {/* FLOATING RECENT ACTIVITY DRAWER CONTAINER */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl p-5 text-left animate-scale-up z-50">
                <h3 className="font-black text-xs uppercase tracking-wider text-gray-400 mb-3">Recent Activity</h3>
                <div className="py-8 text-center text-xs font-semibold text-gray-400">
                  Your notification center is clear! 🌸
                </div>
              </div>
            )}
          </div>

          {/* WIDGET B: LIVE STATUS SELECTOR DROPDOWN BUTTON */}
          <div className="relative" ref={statusMenuRef}>
            <button 
              onClick={() => {
                setShowStatusMenu(!showStatusMenu);
                setShowNotifications(false);
              }}
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

            {/* DYNAMIC SELECTION ROSTER DROPDOWN PANEL */}
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

        {/* LOGOUT SECURE ACTION LINK TRIGGER BUTTON */}
        <Link 
          href="/logout" 
          className="bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-500 border border-gray-200/80 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition shadow-sm"
        >
          Logout
        </Link>

        </div>
      </div>
    </header>
  );
}
