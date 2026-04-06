import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useCosmos } from "../context/CosmosContext";

/**
 * Registers all socket event listeners and wires them to CosmosContext.
 * Must be called once after the user has joined.
 */
export const useSocketEvents = () => {
  const { socket } = useSocket();
  const { addUser, removeUser, updateUserPosition, setUsers, addConnection, removeConnection, addChatMessage } = useCosmos();

  useEffect(() => {
    if (!socket) return;

    // Another user joined
    socket.on("user:new", ({ user }) => addUser(user));

    // A user left
    socket.on("user:left", ({ userId }) => removeUser(userId));

    // Existing users when I join
    socket.on("users:existing", ({ users }) => setUsers(users));

    // A user moved
    socket.on("user:moved", ({ userId, position }) => updateUserPosition(userId, position));

    // Proximity connected
    socket.on("proximity:connected", (data) => addConnection(data));

    // Proximity disconnected
    socket.on("proximity:disconnected", (data) => removeConnection(data));

    // New chat message
    socket.on("chat:newMessage", ({ roomId, message }) => addChatMessage(roomId, message));

    return () => {
      socket.off("user:new");
      socket.off("user:left");
      socket.off("users:existing");
      socket.off("user:moved");
      socket.off("proximity:connected");
      socket.off("proximity:disconnected");
      socket.off("chat:newMessage");
    };
  }, [socket]);
};
