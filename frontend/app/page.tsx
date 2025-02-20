import WebSocketClient from "@/components/WebSocketClient";

export default function Home() {
  return (
    <main>
      <h1>AQI Monitoring Dashboard</h1>
      <WebSocketClient />
    </main>
  );
}
