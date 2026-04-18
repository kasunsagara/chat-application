import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./src/lib/db";
import Message from "./src/models/message";
import Room from "./src/models/room";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket"]
});

// CONNECT DB
connectDB();

// 📥 CHAT HISTORY API
app.get("/messages/:roomId", async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to load messages" });
  }
});

// 🏠 ROOM APIs
// Get user rooms
app.get("/rooms/:userId", async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.params.userId }).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: "Failed to load rooms" });
  }
});

// Create new room
app.post("/rooms/create", async (req, res) => {
  try {
    const { name, userId } = req.body;
    if (!name || !userId) return res.status(400).json({ error: "Name and User ID are required" });

    const newRoom = await Room.create({
      name,
      members: [userId],
    });
    
    res.json(newRoom);
  } catch (err) {
    res.status(500).json({ error: "Failed to create room" });
  }
});

// Join room via ID
app.post("/rooms/join", async (req, res) => {
  try {
    const { roomId, userId } = req.body;
    if (!roomId || !userId) return res.status(400).json({ error: "Room ID and User ID are required" });

    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: "Room not found" });

    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to join room" });
  }
});


// 🔌 SOCKET LOGIC
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("send_message", async (data) => {
    try {
      const msg = await Message.create({
        user: data.user,
        message: data.message,
        room: data.roomId,
      });

      io.to(data.roomId).emit("receive_message", msg);
    } catch (err) {
      console.log("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// START SERVER
httpServer.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});