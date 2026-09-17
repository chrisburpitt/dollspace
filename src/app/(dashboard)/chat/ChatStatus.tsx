// src/app/chat/ChatStatus.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import usePartySocket from "partysocket/react";
import LivePresenceRoster from "@/components/LivePresenceRoster";

interface ActiveChatter {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

interface IncomingMessage {
  id: string;
  content: string;
  createdAt: string;
  user: ActiveChatter;
}

interface ChatStatusProps {
  currentUser: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  roomId: string;
}

export default function FullScreenChat({ currentUser, roomId }: ChatStatusProps) {
  const [messages, setMessages] = useState<IncomingMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [activeUsers, setActiveUsers] = useState<ActiveChatter[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Hook up the Real-Time PartyKit Socket with complete credentials routing
  const socket = usePartySocket({
    host: "my-partykit-app.chrisburpitt.partykit.dev",
    room: roomId,
    
    // 🚀 FIXED: Pass queries so the backend server can track presence counters!
    query: {
      id: currentUser.id,
      username: currentUser.username,
      displayName: currentUser.displayName,
      avatarUrl: currentUser.avatarUrl || ""
    },

    onMessage(event) {
      try {
        const parsedData = JSON.parse(event.data);

        // 🚀 FIXED: Route between chatter presence arrays and message logs
        if (parsedData.type === "presence_update") {
          setActiveUsers(parsedData.users);
        } else if (parsedData.type === "incoming_message") {
          setMessages((prev) => [...prev, parsedData]);
        }
      } catch (err) {
        console.error("Failed parsing message stream data:", err);
      }
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 2. Fire message string up into the socket channel
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // 🚀 FIXED PAYLOAD: Wrap the text inside a structured chat_message packet string
    const chatPayload = {
      type: "chat_message",
      content: inputText.trim()
    };

    socket.send(JSON.stringify(chatPayload));
    setInputText("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
      
      {/* LEFT COMPONENT: The Chat Area */}
      <div className="lg:col-span-8 flex flex-col bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <span className="text-4xl mb-2">💬</span>
              <p className="font-semibold text-sm">Welcome to the Live Room!</p>
              <p className="text-xs">Type a message below to start broadcasting.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.user.id === currentUser.id;

              return (
                <div key={msg.id} className={`flex items-end gap-3 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                  {msg.user.avatarUrl ? (
                    <img src={msg.user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-100 shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 bg-rose-400 text-white rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0">
                      {msg.user.displayName.charAt(0)}
                    </div>
                  )}
                  
                  <div className="space-y-0.5">
                    <div className={`text-[10px] text-gray-400 px-1 font-bold flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                      <span>{msg.user.displayName}</span>
                      <span>•</span>
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className={`p-3.5 rounded-2xl shadow-sm text-xs font-medium whitespace-pre-wrap leading-relaxed ${
                      isMe ? "bg-rose-500 text-white rounded-br-none" : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Message Form Console */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a real-time message..."
            className="flex-1 border border-gray-200 rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white text-xs font-medium text-gray-800 transition"
          />
          <button type="submit" className="bg-rose-500 text-white font-black px-5 py-3 rounded-xl hover:bg-rose-600 transition shadow-sm text-xs tracking-wide">
            Send
          </button>
        </form>
      </div>

      {/* RIGHT COMPONENT: Injected Presence Roster Widget */}
      <div className="lg:col-span-4">
        <LivePresenceRoster activeUsers={activeUsers} />
      </div>

    </div>
  );
}
