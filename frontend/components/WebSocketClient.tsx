"use client";
import { useState } from "react";
import useWebSocket from "@/hooks/useWebSocket";

export default function AQIComponent() {
  const [city, setCity] = useState("Los Angeles");
  const [state, setState] = useState("California");
  const [country, setCountry] = useState("USA");
  const [connect, setConnect] = useState(false);

  const { aqiData, isConnected } = useWebSocket(city, state, country, connect);

  return (
    <div>
      <h2>Real-time AQI Updates</h2>
      <div>
        <label>City: </label>
        <input value={city} onChange={(e) => setCity(e.target.value)} />
      </div>
      <div>
        <label>State: </label>
        <input value={state} onChange={(e) => setState(e.target.value)} />
      </div>
      <div>
        <label>Country: </label>
        <input value={country} onChange={(e) => setCountry(e.target.value)} />
      </div>

      <button onClick={() => setConnect(true)} disabled={isConnected}>
        {isConnected ? "Connected" : "Start Live Updates"}
      </button>

      {aqiData ? (
        <p>
          AQI: {aqiData.aqius} - Last Updated: {aqiData.ts}
        </p>
      ) : (
        <p>Waiting for data...</p>
      )}
      <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
    </div>
  );
}
