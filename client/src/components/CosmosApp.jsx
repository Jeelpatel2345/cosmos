import React, { useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useCosmos } from "../context/CosmosContext";
import { useSocketEvents } from "../hooks/useSocketEvents";
import CosmosCanvas from "./CosmosCanvas";
import ChatPanel from "./ChatPanel";
import StatusBar from "./StatusBar";
import ConnectionNotification from "./ConnectionNotification";
import KeyboardHint from "./KeyboardHint";
import ActiveConnections from "./ActiveConnections";

/**
 * Main cosmos workspace — rendered after user has joined.
 */
const CosmosApp = ({ joinData }) => {
  const { socket } = useSocket();
  const { setMyUser } = useCosmos();

  // Register all socket event listeners
  useSocketEvents();

  // Emit join event and store own user data
useEffect(() => {
  if (!socket || !joinData) return;

  console.log("🚀 Joining user...");

  socket.emit("user:join", joinData);

  const handleJoined = ({ user }) => {
    console.log("✅ USER JOINED:", user);
    setMyUser(user);
  };

  socket.on("user:joined", handleJoined);
  

  return () => {
    socket.off("user:joined", handleJoined);
  };
}, [socket]); // ❗ ONLY socket

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <StatusBar />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Canvas area */}
        <div className="flex-1 relative overflow-hidden">
          <CosmosCanvas />
          <ActiveConnections />
          <KeyboardHint />
        </div>

        {/* Chat panel — only rendered when a chat room is active */}
        <ChatPanel />
      </div>

      {/* Toast notifications */}
      <ConnectionNotification />
    </div>
  );
};

export default CosmosApp;
