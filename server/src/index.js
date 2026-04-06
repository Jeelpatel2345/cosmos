require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const { registerSocketHandlers } = require("./handlers/socketHandlers");
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors({
  origin: "*"
}));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", users: Object.keys(userStore).length });
});

// In-memory user store (no DB call needed for real-time state)
const userStore = {};

// Connect MongoDB (optional, graceful fallback)
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/virtual-cosmos";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(() => console.log("⚠️  MongoDB not available — running in-memory only"));

// Socket.IO setup
io.on("connection", (socket) => {
  registerSocketHandlers(io, socket, userStore);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Virtual Cosmos server running on port ${PORT}`);
});
