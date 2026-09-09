// src/app/messages/MessagesClientWrapper.tsx (PART 1 - REAL-TIME FIX)
"use client";

import { useState, useRef, useEffect } from "react";
import PartySocket from "partysocket";
import { saveDirectMessage } from "@/app/actions/messages";

interface Contact {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

interface MessagePacket {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  recipientId: string;
  roomToken: string;
}

interface WrapperProps {
  currentUser: any;
  availableContacts: Contact[];
  initialHistory: MessagePacket[];
}

function generateLocalRoomToken(userIdA: string, userIdB: string) {
  return [userIdA, userIdB].sort().join("--");
}

export default function MessagesClientWrapper({ currentUser, availableContacts, initialHistory }: WrapperProps) {
  const [contacts] = useState<Contact[]>(availableContacts);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<MessagePacket[]>(initialHistory);
  const [inputText, setInputText] = useState("");
  
  const socketRef = useRef<PartySocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeRoomToken = activeContact ? generateLocalRoomToken(currentUser.id, activeContact.id) : null;

  // 🔌 CONNECT AND LISTEN TO REAL-TIME CHANNELS AUTOMATICALLY ON CONTACT SELECTION
  useEffect(() => {
    if (!activeRoomToken) return;

    if (socketRef.current) {
      socketRef.current.close();
    }

    const socketInstance = new PartySocket({
      // 🎯 Automatically reads your live server variable out of Vercel configs safely
      host: process.env.NEXT_PUBLIC_PARTYKIT_HOST || "my-partykit-app.chrisburpitt.partykit.dev", 
      room: activeRoomToken,
      query: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName
      }
    });

    socketInstance.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        
        // 🚀 CATCH INCOMING LIVE PRIVATE CHAT PACKETS Snappily
        if (parsed.type === "incoming_direct_message") {
          const freshMessage: MessagePacket = {
            id: parsed.id,
            content: parsed.content,
            createdAt: parsed.createdAt,
            senderId: parsed.senderId,
            recipientId: parsed.senderId === currentUser.id ? (activeContact?.id || "") : currentUser.id,
            roomToken: activeRoomToken
          };
          
          setMessages((prev) => {
            if (prev.some(m => m.id === freshMessage.id)) return prev;
            return [...prev, freshMessage];
          });
        }
      } catch (err) {
        console.error("Direct message link packet parsing dropped:", err);
      }
    };

    socketRef.current = socketInstance;

    return () => {
      socketInstance.close();
    };
  }, [activeRoomToken, activeContact, currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeContact]);

  const handleSendPrivateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContact || !activeRoomToken || !socketRef.current) return;

    const currentText = inputText.trim();
    setInputText("");

    // 1. Permanently record your text conversation down into Neon PostgreSQL cloud tables
    const savedRow = await saveDirectMessage({
      senderId: currentUser.id,
      recipientId: activeContact.id,
      content: currentText
    });

    if ("error" in savedRow) {
      alert(savedRow.error);
      return;
    }

    // 2. Broadcast the message packet payload directly up across our live PartyKit server channels
    const dmPayload = {
      type: "direct_message",
      id: savedRow.id,
      content: savedRow.content,
      createdAt: savedRow.createdAt.toISOString()
    };

    socketRef.current.send(JSON.stringify(dmPayload));
  };

  const activeChatFeed = activeRoomToken ? messages.filter(m => m.roomToken === activeRoomToken) : [];


  // src/app/messages/MessagesClientWrapper.tsx (PART 2 - REAL-TIME FIX)
  return (
    <div className="flex h-full divide-x divide-gray-200">
      
      {/* PANEL SECTION A: Left Inbox Contacts Sidebar */}
      <div className="w-1/3 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-black text-base text-gray-900 uppercase tracking-wide">Direct Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 p-2 space-y-1">
          {contacts.map((contact) => {
            const isSelected = activeContact?.id === contact.id;
            return (
              <button
                key={contact.id}
                onClick={() => setActiveContact(contact)}
                className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition text-left ${
                  isSelected ? "bg-rose-50 text-rose-600 border border-rose-100" : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                {contact.avatarUrl ? (
                  <img src={contact.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0 shadow-sm border border-gray-100" />
                ) : (
                  <div className="w-9 h-9 bg-rose-400 text-white rounded-full flex items-center justify-center font-bold text-sm uppercase shrink-0">
                    {contact.displayName.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <span className="font-black text-xs block leading-tight truncate">{contact.displayName}</span>
                  <span className="text-[10px] text-gray-400 font-semibold block truncate">@{contact.username}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* PANEL SECTION B: Right Real-Time Conversation Stream Canvas */}
      <div className="w-2/3 flex flex-col bg-gray-50/50">
        {activeContact && activeRoomToken ? (
          <>
            {/* Thread Active Header Banner Bar */}
            <div className="p-4 bg-white border-b border-gray-200 flex items-center space-x-3 text-left">
              {activeContact.avatarUrl ? (
                <img src={activeContact.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shadow-sm border border-gray-100" />
              ) : (
                <div className="w-8 h-8 bg-rose-400 text-white rounded-full flex items-center justify-center font-bold text-xs uppercase">
                  {activeContact.displayName.charAt(0)}
                </div>
              )}
              <div>
                <span className="font-black text-xs text-gray-900 block leading-tight">{activeContact.displayName}</span>
                <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider animate-pulse">● Private Encrypted Line</span>
              </div>
            </div>

            {/* Conversation Core Message Bubble List Box */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeChatFeed.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <p className="text-xs font-bold uppercase tracking-wider">Start of message thread 🌸</p>
                  <p className="text-[11px] mt-0.5">Send a message below to unlock real-time encrypted dialogue chat lines.</p>
                </div>
              ) : (
                activeChatFeed.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex items-end gap-2 max-w-[80%] ${
                        isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                      } animate-fade-in`}
                    >
                      <div className="space-y-0.5 text-left max-w-full">
                        <div className={`p-3 rounded-2xl shadow-sm text-xs font-medium whitespace-pre-wrap leading-relaxed ${
                          isMe 
                            ? "bg-rose-500 text-white rounded-br-none" 
                            : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
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
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Message Form Bar Console */}
            <form onSubmit={handleSendPrivateMessage} className="p-4 bg-white border-t border-gray-200 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message @${activeContact.username}...`}
                className="flex-1 border border-gray-200 rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white text-xs font-medium text-gray-800 transition"
              />
              <button type="submit" className="bg-rose-500 text-white font-black px-5 py-3 rounded-xl hover:bg-rose-600 transition shadow-sm text-xs tracking-wide">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
            <span className="text-4xl mb-2">💌</span>
            <p className="font-bold text-sm text-gray-700">No Chat Selected</p>
            <p className="text-xs max-w-xs mt-1">Select a contact card from the left panel column roster folder to start direct private messaging!</p>
          </div>
        )}
      </div>

    </div>
  );
}
