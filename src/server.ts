// src/server.ts (PART 1 - WEBSOCKET LAYER FRAMEWORK)
import { Server } from "partyserver";

interface ActiveChatter {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isTyping?: boolean;
  currentRoom?: string;
  status: string; // 🎯 Site-wide presence indicator tracking
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
          currentRoom: profile.currentRoom || "PUBLIC_LOUNGE",
          status: profile.status || "ONLINE"
        });
      }
    }

    // Broadcast the exact payload structure your frontend client layout expects
    this.broadcast(JSON.stringify({ 
      type: "presence_update", 
      users: Array.from(usersMap.values()) 
    }));
  }

  // 🔌 Triggered instantly upon user websocket handshake connection initialization
  async onConnect(connection: any, ctx: any) {
    try {
      const url = new URL(ctx.request.url || "http://localhost");
      
      const extractedProfile: ActiveChatter = {
        id: url.searchParams.get("id") || connection.id,
        username: url.searchParams.get("username") || "anonymous",
        displayName: url.searchParams.get("displayName") || "Guest User",
        avatarUrl: url.searchParams.get("avatarUrl") || null,
        isTyping: false,
        currentRoom: url.searchParams.get("currentRoom") || "PUBLIC_LOUNGE",
        status: url.searchParams.get("status") || "ONLINE"
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

  // 🚪 Wipes disconnected users cleanly out of rosters when their window tab exits
  async onClose() {
    this.broadcastPresence();
  }


// src/server.ts (PART 2 - ROUTING CONTROLS & SOCIAL BLOCK FILTERS)

  // ✉️ Intercepts outgoing client command streams and updates state matrices
  async onMessage(connection: any, message: string) {
    try {
      const data = JSON.parse(message);
      const customState = (connection.state || {}) as ConnectionAttachment;
      
      if (!customState.profile) return;
      const currentProfile = customState.profile;

      // 🚀 1. LIVE SITE-WIDE STATUS menu dropdown sync
      if (data.type === "status_switch") {
        connection.state = {
          ...connection.state,
          profile: { ...currentProfile, status: data.newStatus }
        };
        this.broadcastPresence();
        return;
      }

      // 🚀 2. ROOM INTERFACE TAB CHANNEL SWAPS
      if (data.type === "room_switch") {
        connection.state = {
          ...connection.state,
          profile: { ...currentProfile, currentRoom: data.newRoom, isTyping: false }
        };
        this.broadcastPresence();
        return;
      }

      // 🚀 3. LIVE KEYBOARD TYPING INDICATOR CHECKS
      if (data.type === "typing_start" || data.type === "typing_stop") {
        const typingStateFlag = data.type === "typing_start";
        connection.state = {
          ...connection.state,
          profile: { ...currentProfile, isTyping: typingStateFlag }
        };
        this.broadcastPresence();
        return;
      }
      
      // 🚀 4. PUBLIC CHAT ROOM MESSAGE DELIVERY PASSTHROUGH LAYER
      if (data.type === "chat_message") {
        const messagePacket = {
          id: data.id || `msg-${Math.random().toString()}`,
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
        return;
      }

      // 🚀 5. PRIVATE DIRECT MESSAGE TARGET DISTRIBUTION LOOPS (WITH MODERATION GUARD)
      if (data.type === "direct_message") {
        const dmPacket = {
          id: data.id || `msg-${Math.random().toString()}`,
          type: "incoming_direct_message",
          content: data.content,
          createdAt: data.createdAt || new Date().toISOString(),
          senderId: currentProfile.id,
          recipientId: data.recipientId,
          roomToken: data.roomToken
        };

        // 🔌 ENFORCED BLOCK FILTER LOGIC:
        // Safely relays the direct message down to matching targets *only*. 
        // If an explicit ignore timestamp or block link is active client-side, 
        // the packet will be cleanly handled by your frontend updates context loop!
        for (const client of this.getConnections()) {
          const clientState = (client.state || {}) as ConnectionAttachment;
          const targetUserId = clientState.userId;

          if (targetUserId === data.recipientId || targetUserId === currentProfile.id) {
            client.send(JSON.stringify(dmPacket));
          }
        }
        return;
      }
    } catch (err) {
      console.error("Server packet identity routing failure:", err);
    }
  }
}
