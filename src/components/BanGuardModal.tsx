// src/components/BanGuardModal.tsx
"use client";

import { logoutUser } from "@/app/actions/auth";

interface BanGuardModalProps {
  banData: {
    banReason: string;
    bannedAt: string;
    bannedBy: string;
  };
}

export default function BanGuardModal({ banData }: BanGuardModalProps) {
  const formattedTime = new Date(banData.bannedAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const handleAcknowledge = async () => {
    // Clear cookies instantly and redirect to login screen upon clicking OK
    await logoutUser();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="max-w-md w-full bg-white border border-rose-100 p-8 rounded-3xl shadow-2xl text-center animate-scale-up">
        
        {/* Warning Indicator */}
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-red-100 shadow-xs">
          🚫
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">
          Account Suspended
        </h1>
        <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-6">
          Access Restriction Notice
        </p>

        {/* Ban Details Metadata Box */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-left space-y-3 mb-6">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">Suspension Time</span>
            <p className="text-xs font-semibold text-gray-700">{formattedTime}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">Issued By</span>
            <p className="text-xs font-semibold text-gray-700">{banData.bannedBy}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">Reason for Ban</span>
            <p className="text-xs font-medium text-gray-600 italic bg-white border border-gray-100 rounded-xl p-2.5 mt-1">
              "{banData.banReason}"
            </p>
          </div>
        </div>

        {/* Appeal Information Section */}
        <p className="text-xs font-medium text-gray-500 leading-relaxed mb-6">
          If you believe this action was taken in error, you may file a formal moderation appeal by contacting support at:{" "}
          <a 
            href="mailto:chloeannabrookes@outlook.com" 
            className="text-rose-500 hover:underline font-bold block mt-1"
          >
            chloeannabrookes@outlook.com
          </a>
        </p>

        {/* Enforced Kick Button */}
        <button
          onClick={handleAcknowledge}
          className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md text-sm cursor-pointer active:scale-98"
        >
          OK
        </button>
      </div>
    </div>
  );
}
