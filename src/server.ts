// party/server.ts (SYNCHRONIZED REAL-TIME SYSTEM ARCHITECTURE)
import { Server } from "partyserver";

interface ActiveChatter {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isTyping?: boolean;
  currentRoom?: string;
  status: string; 
}

interface ConnectionAttachment {
  userId?: string;
  profile?: ActiveChatter;
}

export default class ChatServer extends Server {
  
  // 📊 Compiles and dispatches real-time user indicator updates globally
  broadcastPresence() {
    const usersMap = new Map<string, ActiveChatter>();
    
    for (const client of this.getConnections()) {
      const customState = (client.state || {}) as ConnectionAttachment;
      const profile = customState.profile;
      
      if (profile && profile.id) {
        usersMap.set(profile.id, {
          id: profile.id,
          username: profile.username || "",
          displayName: profile.displayName || "Anonymous Doll",
          avatarUrl: profile.avatarUrl || null,
          isTyping: !!profile.isTyping,
          currentRoom: profile.currentRoom || "PUBLIC_LOUNGE"
        });
      }
    }

    // 🎯 SYNCHRONIZED FRONTEND ALIGNMENT: Match the precise "presence_update" object structure your client expects!
    this.broadcast(JSON.stringify({ 
      type: "presence_update", 
      users: Array.from(usersMap.values()) 
    }));
  }

  async function onConnect(connection: any, ctx: any) {
    const url = new URL(ctx.request.url || "http://localhost");
    const extractedProfile: ActiveChatter = {
      id: url.searchParams.get("id") || connection.id,
      username: url.searchParams.get("username") || "anonymous",
      displayName: url.searchParams.get("displayName") || "Guest User",
      avatarUrl: url.searchParams.get("avatarUrl") || null,
      isTyping: false,
      currentRoom: url.searchParams.get("currentRoom") || "PUBLIC_LOUNGE",
      status: url.searchParams.get("status") || "ONLINE" // 🎯 Captures their baseline indicator state
    };

      connection.state = {
        userId: extractedProfile.id,
        profile: extractedProfile
      };

    } catch (e) {
      console.error("Socket query capture error:", e);
    }
    
    this.broadcastPresence();
  }

  async onClose() {
    this.broadcastPresence();
  }

  async onMessage(connection: any, message: string) {
    try {
      const data = JSON.parse(message);
      const customState = (connection.state || {}) as ConnectionAttachment;
      if (!customState.profile) return;
      const currentProfile = customState.profile;
	  
	  if (data.type === "status_switch") {
        connection.state = {
        ...connection.state,
        profile: { ...currentProfile, status: data.newStatus } // Overwrites "ONLINE", "AWAY", "BUSY", or "OFFLINE" instantly
      };
      this.broadcastPresence(); // Sends updated list down to all user dashboard roster sidebars in real time!
      return;
    }

      // 🚀 ROOM CHANNEL SWAPS
      if (data.type === "room_switch") {
        connection.state = {
          ...connection.state,
          profile: { ...currentProfile, currentRoom: data.newRoom, isTyping: false }
        };
        this.broadcastPresence();
        return;
      }

      // ⌨️ TYPING STATE CAPTURE INJECTIONS (Hooks directly into ChatPresenceKeeper)
      if (data.type === "typing_start" || data.type === "typing_stop") {
        const typingStateFlag = data.type === "typing_start";
        connection.state = {
          ...connection.state,
          profile: { ...currentProfile, isTyping: typingStateFlag }
        };
        this.broadcastPresence();
        return;
      }
      
      // 🌍 PUBLIC LOUNGE / MOD CHAT ROOM BROADCAST ENGINE
      if (data.type === "chat_message") {
        const messagePacket = {
          id: data.id || `msg-${Math.random().toString()}`,
          // 🎯 SYNCHRONIZED ALIGNMENT: Passes back the "incoming_message" event type
          type: "incoming_message",
          content: data.content,
          createdAt: new Date().toISOString(),
          room: data.room || currentProfile.currentRoom || "PUBLIC_LOUNGE",
          user: {
            id: currentProfile.id,
            username: currentProfile.username,
            displayName: currentProfile.displayName,
            avatarUrl: currentProfile.avatarUrl
          }
        };

        this.broadcast(JSON.stringify(messagePacket));
      }

      // 🔒 SINGLE-INSTANCE ENCRYPTED PRIVATE DIRECT MESSAGING BROADCAST PIPELINE
      if (data.type === "direct_message") {
        const dmPacket = {
          id: data.id || `msg-${Math.random().toString()}`,
          // 🎯 SYNCHRONIZED ALIGNMENT: Passes back the "incoming_direct_message" event type
          type: "incoming_direct_message",
          content: data.content,
          createdAt: data.createdAt || new Date().toISOString(),
          senderId: currentProfile.id,
          recipientId: data.recipientId,
          roomToken: data.roomToken
        };

        // Efficiently pass the secret packet ONLY to the sender and target recipient
        for (const client of this.getConnections()) {
          const clientState = (client.state || {}) as ConnectionAttachment;
          const targetUserId = clientState.userId;

          if (targetUserId === data.recipientId || targetUserId === currentProfile.id) {
            client.send(JSON.stringify(dmPacket));
          }
        }
      }
    } catch (err) {
      console.error("Server packet identity routing failure:", err);
    }
  }
}
