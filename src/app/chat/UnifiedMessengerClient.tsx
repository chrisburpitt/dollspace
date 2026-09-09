// src/app/chat/UnifiedMessengerClient.tsx (PART 1 - LIGHTNING FAST PUBLIC & PRIVATE FIX)
"use client";

import { useState, useRef, useEffect } from "react";
import usePartySocket from "partysocket/react";
import { saveDirectMessage } from "@/app/actions/messages";
import Link from "next/link";

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
}

function generateLocalRoomToken(userIdA: string, userIdB: string) {
  return [userIdA, userIdB].sort().join("--");
}

export default function UnifiedMessengerClient({ currentUser, platformUsers, initialDMs }: UnifiedClientProps) {
  const [selectedChannel, setSelectedChannel] = useState<string>("PUBLIC_LOUNGE");
  const [activeContact, setActiveContact] = useState<Contact | null>(null);

  const [publicMessages, setPublicMessages] = useState<any[]>([]);
  const [privateMessages, setPrivateMessages] = useState<DirectMessageItem[]>(initialDMs);
  const [inputText, setInputText] = useState("");
  
  const [activePresence, setActivePresence] = useState<Contact[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentRoomToken = activeContact ? generateLocalRoomToken(currentUser.id, activeContact.id) : "";

  // 🔌 PERSISTENT SINGLE SOCKET HOOK LAYER CONNECTS TO GLOBAL SERVER HUB
  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST || "my-partykit-app.chrisburpitt.partykit.dev", // Ensure this matches your live PartyKit host URL!
    room: "dollspace-messenger-hub",
    query: {
      id: currentUser.id,
      username: currentUser.username,
      displayName: currentUser.displayName,
      avatarUrl: currentUser.avatarUrl || ""
    },
    onMessage(event) {
      try {
        const parsedData = JSON.parse(event.data);

        if (parsedData.type === "presence_update") {
          setActivePresence(parsedData.users);
        } else if (parsedData.type === "incoming_message") {
          setPublicMessages((prev) => {
            // 🚀 Prevent duplicate text bubbles if it was already added optimistically by the sender
            if (prev.some(m => m.id === parsedData.id)) return prev;
            return [...prev, parsedData];
          });
        } else if (parsedData.type === "incoming_direct_message") {
          const incomingDM: DirectMessageItem = {
            id: parsedData.id,
            content: parsedData.content,
            createdAt: parsedData.createdAt,
            senderId: parsedData.senderId,
            recipientId: parsedData.recipientId,
            roomToken: parsedData.roomToken
          };
          
          setPrivateMessages((prev) => {
            if (prev.some(m => m.id === incomingDM.id)) return prev;
            return [...prev, incomingDM];
          });
        }
      } catch (err) {
        console.error("Messenger packet stream parsing error:", err);
      }
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [publicMessages, privateMessages, selectedChannel]);

  // 🚀 DISPATCHER ENGINE: Handles instant multi-channel optimistic rendering updates
  const handleSendMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const cleanText = inputText.trim();
    setInputText("");

    const clientMessageId = `msg-opt-${crypto.randomUUID()}`;
    const timestampString = new Date().toISOString();

    if (selectedChannel === "PUBLIC_LOUNGE") {
      // 🌟 PUBLIC OPTIMISTIC UPDATE: Inject straight onto the screen instantly!
      const optimisticPublicMsg = {
        id: clientMessageId,
        content: cleanText,
        createdAt: timestampString,
        user: {
          id: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.displayName,
          avatarUrl: currentUser.avatarUrl
        }
      };
      setPublicMessages((prev) => [...prev, optimisticPublicMsg]);

      // 🌍 Send to public chatroom stream channels over global server
      socket.send(JSON.stringify({ 
        type: "chat_message", 
        id: clientMessageId, 
        content: cleanText 
      }));

    } else if (activeContact) {
      // 🌟 PRIVATE OPTIMISTIC UPDATE: Inject straight onto the screen instantly!
      const optimisticDM: DirectMessageItem = {
        id: clientMessageId,
        content: cleanText,
        createdAt: timestampString,
        senderId: currentUser.id,
        recipientId: activeContact.id,
        roomToken: currentRoomToken
      };
      setPrivateMessages((prev) => [...prev, optimisticDM]);

      // 💌 Send to private PartyKit room socket channel
      socket.send(JSON.stringify({
        type: "direct_message",
        id: clientMessageId,
        content: cleanText,
        createdAt: timestampString,
        recipientId: activeContact.id,
        roomToken: currentRoomToken
      }));

      // Background permanent database archival logging row save
      saveDirectMessage({
        senderId: currentUser.id,
        recipientId: activeContact.id,
        content: cleanText
      }).catch((err) => console.error("Background message archival save paused:", err));
    }
  };

  const activeChatFeedDMs = privateMessages.filter(m => m.roomToken === currentRoomToken);



  // src/app/chat/UnifiedMessengerClient.tsx (PART 2 - PASTE THIS DIRECTLY UNDERNEATH PART 1)
  return (
    <div className="flex h-full divide-x divide-gray-200">
      
      {/* 📂 CHANNEL ROSTER SIDEBAR (1/3 Width Layout Box) */}
      <div className="w-1/3 flex flex-col bg-white overflow-hidden">
        <div className="p-4 border-b border-gray-100 shrink-0">
          <h2 className="font-black text-base text-gray-900 uppercase tracking-wide">Conversations</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Public Chatroom Channel Toggle Cell Trigger Option */}
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
                ✨ Broadcast Room ({activePresence.length} online)
              </span>
            </div>
          </button>

          <div className="text-[10px] uppercase font-black tracking-wider text-gray-400 px-3 pt-4 pb-1">Private Encrypted Lines</div>

          {/* Map through available platforms user contacts lists */}
          {platformUsers.map((contact) => {
            const isSelected = selectedChannel === contact.id;
            const isOnlineNow = activePresence.some(u => u.id === contact.id);

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
                  {isOnlineNow && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></span>}
                </div>
                <div className="min-w-0">
                  <span className="font-black text-xs block leading-tight truncate">{contact.displayName}</span>
                  <span className="text-[10px] text-gray-400 font-semibold block truncate">@{contact.username}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>


      {/* src/app/chat/UnifiedMessengerClient.tsx (PART 3 - PASTE THIS DIRECTLY UNDERNEATH PART 2) */}
      {/* 💬 MESSAGE FEED WORKSPACE (2/3 Width Layout Box Rendering Canvas) */}
      <div className="w-2/3 flex flex-col bg-gray-50/50 overflow-hidden">
        {/* Thread Dynamic Conditional Header Bar */}
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 text-left">
          <div className="flex items-center space-x-3">
            {selectedChannel === "PUBLIC_LOUNGE" ? (
              <>
                <span className="text-2xl">🌍</span>
                <div>
                  <span className="font-black text-xs text-gray-900 block leading-tight">Public Lounge Chat Room</span>
                  <span className="text-[10px] text-rose-500 font-bold tracking-wider">● Anything goes! Don't forget to say Hi 👋🏼</span>
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

        {/* Conversation Message Bubble List Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {selectedChannel === "PUBLIC_LOUNGE" ? (
            /* RENDERING MODE A: Global Chat Bubble Stream */
            publicMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <span className="text-4xl mb-2">👋</span>
                <p className="font-bold text-xs uppercase tracking-wider">Lounge room is quiet</p>
                <p className="text-[11px] mt-0.5">Be the first to say hello or share a story with the other Dolls!</p>
              </div>
            ) : (
              publicMessages.map((msg) => {
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
                        isMe ? "bg-rose-500 text-white rounded-br-none" : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            /* RENDERING MODE B: Private Selected DM Bubble Stream */
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

        {/* Unified Input Text Control Box Bar Form Console */}
        <form onSubmit={handleSendMessageSubmit} className="p-4 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={selectedChannel === "PUBLIC_LOUNGE" ? "Broadcast to public lounge chat room..." : `Message @${activeContact?.username}...`}
            className="flex-1 border border-gray-200 rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white text-xs font-medium text-gray-800 transition"
          />
          <button type="submit" className="bg-rose-500 text-white font-black px-5 py-3 rounded-xl hover:bg-rose-600 transition shadow-sm text-xs tracking-wide">
            Send
          </button>
        </form>
      </div>

    </div>
  );
}
