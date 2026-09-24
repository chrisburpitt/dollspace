"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarNavProps {
  currentUsername: string;
  unreadMailCount: number;
}

export default function SidebarNav({ currentUsername, unreadMailCount }: SidebarNavProps) {
  const pathname = usePathname();

  // Helper utility function to apply native pink highlight states to the active page row
  const getLinkStyle = (targetPath: string) => {
    const isActive = pathname === targetPath || (targetPath !== "/" && pathname.startsWith(targetPath));
    return `px-4 py-2.5 font-black rounded-xl text-sm uppercase tracking-wider transition-all duration-200 hover:scale-[1.01] flex items-center justify-between ${
      isActive 
        ? "bg-rose-50 text-rose-500 border border-rose-100/60 shadow-xs" 
        : "text-gray-500 hover:bg-rose-50/50 hover:text-rose-500 font-bold"
    }`;
  };

  return (
    // 🚀 PURE LIGHT MODE PLATFORM SLATE: 
    // Completely strips out all 'dark:' tokens so this column always stays a pristine, gorgeous light panel layout!
    <div className="bg-white border border-rose-100 rounded-3xl p-5 text-gray-900 shadow-sm space-y-2 text-left transition-all duration-300">
      <nav className="flex flex-col space-y-1">
        
        <Link href="/" className={getLinkStyle("/")}>
          <span className="flex items-center space-x-2">
            <span>🏠 Home Feed</span>
          </span>
        </Link>

        <Link href={`/${currentUsername}`} className={getLinkStyle(`/${currentUsername}`)}>
          <span className="flex items-center space-x-2">
            <span>👑 My Profile</span>
          </span>
        </Link>

        <Link href="/chat" className={getLinkStyle("/chat")}>
          <span className="flex items-center space-x-2">
            <span>💬 Chat Lounge</span>
          </span>
        </Link>

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
            <span>🔍 Find Friends</span>
          </span>
        </Link>

        <Link href="/settings" className={getLinkStyle("/settings")}>
          <span className="flex items-center space-x-2">
            <span>⚙️ Settings</span>
          </span>
        </Link>
		
      </nav>
    </div>
  );
}
