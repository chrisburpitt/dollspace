// src/components/SidebarNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarNavProps {
  currentUsername: string;
  unreadMailCount: number;
}

export default function SidebarNav({ currentUsername, unreadMailCount }: SidebarNavProps) {
  const pathname = usePathname();

  // Helper utility function to apply highlight classes to the active button navigation row
  const getLinkStyle = (targetPath: string) => {
    const isActive = pathname === targetPath || (targetPath !== "/" && pathname.startsWith(targetPath));
    return `px-4 py-2.5 font-bold rounded-xl text-sm transition flex items-center justify-between ${
      isActive 
        ? "bg-rose-50 text-rose-500 border border-rose-100/50 shadow-sm" 
        : "text-gray-600 hover:bg-gray-50 font-semibold"
    }`;
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm w-full">
      <nav className="flex flex-col space-y-1">
        
        <Link href="/" className={getLinkStyle("/")}>
          <span className="flex items-center space-x-2">
            <span>🏠</span>
            <span>Home Feed</span>
          </span>
        </Link>

        <Link href={`/${currentUsername}`} className={getLinkStyle(`/${currentUsername}`)}>
          <span className="flex items-center space-x-2">
            <span>👤</span>
            <span>My Profile</span>
          </span>
        </Link>

        <Link href="/chat" className={getLinkStyle("/chat")}>
          <span className="flex items-center space-x-2">
            <span>💬</span>
            <span>Messenger Lounge</span>
          </span>
        </Link>

        {/* 🚀 UPGRADED: Dynamic internal mail badge bubble indicator nested cleanly inside the sidebar navigation component */}
        <Link href="/mail" className={getLinkStyle("/mail")}>
          <span className="flex items-center space-x-2">
            <span>💌 Mailbox</span>
          </span>
          {unreadMailCount > 0 && (
            <span className="bg-rose-500 text-white font-black text-[10px] px-2 py-0.5 min-w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow-sm">
              {unreadMailCount}
            </span>
          )}
        </Link>

        <Link href="/discover" className={getLinkStyle("/discover")}>
          <span className="flex items-center space-x-2">
            <span>🔍</span>
            <span>Find Friends</span>
          </span>
        </Link>

      </nav>
    </div>
  );
}
