"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import Sidebar from "./components/sidebar";

type Message = {
  user: string;
  message: string;
  room: string;
  createdAt?: string;
};

type Room = {
  _id: string;
  roomId: string;
  name: string;
  members: string[];
};

export default function Home() {
  const router = useRouter();

  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<Message[]>([]);

  const chatRef = useRef<HTMLDivElement>(null);

  // =========================
  // AUTH CHECK (PROTECTED ROUTE)
  // =========================
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(savedUser);
    setUser({ id: parsedUser._id || parsedUser.id, name: parsedUser.name });
  }, [router]);

  // =========================
  // LOAD ROOMS
  // =========================
  const loadRooms = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:3001/rooms/${user.id}`);
      const data = await res.json();
      setRooms(data);
      if (data.length > 0 && !activeRoom) {
        setActiveRoom(data[0]);
      }
    } catch (err) {
      console.error("Error loading rooms", err);
    }
  };

  useEffect(() => {
    loadRooms();
  }, [user]);

  // =========================
  // SOCKET ROOM JOIN & MESSAGES
  // =========================
  useEffect(() => {
    if (activeRoom) {
      socket.emit("join_room", activeRoom.roomId);

      fetch(`http://localhost:3001/messages/${activeRoom.roomId}`)
        .then((res) => res.json())
        .then((data) => setChat(data));
    }
  }, [activeRoom]);

  // =========================
  // SOCKET LISTENER
  // =========================
  useEffect(() => {
    const handler = (data: Message) => {
      if (activeRoom && data.room === activeRoom.roomId) {
        setChat((prev) => [...prev, data]);
      }
    };

    socket.on("receive_message", handler);

    return () => {
      socket.off("receive_message", handler);
    };
  }, [activeRoom]);

  // =========================
  // AUTO SCROLL
  // =========================
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chat]);

  // =========================
  // SEND MESSAGE
  // =========================
  const sendMessage = () => {
    if (!message.trim() || !user || !activeRoom) return;

    socket.emit("send_message", {
      user: user.name,
      message,
      roomId: activeRoom.roomId,
      createdAt: new Date().toISOString(),
    });

    setMessage("");
  };

  // =========================
  // CREATE ROOM
  // =========================
  const handleCreateRoom = async (name: string) => {
    if (!name.trim() || !user) return;
    try {
      const res = await fetch("http://localhost:3001/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, userId: user.id }),
      });
      const room = await res.json();
      setRooms((prev) => [room, ...prev]);
      setActiveRoom(room);
    } catch (err) {
      console.error("Failed to create room", err);
    }
  };

  // =========================
  // JOIN ROOM
  // =========================
  const handleJoinRoom = async (roomId: string) => {
    if (!roomId.trim() || !user) return;
    try {
      const res = await fetch("http://localhost:3001/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, userId: user.id }),
      });
      const room = await res.json();
      if (room.error) {
        alert(room.error);
        return;
      }
      if (!rooms.find((r) => r.roomId === room.roomId)) {
        setRooms((prev) => [room, ...prev]);
      }
      setActiveRoom(room);
    } catch (err) {
      console.error("Failed to join room", err);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    socket.disconnect();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-neutral-900 text-gray-100 font-sans">

      {/* ================= SIDEBAR ================= */}
      <Sidebar
        user={user}
        rooms={rooms}
        activeRoom={activeRoom}
        onSelectRoom={setActiveRoom}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onLogout={handleLogout}
      />

      {/* ================= CHAT AREA ================= */}
      <div className="flex flex-col flex-1 bg-[url('/bg-pattern.svg')] bg-neutral-900 bg-fixed">

        {activeRoom ? (
          <>
            {/* TOP BAR */}
            <div className="bg-neutral-800/90 backdrop-blur-md border-b border-neutral-700 p-4 flex justify-between items-center shadow-sm">
              <div>
                <h2 className="font-bold text-lg text-white">{activeRoom.name}</h2>
                <p className="text-xs text-neutral-400 flex items-center gap-1">
                  ID: <span className="font-mono bg-neutral-700 px-1.5 py-0.5 rounded text-neutral-300 select-all">{activeRoom.roomId}</span>
                </p>
              </div>
            </div>

            {/* CHAT BOX */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {chat.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <p>No messages yet. Be the first to say hello!</p>
                </div>
              )}

              {chat.map((msg, i) => {
                const isMe = msg.user === user.name;
                return (
                  <div
                    key={i}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"} w-full`}
                  >
                    {!isMe && (
                      <span className="text-xs text-neutral-500 ml-1 mb-1 font-semibold">{msg.user}</span>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-md break-words shadow-sm ${isMe
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-neutral-800 text-neutral-100 rounded-bl-none border border-neutral-700"
                        }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* INPUT */}
            <div className="p-4 bg-neutral-800/80 backdrop-blur-md border-t border-neutral-700">
              <div className="max-w-4xl mx-auto flex gap-3">
                <input
                  className="flex-1 bg-neutral-900 border border-neutral-700 text-white px-4 py-3 rounded-full focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={`Message #${activeRoom.name}...`}
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 disabled:active:scale-100 text-white p-3 rounded-full transition shadow-lg shadow-indigo-600/30 flex items-center justify-center w-12 h-12"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
            <div className="w-24 h-24 mb-6 opacity-20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-medium text-neutral-300 mb-2">Welcome to ChatApp Pro</h2>
            <p>Select a room from the sidebar or create a new one to start chatting.</p>
          </div>
        )}
      </div>

    </div>
  );
}