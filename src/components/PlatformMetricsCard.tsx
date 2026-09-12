// src/components/PlatformMetricsCard.tsx
"use client";

import Link from "next/link";

interface PlatformMetricsCardProps {
  metrics: {
    onlineCount: number;
    unreadMailCount: number;
    waitingDMsCount: number;
  };
}

export default function PlatformMetricsCard({ metrics }: PlatformMetricsCardProps) {
  const { onlineCount, unreadMailCount, waitingDMsCount } = metrics;

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-left select-none animate-fade-in space-y-4">
      <h4 className="font-black text-xs text-gray-900 tracking-wider uppercase">
        📊 Live Activity Stream
      </h4>
      
      <div className="space-y-2.5 text-xs font-semibold text-gray-600">
        
        {/* Metric 1: Online Users */}
        <Link href="/discover" className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100 block">
          <span className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>Dolls online right now:</span>
          </span>
          <span className="text-gray-900 font-black bg-gray-100 px-2 py-0.5 rounded-lg text-[11px]">
            {onlineCount}
          </span>
        </Link>

        {/* Metric 2: Unread Mail */}
        <Link href="/mail" className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100 block">
          <span className="flex items-center space-x-2">
            <span>💌</span>
            <span>Unread mail in mailbox:</span>
          </span>
          <span className={`font-black px-2 py-0.5 rounded-lg text-[11px] ${
            unreadMailCount > 0 ? "bg-rose-500 text-white animate-pulse" : "bg-gray-100 text-gray-900"
          }`}>
            {unreadMailCount}
          </span>
        </Link>

        {/* Metric 3: Waiting DMs */}
        <Link href="/chat" className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100 block">
          <span className="flex items-center space-x-2">
            <span>💬</span>
            <span>Direct messages waiting:</span>
          </span>
          <span className={`font-black px-2 py-0.5 rounded-lg text-[11px] ${
            waitingDMsCount > 0 ? "bg-rose-500 text-white animate-pulse" : "bg-gray-100 text-gray-900"
          }`}>
            {waitingDMsCount}
          </span>
        </Link>

      </div>
    </div>
  );
}
