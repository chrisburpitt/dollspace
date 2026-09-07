import type * as Party from "partykit/server";

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

// Declare a type helper to easily access our profile fields on the client connection
interface PartyClientConnection extends Party.Connection {
  userId?: string;
  state?: {
    profile?: {
      name: string;
      avatar: string;
      isTyping: boolean;
    }
  }
}

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  // Broadcasts a clean presence list safely
  broadcastPresence() {
    const usersMap = new Map<string, UserProfile>();
    
    for (const client of this.room.getConnections() as PartyClientConnection[]) {
      let persistentId = client.userId; 
      
      if (!persistentId) {
        try {
          const parsedUrl = new URL(client.uri || client.url, "http://localhost");
          persistentId = parsedUrl.searchParams.get("userId") || client.id;
        } catch (e) {
          persistentId = client.id;
        }
      }

      // ⚡ FIX: Use the official client.state object instead of calling client.setState as an object
      const state = client.state?.profile || {};
      
      usersMap.set(persistentId, {
        id: persistentId,
        // Now accurately reads the username saved to client.state!
        name: state.name || `User #${persistentId.slice(0, 4)}`,
        avatar: state.avatar || "👤",
        isTyping: !!state.isTyping
      });
    }

    this.room.broadcast(JSON.stringify({ 
      type: "presence", 
      count: usersMap.size, 
      users: Array.from(usersMap.values()) 
    }));
  }

  async onConnect(connection: PartyClientConnection, ctx: Party.ConnectionContext) {
    const url = new URL(ctx.request.url);
    const userId = url.searchParams.get("userId") || connection.id;
    
    connection.userId = userId;

    const history = await this.room.storage.get<ChatMessage[]>("public_messages") || [];
    connection.send(JSON.stringify({ type: "history", messages: history }));
    this.broadcastPresence();
  }

  async onClose() {
    this.broadcastPresence();
  }

  async onMessage(message: string, sender: PartyClientConnection) {
    try {
      const data = JSON.parse(message);
      const senderPersistentId = sender.userId || sender.id;

      if (data.type === "update-profile") {
        // ⚡ FIX: Use the official PartyKit connection state storage engine
        sender.setState({
          profile: { name: data.name, avatar: data.avatar, isTyping: false }
        });
        this.broadcastPresence();
      } 

      if (data.type === "typing") {
        const currentProfile = sender.state?.profile || { name: "", avatar: "🦊", isTyping: false };
        sender.setState({
          profile: { ...currentProfile, isTyping: data.isTyping }
        });
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

        const history = await this.room.storage.get<ChatMessage[]>("public_messages") || [];
        history.push(newMessage);
        if (history.length > 100) history.shift();
        await this.room.storage.put("public_messages", history);

        this.room.broadcast(JSON.stringify({ type: "chat", ...newMessage }));
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

        for (const client of this.room.getConnections() as PartyClientConnection[]) {
          const clientPersistentId = client.userId;

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
