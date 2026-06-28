"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";

const SocketContext = createContext(null);

function getSessionToken() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)better-auth\.session_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function SocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    let io;
    const initSocket = async () => {
      try {
        const { io: socketIO } = await import("socket.io-client");
        const serverUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        io = socketIO(serverUrl, {
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 10000,
          reconnectionAttempts: Infinity,
        });

        socketRef.current = io;

        io.on("connect", () => {
          if (!mountedRef.current) return;
          setIsConnected(true);
          const token = getSessionToken();
          if (token) {
            io.emit("authenticate", token);
          }
        });

        io.on("authenticated", () => {
          if (!mountedRef.current) return;
          setIsAuthenticated(true);
        });

        io.on("auth_error", () => {
          if (!mountedRef.current) return;
          setIsAuthenticated(false);
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = setTimeout(() => {
            const token = getSessionToken();
            if (token && io) io.emit("authenticate", token);
          }, 2000);
        });

        io.on("disconnect", () => {
          if (!mountedRef.current) return;
          setIsConnected(false);
          setIsAuthenticated(false);
        });

        io.on("notification", (data) => {
          if (!mountedRef.current) return;
          window.dispatchEvent(
            new CustomEvent("realtime-notification", { detail: data })
          );
        });

        io.connect();
      } catch (err) {
        console.warn("[Socket] Failed to load socket.io-client:", err.message);
      }
    };

    initSocket();

    return () => {
      mountedRef.current = false;
      clearTimeout(reconnectTimerRef.current);
      if (io) {
        io.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, isAuthenticated }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) return { socket: null, isConnected: false, isAuthenticated: false };
  return ctx;
}

export default SocketContext;