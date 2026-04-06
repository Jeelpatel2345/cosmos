import React, { useEffect, useRef, useCallback } from "react";
import * as PIXI from "pixi.js";
import { useCosmos } from "../context/CosmosContext";
import { useSocket } from "../context/SocketContext";
import { hexToNumber } from "../utils/colors";

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 700;
const PROXIMITY_RADIUS = 150;
const MOVE_SPEED = 4;
const THROTTLE_MS = 30; // emit position at most every 30ms

const CosmosCanvas = () => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const spritesRef = useRef({}); // { [userId]: { container, circle, label, ring } }
  const keysRef = useRef({});
  const lastEmitRef = useRef(0);
  const myUserRef = useRef(null);

  const { state, updateMyPosition, setActiveChat } = useCosmos();
  const { socket } = useSocket();

  console.log("STATE:", state);

  // Keep myUser ref in sync to avoid stale closures in animation loop
  useEffect(() => {
    myUserRef.current = state.myUser;
  }, [state.myUser]);

  useEffect(() => {
    console.log("🔥 USERS:", state.users);
  }, [state.users]);

  // ─── PIXI SETUP ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return;

    const app = new PIXI.Application({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: 0x080c14,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    canvasRef.current.appendChild(app.view);
    appRef.current = app;

    // Grid / floor texture
    const grid = new PIXI.Graphics();
    for (let x = 0; x <= CANVAS_WIDTH; x += 60) {
      grid.lineStyle(0.5, 0x1e2d45, 0.4);
      grid.moveTo(x, 0);
      grid.lineTo(x, CANVAS_HEIGHT);
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += 60) {
      grid.lineStyle(0.5, 0x1e2d45, 0.4);
      grid.moveTo(0, y);
      grid.lineTo(CANVAS_WIDTH, y);
    }
    app.stage.addChild(grid);

    return () => {
      app.destroy(true, { children: true });
      appRef.current = null;
    };
  }, []);


  // ─── HELPER: create avatar sprite ─────────────────────────────────────────
  const createSprite = useCallback((user) => {
    if (!appRef.current) return;
    if (spritesRef.current[user.userId]) return; // already exists

    const container = new PIXI.Container();
    container.x = user.position?.x || 200;
    container.y = user.position?.y || 200;

    const color = hexToNumber(user.avatarColor || "#6366f1");

    // Proximity ring (shown when connected)
    const ring = new PIXI.Graphics();
    ring.lineStyle(1.5, color, 0.3);
    ring.drawCircle(0, 0, PROXIMITY_RADIUS);
    ring.visible = false;
    container.addChild(ring);

    // Glow effect
    const glow = new PIXI.Graphics();
    glow.beginFill(color, 0.12);
    glow.drawCircle(0, 0, 22);
    glow.endFill();
    container.addChild(glow);

    // Main circle
    const circle = new PIXI.Graphics();
    circle.beginFill(color);
    circle.drawCircle(0, 0, 16);
    circle.endFill();
    circle.lineStyle(2, 0xffffff, 0.2);
    circle.drawCircle(0, 0, 16);
    container.addChild(circle);

    // Initial letter
    const style = new PIXI.TextStyle({
      fontFamily: "Syne, sans-serif",
      fontSize: 14,
      fontWeight: "700",
      fill: "#ffffff",
    });
    const letter = new PIXI.Text(user.username[0].toUpperCase(), style);
    letter.anchor.set(0.5);
    container.addChild(letter);

    // Username label
    const labelStyle = new PIXI.TextStyle({
      fontFamily: "DM Sans, sans-serif",
      fontSize: 11,
      fill: "#94a3b8",
      fontWeight: "500",
    });
    const label = new PIXI.Text(user.username, labelStyle);
    label.anchor.set(0.5, 0);
    label.y = 22;
    container.addChild(label);

    appRef.current.stage.addChild(container);
    spritesRef.current[user.userId] = { container, circle, glow, ring, label };
  }, []);

  // ─── HELPER: remove sprite ─────────────────────────────────────────────────
  const removeSprite = useCallback((userId) => {
    const sprite = spritesRef.current[userId];
    if (!sprite || !appRef.current) return;
    appRef.current.stage.removeChild(sprite.container);
    sprite.container.destroy({ children: true });
    delete spritesRef.current[userId];
  }, []);

  // ─── Sync users ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!appRef.current) return;

    // Add myUser sprite
    if (state.myUser && !spritesRef.current[state.myUser.userId]) {
      createSprite(state.myUser);
      // Make own avatar slightly brighter
      const s = spritesRef.current[state.myUser.userId];
      if (s) {
        s.label.style.fill = "#ffffff";
        s.label.style.fontWeight = "700";
      }
    }

    // Add/remove other users
    const allUserIds = new Set([
      ...Object.keys(state.users),
      state.myUser?.userId,
    ].filter(Boolean));

    Object.keys(spritesRef.current).forEach((id) => {
      if (!allUserIds.has(id)) removeSprite(id);
    });

    Object.values(state.users).forEach((u) => createSprite(u));
  }, [state.myUser, state.users, createSprite, removeSprite]);

  // ─── Update positions of other users ────────────────────────────────────────
  useEffect(() => {
    Object.values(state.users).forEach((u) => {
      const sprite = spritesRef.current[u.userId];
      if (!sprite) return;
      sprite.container.x = u.position.x;
      sprite.container.y = u.position.y;
    });
  }, [state.users]);

  // ─── Show/hide proximity rings ───────────────────────────────────────────────
  useEffect(() => {
    const connectedIds = new Set(Object.keys(state.connections));

    Object.entries(spritesRef.current).forEach(([userId, sprite]) => {
      const isConnected = connectedIds.has(userId);
      if (sprite.ring) sprite.ring.visible = isConnected;
    });

    // Show ring on own avatar if has any connections
    if (state.myUser) {
      const mySprite = spritesRef.current[state.myUser.userId];
      if (mySprite?.ring) mySprite.ring.visible = connectedIds.size > 0;
    }
  }, [state.connections, state.myUser]);

  // ─── Click on connected user to open chat ────────────────────────────────────
  useEffect(() => {
    Object.entries(state.connections || {}).forEach(([userId, conn]) => {
      const sprite = spritesRef.current[userId];
      if (!sprite) return;
      sprite.container.eventMode = "static";
      sprite.container.cursor = "pointer";
      sprite.container.removeAllListeners("pointerdown");
      sprite.container.on("pointerdown", () => {
        setActiveChat(conn.roomId);
      });
    });
  }, [state.connections, setActiveChat]);

  // ─── Keyboard movement ───────────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      keysRef.current[e.key.toLowerCase()] = true;
    };

    const onKeyUp = (e) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // ─── Game loop ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!appRef.current) return;

    const app = appRef.current;
    const ticker = app.ticker;

    if (!ticker) return;

    const loop = () => {
      // ✅ HARD SAFETY (prevents PIXI crash)
      if (!appRef.current) return;

      const user = myUserRef.current;

      if (!user || !socket) return;

      const keys = keysRef.current;

      // ✅ SAFE POSITION (fix crash)
      let x = user.position?.x || 200;
      let y = user.position?.y || 200;

      let moved = false;

      // ✅ MOVEMENT
      if (keys["w"] || keys["arrowup"]) { y -= MOVE_SPEED; moved = true; }
      if (keys["s"] || keys["arrowdown"]) { y += MOVE_SPEED; moved = true; }
      if (keys["a"] || keys["arrowleft"]) { x -= MOVE_SPEED; moved = true; }
      if (keys["d"] || keys["arrowright"]) { x += MOVE_SPEED; moved = true; }

      if (!moved) return;

      // ✅ BOUNDS
      x = Math.max(20, Math.min(CANVAS_WIDTH - 20, x));
      y = Math.max(20, Math.min(CANVAS_HEIGHT - 20, y));

      // ✅ UPDATE STATE
      updateMyPosition({ x, y });

      // ✅ SAFE SPRITE ACCESS (fix crash)
      const sprite = spritesRef.current[user.userId];
      if (!sprite || !sprite.container) return;

      sprite.container.x = x;
      sprite.container.y = y;

      // ✅ SOCKET EMIT
      const now = Date.now();
      if (now - lastEmitRef.current > THROTTLE_MS) {
        socket.emit("user:move", { position: { x, y } });
        lastEmitRef.current = now;
      }
    };

    ticker.add(loop);

    return () => {
      if (ticker && loop) {
        try {
          ticker.remove(loop);
        } catch (e) {
          console.warn("Cleanup error:", e);
        }
      }
    };
  }, [socket, updateMyPosition]);

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden"
      style={{ cursor: "crosshair" }}
      tabIndex={0}
      onClick={(e) => e.currentTarget.focus()} // 🔥 IMPORTANT
    />
  );
};

export default CosmosCanvas;
