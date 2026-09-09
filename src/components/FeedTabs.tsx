// src/components/FeedTabs.tsx
"use client";

interface FeedTabsProps {
  activeTab: "global" | "following";
  onTabChange: (tab: "global" | "following") => void;
}

export default function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <div className="flex border-b border-gray-200 bg-white rounded-2xl p-1 shadow-sm mb-6">
      <button
        onClick={() => onTabChange("global")}
        className={`flex-1 py-3 text-sm font-black rounded-xl transition tracking-wide text-center ${
          activeTab === "global"
            ? "bg-rose-500 text-white shadow-sm"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        }`}
      >
        🌍 Global Stream
      </button>
      <button
        onClick={() => onTabChange("following")}
        className={`flex-1 py-3 text-sm font-black rounded-xl transition tracking-wide text-center ${
          activeTab === "following"
            ? "bg-rose-500 text-white shadow-sm"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        }`}
      >
        👥 Following Only
      </button>
    </div>
  );
}
