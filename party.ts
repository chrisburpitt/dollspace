// party.ts (PartyKit Unified Messenger Server Code)
import type * as Party from "partykit/server";

interface ActiveChatter {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  currentRoom: string; // 🚀 Added to track active multi-channel visibility
}

export default class DollspaceMessengerServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  async onConnect(connection: Party.Connection, ctx: Party.ConnectionContext) {
    const url = new URL(ctx.request.url);
    const userId = url.searchParams.get("id") || connection.id;
    const username = url.searchParams.get("username") || "anonymous";
    const displayName = url.searchParams.get("displayName") || "Guest Doll";
    const avatarUrl = url.searchParams.get("avatarUrl") || null;
    
    // 🚀 Grab initial active room string from connection url params or default to public lounge
    const currentRoom = url.searchParams.get("currentRoom") || "PUBLIC_LOUNGE";

    connection.setState({ id: userId, username, displayName, avatarUrl, currentRoom });

    // Instantly calculate and broadcast room-by-room presence lists
    this.broadcastPresenceForRooms();
  }

  async onClose() {
    this.broadcastPresenceForRooms();
  }

  onMessage(message: string, sender: Party.Connection) {
    const parsedData = JSON.parse(message);
    const senderState = sender.state as ActiveChatter | undefined;

    // 🚀 NEW ROUTE: Listens for client tab toggles and switches room state on the fly
    if (parsedData.type === "room_switch") {
      if (senderState) {
        sender.setState({
          ...senderState,
          currentRoom: parsedData.newRoom
        });
      }
      this.broadcastPresenceForRooms();
      return; // Stop processing
    }

    // 🌍 ROUTE A: Public Group & Mod Chatroom Messages
    if (parsedData.type === "chat_message") {
      const targetRoom = parsedData.room || "PUBLIC_LOUNGE";
      
      const globalPayload = {
        type: "incoming_message",
        id: parsedData.id || crypto.randomUUID(),
        content: parsedData.content,
        createdAt: new Date().toISOString(),
        room: targetRoom, // Attaches target room parameter block
        user: {
          id: senderState?.id,
          username: senderState?.username,
          displayName: senderState?.displayName,
          avatarUrl: senderState?.avatarUrl
        }
      };

      const outboundString = JSON.stringify(globalPayload);

      // 🚀 TARGETED ROOM BROADCAST: Only dispatch chat packets to users inside the same room!
      for (const client of this.room.getConnections()) {
        const clientState = client.state as ActiveChatter | undefined;
        if (clientState && clientState.currentRoom === targetRoom) {
          client.send(outboundString);
        }
      }
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
        roomToken: parsedData.roomToken
      };

      const outboundString = JSON.stringify(privatePayload);
      
      // 🚀 SECURE TARGETED DM BROADCAST: Never blast DMs globally! Only send to sender and recipient lines.
      for (const client of this.room.getConnections()) {
        const clientState = client.state as ActiveChatter | undefined;
        if (clientState && (clientState.id === parsedData.recipientId || clientState.id === senderState?.id)) {
          client.send(outboundString);
        }
      }
    }
  }

  // 🚀 ENGINE METHOD: Segregates connected instances and sends localized presence arrays
  private broadcastPresenceForRooms() {
    const connections = Array.from(this.room.getConnections());

    // Loop through every single active socket connection independently
    for (const client of connections) {
      const clientState = client.state as ActiveChatter | undefined;
      const targetRoom = clientState?.currentRoom || "PUBLIC_LOUNGE";

      // Filter down connection states to capture ONLY users sharing the exact same room channel view
      const roomSpecificUsers = connections
        .filter((c) => {
          const cState = c.state as ActiveChatter | undefined;
          return cState && cState.currentRoom === targetRoom;
        })
        .map((c) => {
          const cState = c.state as ActiveChatter;
          return {
            id: cState.id,
            username: cState.username,
            displayName: cState.displayName,
            avatarUrl: cState.avatarUrl
          };
        });

      // Remove structural duplicates by ID
      const uniqueRoomUsers = Array.from(new Map(roomSpecificUsers.map(u => [u.id, u])).values());

      // Send the isolated user counter roster to this connection
      client.send(JSON.stringify({ 
        type: "presence_update", 
        users: uniqueRoomUsers 
      }));
    }
  }
}
