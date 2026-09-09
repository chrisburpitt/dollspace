// party.ts (PartyKit Unified Messenger Server Code)
import type * as Party from "partykit/server";

interface ActiveChatter {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export default class DollspaceMessengerServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  async onConnect(connection: Party.Connection, ctx: Party.ConnectionContext) {
    const url = new URL(ctx.request.url);
    const userId = url.searchParams.get("id") || connection.id;
    const username = url.searchParams.get("username") || "anonymous";
    const displayName = url.searchParams.get("displayName") || "Guest Doll";
    const avatarUrl = url.searchParams.get("avatarUrl") || null;

    connection.setState({ id: userId, username, displayName, avatarUrl });

    // Instantly broadcast the live active presence list to everyone
    this.broadcastActiveRoster();
  }

  async onClose() {
    this.broadcastActiveRoster();
  }

  onMessage(message: string, sender: Party.Connection) {
    const parsedData = JSON.parse(message);
    const senderState = sender.state as ActiveChatter | undefined;

    // 🌍 ROUTE A: Public Group Chatroom Messages
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

    // 💌 ROUTE B: Real-Time Direct Private Messages
    if (parsedData.type === "direct_message") {
      const privatePayload = {
        type: "incoming_direct_message",
        id: parsedData.id || crypto.randomUUID(),
        content: parsedData.content,
        createdAt: parsedData.createdAt || new Date().toISOString(),
        senderId: senderState?.id || "",
        recipientId: parsedData.recipientId,
        roomToken: parsedData.roomToken // Mapped cleanly to filter correctly on the client side
      };
      
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
