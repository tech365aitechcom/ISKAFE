"use client";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import EventCard from "../components/EventCard";

const EventsSearch = () => {
  const [eventName, setEventName] = useState("");
  const [country, setCountry] = useState("");
  const [gameType, setGameType] = useState("");

  const handleSearch = () => {
    console.log("Searching for:", { eventName, country, gameType });
    // Implement actual search functionality here
  };

  return (
    <div className="relative w-full bg-purple-900">
      <div className="absolute inset-0 bg-transparent opacity-90"></div>
      <div className="relative w-full max-w-6xl mx-auto px-4 pt-16 pb-32">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            UPCOMING EVENTS AND
          </h1>
          <h1 className="text-4xl md:text-5xl font-bold text-red-500">
            TOURNAMENTS
          </h1>
        </div>
        <div
          className="absolute left-0 right-0 mx-auto px-4 w-full max-w-5xl"
          style={{ top: "70%" }}
        >
          <div className="bg-purple-950 rounded-xl p-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-start">
                <label className="text-white text-sm mb-2">Search Event</label>
                <input
                  type="text"
                  placeholder="Event Name"
                  className="w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                />
              </div>
              <div className="flex flex-col items-start">
                <label className="text-white text-sm mb-2">Country</label>
                <div className="relative w-full">
                  <select
                    className="appearance-none w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="" className="bg-purple-900">
                      Select
                    </option>
                    <option value="usa" className="bg-purple-900">
                      USA
                    </option>
                    <option value="uk" className="bg-purple-900">
                      UK
                    </option>
                    <option value="japan" className="bg-purple-900">
                      Japan
                    </option>
                    <option value="korea" className="bg-purple-900">
                      South Korea
                    </option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start">
                <label className="text-white text-sm mb-2">Game Type</label>
                <div className="relative w-full">
                  <select
                    className="appearance-none w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500"
                    value={gameType}
                    onChange={(e) => setGameType(e.target.value)}
                  >
                    <option value="" className="bg-purple-900">
                      Select
                    </option>
                    <option value="fps" className="bg-purple-900">
                      FPS
                    </option>
                    <option value="moba" className="bg-purple-900">
                      MOBA
                    </option>
                    <option value="battle-royale" className="bg-purple-900">
                      Battle Royale
                    </option>
                    <option value="fighting" className="bg-purple-900">
                      Fighting
                    </option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleSearch}
                className="bg-red-500 text-white px-12 py-3 rounded font-medium hover:bg-red-600 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-32 bg-black"></div>
      <div className="bg-black w-full mx-auto px-4 py-16 flex justify-center gap-10 items-center">
        <EventCard
          imageUrl="https://images.unsplash.com/photo-1714583173985-fa58ef40c8d4?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          imageAlt="Concert stage with lights"
          location="New York, United States"
          month="MAY"
          day="21"
          title="Taylor Swift - The Eras Tour"
          description="Experience the music journey through all of Taylor's eras."
          onClick={() => console.log("Card clicked!")}
        />
        <EventCard
          imageUrl="https://images.unsplash.com/photo-1714583173985-fa58ef40c8d4?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          imageAlt="Concert stage with lights"
          location="New York, United States"
          month="MAY"
          day="21"
          title="Taylor Swift - The Eras Tour"
          description="Experience the music journey through all of Taylor's eras."
          onClick={() => console.log("Card clicked!")}
        />
        <EventCard
          imageUrl="https://images.unsplash.com/photo-1714583173985-fa58ef40c8d4?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          imageAlt="Concert stage with lights"
          location="New York, United States"
          month="MAY"
          day="21"
          title="Taylor Swift - The Eras Tour"
          description="Experience the music journey through all of Taylor's eras."
          onClick={() => console.log("Card clicked!")}
        />
      </div>
    </div>
  );
};

export default EventsSearch;
