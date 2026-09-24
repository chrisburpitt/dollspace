"use client";

import { useState, useTransition, useEffect } from "react";
import { castDotwVote, getRandomDotwCandidate, deleteDotwEntryAction } from "@/app/actions/dotw";
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

  // 🚀 FETCH ACTIVE VOTING CANDIDATE ON MOUNT:
  // Synchronizes your database lookups to pull an eligible opponent look, 
  // or gracefully loads your own entry if you've ranked all available participants!
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

  // 🎯 DETERMINE LOGICAL PHOTO URL HOOK:
  // Decides whether to show an un-voted competitor, fallback to your own entry 
  // when the voting queue finishes, or hide the box if you haven't joined yet.
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
        // Refresh the candidate state pool with a fresh server fetch
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
          
          {/* INTERACTIVE ZOOM TRIGGER IMAGE CONTAINER */}
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
        // Renders only if the user hasn't uploaded a photo to join the tournament yet
        <p className="text-gray-400 text-xs text-center py-6 font-medium">Join this week's tournament path! 🌸</p>
      )}

      {/* THE IMMERSIVE FULL-SCREEN LIGHTBOX OVERLAY WINDOW */}
      {isLightboxOpen && targetPhotoUrl && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col items-center justify-between p-4 animate-fade-in select-none">
          
          {/* Exit Button */}
          <div className="w-full max-w-4xl flex justify-end pt-2">
            <button 
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-lg flex items-center justify-center transition border border-white/10 cursor-pointer shadow-sm active:scale-95"
            >
              ✕
            </button>
          </div>

          {/* Image Node */}
          <div className="max-w-4xl max-h-[70vh] flex items-center justify-center relative px-2">
            <img 
              src={targetPhotoUrl} 
              alt="Immersive high-res tournament look" 
              className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl border border-white/5"
              onContextMenu={(e) => e.preventDefault()}
              draggable="false"
            />
          </div>

          {/* Lightbox Footer Controller */}
          <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/10 p-5 rounded-3xl shadow-2xl mb-6 flex flex-col items-center gap-3 animate-scale-up">
            <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">
              {isDisplayingSelfLook ? "Your Live Contest Entry" : "Cast Your Tournament Rating Option"}
            </p>
            
            {isDisplayingSelfLook ? (
              <div className="flex items-center gap-3 w-full">
    
                {/* RETURNING STANDARD ACTION NAVIGATION TAB PILL */}
                <button 
                  type="button"
                  onClick={() => setIsLightboxOpen(false)}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white font-black text-xs py-3.5 rounded-xl transition cursor-pointer active:scale-95 shadow-sm"
                >
                  Return to Feed Timeline
                </button>

                {/* 🚀 THE PREMIUM UN-SPOOFABLE DELETION TRASH BIN BUTTON */}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={async () => {
                    // Trigger a secure browser window warning confirmation gate block first
                    if (confirm("Are you sure you want to remove your entry photo from this week's Doll of the Week tournament? ⚠️ This will reset your votes and delete your look from DOTW babe!")) {
                      startTransition(async () => {
                        const res = await deleteDotwEntryAction();
                        if (res?.success) {
                          setIsLightboxOpen(false); // Gracefully slide the viewport overlay shut
                          window.location.reload(); // Flush page caches and reload to present the initial submission uploader button!
                        } else if (res?.error) {
                          alert(res.error);
                        }
                      });
                    }
                  }}
                  className="w-12 h-12 bg-rose-500 hover:bg-roose-700 text-white font-bold rounded-xl transition flex items-center justify-center cursor-pointer shrink-0 active:scale-95 shadow-md hover:scale-105 duration-200"
                  title="Delete Tournament Submission Photo Look"
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
                  <span>✨ TELL HER SHE'S A DOLL</span>
                </button>
                <button 
                  type="button"
                  onClick={() => handleVoteActionSubmit("DULL")}
                  disabled={isPending}
                  className="bg-white/20 hover:bg-white/30 text-white font-black text-xs py-3.5 rounded-xl transition border border-white/10 cursor-pointer flex items-center justify-center space-x-1.5 active:scale-[0.98]"
                >
                  <span>🥀️ NO BABE, YOU'RE DULL</span>
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
