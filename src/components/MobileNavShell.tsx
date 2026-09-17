// src/components/MobileNavShell.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileNavShellProps {
  currentUsername: string;
  unreadMailCount: number;
}

export default function MobileNavShell({ currentUsername, unreadMailCount }: MobileNavShellProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // Core platform links mapped to their exact clean matching strings
  const navLinksArray = [
    { label: "🏠 Main Feed", path: "/" },
    { label: "👑 Profile", path: `/${currentUsername}` },
    { label: "💬 Chat", path: "/chat" },
    { label: "💌 Mail", path: "/mail" },
    { label: "🔔 Notifications", path: "/notifications" },
    { label: "⚙️ Settings", path: "/settings" },
  ];

  // 🚀 OUTSIDE CLICK TRACKER: Smoothly closes the crown tray if user taps on the main dashboard feed
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isMenuOpen]);

  return (
    <div ref={menuContainerRef} className="block lg:hidden select-none fixed bottom-6 left-6 z-50">
      
      {/* 📱 1. VIRTUAL POP-UP MENU PANEL: Slides up elegantly right above the crown anchor bubble */}
      {isMenuOpen && (
        <div className="absolute left-0 bottom-16 w-56 bg-white border border-gray-200/90 rounded-2xl shadow-2xl p-2.5 animate-scale-up border-b-2 flex flex-col gap-1">
          <div className="px-3 py-1.5 border-b border-gray-50 mb-1">
            <span className="font-black text-[10px] uppercase text-gray-400 tracking-widest block text-left">
              Dollspace Menu
            </span>
          </div>

          {navLinksArray.map((link) => {
            // Evaluates matching states or sub-route structures (e.g. nested /chat paths)
            const isCurrentActive = link.path === "/" 
              ? pathname === "/" 
              : pathname.startsWith(link.path);

            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide text-left flex items-center justify-between transition group ${
                  isCurrentActive
                    ? "bg-rose-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-rose-500"
                }`}
              >
                <span>{link.label}</span>
                
                {/* 🚀 MAIL COUNT COMPATIBILITY INDICATOR: Appends live alerts to your mailbox text row dynamically */}
                {link.path === "/mail" && unreadMailCount > 0 && (
                  <span className={`text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center tracking-normal ${
                    isCurrentActive ? "bg-white text-rose-500" : "bg-rose-500 text-white animate-pulse"
                  }`}>
                    {unreadMailCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* 📱 2. FLOATING ACTION ICON BUBBLE: Singular crown badge pinned to the lower left corner */}
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl relative transition duration-300 active:scale-90 border focus:outline-none border-b-2 transform ${
          isMenuOpen
            ? "bg-rose-500 border-rose-600 text-white scale-105 rotate-12"
            : "bg-rose-50 border-gray-200 text-amber-500 hover:bg-gray-50"
        }`}
      >
        <span>👑</span>
        
        {/* Unread Alert Node Overlay: Placed on the button hub if the panel is collapsed */}
        {!isMenuOpen && unreadMailCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse border border-white">
            {unreadMailCount}
          </span>
        )}
      </button>

    </div>
  );
}
