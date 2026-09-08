// party.ts
import type * as Party from "partykit/server";

export default class ChatParty implements Party.Server {
  constructor(readonly room: Party.Room) {}

  async onConnect(connection: Party.Connection, ctx: Party.ConnectionContext) {
    const cookieHeader = ctx.request.headers.get("cookie") || "";
    
    // Switch explicitly to standard fallback checking
    const host = ctx.request.headers.get("host")?.includes("localhost") 
      ? "http://localhost:3000" 
      : "http://127.0.0.1:3000";
    
    try {
      const response = await fetch(`${host}/api/auth/verify-session`, {
        headers: { 
          cookie: cookieHeader,
          "Accept": "application/json"
        }
      });
      
      const session = await response.json();

      if (!session || !session.valid) {
        console.log("🔒 Connection refused: Unauthorized socket token.");
        // Force an immediate explicit close with a status code
        connection.close(4001, "Unauthorized");
        return;
      }

      // Securely bind verified session details
      connection.setState({ 
        username: session.user.username, 
        displayName: session.user.displayName 
      });
      console.log(`📡 WebSocket Authenticated: @${session.user.username}`);

    } catch (err) {
      console.log("⚠️ Auth Fetch Failed, closing connection.");
      connection.close(4002, "Auth Fetch Failed");
    }
  }

  async onMessage(message: string, sender: Party.Connection) {
    // Engine defense guard clause
    if (!sender.state || !this.room) {
      console.log("🛑 Blocked unauthenticated message send attempt.");
      return;
    }

    const { username, displayName } = sender.state as { username: string; displayName: string };

    // 🚀 MATCH THE OBJECT STRUCT EXACTLY TO YOUR NEXT.JS CLIENT APP
    const payload = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generates a unique key id natively
      text: message,
      senderId: username,      // 👈 Change senderUsername to senderId
      senderName: displayName,
      avatar: "💬",            // 👈 Fallback placeholder string symbol matching msg.avatar loops
      timestamp: new Date().toISOString()
    };

    // Broadcast the correctly formatted payload out to the listening client sockets
    this.room.broadcast(JSON.stringify(payload));
  }
}
