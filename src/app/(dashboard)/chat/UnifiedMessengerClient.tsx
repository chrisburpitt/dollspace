// src/app/chat/UnifiedMessengerClient.tsx (PART 1 - LIFECYCLE & STATE HOOKS)
"use client";

import { useState, useRef, useEffect } from "react";
import usePartySocket from "partysocket/react";
import { saveDirectMessage, saveModChatMessage  } from "@/app/actions/messages";
import ChatPresenceKeeper from "@/components/ChatPresenceKeeper"; 

interface Contact {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
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

export default function UnifiedMessengerClient({ currentUser, platformUsers, initialDMs, initialModMessages = []  }: UnifiedClientProps) {
  const [selectedChannel, setSelectedChannel] = useState<string>("PUBLIC_LOUNGE");
  const [activeContact, setActiveContact] = useState<Contact | null>(null);

  const [publicMessages, setPublicMessages] = useState<any[]>([]);
  const [modMessages, setModMessages] = useState<any[]>(initialModMessages); 
  const [privateMessages, setPrivateMessages] = useState<DirectMessageItem[]>(initialDMs);
  const [inputText, setInputText] = useState("");
  
  const [activePresence, setActivePresence] = useState<Contact[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentRoomToken = activeContact ? generateLocalRoomToken(currentUser.id, activeContact.id) : "";
  const hasStaffPrivileges = currentUser.role === "MOD" || currentUser.role === "ADMIN";

  // 🔌 SOCKET CONNECTION HOOK
  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST || "my-partykit-app.chrisburpitt.partykit.dev", 
    room: "dollspace-messenger-hub",
    query: {
      id: currentUser.id,
      username: currentUser.username,
      displayName: currentUser.displayName,
      avatarUrl: currentUser.avatarUrl || "",
      currentRoom: selectedChannel
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

  // 🚀 ROOM SWAP TRIGGER: Syncs channel swaps with PartyKit instantly
  useEffect(() => {
    if (socket) {
      socket.send(JSON.stringify({
        type: "room_switch",
        newRoom: selectedChannel
      }));
    }
  }, [selectedChannel, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [publicMessages, modMessages, privateMessages, selectedChannel]);

  // 🚀 MESSAGE DISPATCH CONTROLLER: Handles instant optimistic item injections
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

  const activeChatFeedDMs = privateMessages.filter(m => m.roomToken === currentRoomToken);

  return (
    <div className="flex h-full divide-x divide-gray-200 w-full">
      <ChatPresenceKeeper typingInputId="chat-message-input" />
      
      {/* 📂 LEFT COLUMN: CONVERSATIONS SIDEBAR LIST */}
      <div className="w-1/3 flex flex-col bg-white overflow-hidden shrink-0">
        <div className="p-4 border-b border-gray-100 shrink-0">
          <h2 className="font-black text-base text-gray-900 uppercase tracking-wide">Conversations</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Public Lounge Access Row */}
          <button
            onClick={() => { setSelectedChannel("PUBLIC_LOUNGE"); setActiveContact(null); }}
            className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition text-left border ${
              selectedChannel === "PUBLIC_LOUNGE" 
                ? "bg-rose-500 text-white border-rose-600 shadow-sm" 
                : "hover:bg-gray-50 text-gray-700 border-transparent"
            }`}
          >
            <span className="text-xl">🌍</span>
            <div className="min-w-0 flex-1">
              <span className="font-black text-xs block leading-tight">Public Lounge Chat</span>
              <span className={`text-[10px] block font-bold ${selectedChannel === "PUBLIC_LOUNGE" ? "text-rose-100" : "text-rose-500"}`}>
                ✨ Lounge ({selectedChannel === "PUBLIC_LOUNGE" ? activePresence.length : "•"} inside)
              </span>
            </div>
          </button>

          {/* 🛡️ SECURE MOD CHAT CELL INJECTION */}
          {hasStaffPrivileges && (
            <button
              onClick={() => { setSelectedChannel("MOD_CHAT"); setActiveContact(null); }}
              className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition text-left border ${
                selectedChannel === "MOD_CHAT" 
                  ? "bg-purple-600 text-white border-purple-700 shadow-sm" 
                  : "bg-purple-50/40 hover:bg-purple-50 text-purple-700 border-transparent"
              }`}
            >
              <span className="text-xl">🛡️</span>
              <div className="min-w-0 flex-1">
                <span className="font-black text-xs block leading-tight">Staff Mod Chat</span>
                <span className={`text-[10px] block font-bold ${selectedChannel === "MOD_CHAT" ? "text-purple-100" : "text-purple-500"}`}>
                  🔒 Restricted ({selectedChannel === "MOD_CHAT" ? activePresence.length : "•"} active)
                </span>
              </div>
            </button>
          )}

          <div className="text-[10px] uppercase font-black tracking-wider text-gray-400 px-3 pt-4 pb-1">Private Lines</div>

          {/* Contacts Directory Map Rendering */}
          {platformUsers.map((contact) => {
            const isSelected = selectedChannel === contact.id;
            const isOnlineInThisRoom = activePresence.some(u => u.id === contact.id);

            return (
              <button
                key={contact.id}
                onClick={() => { setSelectedChannel(contact.id); setActiveContact(contact); }}
                className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition text-left border ${
                  isSelected ? "bg-rose-50 text-rose-600 border-rose-100" : "hover:bg-gray-50 text-gray-700 border-transparent"
                }`}
              >
                <div className="relative shrink-0">
                  {contact.avatarUrl ? (
                    <img src={contact.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover shadow-sm border border-gray-100" />
                  ) : (
                    <div className="w-9 h-9 bg-rose-400 text-white rounded-full flex items-center justify-center font-bold text-sm uppercase shrink-0">
                      {contact.displayName.charAt(0)}
                    </div>
                  )}
                  {isOnlineInThisRoom && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></span>}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-black text-xs block leading-tight truncate">{contact.displayName}</span>
                  <span className="text-[10px] text-gray-400 font-semibold block truncate">@{contact.username}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 💬 RIGHT COLUMN: ACTIVE CONVERSATION WORKSPACE TEXT CANVAS */}
      <div className="w-2/3 flex flex-col bg-gray-50/50 overflow-hidden h-full">
        {/* Thread Header Context Bar */}
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 text-left w-full">
          <div className="flex items-center space-x-3">
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
                {activeContact.avatarUrl ? (
                  <img src={activeContact.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shadow-sm border border-gray-100" />
                ) : (
                  <div className="w-8 h-8 bg-rose-400 text-white rounded-full flex items-center justify-center font-bold text-xs uppercase">
                    {activeContact.displayName.charAt(0)}
                  </div>
                )}
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
            /* MODE A: PUBLIC LOUNGE / STAFF MOD ROOM VIEWS */
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
            /* MODE B: SECURE SINGLE INSTANCE PRIVATE DM VIEW STREAM */
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
