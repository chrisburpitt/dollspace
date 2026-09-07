import { Server } from "partyserver";

interface UserProfile {
  id: string; 
  name: string;
  avatar: string;
  isTyping?: boolean;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  senderId: string;
  avatar: string;
  timestamp: string;
  targetId?: string;
}

interface ConnectionAttachment {
  userId?: string;
  profile?: {
    name: string;
    avatar: string;
    isTyping: boolean;
  };
}

export default class ChatServer extends Server {
  // Broadcasts a clean presence list safely to all open sockets
  broadcastPresence() {
    const usersMap = new Map<string, UserProfile>();
    
    for (const client of this.getConnections()) {
      const customState = (client.state || {}) as ConnectionAttachment;
      let persistentId = customState.userId; 
      
      if (!persistentId) {
        persistentId = client.id;
      }

      const profile = customState.profile || { name: "", avatar: "", isTyping: false };
      
      usersMap.set(persistentId, {
        id: persistentId,
        name: profile.name || `User #${persistentId.slice(0, 4)}`,
        avatar: profile.avatar || "👤",
        isTyping: !!profile.isTyping
      });
    }

    this.broadcast(JSON.stringify({ 
      type: "presence", 
      count: usersMap.size, 
      users: Array.from(usersMap.values()) 
    }));
  }

  async onConnect(connection: any, ctx: any) {
    let userId = connection.id;
    try {
      const url = new URL(ctx.request.url || "http://localhost");
      userId = url.searchParams.get("userId") || connection.id;
    } catch (e) {
      // Fallback if context request lacks url attributes
    }
    
    connection.state = {
      ...(connection.state || {}),
      userId: userId
    };

    const storage = (this as any).ctx.storage;
    const history = (await storage.get("public_messages")) as ChatMessage[] || [];
    connection.send(JSON.stringify({ type: "history", messages: history }));
    this.broadcastPresence();
  }

  async onClose() {
    this.broadcastPresence();
  }

  async onMessage(connection: any, message: string) {
    try {
      const data = JSON.parse(message);
      const customState = (connection.state || {}) as ConnectionAttachment;
      const senderPersistentId = customState.userId || connection.id;

      if (data.type === "update-profile") {
        connection.state = {
          ...connection.state,
          profile: { name: data.name, avatar: data.avatar, isTyping: false }
        };
        this.broadcastPresence();
      } 

      if (data.type === "typing") {
        const currentProfile = customState.profile || { name: "", avatar: "🦊", isTyping: false };
        connection.state = {
          ...connection.state,
          profile: { ...currentProfile, isTyping: data.isTyping }
        };
        this.broadcastPresence();
      }
      
      if (data.type === "chat") {
        const newMessage: ChatMessage = {
          id: Math.random().toString(),
          text: data.text,
          sender: data.sender,
          senderId: senderPersistentId, 
          avatar: data.avatar,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const storage = (this as any).ctx.storage;
        const history = (await storage.get("public_messages")) as ChatMessage[] || [];
        history.push(newMessage);
        if (history.length > 100) history.shift();
        await storage.put("public_messages", history);

        this.broadcast(JSON.stringify({ type: "chat", ...newMessage }));
      }

      if (data.type === "dm") {
        const privateMessage: ChatMessage = {
          id: Math.random().toString(),
          text: data.text,
          sender: data.sender,
          senderId: senderPersistentId,
          avatar: data.avatar,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          targetId: data.targetId 
        };

        for (const client of this.getConnections()) {
          const clientState = (client.state || {}) as ConnectionAttachment;
          const clientPersistentId = clientState.userId;

          if (clientPersistentId === data.targetId || clientPersistentId === senderPersistentId) {
            client.send(JSON.stringify({ type: "dm", ...privateMessage }));
          }
        }
      }
    } catch (err) {
      console.error("Server identity routing error:", err);
    }
  }
}
