// src/app/notifications/MobileNotificationsClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import MobileNavShell from "@/components/MobileNavShell"; 

interface NotificationItem {
  id: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  postId: string | null;
  issuer: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

interface MobileNotificationsClientProps {
  currentUserId: string;
  initialNotifications: NotificationItem[];
  sessionUser: {
    username: string;
  };
}

export default function MobileNotificationsClient({ initialNotifications }: MobileNotificationsClientProps) {
  const [notifications] = useState<NotificationItem[]>(initialNotifications);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-28 select-none">
      
      {/* STICKY TOP PAGE ROUTER HEADER HEADER */}
      <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-4 flex items-center space-x-4 shadow-sm">
        <Link href="/" className="text-gray-400 hover:text-rose-500 text-lg transition font-black">
          🔙
        </Link>
        <div>
          <h1 className="font-black text-base text-gray-900 tracking-tight">Recent Activity</h1>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Dollspace Notifications</p>
        </div>
      </div>

      {/* ACTIVITY FEED MAIN CONTAINER STACK */}
      <div className="max-w-md mx-auto px-4 mt-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-2 flex flex-col gap-1">
          
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <span className="text-3xl block mb-2">🌸</span>
              <p className="font-black text-xs uppercase tracking-wider">Your notification center is clear!</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">We will alert you when new interactions roll in.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              // Compute dynamic landing endpoints depending on notification type mappings
              const targetLinkUrl = notif.type === "FOLLOW" 
                ? `/${notif.issuer.username}` 
                : `/#post-${notif.postId}`;

              return (
                <Link
                  key={notif.id} 
                  href={targetLinkUrl}
                  className="p-3.5 rounded-xl flex items-center space-x-3.5 transition hover:bg-gray-50/80 active:bg-gray-100 border border-transparent block text-left"
                >
                  {/* Account profile icon badge thumbnail slots */}
                  {notif.issuer.avatarUrl ? (
                    <img src={notif.issuer.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-100 shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 bg-rose-400 text-white rounded-full flex items-center justify-center font-black text-sm uppercase shrink-0 shadow-sm">
                      {notif.issuer.displayName.charAt(0)}
                    </div>
                  )}
                  
                  {/* Notification text layout line descriptions block */}
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="text-gray-800 leading-normal font-medium">
                      <strong className="font-black text-gray-900 block text-sm mb-0.5 leading-none">
                        {notif.issuer.displayName}
                      </strong>{" "}
                      {notif.type === "FOLLOW" && "started following your profile card."}
                      {notif.type === "COMMENT" && "replied to one of your timeline updates."}
                      {notif.type === "LIKE" && "liked your update post."}
                      {notif.type === "MENTION" && "tagged you inside a timeline discussion comment."}
                    </p>
                    
                    <span className="text-[10px] text-gray-400 font-bold block mt-1 uppercase tracking-wide">
                      {new Date(notif.createdAt).toLocaleDateString('en-AU', { 
                        day: 'numeric', 
                        month: 'short', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>

                  {/* Context helper icon indicator arrows right margin caps */}
                  <div className="text-gray-300 text-xs font-bold pl-1 select-none">
                    {notif.type === "FOLLOW" ? "👤" : "✨"}
                  </div>
                </Link>
              );
            })
          )}

        </div>
      </div>
      <MobileNavShell 
        currentUsername={sessionUser.username} 
        unreadMailCount={0} 
      />
	  
    </div>
  );
}
