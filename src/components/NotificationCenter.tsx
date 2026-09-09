// src/components/NotificationCenter.tsx
"use client";

import { useState } from "react";
import { markNotificationsAsRead } from "@/app/actions/notifications";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: string;
  isRead: boolean;
  createdAt: any;
  postId: string | null;
  issuer: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

interface NotificationCenterProps {
  currentUserId: string;
  notifications: NotificationItem[];
}

export default function NotificationCenter({ currentUserId, notifications }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleToggleOpen = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Clear out unread status dots instantly when opening the console drawer panel
      await markNotificationsAsRead(currentUserId);
    }
  };

  return (
    <div className="relative">
      {/* 🔔 The Notification Bell Button Anchor Icon Element */}
      <button
        onClick={handleToggleOpen}
        className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center transition relative"
      >
        <span className="text-lg">🔔</span>
        
        {/* 🔴 UNREAD INDICATOR DOT FLOATER */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-scale-up">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Alerts Drawer Stack List Dropdown Panel Card */}
      {isOpen && (
        <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl w-80 max-h-96 overflow-y-auto z-50 p-2 animate-scale-up text-left">
          <div className="px-3 py-2 border-b border-gray-50 flex items-center justify-between">
            <span className="text-xs font-black text-gray-900 uppercase tracking-wider">Recent Activity</span>
            {unreadCount > 0 && <span className="bg-rose-50 text-rose-500 font-bold text-[10px] px-2 py-0.5 rounded-full">New Updates</span>}
          </div>

          <div className="divide-y divide-gray-50 mt-1">
            {notifications.length === 0 ? (
              <p className="text-gray-400 text-xs text-center py-8 font-medium">Your notification center is clear! 🌸</p>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-3 rounded-xl flex items-start space-x-2.5 transition ${
                    !notif.isRead ? "bg-rose-50/40" : "hover:bg-gray-50"
                  }`}
                >
                  {notif.issuer.avatarUrl ? (
                    <img src={notif.issuer.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 bg-rose-400 text-white rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0">
                      {notif.issuer.displayName.charAt(0)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="text-gray-800 leading-normal font-medium">
                      <strong className="font-black text-gray-900">
                        {notif.issuer.displayName}
                      </strong>{" "}
                      {notif.type === "FOLLOW" && "started following your profile card."}
                      {notif.type === "COMMENT" && "replied to one of your timeline updates."}
                      {notif.type === "LIKE" && "liked your update post."}
                    </p>
                    <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                      {new Date(notif.createdAt).toLocaleDateString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
