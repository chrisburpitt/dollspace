// party.ts
import type { Party, Connection } from "partyserver";

export default {
  async onConnect(connection: Connection, room: Party) {
    // When a user joins, send them the current message history (optional)
    // For a simple chat, we just let them listen for new messages
  },

  async onMessage(message: string, connection: Connection, room: Party) {
    // Broadcast any incoming chat message to EVERYONE in the room
    room.broadcast(message);
  },
};
