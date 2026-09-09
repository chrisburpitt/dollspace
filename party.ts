// party.ts (PartyKit Backend Operational Server Code)
import type * as Party from "partykit/server";

interface ActiveChatter {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export default class ChatroomServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  // 1. WebSocket Connection Lifecycle Entry Trigger
  async onConnect(connection: Party.Connection, ctx: Party.ConnectionContext) {
    // Extract user tracking metadata parameters safely out of the handshake query connection string
    const url = new URL(ctx.request.url);
    const userId = url.searchParams.get("id") || connection.id;
    const username = url.searchParams.get("username") || "anonymous";
    const displayName = url.searchParams.get("displayName") || "Guest Doll";
    const avatarUrl = url.searchParams.get("avatarUrl") || null;

    // Save these credentials straight onto the specific live socket socket state memory block
    connection.setState({
      id: userId,
      username,
      displayName,
      avatarUrl
    });

    // 🚀 BROADCAST THE RE-COMPLED PRESENCE ROSTER TO EVERYONE IN THE LOUNGE
    this.broadcastActiveRoster();
  }

  // 2. WebSocket Disconnection Lifecycle Trigger
  async onClose(connection: Party.Connection) {
    // Whenever a socket connection terminates or drops out, re-broadcast the active roster instantly
    this.broadcastActiveRoster();
  }

  // 3. Operational Message Dispatch Router Engine
  onMessage(message: string, sender: Party.Connection) {
    const parsedMessage = JSON.parse(message);

    // If it's a message stream dispatch payload, attach the sender metadata profiles and broadcast it
    if (parsedMessage.type === "chat_message") {
      const chatPayload = {
        type: "incoming_message",
        id: crypto.randomUUID(),
        content: parsedMessage.content,
        createdAt: new Date().toISOString(),
        user: sender.state // Injects who typed the update straight out of state verification blocks
      };

      this.room.broadcast(JSON.stringify(chatPayload));
    }
  }

  // 🚀 UTILITY: Gathers all connected sockets, pulls their profiles, and fires an asset dictionary state
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

    const presencePayload = {
      type: "presence_update",
      users: activeUsers
    };

    // Broadcast the full live active list up to everyone currently rendering the page
    this.room.broadcast(JSON.stringify(presencePayload));
  }
}
