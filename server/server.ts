import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { connectDB } from "./src/lib/db";
import User from "./src/models/user";
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
    origin: "http://localhost:3000",
  },
});

// CONNECT DB
connectDB();

// 🔑 AUTHENTICATION APIs
// Register new user
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: "User with this email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to register" });
  }
});

// Login user
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: "Wrong password" });
      return;
    }

    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: "Failed to login" });
  }
});

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
    if (!name || !userId) {
      res.status(400).json({ error: "Name and User ID are required" });
      return;
    }

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
    if (!roomId || !userId) {
      res.status(400).json({ error: "Room ID and User ID are required" });
      return;
    }

    const room = await Room.findOne({ roomId });
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

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
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
