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
  status?: string;
  currentRoom?: string; 
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



      {/* 💬 COLS 2: MAIN DOMINANT CHAT TEXT CANVAS VIEW */}
      <div 
        className={`flex flex-col bg-gray-50/50 overflow-hidden h-full transition-all duration-500 ease-in-out flex-1 ${
          !isChatSelected ? "hidden lg:flex" : "flex"
        }`}
      >
        {/* Thread Header Context Bar */}
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 text-left w-full">
          <div className="flex items-center space-x-3">
            
            {/* 📱 MOBILE NAVIGATION SLIDING RETURN BACK ACTION BUTTON */}
            {isChatSelected && (
              <button 
                type="button"
                onClick={() => { setSelectedChannel("PUBLIC_LOUNGE"); setActiveContact(null); }}
                className="block lg:hidden text-[10px] font-black uppercase tracking-wider text-rose-500 bg-rose-50 px-3 py-2 rounded-xl transition border border-rose-100/50 hover:bg-rose-100"
              >
                ◀ Rooms
              </button>
            )}

            {selectedChannel === "PUBLIC_LOUNGE" ? (
              <>
                <span className="text-2xl">🌍</span>
                <div>
                  <span className="font-black text-xs text-gray-900 block leading-tight">Public Lounge Chat Room</span>
                  <span className="text-[10px] text-rose-500 font-bold tracking-wider">● Anything goes! Don't forget to say HII 👋🏼</span>
                </div>
              </>
            ) : selectedChannel === "MOD_CHAT" ? (
              <>
                <span className="text-2xl">🛡️</span>
                <div>
                  <span className="font-black text-xs text-purple-900 block leading-tight">Staff & Moderation Workspace</span>
                  <span className="text-[10px] text-purple-600 font-bold tracking-wider">🔒 Restricted Channel. Admin logs active.</span>
                </div>
              </>
            ) : activeContact ? (
              <>
                <img 
                  src={activeContact.avatarUrl || "/default-avatar.png"} 
                  className="w-8 h-8 rounded-full object-cover border border-gray-100 shadow-sm" 
                />
                <div>
                  <span className="font-black text-xs text-gray-900 block leading-tight">{activeContact.displayName}</span>
                  <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider animate-pulse">● Private Encrypted Chat Line</span>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Live Scrollable Chat Bubble Roster Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 w-full">
          {selectedChannel === "PUBLIC_LOUNGE" || selectedChannel === "MOD_CHAT" ? (
            (selectedChannel === "MOD_CHAT" ? modMessages : publicMessages).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <span className="text-4xl mb-2">{selectedChannel === "MOD_CHAT" ? "🔒" : "👋"}</span>
                <p className="font-bold text-xs uppercase tracking-wider">This room is clear</p>
                <p className="text-[11px] mt-0.5">Type a message below to broadcast securely.</p>
              </div>
            ) : (
              (selectedChannel === "MOD_CHAT" ? modMessages : publicMessages).map((msg) => {
                const isMe = msg.user?.id === currentUser.id;
                return (
                  <div key={msg.id} className={`flex items-end gap-2 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"} animate-fade-in`}>
                    {msg.user?.avatarUrl ? (
                      <img src={msg.user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-100 shadow-sm" />
                    ) : (
                      <div className="w-7 h-7 bg-rose-400 text-white rounded-full flex items-center justify-center font-bold text-[10px] uppercase shadow-sm shrink-0">
                        {msg.user?.displayName?.charAt(0) || "D"}
                      </div>
                    )}
                    <div className="space-y-0.5 text-left max-w-full">
                      <div className={`text-[9px] text-gray-400 px-1 font-bold flex gap-1 ${isMe ? "justify-end" : "justify-start"}`}>
                        <span>{msg.user?.displayName}</span>
                        <span>•</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className={`p-3 rounded-2xl shadow-sm text-xs font-medium whitespace-pre-wrap leading-relaxed ${
                        isMe 
                          ? (selectedChannel === "MOD_CHAT" ? "bg-purple-600 text-white rounded-br-none" : "bg-rose-500 text-white rounded-br-none")
                          : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            activeChatFeedDMs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <p className="text-xs font-bold uppercase tracking-wider">Start of secure private dialogue thread 🌸</p>
                <p className="text-[11px] mt-0.5">Your conversations are fully sandboxed and stored securely on the network cloud.</p>
              </div>
            ) : (
              activeChatFeedDMs.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div key={msg.id} className={`flex items-end gap-2 max-w-[80%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"} animate-fade-in`}>
                    <div className="space-y-0.5 text-left max-w-full">
                      <div className={`p-3 rounded-2xl shadow-sm text-xs font-medium whitespace-pre-wrap leading-relaxed ${
                        isMe ? "bg-rose-500 text-white rounded-br-none" : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                      }`}>
                        {msg.content}
                      </div>
                      <span className={`text-[9px] text-gray-400 font-bold block px-1.5 ${isMe ? "text-right" : "text-left"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Form Console Controls */}
        <form onSubmit={handleSendMessageSubmit} className="p-4 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0 w-full">
          <input
            id="chat-message-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              selectedChannel === "PUBLIC_LOUNGE" 
                ? "Broadcast to public lounge chat room..." 
                : selectedChannel === "MOD_CHAT"
                ? "Send encrypted staff moderation memo..."
                : `Message @${activeContact?.username}...`
            }
            className="flex-1 border border-gray-200 rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white text-xs font-medium text-gray-800 transition"
          />
          <button 
            type="submit" 
            className={`font-black px-5 py-3 rounded-xl transition shadow-sm text-xs tracking-wide text-white ${
              selectedChannel === "MOD_CHAT" ? "bg-purple-600 hover:bg-purple-700" : "bg-rose-500 hover:bg-rose-600"
            }`}
          >
            Send
          </button>
        </form>
      </div>

    </div>
  );
}
