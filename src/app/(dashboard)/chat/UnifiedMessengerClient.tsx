// src/app/chat/UnifiedMessengerClient.tsx (PART 1 - LIFECYCLE & MUTATION STATES)
"use client";

import { useState, useRef, useEffect } from "react";
import usePartySocket from "partysocket/react";
import Link from "next/link";
import { saveDirectMessage, saveModChatMessage } from "@/app/actions/messages";
import ChatPresenceKeeper from "@/components/ChatPresenceKeeper"; 

interface Contact {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  status?: string; // 🎯 Synchronized status strings tracking
}

interface DirectMessageItem {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  recipientId: string;
  roomToken: string;
}

interface UnifiedClientProps {
  currentUser: any;
  platformUsers: Contact[];
  initialDMs: DirectMessageItem[];
  initialModMessages: any[]; 
}

function generateLocalRoomToken(userIdA: string, userIdB: string) {
  return [userIdA, userIdB].sort().join("--");
}

export default function UnifiedMessengerClient({ currentUser, platformUsers, initialDMs, initialModMessages = [] }: UnifiedClientProps) {
  const [selectedChannel, setSelectedChannel] = useState<string>("PUBLIC_LOUNGE");
  const [activeContact, setActiveContact] = useState<Contact | null>(null);

  const [publicMessages, setPublicMessages] = useState<any[]>([]);
  const [modMessages, setModMessages] = useState<any[]>(initialModMessages); 
  const [privateMessages, setPrivateMessages] = useState<DirectMessageItem[]>(initialDMs);
  const [inputText, setInputText] = useState("");
  
  const [activePresence, setActivePresence] = useState<Contact[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null); // 🎯 Tracks open custom list option tiles
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const optionMenuRef = useRef<HTMLDivElement>(null);

  const currentRoomToken = activeContact ? generateLocalRoomToken(currentUser.id, activeContact.id) : "";
  const hasStaffPrivileges = currentUser.role === "MOD" || currentUser.role === "ADMIN";

  // 📱 RESPONSIVE MOBILE SLIDING STATE TRACKER
  const isChatSelected = selectedChannel !== "PUBLIC_LOUNGE" || activeContact !== null;

  // 🔌 CLOUD WEBSOCKET CHANNEL HOOK
  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST || "my-partykit-app.chrisburpitt.partykit.dev", 
    room: "dollspace-messenger-hub",
    query: {
      id: currentUser.id,
      username: currentUser.username,
      displayName: currentUser.displayName,
      avatarUrl: currentUser.avatarUrl || "",
      currentRoom: selectedChannel,
      status: currentUser.status || "ONLINE"
    },
    onMessage(event) {
      try {
        const parsedData = JSON.parse(event.data);

        if (parsedData.type === "presence_update") {
          setActivePresence(parsedData.users);
        } else if (parsedData.type === "incoming_message") {
          if (parsedData.room === "MOD_CHAT") {
            setModMessages((prev) => prev.some(m => m.id === parsedData.id) ? prev : [...prev, parsedData]);
          } else {
            setPublicMessages((prev) => prev.some(m => m.id === parsedData.id) ? prev : [...prev, parsedData]);
          }
        } else if (parsedData.type === "incoming_direct_message") {
          const incomingDM: DirectMessageItem = {
            id: parsedData.id,
            content: parsedData.content,
            createdAt: parsedData.createdAt,
            senderId: parsedData.senderId,
            recipientId: parsedData.recipientId,
            roomToken: parsedData.roomToken
          };
          setPrivateMessages((prev) => prev.some(m => m.id === incomingDM.id) ? prev : [...prev, incomingDM]);
        }
      } catch (err) {
        console.error("Messenger packet stream parsing error:", err);
      }
    }
  });

  // Global listener closes floating option panels upon clicking outside areas
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (optionMenuRef.current && !optionMenuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.send(JSON.stringify({ type: "room_switch", newRoom: selectedChannel }));
    }
  }, [selectedChannel, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [publicMessages, modMessages, privateMessages, selectedChannel]);


// src/app/chat/UnifiedMessengerClient.tsx (PART 2A - DISPATCH METHODS & ACTIVE FILTERS)

  const handleSendMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const cleanText = inputText.trim();
    setInputText("");

    const clientMessageId = `msg-opt-${crypto.randomUUID()}`;
    const timestampString = new Date().toISOString();

    if (selectedChannel === "PUBLIC_LOUNGE" || selectedChannel === "MOD_CHAT") {
      const optimisticMsg = {
        id: clientMessageId,
        content: cleanText,
        createdAt: timestampString,
        room: selectedChannel,
        user: {
          id: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.displayName,
          avatarUrl: currentUser.avatarUrl
        }
      };

      if (selectedChannel === "MOD_CHAT") {
        setModMessages((prev) => [...prev, optimisticMsg]);
        saveModChatMessage(cleanText, currentUser.id).catch((err) => 
          console.error("Background message logging write failure:", err)
        );
      } else {
        setPublicMessages((prev) => [...prev, optimisticMsg]);
      }

      socket.send(JSON.stringify({ 
        type: "chat_message", 
        id: clientMessageId, 
        content: cleanText,
        room: selectedChannel
      }));

    } else if (activeContact) {
      const optimisticDM: DirectMessageItem = {
        id: clientMessageId,
        content: cleanText,
        createdAt: timestampString,
        senderId: currentUser.id,
        recipientId: activeContact.id,
        roomToken: currentRoomToken
      };
      setPrivateMessages((prev) => [...prev, optimisticDM]);

      socket.send(JSON.stringify({
        type: "direct_message",
        id: clientMessageId,
        content: cleanText,
        createdAt: timestampString,
        recipientId: activeContact.id,
        roomToken: currentRoomToken
      }));

      saveDirectMessage({
        senderId: currentUser.id,
        recipientId: activeContact.id,
        content: cleanText
      }).catch((err) => console.error("Background message save paused:", err));
    }
  };

  // 🎯 THE ONLINE ROSTER FILTER GATEWAY: 
  // Evaluates real-time socket arrays plus profile models. Maps strictly active/busy/away lines!
  const activePrivateLinesList = platformUsers.filter((doll) => {
    const isLiveInSocketPool = activePresence.some((u) => u.id === doll.id);
    const databasePresenceMarker = (doll as any).status || "OFFLINE";
    
    return isLiveInSocketPool || ["ONLINE", "AWAY", "BUSY"].includes(databasePresenceMarker);
  });

  const activeChatFeedDMs = privateMessages.filter(m => m.roomToken === currentRoomToken);

  return (
    <div className="flex h-full w-full bg-white select-none relative overflow-hidden">
      <ChatPresenceKeeper typingInputId="chat-message-input" />
      
      {/* 📱 COLS 1: SLIDING MOTION SIDEBAR GRID CELL */}
      <div 
        className={`h-full flex flex-col bg-white border-r border-gray-100 transition-all duration-500 ease-in-out shrink-0 ${
          isChatSelected 
            ? "w-[72px] lg:w-80 px-2 lg:px-4" // Collapses elegantly to show icons only on selected items
            : "w-full lg:w-80 px-4"          // Covers majority space on mobile if selection room stays open
        }`}
      >
        <div className="p-4 border-b border-gray-100 shrink-0 text-left">
          <h2 className={`font-black text-sm text-gray-900 uppercase tracking-wide ${isChatSelected ? "hidden lg:block text-center lg:text-left" : ""}`}>
            Conversations
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-1.5">
          {/* Public Lounge Access Row */}
          <button
            onClick={() => { setSelectedChannel("PUBLIC_LOUNGE"); setActiveContact(null); }}
            className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition text-left border ${
              selectedChannel === "PUBLIC_LOUNGE" 
                ? "bg-rose-500 text-white border-rose-600 shadow-sm" 
                : "hover:bg-gray-50 text-gray-700 border-transparent"
            } ${isChatSelected ? "justify-center lg:justify-start" : ""}`}
            title="Public Lounge"
          >
            <span className="text-xl shrink-0">🌍</span>
            <div className={`min-w-0 flex-1 ${isChatSelected ? "hidden lg:block" : ""}`}>
              <span className="font-black text-xs block leading-tight">Public Lounge Chat</span>
              <span className={`text-[10px] block font-bold ${selectedChannel === "PUBLIC_LOUNGE" ? "text-rose-100" : "text-rose-500"}`}>
                ✨ Lounge ({activePresence.filter(u => u.currentRoom === "PUBLIC_LOUNGE").length} inside)
              </span>
            </div>
          </button>

          {/* Secure Staff Mod Chat Cell */}
          {hasStaffPrivileges && (
            <button
              onClick={() => { setSelectedChannel("MOD_CHAT"); setActiveContact(null); }}
              className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition text-left border ${
                selectedChannel === "MOD_CHAT" 
                  ? "bg-purple-600 text-white border-purple-700 shadow-sm" 
                  : "bg-purple-50/40 hover:bg-purple-50 text-purple-700 border-transparent"
              } ${isChatSelected ? "justify-center lg:justify-start" : ""}`}
              title="Staff Mod Chat"
            >
              <span className="text-xl shrink-0">🛡️</span>
              <div className={`min-w-0 flex-1 ${isChatSelected ? "hidden lg:block" : ""}`}>
                <span className="font-black text-xs block leading-tight">Staff Mod Chat</span>
                <span className={`text-[10px] block font-bold ${selectedChannel === "MOD_CHAT" ? "text-purple-100" : "text-purple-500"}`}>
                  🔒 Restricted Channel
                </span>
              </div>
            </button>
          )}

          <div className={`text-[10px] uppercase font-black tracking-wider text-gray-400 px-3 pt-4 pb-1 text-left ${isChatSelected ? "hidden lg:block" : ""}`}>
            Private Lines
          </div>


// src/app/chat/UnifiedMessengerClient.tsx (PART 2B - USER TILES & OPTION CONTEXT MENUS)

          {/* Contacts Directory Map Rendering */}
          {activePrivateLinesList.map((contact) => {
            const isSelected = activeContact?.id === contact.id;
            
            // Resolve live presence statuses from active socket array updates
            const matchedLiveUser = activePresence.find(u => u.id === contact.id);
            const resolvedLiveStatus = matchedLiveUser?.status || (contact as any).status || "ONLINE";

            return (
              <div 
                key={contact.id}
                className={`w-full flex items-center justify-between p-2 rounded-2xl transition border group ${
                  isSelected ? "bg-rose-50 border-rose-100" : "border-transparent hover:bg-gray-50/60"
                }`}
              >
                <button
                  onClick={() => { setSelectedChannel(contact.id); setActiveContact(contact); }}
                  className={`flex items-center space-x-3 text-left min-w-0 flex-1 ${isChatSelected ? "justify-center lg:justify-start" : ""}`}
                >
                  {/* 🎨 THE COLORED STATUS INDICATOR RING WRAPPER */}
                  <div className="relative shrink-0 p-[2px]">
                    <img 
                      src={contact.avatarUrl || "/default-avatar.png"} 
                      alt="" 
                      className={`w-9 h-9 rounded-full object-cover shadow-sm border-2 ${
                        resolvedLiveStatus === "ONLINE" ? "border-green-500 ring-2 ring-green-400/20" :
                        resolvedLiveStatus === "AWAY" ? "border-yellow-500 ring-2 ring-yellow-400/20" :
                        resolvedLiveStatus === "BUSY" ? "border-red-500 ring-2 ring-red-400/20" : "border-gray-200"
                      }`} 
                    />
                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      resolvedLiveStatus === "ONLINE" ? "bg-green-500" :
                      resolvedLiveStatus === "AWAY" ? "bg-yellow-500" :
                      resolvedLiveStatus === "BUSY" ? "bg-red-500" : "bg-gray-300"
                    }`}></span>
                  </div>
                  
                  <div className={`min-w-0 flex-1 ${isChatSelected ? "hidden lg:block" : ""}`}>
                    <span className="font-black text-xs block leading-tight truncate text-gray-800">{contact.displayName}</span>
                    <span className="text-[10px] text-gray-400 font-semibold block truncate">@{contact.username}</span>
                  </div>
                </button>

                {/* 🎯 THE '...' ACTIONS CONTEXT MENU PACKET NODE */}
                <div className={`relative ${isChatSelected ? "hidden lg:block" : ""}`} ref={activeMenuId === contact.id ? optionMenuRef : null}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === contact.id ? null : contact.id); }}
                    className="px-2 py-1 text-gray-400 hover:text-gray-900 text-xs font-black transition cursor-pointer"
                  >
                    •••
                  </button>
                  
                  {activeMenuId === contact.id && (
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl p-1 z-50 animate-scale-up divide-y divide-gray-50 text-xs">
                      <Link href={`/${contact.username}`} className="w-full block px-3 py-2 text-left font-black text-gray-700 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition">
                        👤 View Profile
                      </Link>
                      <button type="button" onClick={() => { setActiveMenuId(null); alert("User ignored for 10 minutes."); }} className="w-full block px-3 py-2 text-left font-semibold text-amber-600 hover:bg-amber-50 rounded-lg transition">
                        ⏳ Ignore for 10 mins
                      </button>
                      <button type="button" onClick={() => { setActiveMenuId(null); alert("User blocked successfully."); }} className="w-full block px-3 py-2 text-left font-semibold text-red-600 hover:bg-red-50 rounded-lg transition">
                        🚫 Block User Account
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
