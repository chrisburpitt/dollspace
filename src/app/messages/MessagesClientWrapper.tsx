// src/app/messages/MessagesClientWrapper.tsx - TOP SECTION CLEANED UP
"use client";

import { useState, useRef, useEffect } from "react";
import usePartySocket from "partysocket/react";
import { saveDirectMessage } from "@/app/actions/messages"; // 🚀 FIXED: Removed generateRoomToken out of this action import

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

// 🚀 FIXED: Place the mathematical sort function out here so it executes instantly in the browser
function generateLocalRoomToken(userIdA: string, userIdB: string) {
  return [userIdA, userIdB].sort().join("--");
}

export default function MessagesClientWrapper({ currentUser, availableContacts, initialHistory }: WrapperProps) {
  const [contacts] = useState<Contact[]>(availableContacts);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<MessagePacket[]>(initialHistory);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🚀 FIXED: Point your socket room tracker to our local client function row
  const activeRoomToken = activeContact ? generateLocalRoomToken(currentUser.id, activeContact.id) : "idle-dm-room";

  // Connect to the synchronized private direct message channel path router room
  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST || "my-partykit-app.chrisburpitt.partykit.dev",
    room: activeRoomToken,
    query: { id: currentUser.id, username: currentUser.username, displayName: currentUser.displayName },
    onMessage(event) {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === "incoming_direct_message") {
          const freshMessage: MessagePacket = {
            id: parsed.id,
            content: parsed.content,
            createdAt: parsed.createdAt,
            senderId: parsed.senderId,
            recipientId: parsed.senderId === currentUser.id ? (activeContact?.id || "") : currentUser.id,
            roomToken: activeRoomToken
          };
          
          // Only append the live text packet if it belongs to the currently visible chat room layout view
          setMessages((prev) => {
            if (prev.some(m => m.id === freshMessage.id)) return prev;
            return [...prev, freshMessage];
          });
        }
      } catch (err) {
        console.error("Direct message link packet dropped:", err);
      }
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeContact]);

  const handleSendPrivateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContact) return;

    const currentText = inputText.trim();
    setInputText("");

    // 1. Instantly write record row archive down to Neon PostgreSQL cloud servers
    const savedRow = await saveDirectMessage({
      senderId: currentUser.id,
      recipientId: activeContact.id,
      content: currentText
    });

    if ("error" in savedRow) {
      alert(savedRow.error);
      return;
    }

    // 2. Broadcast the message packet to the private PartyKit room socket channel
    const dmPayload = {
      type: "direct_message",
      id: savedRow.id,
      content: savedRow.content,
      createdAt: savedRow.createdAt.toISOString()
    };

    socket.send(JSON.stringify(dmPayload));
  };

  // Filter messages to display only the conversations tied to the currently selected friend
  const activeChatFeed = messages.filter(m => m.roomToken === activeRoomToken);

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
        {activeContact ? (
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
                    <div key={msg.id} className={`flex items-end gap-2 max-w-[80%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                      <div className="space-y-0.5 text-left">
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
