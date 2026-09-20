// src/components/NotificationCenter.tsx (PART 1 - OPTIMISTIC STATE HANDLERS)
"use client";

import { useState, useTransition, useEffect } from "react";
// 🚀 Bring in your backend single mark and single remove server actions
import { markNotificationsAsRead, markSingleNotificationRead, removeNotification } from "@/app/actions/notifications";
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

export default function NotificationCenter({ currentUserId, notifications: initialNotifications }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 🚀 SEED LOCAL STATE: Allows instant visual deletions and read states updates
  const [localNotifications, setLocalNotifications] = useState<NotificationItem[]>(initialNotifications);

  // Keep state perfectly synchronized with your database parameters on update loads
  useEffect(() => {
    setLocalNotifications(initialNotifications);
  }, [initialNotifications]);

  const unreadCount = localNotifications.filter(n => !n.isRead).length;

  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
    // Note: We don't automatically mark ALL as read on mount anymore so users can clear items individually!
  };

  // 🚀 SINGLE MARK READ METHOD
  const handleMarkAsReadInline = (e: React.MouseEvent, notifId: string) => {
    e.preventDefault();
    e.stopPropagation(); // 🎯 Stops the Link from firing and changing pages!

    // Optimistic Update: Mark it read instantly in local UI state
    setLocalNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, isRead: true } : n))
    );

    startTransition(async () => {
      await markSingleNotificationRead(notifId);
    });
  };

  // 🚀 SINGLE REMOVE ELEMENT METHOD
  const handleRemoveInline = (e: React.MouseEvent, notifId: string) => {
    e.preventDefault();
    e.stopPropagation(); // 🎯 Stops the Link from firing and changing pages!

    // Optimistic Update: Drop item from layout view list instantly
    setLocalNotifications(prev => prev.filter(n => n.id !== notifId));

    startTransition(async () => {
      await removeNotification(notifId);
    });
  };

  // 🚀 CLEAR ALL HANDLER
  const handleMarkAllAsRead = () => {
    setLocalNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    startTransition(async () => {
      await markNotificationsAsRead(currentUserId);
    });
  };

  // src/components/NotificationCenter.tsx (PART 2 - DRAWER OVERLAY MARKUP MATRIX)
  return (
    <div className="relative">
      {/* The Notification Bell Button Anchor Icon Element */}
      <button
        onClick={handleToggleOpen}
        className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center transition relative"
      >
        <span className="text-lg">🔔</span>
        
        {/* UNREAD INDICATOR DOT FLOATER */}
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
            {unreadCount > 0 ? (
              <button 
                onClick={handleMarkAllAsRead}
                className="bg-rose-50 hover:bg-rose-100 text-rose-500 font-bold text-[9px] px-2 py-0.5 rounded-full transition uppercase tracking-wide cursor-pointer"
              >
                Clear All 🎯
              </button>
            ) : (
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">All Caught Up</span>
            )}
          </div>

          <div className="divide-y divide-gray-50 mt-1">
            {localNotifications.length === 0 ? (
              <p className="text-gray-400 text-xs text-center py-8 font-medium">Your notification center is clear! 🌸</p>
            ) : (
              localNotifications.map((notif) => {
                const targetLinkUrl = notif.type === "FOLLOW" 
                  ? `/${notif.issuer.username}` 
                  : `/#post-${notif.postId}`;

                return (
                  <div key={notif.id} className="relative group/item">
                    <Link
                      href={targetLinkUrl}
                      onClick={() => setIsOpen(false)} 
                      className={`p-3 pr-20 rounded-xl flex items-start space-x-2.5 transition block border border-transparent text-left w-full ${
                        !notif.isRead ? "bg-rose-50/40 hover:bg-rose-50" : "hover:bg-gray-50"
                      }`}
                    >
                      {notif.issuer.avatarUrl ? (
                        <img src={notif.issuer.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-100 shadow-xs" />
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
                          {notif.type === "MENTION" && "tagged you inside a timeline discussion comment."}
                        </p>
                        <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                          {new Date(notif.createdAt).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </Link>

                    {/* 🚀 ACTION HUB BUTTON OVERLAYS: Floats inline on the right of each row card */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover/item:opacity-100 transition-opacity duration-200">
                      
                      {/* Individual Read Action Check Indicator Toggle */}
                      {!notif.isRead && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsReadInline(e, notif.id)}
                          className="w-6 h-6 rounded-lg bg-white border border-gray-200 shadow-xs hover:bg-rose-50 hover:border-rose-300 text-gray-400 hover:text-rose-500 transition flex items-center justify-center text-[10px]"
                          title="Mark as Read"
                        >
                          ✓
                        </button>
                      )}

                      {/* Remove / Clear Trashing Action Cross Toggle */}
                      <button
                        type="button"
                        onClick={(e) => handleRemoveInline(e, notif.id)}
                        className="w-6 h-6 rounded-lg bg-white border border-gray-200 shadow-xs hover:bg-red-50 hover:border-red-300 text-gray-400 hover:text-red-500 transition flex items-center justify-center text-[11px]"
                        title="Remove Notification"
                      >
                        ✕
                      </button>
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
