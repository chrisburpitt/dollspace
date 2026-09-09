// party.ts (PartyKit Backend Router Engine)
import type * as Party from "partykit/server";

interface ActiveChatter {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export default class DollspaceSocketServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  async onConnect(connection: Party.Connection, ctx: Party.ConnectionContext) {
    const url = new URL(ctx.request.url);
    const userId = url.searchParams.get("id") || connection.id;
    const username = url.searchParams.get("username") || "anonymous";
    const displayName = url.searchParams.get("displayName") || "Guest Doll";
    const avatarUrl = url.searchParams.get("avatarUrl") || null;

    connection.setState({ id: userId, username, displayName, avatarUrl });

    // Only broadcast system presence lists if users are in the main public lounge channel room
    if (!this.room.id.includes("--")) {
      this.broadcastActiveRoster();
    }
  }

  async onClose() {
    if (!this.room.id.includes("--")) {
      this.broadcastActiveRoster();
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    const parsedData = JSON.parse(message);
    
    // 🚀 EXPLICIT TYPING CAST: Solves the ImmutableObject<unknown> TS2339 property block
    const senderState = sender.state as ActiveChatter | undefined;

    // ROUTER ROUTE A: Standard Global Public Lounge Messages
    if (parsedData.type === "chat_message") {
      const globalPayload = {
        type: "incoming_message",
        id: crypto.randomUUID(),
        content: parsedData.content,
        createdAt: new Date().toISOString(),
        user: senderState
      };
      this.room.broadcast(JSON.stringify(globalPayload));
    }

    // ROUTER ROUTE B: Secure Multi-User Direct Private Message Dispatches
    if (parsedData.type === "direct_message") {
      const privatePayload = {
        type: "incoming_direct_message",
        id: parsedData.id || crypto.randomUUID(),
        content: parsedData.content,
        createdAt: parsedData.createdAt || new Date().toISOString(),
        senderId: senderState?.id || "", // 🎯 FIXED: Correctly reads explicitly typed parameter
        sender: senderState
      };
      
      // Broadcast strictly bounds traffic inside the isolated unique private room Token channel
      this.room.broadcast(JSON.stringify(privatePayload));
    }
  }

  private broadcastActiveRoster() {
    const activeUsers: ActiveChatter[] = [];
    const absoluteIds = new Set<string>();

    for (const client of this.room.getConnections()) {
      const state = client.state as ActiveChatter | undefined;
      if (state && !absoluteIds.has(state.id)) {
        absoluteIds.add(state.id);
        activeUsers.push(state);
      }
    }

    this.room.broadcast(JSON.stringify({ type: "presence_update", users: activeUsers }));
  }
}
