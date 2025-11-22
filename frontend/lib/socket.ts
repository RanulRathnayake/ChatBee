"use client";

import { io, Socket } from "socket.io-client";
import { getToken } from "./auth";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = getToken();

    socket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5000", {
      transports: ["websocket"],
      auth: { token },
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
