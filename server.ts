import { createServer } from "http";
import { Server } from "socket.io";

// Create HTTP server
const httpServer = createServer();

// Create Socket.io server
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

// Listen for connections
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Receive message from client
  socket.on("send_message", (data: { user: string; message: string }) => {
    console.log("Message:", data);

    // Send message to all clients
    io.emit("receive_message", data);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
httpServer.listen(3001, () => {
  console.log("Socket server running on http://localhost:3001");
});