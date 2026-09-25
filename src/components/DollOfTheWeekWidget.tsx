"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom"; // 🚀 Lifesaver layer portal tunnel core
import { castDotwVote, getRandomDotwCandidate } from "@/app/actions/dotw";
import { useRouter } from "next/navigation";

interface DollOfTheWeekWidgetProps {
  currentUserEntry: {
    id: string;
    userId: string;
    imageUrl: string;
    votedEntryIds: string[];
    dollVotes: number;
    dullVotes: number;
  } | null;
}

export default function DollOfTheWeekWidget({ currentUserEntry }: DollOfTheWeekWidgetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [candidate, setCandidate] = useState<any>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [hasVotedAll, setHasVotedAll] = useState(false);

  // Synchronizes your database lookups to pull an eligible opponent look
  useEffect(() => {
    async function fetchCandidate() {
      if (!currentUserEntry || currentUserEntry.id === "empty-fallback" || !currentUserEntry.imageUrl) {
        return;
      }
      try {
        const res = await getRandomDotwCandidate();
        if (res && res.success && res.candidate) {
          setCandidate(res.candidate);
        } else if (res && res.outOfCandidates) {
          setHasVotedAll(true);
        }
      } catch (err) {
        console.error("Failed to load tournament candidates:", err);
      }
    }
    fetchCandidate();
  }, [currentUserEntry]);

  const joinedTournament = currentUserEntry && currentUserEntry.id !== "empty-fallback" && currentUserEntry.imageUrl;
  const targetPhotoUrl = candidate?.imageUrl || (hasVotedAll && joinedTournament ? currentUserEntry.imageUrl : null);
  const isDisplayingSelfLook = !candidate?.imageUrl || candidate?.isSelfFallback === true;

  const handleVoteActionSubmit = (voteType: "DOLL" | "DULL") => {
    const targetEntryId = candidate?.id || (hasVotedAll && currentUserEntry ? currentUserEntry.id : null);
    if (!targetEntryId || isPending || isDisplayingSelfLook) return;

    startTransition(async () => {
      const res = await castDotwVote(targetEntryId, voteType);
      if (res?.success) {
        setIsLightboxOpen(false);
        const nextCandidate = await getRandomDotwCandidate();
        if (nextCandidate && nextCandidate.success && nextCandidate.candidate) {
          setCandidate(nextCandidate.candidate);
          setHasVotedAll(false);
        } else {
          setCandidate(null);
          setHasVotedAll(true);
        }
        router.refresh();
      }
    });
  };

  return (
    <div className="bg-white border border-rose-100 rounded-3xl p-5 text-gray-900 shadow-sm text-left relative overflow-hidden transition-all duration-300">
      <h3 className="font-black text-xs text-rose-500 uppercase tracking-widest mb-1">Doll Of The Week</h3>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Weekly Tournament</p>

      {/* THE INTEGRATED PREVIEW & VOTING GRID LAYOUT */}
      {joinedTournament && targetPhotoUrl ? (
        <div className="space-y-3">
          
          {/* COMPONENT IMAGE THUMBNAIL BOX ROW */}
          <div 
            onClick={() => setIsLightboxOpen(true)}
            className="w-full aspect-square rounded-2xl overflow-hidden border border-rose-100/40 bg-rose-50/10 cursor-zoom-in relative group transition active:scale-[0.99] duration-200"
            title="Click to view look details full-screen"
          >
            <img 
              src={targetPhotoUrl} 
              alt="Tournament participant entry look" 
              className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.02]"
              draggable="false"
            />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center">
              <span className="bg-white/90 backdrop-blur-xs font-black text-[9px] uppercase tracking-wider text-gray-700 px-2.5 py-1 rounded-full shadow-xs">🔍 Zoom Look</span>
            </div>
          </div>

          {/* LOWER RATINGS ROW CAPSULES */}
          {isDisplayingSelfLook ? (
            <p className="text-center font-bold text-[10px] text-gray-400 italic pt-1">Reviewing your entry look ✨</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={() => handleVoteActionSubmit("DOLL")}
                disabled={isPending}
                className="bg-rose-50 hover:bg-rose-100 text-rose-500 font-black text-xs py-2 rounded-xl border border-rose-100 transition shadow-2xs cursor-pointer flex items-center justify-center space-x-1"
              >
                <span>✨ DOLL</span>
              </button>
              <button 
                type="button"
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
        <div className="space-y-2 pt-1 animate-scale-up">
          <p className="text-gray-400 text-[11px] font-medium leading-relaxed mb-3">
            You don't have an active entry look in this week's tournament queue yet, doll!
          </p>
          <label className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black text-[11px] uppercase tracking-widest py-3 rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center space-x-2 text-center group">
            <span>✨ Submit Competition Look</span>
            <input 
              type="file" 
              accept="image/*"
              className="hidden" 
              disabled={isPending}
              onChange={async (e) => {
                const targetFile = e.target.files?.[0];
                if (!targetFile) return;
                
                startTransition(async () => {
                  const { submitDotwPhotoAction } = await import("@/app/actions/dotw");
                  const res = await submitDotwPhotoAction(targetFile);
                  if (res?.success) {
                    window.location.reload();
                  } else if (res?.error) {
                    alert(res.error);
                  }
                });
              }}
            />
          </label>
        </div>
      )}


      {/* 🚀 THE IMMERSIVE ROOT PORTAL LIGHTBOX WINDOW:
          Lifts your full-screen rating window completely out of the sidebar container markup 
          and appends it directly onto the root document body, completely matching your ImageLightbox setup! */}
      {isLightboxOpen && targetPhotoUrl && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col items-center justify-between p-4 animate-fade-in select-none">
          
          {/* LIGHTBOX CLOSE ROW CONTAINER */}
          <div className="w-full max-w-4xl flex justify-end pt-2">
            <button 
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-lg flex items-center justify-center transition border border-white/10 cursor-pointer shadow-sm active:scale-95"
              title="Close View"
            >
              ✕
            </button>
          </div>

          {/* LIGHTBOX CENTRAL PHOTO CANVAS FRAME WITH RIGHT-CLICK SECURITY PROTECTION */}
          <div className="max-w-4xl max-h-[70vh] flex items-center justify-center relative px-2">
            <img 
              src={targetPhotoUrl} 
              alt="Expanded tournament entry look" 
              className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl border border-white/5 select-none"
              onContextMenu={(e) => e.preventDefault()}
              draggable="false"
            />
            {/* Anti-theft transparent screen layout guard asset shield overlay */}
            <div 
              className="absolute inset-0 bg-transparent rounded-2xl z-10 cursor-default" 
              onContextMenu={(e) => e.preventDefault()} 
            />
          </div>

          {/* LIGHTBOX FLOATING USER RATING CONTROL CONSOLE BAR PANEL */}
          <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/10 p-5 rounded-3xl shadow-2xl mb-6 flex flex-col items-center gap-3 animate-scale-up z-20">
            <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">
              {isDisplayingSelfLook ? "Your Live Contest Entry" : "Cast Your Tournament Rating Option"}
            </p>
            
            {isDisplayingSelfLook ? (
              <div className="flex items-center gap-3 w-full">
                <button 
                  type="button" 
                  onClick={() => setIsLightboxOpen(false)} 
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white font-black text-xs py-3.5 rounded-xl transition cursor-pointer active:scale-95 shadow-sm"
                >
                  Return to Feed Timeline
                </button>
                <button
                  type="button" 
                  disabled={isPending}
                  onClick={async () => {
                    if (confirm("Are you absolutely sure you want to withdraw your photo entry look from this week's tournament queue? ⚠️")) {
                      startTransition(async () => {
                        const { deleteDotwEntryAction } = await import("@/app/actions/dotw");
                        const res = await deleteDotwEntryAction();
                        if (res?.success) { 
                          setIsLightboxOpen(false); 
                          window.location.reload(); 
                        } else if (res?.error) {
                          alert(res.error);
                        }
                      });
                    }
                  }}
                  className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition flex items-center justify-center cursor-pointer shrink-0 active:scale-95 shadow-md hover:scale-105 duration-200"
                  title="Withdraw Competition Entry Photo"
                >
                  {isPending ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin block" />
                  ) : (
                    "🗑️"
                  )}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 w-full">
                <button 
                  type="button" 
                  onClick={() => handleVoteActionSubmit("DOLL")} 
                  disabled={isPending} 
                  className="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs py-3.5 rounded-xl transition shadow-md cursor-pointer flex items-center justify-center space-x-1.5 active:scale-[0.98]"
                >
                  <span>✨ BRAND AS DOLL</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => handleVoteActionSubmit("DULL")} 
                  disabled={isPending} 
                  className="bg-white/20 hover:bg-white/30 text-white font-black text-xs py-3.5 rounded-xl transition border border-white/10 cursor-pointer flex items-center justify-center space-x-1.5 active:scale-[0.98]"
                >
                  <span>🗑️ MARK AS DULL</span>
                </button>
              </div>
            )}
          </div>

        </div>,
        document.body // Appends the active lightbox natively to the root body node!
      )}
    </div>
  );
}
