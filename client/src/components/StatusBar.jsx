import React from "react";
import { useCosmos } from "../context/CosmosContext";
import { useSocket } from "../context/SocketContext";

const StatusBar = () => {
  const { state } = useCosmos();
  const { connected } = useSocket();

  const { myUser, users, connections } = state;

  const totalUsers = Object.keys(users).length + (myUser ? 1 : 0);
  const activeConnections = Object.keys(connections).length;

  return (
    <div className="flex items-center justify-between px-5 py-2.5 bg-black text-white">

      {/* Left */}
      <div className="font-bold">Virtual Cosmos</div>

      {/* Center */}
      <div className="flex gap-5">
        <span>{totalUsers} Users</span>
        <span>{activeConnections} Connections</span>
        {myUser && <span>{myUser.username}</span>}
      </div>

      {/* Right */}
      <div>
        {connected ? "🟢 Connected" : "🔴 Disconnected"}
      </div>
    </div>
  );
};

export default StatusBar;