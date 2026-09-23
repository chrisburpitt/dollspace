// src/components/DollOfTheWeekWidget.tsx (PART 1 - CANVAS LOGIC & HOOKS)
"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { submitDotwPhotoAction, getRandomDotwCandidate, castDotwVote } from "@/app/actions/dotw";

// 🚀 NATIVE COMPRESSION UTILITY: Copied straight from FeedForm.tsx to optimize phone uploads
function compressImageBeforeUpload(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: "image/jpeg",
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, "image/jpeg", quality);
      };
    };
  });
}

export default function DollOfTheWeekWidget({ currentUserEntry }: { currentUserEntry: any }) {
  const [isPending, startTransition] = useTransition();
  
  // ✨ Airtight Safeguard: Explicitly evaluates to false if currentUserEntry is null or undefined!
  const [hasEntered, setHasEntered] = useState(
    currentUserEntry && currentUserEntry.id ? true : false
  );
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
        loadNextBlindCandidate(); 
      }
    });
  };


  // src/components/DollOfTheWeekWidget.tsx (PART 2 - RE-WIRED UPLOADTHING FLOWS)
  const handleNativeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const selectedFile = files[0];
    
    startTransition(async () => {
      try {
        // 1. Process client canvas compression instantly inside the browser frame
        const compressedPhoto = await compressImageBeforeUpload(selectedFile);
        
        // 🚀 2. FIRING THE REAL CLOUD MUTATION:
        // Ships the binary File object straight to your updated UploadThing server task!
        const res = await submitDotwPhotoAction(compressedPhoto);

        if (res.success) {
          setHasEntered(true);
          alert("Yay! Your contestant look has been recorded successfully. Now you can vote! 🩰✨");
        } else if (res.error) {
          alert(res.error);
        }
      } catch (err) {
        console.error("Widget file submission failure:", err);
        alert("Something paused your tournament photo processing loop.");
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
        /* PHASE 1: NATIVE IMAGE PICKER PROMPT CONTROLS FORM */
        <div className="space-y-4 w-full text-left animate-fade-in">
          <p className="text-gray-500 font-medium text-[11px] leading-relaxed">
            Submit your best look this week to join the contest. Uploading your photo unlocks the ability to vote on other participants!
          </p>
          
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-gray-50/50 hover:bg-gray-50 transition duration-200 min-h-[140px] text-center w-full">
            
            {/* 🚀 FIXED NATIVE LABEL TRIGGER: Matches FeedForm style perfectly with 0 type errors! */}
            <label 
              htmlFor="dotw-native-file-upload" 
              className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-black px-6 py-3 rounded-xl transition shadow-sm uppercase tracking-wider cursor-pointer text-center block"
            >
              {isPending ? "⏳ Uploading..." : "📸 Select Photo"}
            </label>
            
            <input
              type="file"
              id="dotw-native-file-upload"
              ref={fileInputRef}
              accept="image/*"
              disabled={isPending}
              onChange={handleNativeFileChange}
              className="hidden"
            />
            
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-3 block">
              PNG, JPG or HEIC format accepts
            </span>
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
