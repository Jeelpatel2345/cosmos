# 🌌 Virtual Cosmos

A real-time 2D multiplayer virtual space where users can move around and interact based on proximity.

**Core mechanic:** When users move close to each other → chat connects. When they move apart → chat disconnects.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, PixiJS 7, Tailwind CSS |
| Backend | Node.js + Express |
| Real-time | Socket.IO |
| Database | MongoDB (optional, graceful in-memory fallback) |

---

## Project Structure

```
virtual-cosmos/
├── client/               # React frontend (Vite)
│   └── src/
│       ├── components/   # UI components
│       │   ├── JoinScreen.jsx          # Entry screen
│       │   ├── CosmosApp.jsx           # Main layout
│       │   ├── CosmosCanvas.jsx        # PixiJS 2D world
│       │   ├── ChatPanel.jsx           # Proximity chat
│       │   ├── StatusBar.jsx           # Top status bar
│       │   ├── ActiveConnections.jsx   # Nearby users overlay
│       │   ├── ConnectionNotification.jsx # Toast alerts
│       │   └── KeyboardHint.jsx        # Movement hint
│       ├── context/
│       │   ├── SocketContext.jsx       # Socket.IO connection
│       │   └── CosmosContext.jsx       # Global state (useReducer)
│       ├── hooks/
│       │   └── useSocketEvents.js      # Socket event wiring
│       └── utils/
│           └── colors.js               # Avatar colors
└── server/               # Node.js backend
    └── src/
        ├── index.js                    # Express + Socket.IO setup
        ├── handlers/
        │   └── socketHandlers.js       # All socket event logic
        └── utils/
            └── proximity.js            # Distance calculations
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB (optional)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd virtual-cosmos

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Environment

```bash
# In server/
cp .env.example .env
# Edit .env if needed (defaults work out of the box)
```

### 3. Run

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Server starts on http://localhost:4000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# Frontend starts on http://localhost:5173
```

### 4. Open in Browser

Open **two or more browser tabs** at `http://localhost:5173`, enter different names, and move your avatars close together to trigger proximity chat.

---

## Features

- **2D Canvas World** — Rendered with PixiJS, grid-based environment
- **Keyboard Movement** — WASD or Arrow keys to move your avatar
- **Real-time Multiplayer** — All positions sync via Socket.IO
- **Proximity Detection** — 150px radius; enter range → chat opens, leave → chat closes
- **Live Chat** — Per-room messaging with history, timestamps, auto-scroll
- **Multiple Connections** — Connect with several users simultaneously, tab between chats
- **Toast Notifications** — Visual feedback on connect/disconnect
- **Status Bar** — Live count of users online and active connections

---

## Socket Events Reference

| Event | Direction | Payload |
|---|---|---|
| `user:join` | Client → Server | `{ username, avatarColor }` |
| `user:joined` | Server → Client | `{ user }` |
| `users:existing` | Server → Client | `{ users[] }` |
| `user:new` | Server → All | `{ user }` |
| `user:left` | Server → All | `{ userId }` |
| `user:move` | Client → Server | `{ position: {x, y} }` |
| `user:moved` | Server → Others | `{ userId, position }` |
| `proximity:connected` | Server → Client | `{ withUserId, withUsername, roomId, history }` |
| `proximity:disconnected` | Server → Client | `{ withUserId, roomId }` |
| `chat:message` | Client → Server | `{ roomId, message }` |
| `chat:newMessage` | Server → Room | `{ roomId, message }` |

---

## Configuration

| Parameter | Location | Default | Description |
|---|---|---|---|
| `PROXIMITY_RADIUS` | `server/src/handlers/socketHandlers.js` | `150` | Pixel distance to trigger connection |
| `MOVE_SPEED` | `client/src/components/CosmosCanvas.jsx` | `4` | Pixels per frame |
| `THROTTLE_MS` | `client/src/components/CosmosCanvas.jsx` | `30` | Position emit throttle |
| `PORT` | `server/.env` | `4000` | Server port |

