"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";

type Message = {
  user: string;
  message: string;
  createdAt?: string;
};

export default function Home() {
  const router = useRouter();

  const [username, setUsername] = useState("");
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

    const user = JSON.parse(savedUser);
    setUsername(user.name);
  }, [router]);

  // =========================
  // LOAD CHAT HISTORY
  // =========================
  useEffect(() => {
    fetch("http://localhost:3001/messages")
      .then((res) => res.json())
      .then((data) => setChat(data));
  }, []);

  // =========================
  // SOCKET LISTENER
  // =========================
  useEffect(() => {
    const handler = (data: Message) => {
      setChat((prev) => [...prev, data]);
    };

    socket.on("receive_message", handler);

    return () => {
      socket.off("receive_message", handler);
    };
  }, []);

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
    if (!message.trim()) return;
    if (!username) return;

    socket.emit("send_message", {
      user: username,
      message,
      createdAt: new Date().toISOString(),
    });

    setMessage("");
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("user");
    socket.disconnect();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">

      {/* ================= LEFT SIDEBAR ================= */}
      <div className="w-72 bg-blue-700 text-white flex flex-col p-4">

        {/* TITLE */}
        <h1 className="text-xl font-bold mb-6">💬 Chat App</h1>

        {/* USER INFO */}
        <div className="bg-blue-600 p-3 rounded mb-4">
          <p className="text-xs opacity-70">Logged in as</p>
          <p className="font-bold">{username}</p>
        </div>

        {/* INFO */}
        <div className="text-sm opacity-80">
          💡 Real-time chat system
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="mt-auto bg-red-500 hover:bg-red-600 p-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* ================= CHAT AREA ================= */}
      <div className="flex flex-col flex-1">

        {/* TOP BAR */}
        <div className="bg-white shadow p-4 font-bold">
          💬 Global Chat Room
        </div>

        {/* CHAT BOX */}
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto p-4 space-y-2"
        >
          {chat.length === 0 && (
            <p className="text-center text-gray-400">
              No messages yet
            </p>
          )}

          {chat.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg max-w-xs shadow ${
                msg.user === username
                  ? "ml-auto bg-blue-500 text-white"
                  : "bg-white"
              }`}
            >
              <b>{msg.user}</b>
              <div>{msg.message}</div>
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div className="p-3 bg-white flex gap-2 border-t">
          <input
            className="flex-1 border p-2 rounded"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type message..."
          />

          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}