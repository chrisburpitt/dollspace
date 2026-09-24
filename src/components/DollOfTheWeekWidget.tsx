"use client";

import { useState, useTransition } from "react";
import { castDotwVote } from "@/app/actions/dotw";
import { useRouter } from "next/navigation";

export default function DollOfTheWeekWidget({ currentUserEntry, initialCandidate }: any) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [candidate, setCandidate] = useState(initialCandidate);
  
  // 🚀 1. INTERACTIVE FULL-SCREEN LIGHTBOX PORTAL STATES:
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleVoteActionSubmit = (voteType: "DOLL" | "DULL") => {
    if (!candidate || isPending) return;

    startTransition(async () => {
      const res = await castDotwVote(candidate.id, voteType);
      if (res?.success) {
        setIsLightboxOpen(false); // Natively close the lightbox frame upon submission hooks
        router.refresh(); // Quietly re-fetch the next eligible contestant look behind the scenes
      }
    });
  };

  return (
    <div className="bg-white border border-rose-100 rounded-3xl p-5 text-gray-900 shadow-sm text-left relative overflow-hidden">
      <h3 className="font-black text-xs text-rose-500 uppercase tracking-widest mb-1">Doll Of The Week</h3>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Weekly Tournament</p>

      {/* THE VOTING CONTENT SLATE */}
      {candidate?.imageUrl ? (
        <div className="space-y-3">
          {/* 🚀 2. MAKE IMAGE CLICKABLE TARGET TRAPPINGS */}
          <div 
            onClick={() => setIsLightboxOpen(true)}
            className="w-full aspect-square rounded-2xl overflow-hidden border border-rose-100/40 bg-rose-50/10 cursor-zoom-in relative group transition active:scale-[0.99]"
            title="Click to view full look details"
          >
            <img 
              src={candidate.imageUrl} 
              alt="Contestant look" 
              className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.02]"
              draggable="false"
            />
            
            {/* Soft overlay hint tags */}
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center">
              <span className="bg-white/90 backdrop-blur-xs font-black text-[9px] uppercase tracking-wider text-gray-700 px-2.5 py-1 rounded-full shadow-xs">🔍 Zoom Look</span>
            </div>
          </div>

          {/* Fallback info labels */}
          {candidate.isSelfFallback ? (
            <p className="text-center font-bold text-[10px] text-gray-400 italic">Reviewing your entry look ✨</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleVoteActionSubmit("DOLL")}
                disabled={isPending}
                className="bg-rose-50 hover:bg-rose-100 text-rose-500 font-black text-xs py-2 rounded-xl border border-rose-100 transition shadow-2xs cursor-pointer flex items-center justify-center space-x-1"
              >
                <span>✨ DOLL</span>
              </button>
              <button 
                onClick={() => handleVoteActionSubmit("DULL")}
                disabled={isPending}
                className="bg-gray-50 hover:bg-gray-100 text-gray-500 font-black text-xs py-2 rounded-xl border border-gray-200 transition shadow-2xs cursor-pointer flex items-center justify-center space-x-1"
              >
                <span>🗑️ DULL</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-400 text-xs text-center py-6 font-medium">Join this week's tournament path! 🌸</p>
      )}

      {/* 🚀 3. THE IMMERSIVE FULL-SCREEN LIGHTBOX OVERLAY WINDOW */}
      {isLightboxOpen && candidate?.imageUrl && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col items-center justify-between p-4 animate-fade-in select-none">
          
          {/* LIGHTBOX HEADER: Absolute safety exit wire */}
          <div className="w-full max-w-4xl flex justify-end pt-2">
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-lg flex items-center justify-center transition border border-white/10 cursor-pointer shadow-sm active:scale-95"
              title="Close View"
            >
              ✕
            </button>
          </div>

          {/* LIGHTBOX BODY: Full High-Res Aspect Core image display */}
          <div className="max-w-4xl max-h-[70vh] flex items-center justify-center relative px-2">
            <img 
              src={candidate.imageUrl} 
              alt="Immersive contestant view" 
              className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl border border-white/5"
              onContextMenu={(e) => e.preventDefault()}
              draggable="false"
            />
          </div>

          {/* LIGHTBOX FOOTER: Floating Action Button Console */}
          <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/10 p-5 rounded-3xl shadow-2xl mb-6 flex flex-col items-center gap-3 animate-scale-up">
            <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">
              {candidate.isSelfFallback ? "Your Live Contest Entry" : "Cast Your Tournament Rating Option"}
            </p>
            
            {candidate.isSelfFallback ? (
              <button 
                onClick={() => setIsLightboxOpen(false)}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-black text-xs py-3 rounded-xl transition cursor-pointer"
              >
                Return to Feed Timeline
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-4 w-full">
                <button 
                  onClick={() => handleVoteActionSubmit("DOLL")}
                  disabled={isPending}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs py-3.5 rounded-xl transition shadow-md cursor-pointer flex items-center justify-center space-x-1.5 active:scale-[0.98]"
                >
                  <span>✨ TELL HER SHE'S A DOLL</span>
                </button>
                <button 
                  onClick={() => handleVoteActionSubmit("DULL")}
                  disabled={isPending}
                  className="bg-white/20 hover:bg-white/30 text-white font-black text-xs py-3.5 rounded-xl transition border border-white/10 cursor-pointer flex items-center justify-center space-x-1.5 active:scale-[0.98]"
                >
                  <span>🗑️ MARK AS DULL</span>
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
