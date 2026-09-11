// src/app/discover/DiscoverDashboardClient.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { searchDollsRegistry } from "@/app/actions/search";
import Link from "next/link";

export default function DiscoverDashboardClient({ currentUserId }: { currentUserId: string }) {
  const [isPending, startTransition] = useTransition();
  const [registryUsers, setRegistryUsers] = useState<any[]>([]);

  // Search filter configuration states
  const [textQuery, setTextQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [lookingFilter, setLookingFilter] = useState("ALL");

  const runRegistrySearch = () => {
    const payload = {
      query: textQuery.trim() || undefined,
      genderIdentity: genderFilter !== "ALL" ? genderFilter : undefined,
      lookingFor: lookingFilter !== "ALL" ? lookingFilter : undefined
    };

    startTransition(async () => {
      const res = await searchDollsRegistry(payload);
      if (res?.success && res.users) {
        setRegistryUsers(res.users);
      }
    });
  };

  // Automatically trigger search passes when dropdown filters flip
  useEffect(() => {
    runRegistrySearch();
  }, [genderFilter, lookingFilter]);

  return (
    <div className="space-y-6 text-left animate-fade-in select-none">
      
      {/* 🛠️ SEARCH FILTER DECK PANEL */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="font-black text-base text-gray-900 uppercase tracking-wide">Registry Search & Filter</h2>
        
        {/* Live Handle Keywords Input Console */}
        <div className="flex gap-2">
          <input
            type="text"
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runRegistrySearch()}
            placeholder="Search by profile display name or unique handle username... (Press Enter)"
            className="flex-1 border border-gray-200 rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-400 text-xs font-semibold text-gray-800 transition"
          />
          <button 
            onClick={runRegistrySearch}
            className="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs px-6 py-3 rounded-xl transition shadow-sm tracking-wide"
          >
            Find
          </button>
        </div>

        {/* Dynamic Trait Selectors Matrix Dropdowns Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 tracking-wider">Gender Identity</label>
            <select 
              value={genderFilter} 
              onChange={(e) => setGenderFilter(e.target.value)} 
              className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-bold text-gray-700 focus:outline-none"
            >
              <option value="ALL">✨ All Identities</option>
              <option value="FEMALE">🚺 Female</option>
              <option value="MALE">🚹 Male</option>
              <option value="NON_BINARY">⚧️ Non-Binary</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 tracking-wider">Looking For</label>
            <select 
              value={lookingFilter} 
              onChange={(e) => setLookingFilter(e.target.value)} 
              className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-bold text-gray-700 focus:outline-none"
            >
              <option value="ALL">🌟 Anything</option>
              <option value="FRIENDSHIP">👥 Friendship</option>
              <option value="DATING">❤️ Dating</option>
              <option value="NETWORKING">💼 Networking</option>
            </select>
          </div>
        </div>
      </div>

      {/* 📇 PROFILE DIRECTORY REGISTRY CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isPending ? (
          <div className="col-span-full py-20 text-center font-bold text-gray-400 uppercase tracking-widest text-xs animate-pulse">
            Scanning Platform Frequencies...
          </div>
        ) : registryUsers.length === 0 ? (
          <div className="col-span-full bg-white border border-dashed border-gray-200 p-16 rounded-3xl text-center text-gray-400 shadow-sm">
            <span className="text-3xl block mb-2">🔍</span>
            <p className="font-bold text-sm">No member accounts matched your filters.</p>
            <p className="text-xs mt-0.5">Try widening your text search phrase criteria!</p>
          </div>
        ) : (
          registryUsers.map((user) => (
            <div key={user.id} className="bg-white border border-gray-200 p-5 rounded-3xl shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4 animate-scale-up relative overflow-hidden">
              
              <div className="flex items-start space-x-3">
                {/* User Avatar Circle Frame Frame */}
                <div className="relative shrink-0 select-none">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 bg-rose-400 text-white rounded-full flex items-center justify-center font-black text-sm uppercase shadow-sm">
                      {user.displayName.charAt(0)}
                    </div>
                  )}
                  {/* Native Live Status Matrix Indicator Overlays */}
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                    user.status === "ONLINE" ? "bg-green-500" :
                    user.status === "AWAY" ? "bg-amber-400" :
                    user.status === "BUSY" ? "bg-red-500" : "bg-gray-400"
                  }`} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-black text-sm text-gray-900 block truncate leading-tight">{user.displayName}</h3>
                  <span className="text-[10px] text-gray-400 font-bold block truncate">@{user.username}</span>
                  {user.location && <span className="text-[10px] text-gray-500 font-medium block mt-1">📍 {user.location}</span>}
                </div>
              </div>

              {/* Badges row displaying gender and looking for criteria lists */}
              <div className="flex flex-wrap gap-1 text-[9px] font-black uppercase tracking-wide">
                {user.genderIdentity && <span className="bg-rose-50 text-rose-500 px-2 py-0.5 rounded-md border border-rose-100">{user.genderIdentity.replace(/_/g, ' ')}</span>}
                {user.lookingFor && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">🔍 {user.lookingFor.replace(/_/g, ' ')}</span>}
              </div>

              {/* Bottom footer linking action line row */}
              <div className="border-t border-gray-50 pt-3 flex items-center justify-between mt-1">
                <span className="text-[9px] font-bold text-gray-400 block tracking-wide">
                  Doll since: {new Date(user.createdAt).toLocaleDateString('en-AU', { dateStyle: 'short' })}
                </span>
                <Link 
                  href={`/${user.username}`} 
                  className="bg-gray-900 hover:bg-rose-500 text-white font-black text-[10px] px-3.5 py-2 rounded-xl uppercase tracking-wider transition shadow-sm"
                >
                  View Profile 👤
                </Link>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
