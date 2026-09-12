// src/components/ChatPresenceKeeper.tsx
"use client";

import { useEffect, useRef } from "react";
import { forceClientPresenceNudge } from "@/app/actions/presence";

interface ChatPresenceKeeperProps {
  typingInputId?: string; // Optional: Link directly to your chat box input HTML id attribute string
}

export default function ChatPresenceKeeper({ typingInputId = "chat-message-input" }: ChatPresenceKeeperProps) {
  const lastNudgeTimeRef = useRef<number>(0);

  // Helper utility to safely execute a high-speed database pulse check
  const triggerPresenceNudge = async () => {
    const now = Date.now();
    // Throttle checks to a minimum of every 15 seconds to completely eliminate server bloat
    if (now - lastNudgeTimeRef.current < 15000) return;
    
    lastNudgeTimeRef.current = now;
    await forceClientPresenceNudge();
  };

  useEffect(() => {
    // 🚀 BACKGROUND PULSER: Silently nudges the database every 60 seconds while sitting on the page
    const intervalTimer = setInterval(() => {
      triggerPresenceNudge();
    }, 60000);

    // 🚀 INSTANT TYPING TRACKER: Fires immediately the moment they hit keys inside the chat lounge input box!
    const handleTypingStroke = () => {
      triggerPresenceNudge();
    };

    // Locate the active messaging textarea input box inside the document DOM tree
    const targetInputBox = document.getElementById(typingInputId);
    if (targetInputBox) {
      targetInputBox.addEventListener("input", handleTypingStroke);
    }

    // Trigger an initial immediate nudge the second the chat page opens up
    triggerPresenceNudge();

    return () => {
      clearInterval(intervalTimer);
      if (targetInputBox) {
        targetInputBox.removeEventListener("input", handleTypingStroke);
      }
    };
  }, [typingInputId]);

  return null; // Entirely silent component that executes cleanly behind the scenes with zero layout footprint
}
