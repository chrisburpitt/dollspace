// src/components/MobileNavShell.tsx (UPGRADED WITH NATIVE ANCHOR DEEPLINK WATCHER)
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation"; // 🚀 Added navigation observers

interface MobileNavShellProps {
  currentUsername: string;
  unreadMailCount: number;
}

export default function MobileNavShell({ currentUsername, unreadMailCount }: MobileNavShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams(); // 🚀 Watches for route transitions state adjustments
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  const navLinksArray = [
    { label: "🏠 Main Feed", path: "/" },
    { label: "👑 Profile", path: `/${currentUsername}` },
    { label: "💬 Chat", path: "/chat" },
    { label: "💌 Mail", path: "/mail" },
    { label: "🔔 Notifications", path: "/notifications" },
    { label: "⚙️ Settings", path: "/settings" },
  ];

  // 🚀 CRUCIAL FIX: DEEPLINK SNAP-SCROLL WATCHER ENGINE
  // Listens directly to URL coordinate updates and forces smooth-scrolling onto matching target post elements!
  useEffect(() => {
    function scrollToCurrentHashElement() {
      const activeHashToken = window.location.hash;
      if (!activeHashToken) return;

      // Clean the string token to pull matching document element reference containers (e.g., #post-xyz -> post-xyz)
      const sanitizedIdElement = activeHashToken.replace("#", "");
      const targetedPostDomNode = document.getElementById(sanitizedIdElement);

      if (targetedPostDomNode) {
        // Wait a split-second for React to load the feed cards array cleanly on mount
        setTimeout(() => {
          targetedPostDomNode.scrollIntoView({
            behavior: "smooth",
            block: "center", // Puts the targeted post card right in the clean middle of the smartphone lens view screen area!
          });
          
          // Flash accent feedback color line animation to draw focus onto the update item card
          targetedPostDomNode.classList.add("ring-2", "ring-rose-400", "duration-500");
          setTimeout(() => {
            targetedPostDomNode.classList.remove("ring-2", "ring-rose-400");
          }, 2000);
        }, 150);
      }
    }

    // Trigger lookup instantly on component mount state loops
    scrollToCurrentHashElement();

    // Bind event hooks to pick up live clicks from the desktop header bar dropdown elements too
    window.addEventListener("hashchange", scrollToCurrentHashElement);
    return () => {
      window.removeEventListener("hashchange", scrollToCurrentHashElement);
    };
  }, [pathname, searchParams]); // 🚀 Re-fires seamlessly whenever the user switches page directories!

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
      
      {/* 📱 1. VIRTUAL POP-UP MENU PANEL */}
      {isMenuOpen && (
        <div className="absolute left-0 bottom-16 w-56 bg-white border border-gray-200/90 rounded-2xl shadow-2xl p-2.5 animate-scale-up border-b-2 flex flex-col gap-1">
          <div className="px-3 py-1.5 border-b border-gray-50 mb-1">
            <span className="font-black text-[10px] uppercase text-gray-400 tracking-widest block text-left">
              Dollspace Menu
            </span>
          </div>

          {navLinksArray.map((link) => {
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
                
                {/* MAIL COUNT COMPATIBILITY INDICATOR */}
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

      {/* 📱 2. FLOATING ACTION ICON BUBBLE */}
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
        
        {!isMenuOpen && unreadMailCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse border border-white">
            {unreadMailCount}
          </span>
        )}
      </button>

    </div>
  );
}
