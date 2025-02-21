import { Feedback } from "@/components/feedback";
import WebSocketClient from "@/components/WebSocketClient";

export default function Home() {
  return (
    <main className="bg-gray-900 min-h-screen text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">AQI Monitoring Dashboard</h1>
      <WebSocketClient />
      <Feedback/>
    </main>
  );
  
}

