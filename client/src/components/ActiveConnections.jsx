import React from "react";
import { useCosmos } from "../context/CosmosContext";

/**
 * Shows active connections as a small overlay panel on the canvas.
 */
const ActiveConnections = () => {
  const { state, setActiveChat } = useCosmos();
  const { connections } = state;

  const connList = Object.entries(connections);
  if (connList.length === 0) return null;

  return (
    <div
      className="absolute top-4 right-4 flex flex-col gap-1.5"
      style={{ zIndex: 10 }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--cosmos-muted)" }}>
        Nearby
      </p>
      {connList.map(([userId, conn]) => (
        <button
          key={userId}
          onClick={() => setActiveChat(conn.roomId)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all hover:scale-105"
          style={{
            background: "rgba(15,21,32,0.85)",
            border: "1px solid #10b98140",
            backdropFilter: "blur(8px)",
            boxShadow: "0 0 12px rgba(16,185,129,0.1)",
          }}
        >
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#10b981" }} />
          <span className="text-xs text-white font-medium">{conn.username}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: "var(--cosmos-muted)" }}>
            <path d="M1 5h8M5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ))}
    </div>
  );
};

export default ActiveConnections;
