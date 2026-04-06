import React, { createContext, useContext, useReducer, useCallback } from "react";

const CosmosContext = createContext(null);

const initialState = {
  myUser: null,
  users: {},
  connections: {},
  chatRooms: {},
  activeChatRoom: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_MY_USER":
      return {
        ...state,
        myUser: action.payload,
        users: {
          ...state.users,
          [action.payload.userId]: action.payload, // 🔥 ADD THIS
        },
      };
    case "UPDATE_MY_POSITION": return { ...state, myUser: { ...state.myUser, position: action.payload } };
    case "ADD_USER": return { ...state, users: { ...state.users, [action.payload.userId]: action.payload } };
    case "REMOVE_USER": {
      const { [action.payload]: _u, ...users } = state.users;
      const { [action.payload]: _c, ...connections } = state.connections;
      return { ...state, users, connections };
    }
    case "UPDATE_USER_POSITION":
      return { ...state, users: { ...state.users, [action.payload.userId]: { ...state.users[action.payload.userId], position: action.payload.position } } };
    case "SET_USERS":
      return { ...state, users: action.payload.reduce((acc, u) => ({ ...acc, [u.userId]: u }), {}) };
    case "ADD_CONNECTION":
      return {
        ...state,
        connections: { ...state.connections, [action.payload.withUserId]: { roomId: action.payload.roomId, username: action.payload.withUsername } },
        chatRooms: { ...state.chatRooms, [action.payload.roomId]: action.payload.history || [] },
      };
    case "REMOVE_CONNECTION": {
      const { [action.payload.withUserId]: _, ...connections } = state.connections;
      return { ...state, connections, activeChatRoom: state.activeChatRoom === action.payload.roomId ? null : state.activeChatRoom };
    }
    case "ADD_CHAT_MESSAGE": {
      const room = state.chatRooms[action.payload.roomId] || [];
      return { ...state, chatRooms: { ...state.chatRooms, [action.payload.roomId]: [...room, action.payload.message] } };
    }
    case "SET_ACTIVE_CHAT": return { ...state, activeChatRoom: action.payload };
    default: return state;
  }
};

export const CosmosProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const setMyUser = useCallback((u) => dispatch({ type: "SET_MY_USER", payload: u }), []);
  const updateMyPosition = useCallback((p) => dispatch({ type: "UPDATE_MY_POSITION", payload: p }), []);
  const addUser = useCallback((u) => dispatch({ type: "ADD_USER", payload: u }), []);
  const removeUser = useCallback((id) => dispatch({ type: "REMOVE_USER", payload: id }), []);
  const updateUserPosition = useCallback((id, pos) => dispatch({ type: "UPDATE_USER_POSITION", payload: { userId: id, position: pos } }), []);
  const setUsers = useCallback((u) => dispatch({ type: "SET_USERS", payload: u }), []);
  const addConnection = useCallback((d) => dispatch({ type: "ADD_CONNECTION", payload: d }), []);
  const removeConnection = useCallback((d) => dispatch({ type: "REMOVE_CONNECTION", payload: d }), []);
  const addChatMessage = useCallback((roomId, msg) => dispatch({ type: "ADD_CHAT_MESSAGE", payload: { roomId, message: msg } }), []);
  const setActiveChat = useCallback((id) => dispatch({ type: "SET_ACTIVE_CHAT", payload: id }), []);

  return (
    <CosmosContext.Provider value={{ state, setMyUser, updateMyPosition, addUser, removeUser, updateUserPosition, setUsers, addConnection, removeConnection, addChatMessage, setActiveChat }}>
      {children}
    </CosmosContext.Provider>
  );
};

export const useCosmos = () => useContext(CosmosContext);
