/** A live participant on a board. Stored on `socket.data` so it survives across instances. */
export interface Member {
  socketId: string;
  name: string;
  color: string;
}

/** The shape of `socket.data`: who the socket is, and which boards it has joined. */
export interface SocketState {
  member?: Member;
  boards?: string[];
}
