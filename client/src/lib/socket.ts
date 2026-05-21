import { io, Socket } from "socket.io-client";

// message type
export interface Message {
  user: string;
  message: string;
}

// create socket connection (singleton)
export const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// connection events
socket.on("connect", () => {
  console.log("Connected to socket server:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected from socket server");
});

socket.on("connect_error", (err) => {
  console.log("Connection error:", err.message);
});