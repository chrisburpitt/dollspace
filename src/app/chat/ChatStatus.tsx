"use client";

import { useState, useEffect, useRef } from 'react';
import usePartySocket from 'partysocket/react';

interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  senderId: string; // This will now be our persistent account ID!
  avatar: string;
  timestamp: string;
  targetId?: string;
}

interface ActiveUser {
  id: string; // The user's unique account ID
  name: string;
  avatar: string;
  isTyping?: boolean;
}

const AVATARS = ["🦊", "🐱", "🐼", "🦁", "🐸", "🤖", "👾", "🦄"];

export default function FullScreenChat() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Persistent Account States
  const [myId, setMyId] = useState(""); 
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("🦊");
  const [isEditingProfile, setIsEditingProfile] = useState(true);

  // Chat tracking states
  const [activeTab, setActiveTab] = useState<"public" | string>("public"); 
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [dmMessages, setDmMessages] = useState<ChatMessage[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  const [status, setStatus] = useState("Connecting...");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 💾 LOCALSTORAGE ACCOUNT SYNC: Runs on load to pull saved profile details
  useEffect(() => {
    setIsMounted(true);

    const savedId = localStorage.getItem("partyroom_user_id") || `usr_${Math.random().toString(36).substring(2, 11)}`;
    const savedName = localStorage.getItem("partyroom_username");
    const savedAvatar = localStorage.getItem("partyroom_avatar");

    localStorage.setItem("partyroom_user_id", savedId);
    setMyId(savedId);

    if (savedName && savedAvatar) {
      setUsername(savedName);
      setAvatar(savedAvatar);
      setIsEditingProfile(false); // Skip form if account already exists!
    } else {
      setUsername(`Guest_${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, dmMessages, activeUsers, activeTab]);

  // Connect to the room and send our persistent ID as a query parameter
  const socket = usePartySocket({
    host: "localhost:1999",
    room: "my-room",
    query: async () => ({
      userId: localStorage.getItem("partyroom_user_id") || "",
    }),
    onOpen() {
      setStatus("Connected ⚡");
      // If logged in, automatically synchronise profile with backend on connect
      const savedName = localStorage.getItem("partyroom_username");
      const savedAvatar = localStorage.getItem("partyroom_avatar");
      if (savedName && savedAvatar) {
        socket.send(JSON.stringify({ 
          type: "update-profile", 
          name: savedName, 
          avatar: savedAvatar 
        }));
      }
    },
    onMessage(event) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "history") {
          setMessages(data.messages || []);
        } else if (data.type === "presence") {
          setOnlineCount(data.count || 0);
          setActiveUsers(data.users || []);
        } else if (data.type === "chat") {
          setMessages((prev) => [...prev, data]);
        } else if (data.type === "dm") {
          setDmMessages((prev) => [...prev, data]);
        }
      } catch (e) {
        console.log("Fallback message:", event.data);
      }
    },
    onClose() {
      setStatus("Disconnected");
    },
  });

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    // Save account securely to this machine's hard drive
    localStorage.setItem("partyroom_username", username);
    localStorage.setItem("partyroom_avatar", avatar);

    socket.send(JSON.stringify({ type: "update-profile", name: username, avatar: avatar }));
    setIsEditingProfile(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (activeTab === "public") {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        socket.send(JSON.stringify({ type: "typing", isTyping: true }));
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        socket.send(JSON.stringify({ type: "typing", isTyping: false }));
      }, 1500);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (activeTab === "public") {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      isTypingRef.current = false;
      socket.send(JSON.stringify({ type: "typing", isTyping: false }));
      socket.send(JSON.stringify({ type: "chat", text: inputValue, sender: username, avatar: avatar }));
    } else {
      socket.send(JSON.stringify({
        type: "dm",
        text: inputValue,
        sender: username,
        avatar: avatar,
        targetId: activeTab // Targeted User's Account ID
      }));
    }
    setInputValue("");
  };

  const visibleMessages = activeTab === "public" 
    ? messages 
    : dmMessages.filter(m => 
        (m.senderId === myId && m.targetId === activeTab) || 
        (m.senderId === activeTab && m.targetId === myId)
      );

  const targetUser = activeUsers.find(u => u.id === activeTab);
  const typingUsers = activeUsers.filter(u => u.isTyping && u.id !== myId);
  const otherUsers = activeUsers.filter(u => u.id !== myId);

  if (!isMounted) {
    return <div className="fixed inset-0 flex items-center justify-center bg-gray-900 text-gray-400">Booting account cluster...</div>;
  }

// THIS IS WHERE PART 2 GOES //

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-900 text-white font-sans overflow-hidden w-screen h-screen">
      
      {/* Top Banner Header */}
      <header className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex justify-between items-center shadow-md shrink-0 h-16">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-wide">PartyRoom</h1>
          <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
            🟢 {onlineCount} online
          </span>
        </div>
        <div className="flex items-center gap-4">
          {!isEditingProfile && (
            <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1 rounded-lg border border-gray-600">
              <span className="text-xl">{avatar}</span>
              <span className="text-sm font-medium">{username}</span>
              <button onClick={() => setIsEditingProfile(true)} className="text-xs text-blue-400 hover:text-blue-300 ml-2 underline">Edit</button>
            </div>
          )}
          <span className="text-xs text-gray-500 font-mono">{status}</span>
        </div>
      </header>

      {/* Main Split Layout Container */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        
        {/* Onboarding Dialog */}
        {isEditingProfile && (
          <div className="absolute inset-0 bg-gray-900/95 z-50 flex items-center justify-center p-4">
            <form onSubmit={saveProfile} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 w-full max-w-sm space-y-4 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-100">Set Up Your Profile</h3>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose username..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-between py-1 bg-gray-900/40 p-2 rounded-xl border border-gray-700/50">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`text-2xl p-1 rounded-lg transition ${avatar === av ? 'bg-blue-600 scale-110' : 'hover:bg-gray-700'}`}
                  >
                    {av}
                  </button>
                ))}
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl transition shadow-lg">
                Enter Fullscreen Chat
              </button>
            </form>
          </div>
        )}

        {/* SIDEBAR: Online User Directory List */}
        <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col shrink-0 h-full">
          <div className="p-4 border-b border-gray-700 text-xs font-bold text-gray-400 tracking-wider">CHANNELS</div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            
            <button
              onClick={() => setActiveTab("public")}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === "public" ? "bg-blue-600 text-white font-bold" : "text-gray-300 hover:bg-gray-700/50"}`}
            >
              <span>🌍</span>
              <span>#general-room</span>
            </button>

            <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Direct Messages</div>
            
            {otherUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => setActiveTab(user.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition ${activeTab === user.id ? "bg-gray-700 text-white border border-gray-600 font-semibold" : "text-gray-300 hover:bg-gray-700/40"}`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-lg">{user.avatar}</span>
                  <span className="truncate">{user.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {user.isTyping && <span className="text-[10px] text-blue-400 animate-bounce">✍️</span>}
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                </div>
              </button>
            ))}

            {otherUsers.length === 0 && (
              <div className="text-center py-4 text-xs text-gray-500 italic">No one else online yet</div>
            )}
          </div>
        </aside>

        {/* MAIN PANEL: Chat Feed Stream */}
        <div className="flex-1 flex flex-col bg-gray-950 overflow-hidden h-full">
          <div className="px-6 py-2 bg-gray-900/40 border-b border-gray-800 text-xs text-gray-400 font-medium">
            {activeTab === "public" ? "Viewing public arena messages" : `🔒 Private DM conversation with ${targetUser?.name || 'User'}`}
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {visibleMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-600">
                <span className="text-4xl mb-2">{activeTab === "public" ? "💬" : "🔒"}</span>
                <p className="text-sm">
                  {activeTab === "public" ? "No global messages yet." : `Secure DM thread with ${targetUser?.name || 'this user'}.`}
                </p>
              </div>
            ) : (
              visibleMessages.map((msg) => {
                const isMe = msg.senderId === myId;
                return (
                  <div key={msg.id} className={`flex items-end gap-3 max-w-[70%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                    <span className="text-3xl mb-1 bg-gray-800 p-1.5 rounded-xl border border-gray-700 shadow-sm shrink-0">{msg.avatar}</span>
                    <div className="space-y-0.5">
                      <div className={`text-[10px] text-gray-500 px-1 font-semibold flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                        <span>{isMe ? "You" : msg.sender}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <div className={`p-3 rounded-2xl text-sm shadow-md whitespace-pre-wrap leading-relaxed ${isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700"}`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing Strip */}
          <div className="h-6 px-6 text-xs text-blue-400 font-medium bg-gray-950 flex items-center shrink-0">
            {activeTab === "public" && typingUsers.length > 0 && (
              <span className="animate-pulse">
                {typingUsers.map(u => `${u.avatar} ${u.name}`).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </span>
            )}
          </div>

          {/* Input Controls */}
          <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700 flex gap-3 items-center shrink-0 h-20">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              disabled={isEditingProfile}
              placeholder={isEditingProfile ? "Unlock chat profile menu..." : activeTab === "public" ? "Message #general-room..." : `Send private DM to ${targetUser?.name || 'user'}...`}
              className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-950 transition"
            />
            <button
              type="submit"
              disabled={isEditingProfile || !inputValue.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition disabled:bg-gray-700 disabled:text-gray-500"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
