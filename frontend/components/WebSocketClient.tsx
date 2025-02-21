"use client";

import { useState } from "react";
import useWebSocket from "@/hooks/useWebSocket";
import { cn } from "@/lib/utils";
import { CloudSunRain, CircleArrowUp } from "lucide-react";

export default function AQIComponent() {
  const [city, setCity] = useState("Los Angeles");
  const [state, setState] = useState("California");
  const [country, setCountry] = useState("USA");
  const [connect, setConnect] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const { aqiData, isConnected } = useWebSocket(city, state, country, connect);

  const handleStart = () => {
    setConnect(true);
    setIsFlipped(true);
  };

  const handleGoBack = () => {
    setIsFlipped(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-4">Real-time AQI Updates</h2>

      {/* Flip Card with Smooth Transition */}
      <div className="group relative h-64 w-72 sm:h-80 sm:w-96 [perspective:1200px]">
        <div
          className={cn(
            "relative h-full w-full rounded-3xl transition-transform duration-700 [transform-style:preserve-3d]",
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          )}
        >
          {/* Front Side - Input Form */}
          <div className="absolute h-full w-full bg-opacity-10 bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-padding p-6 backdrop-blur-sm backdrop-filter dark:from-gray-700 dark:to-gray-900 rounded-3xl shadow-lg [backface-visibility:hidden]">
            <div className="mb-3">
              <label className="block text-sm mb-1">City:</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded text-white"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1">State:</label>
              <input
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Country:</label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded text-white"
              />
            </div>
            <button
              onClick={handleStart}
              disabled={isConnected}
              className={`mx-auto block w-1/2 p-2 rounded-full text-white ${
                isConnected ? "bg-green-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {isConnected ? "Connected" : "Check"}
            </button>
          </div>

          {/* Back Side - AQI Data (Weather Widget Style) */}
          <div className="absolute h-full w-full rounded-3xl bg-opacity-10 bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-padding p-6 backdrop-blur-sm backdrop-filter dark:from-gray-700 dark:to-gray-900 shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between">
            <button
              onClick={handleGoBack}
              className="absolute top-4 right-4 h-10 w-14 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 text-white text-lg"
            >
              ➤
            </button>

            {aqiData ? (
              <>
                <div className="flex flex-col gap-2 dark:text-white">
                  <p className="opacity-70">{city}, {state}</p>
                  <div className="flex items-center">
                    <CloudSunRain className="h-10 w-10" />
                    <p className="text-5xl font-black">{aqiData.aqius}</p>
                  </div>
                  <p className="opacity-70">AQI Index</p>
                </div>
                <div className="flex justify-between rounded-xl bg-gray-400 bg-opacity-30 bg-clip-padding py-1 backdrop-blur-lg backdrop-filter">
                  <div className="flex items-center gap-1 px-2 text-orange-500 dark:text-orange-200">
                    <CircleArrowUp className="h-5 w-5" />
                    {aqiData.aqius + 5} {/* Example high AQI */}
                  </div>
                  <p className="text-black opacity-50">|</p>
                  <div className="flex items-center gap-1 px-3 text-green-800 dark:text-green-200">
                    <CircleArrowUp className="h-5 w-5 rotate-180" />
                    {aqiData.aqius - 5} {/* Example low AQI */}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-red-400 flex items-center justify-center flex-grow">
                Sorry, no data available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
