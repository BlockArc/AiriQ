"use client";
import { useEffect, useState } from "react";

export type AQIData = {
  aqi: number;
  status: string;
};

export default function useWebSocket(url: string) {
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => {
      console.log("Connected to WebSocket");
      setIsConnected(true);
      setWs(socket);
    };

    socket.onmessage = (event) => {
      try {
        const data: AQIData = JSON.parse(event.data);
        setAqiData(data);
      } catch (error) {
        console.error("Invalid WebSocket data:", event.data);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket Disconnected");
      setIsConnected(false);
      setWs(null);
      // Reconnect after 3 seconds if disconnected
      setTimeout(() => {
        console.log("Reconnecting WebSocket...");
        setWs(new WebSocket(url));
      }, 3000);
    };

    return () => {
      socket.close();
    };
  }, [url]);

  return { aqiData, isConnected };
}
