"use client";

import { useState } from "react";

type Room = {
  _id: string;
  roomId: string;
  name: string;
  members: string[];
};

type SidebarProps = {
  user: { id: string; name: string };
  rooms: Room[];
  activeRoom: Room | null;
  onSelectRoom: (room: Room) => void;
  onCreateRoom: (name: string) => Promise<void>;
  onJoinRoom: (roomId: string) => Promise<void>;
  onLogout: () => void;
};

export default function Sidebar({
  user,
  rooms,
  activeRoom,
  onSelectRoom,
  onCreateRoom,
  onJoinRoom,
  onLogout,
}: SidebarProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");

  const handleCreate = async () => {
    await onCreateRoom(newRoomName);
    setNewRoomName("");
    setShowCreateModal(false);
  };

  const handleJoin = async () => {
    await onJoinRoom(joinRoomId);
    setJoinRoomId("");
    setShowJoinModal(false);
  };

  return (
    <>
      {/* ================= LEFT SIDEBAR ================= */}
      <div className="w-80 bg-neutral-800 border-r border-neutral-700 flex flex-col">
        {/* HEADER */}
        <div className="p-5 border-b border-neutral-700 flex justify-between items-center bg-neutral-900">
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
              💬 ChatApp Pro
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Logged in as <span className="font-semibold text-white">{user.name}</span>
            </p>
          </div>

          <button
            onClick={onLogout}
            className="text-neutral-400 hover:text-red-400 transition"
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>

        {/* ROOM ACTIONS */}
        <div className="p-4 flex gap-2 border-b border-neutral-700">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-sm py-2 rounded-md font-medium transition shadow-lg shadow-indigo-500/20"
          >
            + Create
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-sm py-2 rounded-md font-medium transition"
          >
            Join ID
          </button>
        </div>

        {/* ROOM LIST */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 px-2">
            Your Rooms
          </h2>
          {rooms.length === 0 ? (
            <p className="text-sm text-neutral-500 px-2 italic">You haven&apos;t joined any rooms yet.</p>
          ) : (
            rooms.map((room) => (
              <button
                key={room._id}
                onClick={() => onSelectRoom(room)}
                className={`w-full text-left px-3 py-3 rounded-lg transition group ${
                  activeRoom?.roomId === room.roomId
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                    : "hover:bg-neutral-700 text-neutral-300 border border-transparent"
                }`}
              >
                <div className="font-semibold text-sm truncate">{room.name}</div>
                <div className="text-xs opacity-60 truncate mt-1 flex justify-between items-center">
                  <span>{room.members.length} members</span>
                  {activeRoom?.roomId === room.roomId && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ================= CREATE ROOM MODAL ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-neutral-800 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl border border-neutral-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-neutral-700">
              <h3 className="font-bold text-lg text-white">Create New Room</h3>
            </div>
            <div className="p-5">
              <label className="block text-sm text-neutral-400 mb-2">Room Name</label>
              <input
                className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 rounded focus:outline-none focus:border-indigo-500 text-white"
                placeholder="e.g. general, engineering"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
            </div>
            <div className="p-4 bg-neutral-900/50 flex justify-end gap-2 border-t border-neutral-700">
              <button
                onClick={() => { setShowCreateModal(false); setNewRoomName(""); }}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newRoomName.trim()}
                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded transition shadow-lg"
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= JOIN ROOM MODAL ================= */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-neutral-800 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl border border-neutral-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-neutral-700">
              <h3 className="font-bold text-lg text-white">Join Room</h3>
            </div>
            <div className="p-5">
              <label className="block text-sm text-neutral-400 mb-2">Room ID</label>
              <input
                className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 rounded focus:outline-none focus:border-indigo-500 text-white font-mono text-sm"
                placeholder="Paste the Room ID"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                autoFocus
              />
            </div>
            <div className="p-4 bg-neutral-900/50 flex justify-end gap-2 border-t border-neutral-700">
              <button
                onClick={() => { setShowJoinModal(false); setJoinRoomId(""); }}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleJoin}
                disabled={!joinRoomId.trim()}
                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded transition shadow-lg"
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
