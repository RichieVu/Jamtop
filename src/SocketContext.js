import React, { createContext, useContext } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const socket = io("http://localhost:5000");

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
