import React, { useEffect, useState } from "react";
import { useCosmos } from "../context/CosmosContext";

/**
 * Shows a toast when proximity connects/disconnects happen.
 */
const ConnectionNotification = () => {
  const { state } = useCosmos();
  const [toasts, setToasts] = useState([]);
  const prevConnectionsRef = React.useRef({});

  useEffect(() => {
    const prev = prevConnectionsRef.current;
    const curr = state.connections;

    const prevIds = new Set(Object.keys(prev));
    const currIds = new Set(Object.keys(curr));

    // New connections
    currIds.forEach((id) => {
      if (!prevIds.has(id)) {
        const username = curr[id]?.username || "Someone";
        addToast({ type: "connect", text: `Connected with ${username}`, color: "#10b981" });
      }
    });

    // Dropped connections
    prevIds.forEach((id) => {
      if (!currIds.has(id)) {
        const username = prev[id]?.username || "Someone";
        addToast({ type: "disconnect", text: `Disconnected from ${username}`, color: "#ef4444" });
      }
    });

    prevConnectionsRef.current = curr;
  }, [state.connections]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { ...toast, id }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3000);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-50 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="px-4 py-2 rounded-xl text-sm text-white flex items-center gap-2 animate-fade-in"
          style={{
            background: "rgba(15,21,32,0.95)",
            border: `1px solid ${t.color}40`,
            boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px ${t.color}20`,
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: t.color }} />
          {t.text}
        </div>
      ))}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default ConnectionNotification;
