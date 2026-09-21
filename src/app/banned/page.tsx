// src/app/banned/page.tsx
"use client";

import { logoutUser } from "@/app/actions/auth";

export default function BannedPage() {
  const handleAcknowledge = async () => {
    await logoutUser();
  };

  return (
    <div className="min-h-screen bg-rose-50/20 flex items-center justify-center p-4 select-none font-sans">
      <div className="max-w-md w-full bg-white border border-rose-100 p-8 rounded-3xl shadow-2xl text-center">
        
        {/* Warning Indicator */}
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-red-100">
          🚫
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">
          Account Suspended
        </h1>
        <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-6">
          Access Restriction Notice
        </p>

        {/* Ban Details Metadata Box */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-left space-y-3 mb-6">
          <p className="text-xs font-medium text-gray-600 leading-relaxed">
            This profile account has been permanently blacklisted by an administrator due to platform community standard rules violations.
          </p>
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
          className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md text-sm cursor-pointer"
        >
          OK
        </button>
      </div>
    </div>
  );
}
