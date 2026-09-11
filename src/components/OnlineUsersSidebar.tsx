// src/components/OnlineUsersSidebar.tsx
"use client";

import Link from "next/link";

interface OnlineUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  status: string;
}

interface OnlineUsersSidebarProps {
  users: OnlineUser[];
}

export default function OnlineUsersSidebar({ users }: OnlineUsersSidebarProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-left select-none animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-xs text-gray-900 tracking-wider uppercase flex items-center space-x-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span>Dolls Online Now</span>
        </h3>
        <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-2 py-0.5 rounded-full">
          {users.length} Active
        </span>
      </div>

      {users.length === 0 ? (
        <p className="text-gray-400 text-xs italic py-2 text-center">No other dolls online just yet 🌸</p>
      ) : (
        <div className="space-y-3">
          {users.map((doll) => (
            <Link 
              key={doll.id} 
              href={`/${doll.username}`}
              className="flex items-center space-x-3 p-1 rounded-xl hover:bg-gray-50 transition group block"
            >
              {/* Avatar Frame with Live Indicator Status Overlay */}
              <div className="relative shrink-0">
                {doll.avatarUrl ? (
                  <img src={doll.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-100 shadow-sm" />
                ) : (
                  <div className="w-9 h-9 bg-rose-400 text-white rounded-full flex items-center justify-center font-black text-xs uppercase shadow-sm">
                    {doll.displayName.charAt(0)}
                  </div>
                )}
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ${
                  doll.status === "ONLINE" ? "bg-green-500" :
                  doll.status === "AWAY" ? "bg-amber-400" : "bg-red-500"
                }`} />
              </div>

              {/* User Handle Metrics text rows */}
              <div className="min-w-0 flex-1">
                <h4 className="font-black text-xs text-gray-900 group-hover:underline truncate leading-tight">
                  {doll.displayName}
                </h4>
                <span className="text-[10px] text-gray-400 font-bold block truncate">
                  @{doll.username}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
