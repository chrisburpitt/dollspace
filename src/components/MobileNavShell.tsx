// src/components/MobileNavShell.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileNavShellProps {
  currentUsername: string;
  unreadMailCount: number;
}

export default function MobileNavShell({ currentUsername, unreadMailCount }: MobileNavShellProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Core platform links mapped to their emojis and paths
  const navLinksArray = [
    { label: "🏠 Home Feed", path: "/" },
    { label: "👑 My Profile", path: `/${currentUsername}` },
    { label: "💬 Chat Lounge", path: "/chat" },
	{ label: "💌 Mailbox", path: "/mail" },
    { label: "🔔 Activity Notifications", path: "/notifications" },
    { label: "⚙️ Settings", path: "/settings" },
  ];

  return (
    <div className="block lg:hidden select-none">
      
      {/* 📱 1. THE FLOATING BOTTOM ACTION BAR: Thumb-friendly controls pinned to the bottom of viewports */}
      <div className="fixed bottom-4 left-4 right-4 h-14 bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-xl flex items-center justify-around px-4 z-40">
        <Link href="/" className={`text-xl transition ${pathname === "/" ? "scale-110 text-rose-500" : "text-gray-400"}`}>🏠</Link>
		<Link href={`/${currentUsername}`} className={`text-xl transition ${pathname === `/${currentUsername}` ? "scale-110 text-rose-500" : "text-gray-400"}`}>👑</Link>
        <Link href="/chat" className={`text-xl relative transition ${pathname.startsWith("/chat") ? "scale-110 text-rose-500" : "text-gray-400"}`}>
          <span>💬</span>
          {unreadMailCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
              {unreadMailCount}
            </span>
          )}
        </Link>
        
        {/* Toggle Hamburger button trigger line */}
        <button 
          type="button" 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className={`text-xl font-bold transition focus:outline-none ${isMenuOpen ? "text-rose-500 rotate-90" : "text-gray-400"}`}
        >
          {isMenuOpen ? "✕" : "✨"}
        </button>
      </div>

      {/* 📱 2. SLIDE-UP DRAWER INTERACTIVE MENU PANEL OVERLAY */}
      {isMenuOpen && (
        <div 
          onClick={(e) => e.target === e.currentTarget && setIsMenuOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 flex items-end justify-center animate-fade-in cursor-pointer"
        >
          <div className="bg-white rounded-t-3xl w-full p-6 pb-24 border-t border-gray-100 shadow-2xl animate-scale-up cursor-default space-y-4 max-w-md">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-2" onClick={() => setIsMenuOpen(false)} />
            <h4 className="font-black text-xs uppercase text-gray-400 tracking-widest text-center">Dollspace Navigation Menu</h4>
            
            <div className="grid grid-cols-1 gap-2.5 pt-2">
              {navLinksArray.map((link) => {
                const isCurrentActive = pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`p-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-center border transition shadow-sm ${
                      isCurrentActive
                        ? "bg-rose-500 text-white border-rose-600"
                        : "bg-gray-50 text-gray-600 border-gray-200/60 hover:bg-gray-100"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
