import React, { useState, useEffect, useRef } from "react";
import { useCosmos } from "../context/CosmosContext";
import { useSocket } from "../context/SocketContext";

const ChatPanel = () => {
  const { state, setActiveChat } = useCosmos();
  const { socket } = useSocket();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const { activeChatRoom, chatRooms, connections, myUser } = state;

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatRooms[activeChatRoom]?.length]);

  // Auto-open chat when first connection arrives
  useEffect(() => {
    if (!activeChatRoom && Object.keys(connections).length > 0) {
      const firstConn = Object.values(connections)[0];
      setActiveChat(firstConn.roomId);
    }
  }, [connections, activeChatRoom, setActiveChat]);

  if (!activeChatRoom) return null;

  const messages = chatRooms[activeChatRoom] || [];
  const connectedUser = Object.values(connections).find((c) => c.roomId === activeChatRoom);

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !socket) return;
    socket.emit("chat:message", { roomId: activeChatRoom, message: text });
    setInput("");
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: "var(--cosmos-surface)",
        borderLeft: "1px solid var(--cosmos-border)",
        width: "320px",
        minWidth: "320px",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid var(--cosmos-border)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#10b981" }}
          />
          <span className="font-display text-sm font-semibold text-white">
            {connectedUser?.username || "Chat"}
          </span>
        </div>
        <button
          onClick={() => setActiveChat(null)}
          className="text-xs px-2 py-1 rounded-lg transition-colors hover:text-white"
          style={{ color: "var(--cosmos-muted)", background: "transparent" }}
        >
          ✕
        </button>
      </div>

      {/* Connection tabs — show if multiple connections */}
      {Object.values(connections).length > 1 && (
        <div
          className="flex gap-1 px-3 py-2 overflow-x-auto"
          style={{ borderBottom: "1px solid var(--cosmos-border)" }}
        >
          {Object.values(connections).map((conn) => (
            <button
              key={conn.roomId}
              onClick={() => setActiveChat(conn.roomId)}
              className="px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-all"
              style={{
                background: conn.roomId === activeChatRoom ? "var(--cosmos-accent)" : "rgba(255,255,255,0.05)",
                color: conn.roomId === activeChatRoom ? "white" : "var(--cosmos-muted)",
                border: "1px solid",
                borderColor: conn.roomId === activeChatRoom ? "var(--cosmos-accent)" : "var(--cosmos-border)",
              }}
            >
              {conn.username}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-2xl mb-2">👋</div>
            <p className="text-xs" style={{ color: "var(--cosmos-muted)" }}>
              You're now connected with <strong className="text-white">{connectedUser?.username}</strong>
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--cosmos-muted)" }}>
              Say hello!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === myUser?.userId;
            return (
              <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                {/* Avatar dot */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                  style={{ background: msg.avatarColor }}
                >
                  {msg.senderName[0].toUpperCase()}
                </div>
                <div className={`flex flex-col gap-0.5 max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                  <div
                    className="px-3 py-2 rounded-2xl text-sm leading-relaxed break-words"
                    style={{
                      background: isMe ? "var(--cosmos-accent)" : "rgba(255,255,255,0.07)",
                      color: "white",
                      borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    }}
                  >
                    {msg.text}
                  </div>
                  <span className="text-xs" style={{ color: "var(--cosmos-muted)" }}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="px-3 py-3 flex gap-2 items-center"
        style={{ borderTop: "1px solid var(--cosmos-border)" }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          maxLength={300}
          className="flex-1 px-3 py-2 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--cosmos-border)",
            fontFamily: "'DM Sans', sans-serif",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--cosmos-accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--cosmos-border)")}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
          style={{
            background: input.trim() ? "var(--cosmos-accent)" : "rgba(255,255,255,0.05)",
            cursor: input.trim() ? "pointer" : "not-allowed",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14 8L2 2l2.5 6L2 14l12-6z" fill="white" opacity={input.trim() ? 1 : 0.3} />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
