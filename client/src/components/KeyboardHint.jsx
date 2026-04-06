import React from "react";

const KEY = ({ children }) => (
  <kbd
    className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-mono font-bold text-white"
    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
  >
    {children}
  </kbd>
);

const KeyboardHint = () => (
  <div
    className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 rounded-xl text-xs pointer-events-none"
    style={{
      background: "rgba(8,12,20,0.7)",
      border: "1px solid var(--cosmos-border)",
      backdropFilter: "blur(8px)",
      color: "var(--cosmos-muted)",
    }}
  >
    <div className="flex gap-1">
      <KEY>W</KEY><KEY>A</KEY><KEY>S</KEY><KEY>D</KEY>
    </div>
    <span>or</span>
    <div className="flex gap-1">
      <KEY>↑</KEY><KEY>←</KEY><KEY>↓</KEY><KEY>→</KEY>
    </div>
    <span>to move</span>
  </div>
);

export default KeyboardHint;
