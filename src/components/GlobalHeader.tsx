// src/components/GlobalHeader.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { logoutUser } from "@/app/actions/auth";
import { updateStatus } from "@/app/actions/profile"; 

interface GlobalHeaderProps {
  currentUser: {
    id: string;
    status: string;
    [key: string]: any; // 🚀 ADD THIS LINE to allow any extra user fields to pass safely
  };
}s

// Map status strings to beautiful visual indicators
const STATUS_OPTIONS = [
  { value: "ONLINE", label: "🟢 Online" },
  { value: "AWAY", label: "🟡 Away" },
  { value: "BUSY", label: "🔴 Busy" },
  { value: "OFFLINE", label: "⚫ Appear Offline" },
];

export default function GlobalHeader({ currentUser }: GlobalHeaderProps) {
  const [currentStatus, setCurrentStatus] = useState(currentUser.status || "ONLINE");
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setCurrentStatus(newStatus);
    setIsOpen(false);
    await updateStatus(currentUser.id, newStatus);
  };

  const activeLabel = STATUS_OPTIONS.find(s => s.value === currentStatus)?.label || "🟢 Online";

  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tight text-rose-500 hover:opacity-90 transition">
          Dollspace
        </Link>

        <div className="flex items-center space-x-3 relative">
          {/* Status Selector Dropdown Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs px-4 py-2 rounded-xl border border-gray-200 transition flex items-center space-x-1"
          >
            <span>{activeLabel}</span>
            <span className="text-[10px] text-gray-400 ml-1">▼</span>
          </button>

          {/* Floating Dropdown Selector Panel */}
          {isOpen && (
            <div className="absolute top-11 left-0 bg-white border border-gray-200 p-1.5 rounded-xl shadow-lg flex flex-col min-w-[140px] z-50">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className={`text-left w-full px-3 py-2 rounded-lg text-xs font-bold transition ${
                    currentStatus === opt.value 
                      ? "bg-rose-50 text-rose-600" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Secure Logout Trigger Form Button */}
          <form action={logoutUser}>
            <button 
              type="submit" 
              className="text-xs bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 font-bold px-4 py-2 rounded-xl border border-gray-200 transition"
            >
              🚪 Logout
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
