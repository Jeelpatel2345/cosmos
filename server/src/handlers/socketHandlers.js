const { v4: uuidv4 } = require("uuid");
const { getNearbyUsers, getDistance } = require("../utils/proximity");

const PROXIMITY_RADIUS = 150; // pixels
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 700;

// Chat messages per room (in-memory)
const chatRooms = {};

const registerSocketHandlers = (io, socket, userStore) => {
  // ─── JOIN ───────────────────────────────────────────────────────────
  socket.on("user:join", ({ username, avatarColor, status }) => {
    const userId = socket.id;

    userStore[userId] = {
      userId,
      username: username || `User_${userId.slice(0, 4)}`,
      avatarColor: avatarColor || "#6366f1",
      position: {
        x: Math.floor(Math.random() * (CANVAS_WIDTH - 200)) + 100,
        y: Math.floor(Math.random() * (CANVAS_HEIGHT - 200)) + 100,
      },
      connections: [],
    };

    socket.emit("user:joined", { user: userStore[userId] });
    socket.broadcast.emit("user:new", { user: userStore[userId] });

    // Send existing users to new joiner
    const otherUsers = Object.values(userStore).filter((u) => u.userId !== userId);
    socket.emit("users:existing", { users: otherUsers });

    console.log(`✅ ${userStore[userId].username} joined (${userId})`);
  });

  // ─── MOVE ────────────────────────────────────────────────────────────
  socket.on("user:move", ({ position }) => {
    const userId = socket.id;
    const user = userStore[userId];
    if (!user) return;

    user.position = position;

    // Broadcast position to all others
    socket.broadcast.emit("user:moved", { userId, position });

    // Recalculate proximity for this user
    const nearbyIds = getNearbyUsers(userId, userStore, PROXIMITY_RADIUS);
    const prevConnections = new Set(user.connections);
    const newConnections = new Set(nearbyIds);

    // Newly connected
    nearbyIds.forEach((nearId) => {
      if (!prevConnections.has(nearId)) {
        // Join shared room
        const roomId = [userId, nearId].sort().join("__");
        socket.join(roomId);
        const nearSocket = io.sockets.sockets.get(nearId);
        if (nearSocket) nearSocket.join(roomId);

        if (!chatRooms[roomId]) chatRooms[roomId] = [];

        // Notify both users
        socket.emit("proximity:connected", {
          withUserId: nearId,
          withUsername: userStore[nearId]?.username,
          roomId,
          history: chatRooms[roomId],
        });
        io.to(nearId).emit("proximity:connected", {
          withUserId: userId,
          withUsername: user.username,
          roomId,
          history: chatRooms[roomId],
        });
      }
    });

    // Newly disconnected
    prevConnections.forEach((prevId) => {
      if (!newConnections.has(prevId)) {
        const roomId = [userId, prevId].sort().join("__");
        socket.leave(roomId);
        const prevSocket = io.sockets.sockets.get(prevId);
        if (prevSocket) prevSocket.leave(roomId);

        socket.emit("proximity:disconnected", { withUserId: prevId, roomId });
        io.to(prevId).emit("proximity:disconnected", { withUserId: userId, roomId });
      }
    });

    user.connections = nearbyIds;

    // Also update other users who might now be near/far from this user
    Object.values(userStore).forEach((otherUser) => {
      if (otherUser.userId === userId) return;
      const dist = getDistance(user.position, otherUser.position);
      const wasConnected = otherUser.connections.includes(userId);
      const isNowConnected = dist < PROXIMITY_RADIUS;

      if (!wasConnected && isNowConnected) {
        otherUser.connections = [...otherUser.connections, userId];
      } else if (wasConnected && !isNowConnected) {
        otherUser.connections = otherUser.connections.filter((id) => id !== userId);
      }
    });
  });

  // ─── CHAT ────────────────────────────────────────────────────────────
  socket.on("chat:message", ({ roomId, message }) => {
    const userId = socket.id;
    const user = userStore[userId];
    if (!user) return;

    const msg = {
      id: uuidv4(),
      senderId: userId,
      senderName: user.username,
      avatarColor: user.avatarColor,
      text: message,
      timestamp: new Date().toISOString(),
    };

    if (!chatRooms[roomId]) chatRooms[roomId] = [];
    chatRooms[roomId].push(msg);

    // Emit to room
    io.to(roomId).emit("chat:newMessage", { roomId, message: msg });
  });

  // ─── DISCONNECT ──────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    const userId = socket.id;
    const user = userStore[userId];
    if (!user) return;

    // Notify connected users
    user.connections.forEach((connId) => {
      const roomId = [userId, connId].sort().join("__");
      io.to(connId).emit("proximity:disconnected", { withUserId: userId, roomId });
    });

    // Notify all about user leaving
    io.emit("user:left", { userId });

    delete userStore[userId];
    console.log(`❌ ${user.username} disconnected`);
  });
};

module.exports = { registerSocketHandlers };
