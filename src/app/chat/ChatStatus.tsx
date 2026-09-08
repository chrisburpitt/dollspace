"use client";

import { useState, useRef, useEffect } from "react";
import usePartySocket from "partysocket/react";

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  avatar: string;
  timestamp: string;
}

interface ChatStatusProps {
  currentUser: {
    id: string;          // 👈 Added id to match full user database layout
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  roomId: string;}

const AVATARS = ["🦊", "🐱", "🐼", "🦁", "🐸", "🤖", "👾", "🦄"];

export default function FullScreenChat({ currentUser, roomId }: ChatStatusProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Hook up the Real-Time PartyKit Socket
  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST || "localhost:1999",
    room: roomId,
    // The query block is ignored now because our protected party.ts server reads cookies directly instead!
    onMessage(event) {
      try {
        // Parse the incoming broadcast data string directly
        const incomingMsg = JSON.parse(event.data) as ChatMessage;
        
        // Push the item natively onto the reactive state array list
        setMessages((prev) => [...prev, incomingMsg]);
      } catch (err) {
        console.error("Failed parsing message stream data:", err);
      }
    }
  });

  // 2. Automatically scroll chat viewport to the bottom on new message entries
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Fire message string up into the socket channel
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Send the raw text string into the PartyKit server room stream
    socket.send(inputText);
    setInputText("");
  };

  const myId = currentUser.username;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
      {/* Messages Stream Wrapper Window Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <span className="text-4xl mb-2">💬</span>
            <p className="font-semibold text-sm">Welcome to the Live Room!</p>
            <p className="text-xs">Type a message below to start broadcasting.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === myId;
            const messageKey = msg.id || `msg-${index}`;

            return (
              <div key={messageKey} className={`flex items-end gap-3 max-w-[70%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                {/* Render Avatar */}
                {currentUser.avatarUrl && isMe ? (
                  <img src={currentUser.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0 border shadow-sm" />
                ) : (
                  <span className="text-2xl mb-1 bg-gray-200 p-1.5 rounded-xl border border-gray-300 shadow-sm shrink-0">
                    {msg.avatar || "💬"}
                  </span>
                )}
                
                <div className="space-y-0.5">
                  <div className={`text-[10px] text-gray-400 px-1 font-bold flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                    <span>{msg.senderName}</span>
                    <span>•</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={`p-4 rounded-2xl shadow-sm text-sm font-medium whitespace-pre-wrap ${
                    isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Form Console Deck */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white flex items-center gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a real-time message..."
          className="flex-1 border border-gray-200 rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-800"
        />
        <button type="submit" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-sm text-sm">
          Send
        </button>
      </form>
    </div>
  );
}