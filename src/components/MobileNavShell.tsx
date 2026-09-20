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

  // 🚀 FIXED: ASYNCHRONOUS MUTATION OBSERVER DEEPLINK SCANNER ENGINE
  // Listens globally to hash strings and handles deferred scrolling triggers once database rows stream into view
  useEffect(() => {
    let observerInstance: MutationObserver | null = null;
    let fallbackTimeout: NodeJS.Timeout | null = null;

    function executeSmoothScrollToPost() {
      const activeHashToken = window.location.hash;
      if (!activeHashToken) return false;

      const sanitizedIdElement = activeHashToken.replace("#", "");
      const targetedPostDomNode = document.getElementById(sanitizedIdElement);

      // If the post card exists in the DOM tree, execute the smooth slide down!
      if (targetedPostDomNode) {
        // Clear any ongoing loops or observers cleanly
        if (observerInstance) observerInstance.disconnect();
        if (fallbackTimeout) clearTimeout(fallbackTimeout);

        setTimeout(() => {
          targetedPostDomNode.scrollIntoView({
            behavior: "smooth",
            block: "center", // Perfectly centers the targeted card on smartphone displays
          });
          
          // Flash accent feedback line to draw focus onto the update item card container
          targetedPostDomNode.classList.add("ring-4", "ring-rose-400", "duration-500", "transition-all");
          setTimeout(() => {
            targetedPostDomNode.classList.remove("ring-4", "ring-rose-400");
          }, 2000);
        }, 100);

        return true; // Success!
      }
      return false; // Element not spawned yet
    }

    // 1. Initial Attempt: Check if the element is already rendered on screen
    const handledInstantly = executeSmoothScrollToPost();

    // 2. Background Observer: If the element hasn't loaded yet, watch the document body for changes
    if (!handledInstantly && window.location.hash) {
      observerInstance = new MutationObserver(() => {
        const structuralCheckSuccess = executeSmoothScrollToPost();
        // Once found and scrolled, disconnect the observer to maximize phone battery and performance
        if (structuralCheckSuccess && observerInstance) {
          observerInstance.disconnect();
        }
      });

      // Command the observer engine to monitor all incoming React streamed data nodes
      observerInstance.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Safety Fallback: Automatically cancel lookup after 4 seconds if the post was deleted or missing
      fallbackTimeout = setTimeout(() => {
        if (observerInstance) observerInstance.disconnect();
      }, 4000);
    }

    // Bind event hooks to pick up live clicks from the desktop header bar dropdown links too
    window.addEventListener("hashchange", executeSmoothScrollToPost);
    return () => {
      window.removeEventListener("hashchange", executeSmoothScrollToPost);
      if (observerInstance) observerInstance.disconnect();
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
    };
  }, [pathname, searchParams]);


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
