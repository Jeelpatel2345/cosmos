import React, { useState } from "react";
import { AVATAR_COLORS } from "../utils/colors";

const JoinScreen = ({ onJoin }) => {
  const [username, setUsername] = useState("");
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);

  const handleJoin = (e) => {
    e.preventDefault();
    const name = username.trim();
    if (!name) return;
    onJoin({ username: name, avatarColor: selectedColor });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "var(--cosmos-bg)" }}>
      {/* Starfield background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + "px",
              height: Math.random() * 2 + 1 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.6 + 0.1,
              animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: Math.random() * 3 + "s",
            }}
          />
        ))}
      </div>

      <div
        className="relative z-10 w-full max-w-md mx-4 rounded-2xl p-8"
        style={{
          background: "var(--cosmos-surface)",
          border: "1px solid var(--cosmos-border)",
          boxShadow: "0 0 60px rgba(59,130,246,0.12), 0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", boxShadow: "0 0 30px rgba(59,130,246,0.4)" }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="6" fill="white" opacity="0.9" />
              <circle cx="16" cy="16" r="12" stroke="white" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />
              <circle cx="16" cy="16" r="15" stroke="white" strokeWidth="0.5" opacity="0.25" />
              <circle cx="6" cy="10" r="1.5" fill="white" opacity="0.7" />
              <circle cx="26" cy="22" r="1.5" fill="white" opacity="0.7" />
              <circle cx="24" cy="7" r="1" fill="white" opacity="0.5" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Virtual Cosmos</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--cosmos-muted)" }}>
            Move close to connect. Move away to disconnect.
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--cosmos-muted)" }}>
              Your Name
            </label>
            <input
              type="text"
              maxLength={20}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--cosmos-border)",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--cosmos-accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--cosmos-border)")}
              autoFocus
            />
          </div>

          {/* Avatar color */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--cosmos-muted)" }}>
              Avatar Color
            </label>
            <div className="flex gap-3 flex-wrap">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className="w-9 h-9 rounded-full transition-all duration-150 flex items-center justify-center"
                  style={{
                    background: color,
                    boxShadow: selectedColor === color ? `0 0 0 3px var(--cosmos-bg), 0 0 0 5px ${color}` : "none",
                    transform: selectedColor === color ? "scale(1.15)" : "scale(1)",
                  }}
                >
                  {selectedColor === color && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l3.5 3.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--cosmos-border)" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-white text-sm"
              style={{ background: selectedColor, boxShadow: `0 0 16px ${selectedColor}60` }}>
              {username ? username[0].toUpperCase() : "?"}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{username || "Your Name"}</p>
              <p className="text-xs" style={{ color: "var(--cosmos-muted)" }}>Ready to explore</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!username.trim()}
            className="w-full py-3 rounded-xl font-display font-semibold text-white text-sm tracking-wide transition-all duration-200"
            style={{
              background: username.trim()
                ? "linear-gradient(135deg, #3b82f6, #6366f1)"
                : "rgba(255,255,255,0.05)",
              color: username.trim() ? "white" : "var(--cosmos-muted)",
              boxShadow: username.trim() ? "0 4px 24px rgba(59,130,246,0.35)" : "none",
              cursor: username.trim() ? "pointer" : "not-allowed",
            }}
          >
            Enter the Cosmos →
          </button>
        </form>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );

};

export default JoinScreen;

