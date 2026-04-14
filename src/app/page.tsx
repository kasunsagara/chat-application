"use client";

import { useEffect, useState } from "react";
import { socket } from "./lib/socket";

type Message = {
  user: string;
  message: string;
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<Message[]>([]);
  const [username] = useState("Kasun");

  useEffect(() => {
    socket.on("receive_message", (data: Message) => {
      setChat((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;

    const msgData: Message = {
      user: username,
      message,
    };

    socket.emit("send_message", msgData);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-100 to-slate-200">

      {/* Header */}
      <div className="bg-blue-600 text-white p-4 text-center text-xl font-bold shadow-md">
        💬 Chat App
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chat.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.user === username ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl shadow-sm break-words ${
                msg.user === username
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none"
              }`}
            >
              <p className="text-xs opacity-70 mb-1">{msg.user}</p>
              <p className="text-sm">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="p-3 bg-white border-t flex items-center gap-2 shadow-md">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-full outline-none focus:ring-2 focus:ring-blue-400"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition text-white px-5 py-2 rounded-full font-medium shadow"
        >
          Send
        </button>
      </div>
    </div>
  );
}