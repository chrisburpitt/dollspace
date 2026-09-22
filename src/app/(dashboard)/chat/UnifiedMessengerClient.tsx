// src/app/chat/UnifiedMessengerClient.tsx (PART 1 - FRAMEWORK & REINFORCED FILTERS)
"use client";

import { useState, useRef, useEffect } from "react";
import usePartySocket from "partysocket/react";
import Link from "next/link";
import { saveDirectMessage, saveModChatMessage } from "@/app/actions/messages";
import ChatPresenceKeeper from "@/components/ChatPresenceKeeper"; 
import { ignoreUserAction, blockUserAction } from "@/app/actions/moderation";

interface Contact {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  status?: string;
  currentRoom?: string;
  location?: string | null;
  genderIdentity?: string | null; 
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
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null); 
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const optionMenuRef = useRef<HTMLDivElement>(null);

  const currentRoomToken = activeContact ? generateLocalRoomToken(currentUser.id, activeContact.id) : "";
  const hasStaffPrivileges = currentUser.role === "MOD" || currentUser.role === "ADMIN";

  // 📱 RESPONSIVE DYNAMIC TOGGLE
  const [mobileViewState, setMobileViewState] = useState<"ROOMS" | "WORKSPACE">("ROOMS");
  const isChatSelected = mobileViewState === "WORKSPACE";

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

  // Filter out offline rows dynamically
  const activePrivateLinesList = platformUsers.filter((doll) => {
    const isLiveInSocketPool = activePresence.some((u) => u.id === doll.id);
    const databasePresenceMarker = (doll as any).status || "OFFLINE";
    return isLiveInSocketPool || ["ONLINE", "AWAY", "BUSY"].includes(databasePresenceMarker);
  });

  const activeChatFeedDMs = privateMessages.filter(m => m.roomToken === currentRoomToken);


  return (
    <div className="flex h-full w-full bg-white select-none relative overflow-hidden max-h-full">
      <ChatPresenceKeeper typingInputId="chat-message-input" />
      
      {/* 🚀 LEFT COLUMN: ROOM SELECTORS & CONVERSATIONS LIST */}
      {/* On mobile screens, this container slides completely hidden if a chat space cell goes live */}
      <div 
        className={`h-full flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ease-in-out shrink-0 ${
          isChatSelected 
            ? "hidden md:flex md:w-72 lg:w-80 px-4" // Completely hidden on mobile when viewing a chat!
            : "w-full md:w-72 lg:w-80 px-4"         // Displays wide if no chat window is selected
        }`}
      >
        <div className="p-4 border-b border-gray-100 shrink-0 text-left">
          <h2 className="font-black text-sm text-gray-900 uppercase tracking-wide">
            Conversations
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-1.5">
          {/* Public Lounge Access Row */}
          <button
            onClick={() => { setSelectedChannel("PUBLIC_LOUNGE"); setActiveContact(null); setMobileViewState("WORKSPACE"); }}
            className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition text-left border ${
              selectedChannel === "PUBLIC_LOUNGE" 
                ? "bg-rose-500 text-white border-rose-600 shadow-sm" 
                : "hover:bg-gray-50 text-gray-700 border-transparent"
            }`}
          >
            <span className="text-xl shrink-0">🌍</span>
            <div className="min-w-0 flex-1text-left">
              <span className="font-black text-xs block leading-tight">Public Lounge Chat</span>
              <span className={`text-[10px] block font-bold ${selectedChannel === "PUBLIC_LOUNGE" ? "text-rose-100" : "text-rose-500"}`}>
                ✨ Lounge ({activePresence.filter(u => u.currentRoom === "PUBLIC_LOUNGE").length} inside)
              </span>
            </div>
          </button>

          {/* Secure Staff Mod Chat Cell */}
          {hasStaffPrivileges && (
            <button
              onClick={() => { setSelectedChannel("MOD_CHAT"); setActiveContact(null); setMobileViewState("WORKSPACE"); }}
              className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition text-left border ${
                selectedChannel === "MOD_CHAT" 
                  ? "bg-purple-600 text-white border-purple-700 shadow-sm" 
                  : "bg-purple-50/40 hover:bg-purple-50 text-purple-700 border-transparent"
              }`}
            >
              <span className="text-xl shrink-0">🛡️</span>
              <div className="min-w-0 flex-1 text-left">
                <span className="font-black text-xs block leading-tight">Staff Mod Chat</span>
                <span className={`text-[10px] block font-bold ${selectedChannel === "MOD_CHAT" ? "text-purple-100" : "text-purple-500"}`}>
                  🔒 Restricted Channel
                </span>
              </div>
            </button>
          )}

          <div className="text-[10px] uppercase font-black tracking-wider text-gray-400 px-3 pt-4 pb-1 text-left">
            Online Users
          </div>

          {/* Contacts Directory Map Rendering */}
          {activePrivateLinesList.map((contact) => {
            const isSelected = activeContact?.id === contact.id;
            const matchedLiveUser = activePresence.find(u => u.id === contact.id);
            const resolvedLiveStatus = matchedLiveUser?.status || (contact as any).status || "ONLINE";

            return (
              <div 
                key={contact.id}
                className={`w-full flex items-center justify-between p-2 rounded-2xl transition border ${
                  isSelected ? "bg-rose-50 border-rose-100" : "border-transparent hover:bg-gray-50/60"
                }`}
              >
                <button
                  onClick={() => { setSelectedChannel(contact.id); setActiveContact(contact); setMobileViewState("WORKSPACE"); }}
                  className="flex items-center space-x-3 text-left min-w-0 flex-1"
                >
                  {/* Colored indicator ring */}
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
                  
                  <div className="min-w-0 flex-1 text-left">
                    <span className="font-black text-xs block leading-tight truncate text-gray-800">
                      {contact.displayName}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold block truncate leading-tight">
                      @{contact.username}
                    </span>
  
                    {/* 🎯 THE DISCOVERY BADGES INJECTION LAYER */}
                    {/* Renders beautifully below their profile tags if populated in Neon PostgreSQL */}
                    {(contact.genderIdentity || contact.location) && (
                      <div className="flex items-center flex-wrap gap-1 mt-1 max-w-full truncate select-none">
                        {contact.genderIdentity && (
                          <span className="bg-rose-50 text-rose-500 font-bold px-1.5 py-0.5 rounded text-[8px] tracking-wide uppercase shrink-0">
                            ✨ {contact.genderIdentity}
                          </span>
                        )}
                        {contact.location && (
                          <span className="bg-gray-100 text-gray-500 font-medium px-1.5 py-0.5 rounded text-[8px] tracking-wide truncate max-w-[100px]">
                            📍 {contact.location}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>

                {/* Dropdown triggers */}
                <div className="relative" ref={activeMenuId === contact.id ? optionMenuRef : null}>
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
                      <button 
                        type="button" 
                        onClick={async () => { 
                          setActiveMenuId(null); 
                          const res = await ignoreUserAction(contact.id); 
                          if (res.success) alert(`Muted @${contact.username} for 10 minutes.`);
                        }} 
                        className="w-full block px-3 py-2 text-left font-semibold text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      >
                        ⏳ Ignore for 10 mins
                      </button>
                      <button 
                        type="button" 
                        onClick={async () => { 
                          setActiveMenuId(null); 
                          const res = await blockUserAction(contact.id);
                          if (res.success) alert(`Successfully blocked @${contact.username}.`);
                        }} 
                        className="w-full block px-3 py-2 text-left font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
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


      {/* 💬 MAIN CHAT WORKSPACE CONSOLE VIEW */}
      <div 
        className={`flex flex-col bg-gray-50/50 h-full w-full min-h-0 flex-1 relative ${
          !isChatSelected ? "hidden md:flex" : "flex"
        }`}
      >
        {/* THE REFINED HEADER ROW */}
        <div className="p-4 py-2 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 text-left w-full h-14 min-h-14 overflow-hidden">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            
            {/* ROOMS BACK BUTTON */}
            {isChatSelected && (
              <button 
                type="button"
                onClick={() => { setMobileViewState("ROOMS"); }}
                className="block md:hidden font-black uppercase text-[10px] tracking-wider text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-100/60 px-3 py-1.5 rounded-xl shrink-0 transition"
              >
                ◀ Rooms
              </button>
            )}

            {selectedChannel === "PUBLIC_LOUNGE" ? (
              <div className="flex items-center justify-between w-full min-w-0 pr-1">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="text-lg shrink-0">🌍</span>
                  <span className="font-black text-xs text-gray-900 block truncate leading-none">Public Lounge Chat Room</span>
                </div>
                <span className="bg-green-50 border border-green-100 text-green-600 text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap ml-2">
                  ● {activePresence.filter(u => u.currentRoom === "PUBLIC_LOUNGE").length} Dolls Here
                </span>
              </div>
            ) : selectedChannel === "MOD_CHAT" ? (
              <div className="flex items-center justify-between w-full min-w-0 pr-1">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="text-lg shrink-0">🛡️</span>
                  <span className="font-black text-xs text-purple-900 block truncate leading-none">Staff Moderation Panel</span>
                </div>
                <span className="bg-purple-50 border border-purple-100 text-purple-600 text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap ml-2">
                  🔒 Secure
                </span>
              </div>
            ) : activeContact ? (
              <div className="flex items-center justify-between w-full min-w-0 pr-1">
                <div className="flex items-center space-x-2 min-w-0">
                  <img 
                    src={activeContact.avatarUrl || "/default-avatar.png"} 
                    className="w-7 h-7 rounded-full object-cover border border-gray-100 shadow-sm shrink-0" 
                  />
                  <span className="font-black text-xs text-gray-900 block truncate leading-none">{activeContact.displayName}</span>
                </div>
                <span className="bg-rose-50 border border-rose-100 text-rose-500 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap ml-2">
                  🔒 Private Message
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* 🚀 THE FIXED INSET CONTAINER: Perfectly wraps your scroll boxes and layout logic */}
        <div className="flex-1 min-h-0 w-full relative bg-gray-50/30">
          <div className="absolute inset-0 overflow-y-auto p-4 space-y-3 flex flex-col">
            
            {selectedChannel === "PUBLIC_LOUNGE" || selectedChannel === "MOD_CHAT" ? (
              /* MODE A: PUBLIC LOUNGE / STAFF MOD ROOM VIEWS */
              (selectedChannel === "MOD_CHAT" ? modMessages : publicMessages).length === 0 ? (
                <div className="my-auto flex flex-col items-center justify-center text-gray-400">
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
              /* MODE B: SECURE SINGLE INSTANCE PRIVATE DM VIEW STREAM */
              activeChatFeedDMs.length === 0 ? (
                <div className="my-auto flex flex-col items-center justify-center text-gray-400">
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
            
            {/* Safe baseline scroller node placement */}
            <div ref={messagesEndRef} />
          </div>
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
                ? "Say something..." 
                : selectedChannel === "MOD_CHAT"
                ? "Say something..."
                : `Message @${activeContact?.username}...`
            }
            className="flex-1 border border-gray-200 rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white text-xs font-medium text-gray-800 transition"
          />
          <button 
            type="submit" 
            className={`font-black px-5 py-3 rounded-xl transition shadow-sm text-xs tracking-wide text-white shrink-0 ${
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