"use client";
import { useState } from "react";

export default function TournamentSystem() {
  // Event data
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

  // Participants data with all required fields
  const participantsData = {
    1: [
      {
        id: 1,
        firstName: "Eric",
        lastName: "Franks",
        age: 28,
        phone: "555-123-4567",
        email: "eric.franks@example.com",
        type: "Fighter",
        hasParticipated: true,
        regLink: "#",
        image: "/api/placeholder/100/120",
        bracket: 1,
        position: 1,
      },
      {
        id: 2,
        firstName: "Anthony",
        lastName: "Bui",
        age: 32,
        phone: "555-234-5678",
        email: "anthony.bui@example.com",
        type: "Trainer",
        hasParticipated: false,
        regLink: "#",
        image: "/api/placeholder/100/120",
        bracket: 1,
        position: 2,
      },
      // More participants...
    ],
    2: [
      // Participants for event 2...
    ],
    3: [
      // Participants for event 3...
    ],
  };

  // State management
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState("eventsList");
  const [activeTab, setActiveTab] = useState("competitorList");
  const [participantSearch, setParticipantSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [ageRange, setAgeRange] = useState({ min: 0, max: 100 });
  const [hasParticipated, setHasParticipated] = useState(false);

  // Filter events based on search
  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter participants based on all criteria
  const filteredParticipants = selectedEventId
    ? (participantsData[selectedEventId] || []).filter((participant) => {
        const nameMatch = `${participant.firstName} ${participant.lastName}`
          .toLowerCase()
          .includes(participantSearch.toLowerCase());
        const emailMatch = participant.email
          .toLowerCase()
          .includes(participantSearch.toLowerCase());
        const phoneMatch = participant.phone.includes(participantSearch);
        const typeMatch = typeFilter === "all" || participant.type === typeFilter;
        const ageMatch =
          participant.age >= ageRange.min && participant.age <= ageRange.max;
        const participationMatch = !hasParticipated || participant.hasParticipated;

        return (
          (nameMatch || emailMatch || phoneMatch) &&
          typeMatch &&
          ageMatch &&
          participationMatch
        );
      })
    : [];

  // Event handlers
  const handleEventSelect = (eventId) => {
    setSelectedEventId(eventId);
    setCurrentView("eventDetails");
    setActiveTab("competitorList");
  };

  const handleBackToEvents = () => {
    if (currentView === "participantList" || currentView === "bracketView") {
      setCurrentView("eventDetails");
    } else {
      setSelectedEventId(null);
      setCurrentView("eventsList");
    }
  };

  const handleLoadData = () => {
    setCurrentView("participantList");
  };

  const handleViewBrackets = () => {
    setCurrentView("bracketView");
  };

  // Component for the participant list view
  const ParticipantListView = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {events.find((e) => e.id === selectedEventId)?.name}
          </h2>
          <button
            className="text-blue-400 hover:text-blue-300"
            onClick={handleBackToEvents}
          >
            ← Back to event details
          </button>
        </div>

        <div className="mb-6">
          <div className="flex space-x-4 mb-4">
            <div className="relative flex-1">
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
                placeholder="Search by name, email, or phone"
                value={participantSearch}
                onChange={(e) => setParticipantSearch(e.target.value)}
              />
            </div>

            <select
              className="bg-gray-800 border border-gray-700 text-white rounded px-3 py-1"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Fighter">Fighter</option>
              <option value="Trainer">Trainer</option>
              <option value="Coach">Coach</option>
              <option value="Official">Official</option>
            </select>

            <div className="flex items-center space-x-2">
              <label className="text-sm">Age:</label>
              <input
                type="number"
                className="w-16 bg-gray-800 border border-gray-700 text-white rounded px-2 py-1"
                placeholder="Min"
                value={ageRange.min}
                onChange={(e) =>
                  setAgeRange({ ...ageRange, min: parseInt(e.target.value) || 0 })
                }
              />
              <span>-</span>
              <input
                type="number"
                className="w-16 bg-gray-800 border border-gray-700 text-white rounded px-2 py-1"
                placeholder="Max"
                value={ageRange.max}
                onChange={(e) =>
                  setAgeRange({ ...ageRange, max: parseInt(e.target.value) || 100 })
                }
              />
            </div>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={hasParticipated}
                onChange={(e) => setHasParticipated(e.target.checked)}
                className="rounded border-gray-600 bg-gray-700"
              />
              <span className="text-sm">Only competed</span>
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800 text-left">
                  <th className="p-3 border-b border-gray-700">First Name</th>
                  <th className="p-3 border-b border-gray-700">Last Name</th>
                  <th className="p-3 border-b border-gray-700 text-center">Age</th>
                  <th className="p-3 border-b border-gray-700">Phone</th>
                  <th className="p-3 border-b border-gray-700">Email</th>
                  <th className="p-3 border-b border-gray-700 text-center">Type</th>
                  <th className="p-3 border-b border-gray-700 text-center">
                    Registration
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.length > 0 ? (
                  filteredParticipants.map((participant) => (
                    <tr
                      key={participant.id}
                      className="border-b border-gray-700 hover:bg-gray-800"
                    >
                      <td className="p-3">{participant.firstName}</td>
                      <td className="p-3">{participant.lastName}</td>
                      <td className="p-3 text-center">{participant.age}</td>
                      <td className="p-3">{participant.phone}</td>
                      <td className="p-3">{participant.email}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            participant.type === "Fighter"
                              ? "bg-purple-900 text-purple-300"
                              : participant.type === "Trainer"
                              ? "bg-blue-900 text-blue-300"
                              : participant.type === "Coach"
                              ? "bg-green-900 text-green-300"
                              : "bg-yellow-900 text-yellow-300"
                          }`}
                        >
                          {participant.type}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <a
                          href={participant.regLink}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-4 text-center text-gray-400">
                      No participants found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <button
            className="text-blue-400 hover:text-blue-300"
            onClick={handleBackToEvents}
          >
            ← Back to event details
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={handleViewBrackets}
          >
            View Tournament Brackets
          </button>
        </div>
      </div>
    );
  };

  // Component for the tournament bracket view
  const TournamentBracket = ({ eventId }) => {
    const competitors = participantsData[eventId] || [];
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
            ← Back to participant list
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
                            alt={`${competitor.firstName} ${competitor.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-center p-2 text-sm">
                          {competitor.firstName} {competitor.lastName}
                        </div>
                        <div className="text-center pb-2 text-xs text-gray-400">
                          {competitor.type}
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

  // Event details view
  const EventDetailsView = () => {
    const selectedEvent = events.find((event) => event.id === selectedEventId);

    return (
      <div>
        <div className="grid grid-cols-12 gap-4 mb-2">
          <div className="col-span-6 font-bold uppercase text-sm">
            Event Name
          </div>
          <div className="col-span-2 font-bold uppercase text-sm text-center">
            Days
          </div>
          <div className="col-span-2 font-bold uppercase text-sm text-center">
            Brackets
          </div>
          <div className="col-span-2 font-bold uppercase text-sm text-center"></div>
        </div>

        <div className="grid grid-cols-12 gap-4 items-center mb-4">
          <div className="col-span-6">
            <button className="bg-[#AEBFFF33] text-white text-left px-4 py-2 rounded w-full">
              {selectedEvent.name}
            </button>
          </div>

          <div className="col-span-2 flex justify-center">
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

          <div className="col-span-2 flex justify-center">
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
          </div>

          <div className="col-span-2 flex justify-center">
            <button
              style={{
                background:
                  "linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)",
              }}
              className="text-white py-1 px-3 rounded flex items-center hover:opacity-90"
              onClick={handleLoadData}
            >
              View Participants
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
  };

  // Main render function
  const renderContent = () => {
    switch (currentView) {
      case "eventDetails":
        return <EventDetailsView />;
      case "participantList":
        return <ParticipantListView />;
      case "bracketView":
        return <TournamentBracket eventId={selectedEventId} />;
      default:
        return (
          <div className="flex flex-col gap-2">
            {filteredEvents.map((event) => (
              <button
                key={event.id}
                className="bg-[#AEBFFF33] text-white text-left px-4 py-2 rounded w-full hover:bg-[#AEBFFF66] transition-colors"
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
            placeholder="Search for events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}
      {renderContent()}
    </div>
  );
}