// src/components/MentionInput.tsx
"use client";

import { useState, useEffect, useRef } from "react";

interface MentionInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  isTextArea?: boolean;
  rows?: number;
  disabled?: boolean;
  className?: string;
  followersList: Array<{ username: string; displayName: string }>;
}

export default function MentionInput({
  value,
  onChange,
  placeholder,
  isTextArea = false,
  rows = 3,
  disabled = false,
  className = "",
  followersList = []
}: MentionInputProps) {
  const [searchWord, setSearchString] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [triggerIndex, setTriggerIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function clickAway(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", clickAway);
    return () => document.removeEventListener("mousedown", clickAway);
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const text = e.target.value;
    onChange(text);

    const selectionStart = e.target.selectionStart || 0;
    const textBeforeCursor = text.slice(0, selectionStart);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1 && (lastAtIndex === 0 || /\s/.test(textBeforeCursor[lastAtIndex - 1]))) {
      const matchWord = textBeforeCursor.slice(lastAtIndex + 1);
      if (!/\s/.test(matchWord)) {
        setTriggerIndex(lastAtIndex);
        setSearchString(matchWord);
        setShowDropdown(true);
        return;
      }
    }
    setShowDropdown(false);
  };

  const selectUserSuggestion = (username: string) => {
    const text = value;
    const textBeforeTrigger = text.slice(0, triggerIndex);
    const textAfterCursor = text.slice(triggerIndex + searchWord.length + 1);
    
    const completedText = `${textBeforeTrigger}@${username} ${textAfterCursor}`;
    onChange(completedText);
    setShowDropdown(false);
  };

  const matchedDolls = searchWord === "" 
    ? followersList.slice(0, 5)
    : followersList.filter(u => 
        u.username.toLowerCase().includes(searchWord.toLowerCase()) ||
        u.displayName.toLowerCase().includes(searchWord.toLowerCase())
      ).slice(0, 5);

  return (
    <div className="relative w-full text-left" ref={dropdownRef}>
      {isTextArea ? (
        <textarea
          value={value}
          onChange={handleTextChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={className}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={handleTextChange}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
        />
      )}

      {showDropdown && matchedDolls.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 mb-1 overflow-hidden divide-y divide-gray-50 max-h-44 overflow-y-auto animate-scale-up">
          {matchedDolls.map(u => (
            <button
              key={u.username}
              type="button"
              onClick={() => selectUserSuggestion(u.username)}
              className="w-full px-4 py-2 text-left text-xs font-bold text-gray-700 hover:bg-rose-50 hover:text-rose-500 transition flex items-center justify-between"
            >
              <span>{u.displayName}</span>
              <span className="text-[10px] text-gray-400 font-semibold">@{u.username}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
