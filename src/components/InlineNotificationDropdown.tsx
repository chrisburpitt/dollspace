
// src/components/InlineNotificationDropdown.tsx
"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { markNotificationsAsRead, markSingleNotificationRead, removeNotification } from "@/app/actions/notifications";
import Link from "next/link";

export default function InlineNotificationDropdown({ currentUserId, notifications: initialNotifications }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [localNotifications, setLocalNotifications] = useState<any[]>(initialNotifications);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = localNotifications.filter(n => !n.isRead).length;

  useEffect(() => { setLocalNotifications(initialNotifications); }, [initialNotifications]);

  // Click Outside Closure Listener Hook
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsReadInline = (e: React.MouseEvent, notifId: string) => {
    e.preventDefault(); e.stopPropagation();
    setLocalNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
    startTransition(async () => { await markSingleNotificationRead(notifId); });
  };

  const handleRemoveInline = (e: React.MouseEvent, notifId: string) => {
    e.preventDefault(); e.stopPropagation();
    setLocalNotifications(prev => prev.filter(n => n.id !== notifId));
    startTransition(async () => { await removeNotification(notifId); });
  };

  const handleMarkAllAsRead = () => {
    setLocalNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    startTransition(async () => { await markNotificationsAsRead(currentUserId); });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-xl border transition relative text-sm cursor-pointer ${
          isOpen ? "bg-rose-50 border-rose-200 text-rose-500" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
        }`}
      >
        <span>🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-scale-up">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        /* 🚀 RESOLVED HEIGHTS: Fixed clipping frames preventing any empty height scaling leaks underneath header */
        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl w-80 h-auto max-h-[380px] flex flex-col z-50 p-2 animate-scale-up text-left overflow-hidden min-h-0">
          <div className="px-3 py-2 border-b border-gray-50 flex items-center justify-between shrink-0">
            <span className="text-xs font-black text-gray-900 uppercase tracking-wider">Recent Activity</span>
            {unreadCount > 0 ? (
              <button onClick={handleMarkAllAsRead} className="bg-rose-50 hover:bg-rose-100 text-rose-500 font-bold text-[9px] px-2 py-0.5 rounded-full transition uppercase tracking-wide cursor-pointer">Clear All 🎯</button>
            ) : (
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">All Caught Up</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-gray-50 mt-1 pr-0.5 w-full max-h-full">
            {localNotifications.length === 0 ? (
              <p className="text-gray-400 text-xs text-center py-10 font-medium">Your notification center is clear! 🌸</p>
            ) : (
              localNotifications.map((notif) => {
                const normalisedType = notif.type.toUpperCase();
                const targetLinkUrl = normalisedType === "FOLLOW" ? `/${notif.issuer.username}` : `/#post-${notif.postId}`;

                return (
                  <div key={notif.id} className="relative group/item w-full block">
                    <Link
                      href={targetLinkUrl}
                      onClick={() => setIsOpen(false)} 
                      className={`p-3 pr-20 rounded-xl flex items-start space-x-2.5 transition block border border-transparent text-left w-full ${
                        !notif.isRead ? "bg-rose-50/40 hover:bg-rose-50" : "hover:bg-gray-50"
                      }`}
                    >
                      {notif.issuer.avatarUrl ? (
                        <img src={notif.issuer.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-100" />
                      ) : (
                        <div className="w-8 h-8 bg-rose-400 text-white rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0">{notif.issuer.displayName.charAt(0)}</div>
                      )}
                      
                      <div className="flex-1 min-w-0 text-xs text-left">
                        <p className="text-gray-800 leading-normal font-medium text-left w-full block">
                          <strong className="font-black text-gray-900">{notif.issuer.displayName}</strong>{" "}
                          {normalisedType === "FOLLOW" && "started following your profile card."}
                          {normalisedType === "COMMENT" && "replied to one of your timeline updates."}
                          {normalisedType === "LIKE" && "liked your update post."}
                          {normalisedType === "MENTION" && "tagged you inside a timeline discussion comment."}
                        </p>
                        <span className="text-[10px] text-gray-400 font-semibold block mt-0.5 text-left">
                          {new Date(notif.createdAt).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </Link>

                    {/* ACTION OVERLAYS HOVER TOOLS PANEL */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover/item:opacity-100 transition-opacity duration-200 z-10">
                      {!notif.isRead && (
                        <button type="button" onClick={(e) => handleMarkAsReadInline(e, notif.id)} className="w-6 h-6 rounded-lg bg-white border border-gray-200 hover:bg-rose-50 text-gray-400 hover:text-rose-500 flex items-center justify-center text-[10px] cursor-pointer" title="Mark Read">✓</button>
                      )}
                      <button type="button" onClick={(e) => handleRemoveInline(e, notif.id)} className="w-6 h-6 rounded-lg bg-white border border-gray-200 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center text-[11px] cursor-pointer" title="Remove">✕</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
