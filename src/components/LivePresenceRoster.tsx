// src/components/LivePresenceRoster.tsx
"use client";

import Link from "next/link";

interface ActiveChatter {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

interface LivePresenceRosterProps {
  activeUsers: ActiveChatter[];
}

export default function LivePresenceRoster({ activeUsers }: LivePresenceRosterProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4 text-left h-fit">
      
      {/* Dynamic Header Metrics row */}
      <div className="flex items-center justify-between border-b border-gray-50 pb-3">
        <div className="flex items-center space-x-2">
          <h3 className="font-black text-sm text-gray-900 tracking-wide uppercase">Active Dolls</h3>
          <span className="bg-rose-50 text-rose-500 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse border border-rose-100 shadow-sm">
            LIVE LOUNGE
          </span>
        </div>
        <span className="text-xs font-bold text-gray-400">
          {activeUsers.length} Online
        </span>
      </div>

      {/* Roster list flow mapping node loops */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {activeUsers.length === 0 ? (
          <p className="text-xs text-gray-400 font-medium italic">Scanning lounge frequencies...</p>
        ) : (
          activeUsers.map((doll) => (
            <Link 
              key={doll.id}
              href={`/${doll.username}`}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-rose-50/30 border border-transparent hover:border-rose-100/40 transition group animate-fade-in"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="relative shrink-0">
                  {doll.avatarUrl ? (
                    <img src={doll.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shadow-sm border border-gray-100" />
                  ) : (
                    <div className="w-8 h-8 bg-rose-400 text-white rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                      {doll.displayName.charAt(0)}
                    </div>
                  )}
                  {/* Glowing Real-time Network Presence Dot Indicator */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white shadow-sm ring-1 ring-green-400/20"></span>
                </div>
                
                <div className="min-w-0">
                  <span className="font-black text-xs text-gray-800 block truncate group-hover:text-rose-500 transition leading-tight">
                    {doll.displayName}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold block truncate">
                    @{doll.username}
                  </span>
                </div>
              </div>

              <span className="text-[10px] text-gray-400 font-bold opacity-0 group-hover:opacity-100 transition pr-1">
                View 👤
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
