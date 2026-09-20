// src/components/DollOfTheWeekWidget.tsx (FIXED UPLOADTHING CORE IMPORT SYNTAX)
"use client";

import { useState, useEffect, useTransition } from "react";
import { submitDotwPhoto, getRandomDotwCandidate, castDotwVote } from "@/app/actions/dotw";
// 🚀 FIXED: Swapped out the ghost alias path line for the raw underlying official UploadThing framework entry module!
import { UploadButton } from "@uploadthing/react"; 

export default function DollOfTheWeekWidget({ currentUserEntry }: { currentUserEntry: any }) {
  const [isPending, startTransition] = useTransition();
  const [hasEntered, setHasEntered] = useState(!!currentUserEntry);
  
  // Competing candidate states
  const [activeCandidate, setActiveCandidate] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const loadNextBlindCandidate = async () => {
    const res = await getRandomDotwCandidate();
    if (res?.requiresSubmission) {
      setHasEntered(false);
    } else if (res?.outOfCandidates) {
      setActiveCandidate(null);
      setStatusMessage("You've voted on all available entries so far! Check back later for more updates. 🌸");
    } else if (res?.success && res.candidate) {
      setActiveCandidate(res.candidate);
      setStatusMessage("");
    }
  };

  useEffect(() => {
    if (hasEntered) loadNextBlindCandidate();
  }, [hasEntered]);

  const handleVoteAction = (voteType: "DOLL" | "DULL") => {
    if (!activeCandidate) return;

    startTransition(async () => {
      const res = await castDotwVote(activeCandidate.id, voteType);
      if (res.success) {
        loadNextBlindCandidate(); // Slide next candidate onto panel cleanly
      }
    });
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-3xl p-5 shadow-sm text-left select-none animate-fade-in flex flex-col gap-4">
      <div className="border-b border-gray-50 pb-2 flex justify-between items-center w-full">
        <div>
          <h3 className="font-black text-xs uppercase tracking-wider text-gray-900">👑 Doll of the Week</h3>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Weekly Community Tournament</p>
        </div>
        <span className="text-sm">🩰</span>
      </div>

      {!hasEntered ? (
        /* PHASE 1: UPLOADTHING INTEGRATED FILE PICKER HUD FORM */
        <div className="space-y-4 w-full text-left animate-fade-in">
          <p className="text-gray-500 font-medium text-[11px] leading-relaxed">
            Submit your best look this week to join the contest. Uploading your photo unlocks the ability to vote on other participants!
          </p>
          
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-gray-50/50 hover:bg-gray-50 transition duration-200 min-h-[140px] text-center w-full">
            {/* 🚀 THE FILE PICKER WIDGET CORE CUSTOMIZATION SLOT */}
            <UploadButton
              url="/api/uploadthing" // 🎯 Explicitly anchors the payload network pipe to hit your app's core endpoint layout
              endpoint="imageUploader" // Targets your matching configuration file row selector token from core.ts
              onClientUploadComplete={(res: any) => {
                // Safely handles array or single object format models returned from the storage nodes
                const firstFile = Array.isArray(res) ? res[0] : res;
                const uploadedUrl = firstFile?.url;
                
                if (!uploadedUrl) {
                  alert("Failed to extract the secure attachment storage path.");
                  return;
                }

                // Automatically submit the raw file token link straight to your Neon DB entries table
                startTransition(async () => {
                  const submitRes = await submitDotwPhoto(uploadedUrl);
                  if (submitRes.success) {
                    setHasEntered(true);
                    alert("Yay! Your look has been recorded successfully. Now you can vote! 🩰✨");
                  } else if (submitRes.error) {
                    alert(submitRes.error);
                  }
                });
              }}
              onUploadError={(error: Error) => {
                alert(`Upload failed: ${error.message}`);
              }}
              appearance={{
                button: "bg-rose-500 hover:bg-rose-600 text-white text-xs font-black px-5 py-2.5 rounded-xl transition shadow-sm uppercase tracking-wider cursor-pointer h-auto w-full max-w-[200px]",
                allowedContent: "text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-2 block"
              }}
              content={{
                button({ ready }) {
                  if (ready) return "📸 Select Photo";
                  return "⏳ Initializing...";
                }
              }}
            />
          </div>
        </div>
      ) : activeCandidate ? (
        /* PHASE 2: BLIND GAMIFIED VOTING CAROUSEL ACTION AREA */
        <div className="flex flex-col gap-3.5 items-center w-full animate-scale-up">
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-wider text-left self-start">Rate this competitor look:</p>
          
          <div className="w-full aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shadow-inner relative group select-none">
            <img src={activeCandidate.imageUrl} alt="Contestant Entry" className="w-full h-full object-cover" draggable="false" />
            <div className="absolute inset-0 bg-transparent z-10" onContextMenu={(e) => e.preventDefault()} />
          </div>

          <div className="grid grid-cols-2 gap-2 w-full pt-1">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleVoteAction("DOLL")}
              className="bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-200 hover:border-rose-600 font-black py-2.5 rounded-xl text-xs transition uppercase tracking-wider shadow-xs cursor-pointer text-center"
            >
              ✨ Doll
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleVoteAction("DULL")}
              className="bg-gray-50 hover:bg-gray-800 text-gray-600 hover:text-white border border-gray-200 hover:border-gray-900 font-black py-2.5 rounded-xl text-xs transition uppercase tracking-wider shadow-xs cursor-pointer text-center"
            >
              🥀 Dull
            </button>
          </div>
        </div>
      ) : (
        /* PHASE 3: COMPLETED CAP WINDOW MESSAGING BAR */
        <div className="py-4 text-center text-[11px] font-semibold text-gray-400 leading-relaxed px-2 animate-fade-in">
          {statusMessage || "Syncing contestant data data loops... 🌸"}
        </div>
      )}
    </div>
  );
}
