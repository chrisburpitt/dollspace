// src/app/discover/DiscoverDashboardClient.tsx (PART 1 - LOCATION FILTER BARS)
"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { searchDollsRegistry } from "@/app/actions/search";
import { toggleBlockUser } from "@/app/actions/block";
import Link from "next/link";

export default function DiscoverDashboardClient({ currentUserId }: { currentUserId: string }) {
  const [isPending, startTransition] = useTransition();
  const [registryUsers, setRegistryUsers] = useState<any[]>([]);

  // Search filter configuration states
  const [textQuery, setTextQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [lookingFilter, setLookingFilter] = useState("ALL");
  
  // 🚀 NEW PROXIMITY LOCATION TRACKERS
  const [townQuery, setTownQuery] = useState("");
  const [radiusFilter, setRadiusFilter] = useState("0");

  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  const runRegistrySearch = () => {
    const payload = {
      query: textQuery.trim() || undefined,
      genderIdentity: genderFilter !== "ALL" ? genderFilter : undefined,
      lookingFor: lookingFilter !== "ALL" ? lookingFilter : undefined,
      town: townQuery.trim() || undefined,
      radiusKm: radiusFilter !== "0" ? parseInt(radiusFilter) : undefined
    };

    startTransition(async () => {
      const res = await searchDollsRegistry(payload);
      if (res?.success && res.users) {
        setRegistryUsers(res.users);
      }
    });
  };

  // Automatically refresh feed view windows whenever dropdown choices are clicked
  useEffect(() => {
    runRegistrySearch();
  }, [genderFilter, lookingFilter, radiusFilter]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
        setActiveMenuUserId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBlockClick = (targetId: string, name: string) => {
    if (!confirm(`🌸 Are you sure you want to block ${name}? They will be removed from your lists.`)) return;
    startTransition(async () => {
      await toggleBlockUser(targetId);
      setActiveMenuUserId(null);
      runRegistrySearch();
    });
  };



  // src/app/discover/DiscoverDashboardClient.tsx (PART 2 - LAYOUT OVERLAYS)
  return (
    <div className="space-y-6 text-left animate-fade-in select-none" ref={menuContainerRef}>
      
      {/* SEARCH FILTER DECK PANEL */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="font-black text-base text-gray-900 uppercase tracking-wide">Registry Search & Filter</h2>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runRegistrySearch()}
            placeholder="Search by profile display name or unique handle username... (Press Enter)"
            className="flex-1 border border-gray-200 rounded-xl p-3 bg-gray-50 focus:outline-none text-xs font-semibold text-gray-800 transition"
          />
          <button 
            onClick={runRegistrySearch}
            className="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs px-6 py-3 rounded-xl transition shadow-sm tracking-wide"
          >
            Find
          </button>
        </div>

        {/* 🚀 EXTENDED GRID: Reconfigured into a clean 4-column search control bar panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 tracking-wider">Gender Identity</label>
            <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-bold text-gray-700 focus:outline-none">
              <option value="ALL">✨ All Identities</option>
              <option value="FEMALE">🚺 Female</option>
              <option value="MALE">🚹 Male</option>
              <option value="NON_BINARY">⚧️ Non-Binary</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 tracking-wider">Looking For</label>
            <select value={lookingFilter} onChange={(e) => setLookingFilter(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-bold text-gray-700 focus:outline-none">
              <option value="ALL">🌟 Anything</option>
              <option value="Friends">👥 Friends</option>
              <option value="Relationship">❤️ Relationship</option>
              <option value="Chat">💬 Chat</option>
              <option value="Discovery">💼 Discovery</option>
            </select>
          </div>

          {/* 🚀 NEW TOWN INPUT PARAMETER CELL */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 tracking-wider">City / Town Name</label>
            <input
              type="text"
              value={townQuery}
              onChange={(e) => setTownQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runRegistrySearch()}
              placeholder="e.g. Brisbane"
              className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-semibold text-gray-800 focus:outline-none"
            />
          </div>

          {/* 🚀 NEW PROXIMITY RADIUS FILTER DROPDOWN */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 tracking-wider">Proximity Radius</label>
            <select value={radiusFilter} onChange={(e) => setRadiusFilter(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 bg-gray-50 text-xs font-bold text-gray-700 focus:outline-none">
              <option value="0">🌐 Everywhere Global</option>
              <option value="10">📍 Within 10 KMs</option>
              <option value="25">📍 Within 25 KMs</option>
              <option value="50">📍 Within 50 KMs</option>
              <option value="100">📍 Within 100 KMs</option>
            </select>
          </div>
        </div>
      </div>

      {/* PROFILE DIRECTORY REGISTRY CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isPending ? (
          <div className="col-span-full py-20 text-center font-bold text-gray-400 uppercase tracking-widest text-xs animate-pulse">
            Scanning Platform Frequencies...
          </div>
        ) : registryUsers.length === 0 ? (
          <div className="col-span-full bg-white border border-dashed border-gray-200 p-16 rounded-3xl text-center text-gray-400 shadow-sm">
            <span className="text-3xl block mb-2">🔍</span>
            <p className="font-bold text-sm">No member accounts matched your filters.</p>
          </div>
        ) : (
          registryUsers.map((user) => (
            <div key={user.id} className="bg-white border border-gray-200 p-5 rounded-3xl shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4 relative overflow-visible animate-scale-up group">
              
              {/* 🚀 NEW PROXIMITY GEOTAG BADGE BULB LAYER OVERLAY */}
              {user.distanceAway !== undefined && user.distanceAway !== null && (
                <span className="absolute top-3.5 right-12 bg-rose-50 text-rose-500 font-black text-[8px] px-2 py-0.5 rounded-md border border-rose-100 uppercase tracking-wide">
                  📍 {user.distanceAway} KM AWAY
                </span>
              )}

              <div className="flex items-start justify-between space-x-2">
                <div className="flex items-start space-x-3 min-w-0">
                  <div className="relative shrink-0 select-none">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 bg-rose-400 text-white rounded-full flex items-center justify-center font-black text-sm uppercase shadow-sm">
                        {user.displayName.charAt(0)}
                      </div>
                    )}
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                      user.status === "ONLINE" ? "bg-green-500" :
                      user.status === "AWAY" ? "bg-amber-400" : "bg-red-500"
                    }`} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-black text-sm text-gray-900 block truncate leading-tight">{user.displayName}</h3>
                    <span className="text-[10px] text-gray-400 font-bold block truncate">@{user.username}</span>
                    {user.location && <span className="text-[10px] text-gray-500 font-medium block mt-1 truncate max-w-full">📍 {user.location.split(",")[0]}</span>}
                  </div>
                </div>

                <button
                  onClick={() => setActiveMenuUserId(activeMenuUserId === user.id ? null : user.id)}
                  className="text-gray-400 hover:text-gray-900 font-black p-1 hover:bg-gray-50 rounded-xl transition text-sm leading-none shrink-0"
                >
                  •••
                </button>

                {activeMenuUserId === user.id && (
                  <div className="absolute right-4 top-14 w-44 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-50 animate-scale-up text-xs font-bold divide-y divide-gray-50">
                    <Link href={`/${user.username}`} className="w-full px-4 py-2.5 hover:bg-gray-50 text-gray-700 block transition">👤 View Profile</Link>
                    <Link href="/chat" className="w-full px-4 py-2.5 hover:bg-gray-50 text-gray-700 block transition">💌 Send Message</Link>
                    <button type="button" onClick={() => alert("🌸 Follow status toggled optimistic UI pass")} className="w-full px-4 py-2.5 text-left hover:bg-gray-50 text-rose-500 block transition">💖 Follow / Unfollow</button>
                    <button type="button" onClick={() => handleBlockClick(user.id, user.displayName)} className="w-full px-4 py-2.5 text-left hover:bg-red-50 text-red-500 block transition">🚫 Block User</button>
                  </div>
                )}
              </div>

              {/* Trait Badges Summary rows */}
              <div className="flex flex-wrap gap-1 text-[9px] font-black uppercase tracking-wide">
                {user.genderIdentity && <span className="bg-rose-50 text-rose-500 px-2 py-0.5 rounded-md border border-rose-100">{user.genderIdentity.replace(/_/g, ' ')}</span>}
                {user.lookingFor && (
                  <div className="flex flex-wrap gap-1">
                    {user.lookingFor.split(",").map((tag: string) => (
                      <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">🔍 {tag.trim()}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-50 pt-3 text-[9px] font-bold text-gray-400 text-left">
                Doll since: {new Date(user.createdAt).toLocaleDateString('en-AU', { dateStyle: 'short' })}
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
