"use client";
import useWebSocket from "@/hooks/useWebSocket";

export default function AQIComponent() {
  const { aqiData } = useWebSocket("ws://127.0.0.1:3000/ws");

  return (
    <div>
      <h2>Real-time AQI Updates</h2>
      {aqiData ? (
        <p>
          AQI: {aqiData.aqi} - Status: {aqiData.status}
        </p>
      ) : (
        <p>Waiting for data...</p>
      )}
    </div>
  );
}
