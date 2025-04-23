"use client";
import { useState } from "react";

export default function TournamentSystem() {
  const events = [
    {
      id: 1,
      name: "IKF Point Muay Thai and PBSC Point Boxing Sparring Seminar by Anthony Bui- Mexico (03/22/2025)",
      days: 1,
      brackets: 1,
    },
    {
      id: 2,
      name: "ISCF Semi-Contact MMA Technical Bouts (03/29/2025)",
      days: 2,
      brackets: 3,
    },
    {
      id: 3,
      name: "PBSC Point Boxing Sparring Circuit - Bishop, CA (03/29/2025)",
      days: 1,
      brackets: 2,
    },
  ];

  const competitorsData = {
    1: [
      {
        id: 1,
        name: "Eric Franks",
        image: "/api/placeholder/100/120",
        bracket: 1,
        position: 1,
      },
      {
        id: 2,
        name: "Anthony Bui",
        image: "/api/placeholder/100/120",
        bracket: 1,
        position: 2,
      },
      {
        id: 3,
        name: "Chantese Dentley",
        image: "/api/placeholder/100/120",
        bracket: 1,
        position: 3,
      },
      {
        id: 4,
        name: "Eric Franks",
        image: "/api/placeholder/100/120",
        bracket: 1,
        position: 4,
      },
      {
        id: 5,
        name: "Eric Franks",
        image: "/api/placeholder/100/120",
        bracket: 2,
        position: 1,
      },
      {
        id: 6,
        name: "Eric Franks",
        image: "/api/placeholder/100/120",
        bracket: 2,
        position: 2,
      },
      {
        id: 7,
        name: "Eric Franks",
        image: "/api/placeholder/100/120",
        bracket: 2,
        position: 3,
      },
      {
        id: 8,
        name: "Eric Franks",
        image: "/api/placeholder/100/120",
        bracket: 2,
        position: 4,
      },
    ],
  };

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBracket, setShowBracket] = useState(false);
  const [currentView, setCurrentView] = useState("eventsList");

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedEvent = events.find((event) => event.id === selectedEventId);

  const handleEventSelect = (eventId) => {
    setSelectedEventId(eventId);
    setCurrentView("eventDetails");
  };

  const handleLoadData = () => {
    setCurrentView("bracketView");
  };

  const handleBackToEvents = () => {
    if (currentView === "bracketView") {
      setCurrentView("eventDetails");
    } else {
      setSelectedEventId(null);
      setCurrentView("eventsList");
    }
  };

  const TournamentBracket = ({ eventId }) => {
    const competitors = competitorsData[eventId] || [];
    const event = events.find((e) => e.id === eventId);

    const bracketGroups = competitors.reduce((groups, competitor) => {
      if (!groups[competitor.bracket]) {
        groups[competitor.bracket] = [];
      }
      groups[competitor.bracket].push(competitor);
      return groups;
    }, {});

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{event.name}</h2>
          <button
            className="text-blue-400 hover:text-blue-300"
            onClick={handleBackToEvents}
          >
            ← Back to event details
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold mb-4">COMPETITORS</h2>
          <div className="p-4 border border-gray-700 rounded-lg">
            {Object.keys(bracketGroups).map((bracketNum) => (
              <div key={bracketNum} className="mb-8">
                <div className="flex justify-center mb-6">
                  <div className="bg-gray-800 border border-gray-700 rounded px-6 py-2 text-center">
                    <div className="text-sm">Bracket</div>
                    <div className="text-xl font-bold">{bracketNum}</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-4 flex justify-center relative h-8">
                    <div className="absolute top-0 left-1/4 w-1/2 h-4 border-t-2 border-gray-600"></div>
                    <div className="absolute top-0 left-1/4 h-4 border-l-2 border-gray-600"></div>
                    <div className="absolute top-0 right-1/4 h-4 border-r-2 border-gray-600"></div>
                    <div className="absolute top-0 left-1/8 w-1/4 h-4 border-t-2 border-gray-600"></div>
                    <div className="absolute top-0 right-1/8 w-1/4 h-4 border-t-2 border-gray-600"></div>
                    <div className="absolute top-0 left-1/8 h-4 border-l-2 border-gray-600"></div>
                    <div className="absolute top-0 left-3/8 h-4 border-r-2 border-gray-600"></div>
                    <div className="absolute top-0 right-3/8 h-4 border-l-2 border-gray-600"></div>
                    <div className="absolute top-0 right-1/8 h-4 border-r-2 border-gray-600"></div>
                  </div>
                  {bracketGroups[bracketNum].map((competitor) => (
                    <div
                      key={competitor.id}
                      className="flex flex-col items-center"
                    >
                      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden w-full max-w-xs">
                        <div className="w-full h-32 bg-gray-700 overflow-hidden">
                          <img
                            src={competitor.image}
                            alt={competitor.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-center p-2 text-sm">
                          {competitor.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  const renderContent = () => {
    switch (currentView) {
      case "eventDetails":
        return (
          <div>
            <div className="grid grid-cols-12 gap-4 mb-2">
              <div className="col-span-8 font-bold uppercase text-sm">
                Event Name
              </div>
              <div className="col-span-2 font-bold uppercase text-sm text-center">
                Days
              </div>
              <div className="col-span-2 font-bold uppercase text-sm text-center">
                Brackets
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center mb-4">
              <div className="col-span-8">
                <button className="bg-[#AEBFFF33] text-white text-left px-4 py-2 rounded w-full">
                  {selectedEvent.name}
                </button>
              </div>
              <div className="col-span-2">
                <div className="flex justify-center">
                  <div className="border border-gray-700 text-white px-4 py-1 rounded w-16 text-center relative">
                    {selectedEvent.days}
                    <span className="absolute inset-y-0 right-2 flex items-center">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-center gap-2">
                <div className="border border-gray-700 text-white px-4 py-1 rounded w-16 text-center relative">
                  {selectedEvent.brackets}
                  <span className="absolute inset-y-0 right-2 flex items-center">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </span>
                </div>
                <button
                  className="bg-pink-600 hover:bg-pink-700 text-white text-xs px-3 py-1 rounded"
                  onClick={handleLoadData}
                >
                  Load Data
                </button>
              </div>
            </div>
            <button
              className="text-blue-400 hover:text-blue-300 mt-4"
              onClick={handleBackToEvents}
            >
              ← Back to events list
            </button>
          </div>
        );

      case "bracketView":
        return <TournamentBracket eventId={selectedEventId} />;

      default:
        return (
          <div className="flex flex-col gap-2">
            {filteredEvents.map((event) => (
              <button
                key={event.id}
                className="bg-[#AEBFFF33] text-white text-left px-4 py-2 rounded w-full"
                onClick={() => handleEventSelect(event.id)}
              >
                {event.name}
              </button>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="bg-[#0B1739] text-white min-h-screen p-10 m-8 rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Events</h1>
      {currentView === "eventsList" && (
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            className="block w-full p-2 pl-10 text-sm text-gray-300 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search for..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}
      {renderContent()}
    </div>
  );
}
