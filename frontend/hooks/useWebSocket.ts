"use client";
import { useEffect, useState } from "react";

export type AQIData = {
  ts: string;
  aqius: number;
};

export default function useWebSocket(city: string, state: string, country: string, connect: boolean) {
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!connect || !city || !state || !country) return; // Only connect when button is pressed

    const url = `ws://127.0.0.1:3000/ws?city=${city}&state=${state}&country=${country}`;
    const socket = new WebSocket(url);
    setWs(socket);

    socket.onopen = () => {
      console.log("Connected to WebSocket");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data: AQIData = JSON.parse(event.data);
        setAqiData(data);
      } catch (error) {
        console.error("Invalid WebSocket data:", event.data);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket Disconnected");
      setIsConnected(false);
      setWs(null);
    };

    return () => socket.close();
  }, [connect, city, state, country]);

  return { aqiData, isConnected };
}
