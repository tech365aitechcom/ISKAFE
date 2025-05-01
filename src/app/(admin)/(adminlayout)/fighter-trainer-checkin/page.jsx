"use client";
import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  Upload,
  Calendar,
} from "lucide-react";
import FighterDetails from "./_components/FighterDetails";
import { UserTable } from "./_components/UserTable";

// Main Component
export default function FighterTrainerCheckin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedFighter, setSelectedFighter] = useState(null);

  const events = [
    "IKF Point Muay Thai and PBSC Point Boxing Sparring Seminar by Anthony Bui- Mexico (03/22/2025)",
    "ISCF Semi-Contact MMA Technical Bouts (03/29/2025)",
    "PBSC Point Boxing Sparring Circuit - Bishop, CA (03/29/2025)",
    "PBSC Point Boxing Sparring Circuit - Newport Beach 2025 (04/05/2025)",
    "Orlando IKF ALL DIVISIONS PKB/PMT (03/30/2025)",
    "IKF PKB and PBSC Point Boxing Sparring-Charlotte, NC (03/29/2025)",
    "PBSC Point Boxing Sparring Circuit - EVO Sport Expo 2025 (04/12/2025)",
    "PBSC Point Boxing Sparring Circuit - EVO Sport Expo 2025 (04/12/2025)",
    "PBSC Point Boxing Sparring Circuit - EVO Sport Expo 2025 (04/12/2025)",
    "IKF Semi-Contact Kickboxing & Muay Thai (04/13/2025)",
    "Fusion IKF Point Sparring Tournament (04/26/2025)",
    "IKF Point Muay Thai / Kickboxing And PBSC Point Boxing Sparring -Moncks Corner- Sunday! (04/13/2025)",
    "IKF PKB and PBSC Point Boxing Sparring-Charlotte, NC (03/29/2025)",
    "PBSC Point Boxing Sparring Circuit - EVO Sport Expo 2025 (04/12/2025)",
  ];

  const participants = [
    {
      id: 1,
      name: "Eric Franks",
      firstName: "Eric",
      lastName: "Franks",
      regNumber: "(KF) 937 - 1274",
      type: "Competitor",
      age: "36",
      weight: "90",
      height: "5'4\"",
      experience: "24 Months",
      training: "40 Months",
      gym: "8 Star, MMA",
      gender: "Male",
      hotelConfirmation: "--",
      suspended: "No",
      paymentsCompleted: true,
      examDone: true,
      comments: "Message",
      avatar: "EF",
    },
    {
      id: 2,
      name: "Sophie Moore",
      regNumber: "(ATR) 480 - 4277",
      type: "Competitor",
      age: 32,
      weight: 120,
      height: 190,
      avatar: "SM",
    },
    {
      id: 3,
      name: "Matt Cannon",
      regNumber: "(318) 698 - 9689",
      type: "Trainer",
      age: 34,
      weight: 150,
      height: 180,
      avatar: "MC",
    },
    {
      id: 4,
      name: "Graham Hills",
      regNumber: "(465) 627 - 3890",
      type: "Competitor",
      age: 14,
      weight: 130,
      height: 150,
      avatar: "GH",
    },
    {
      id: 5,
      name: "Sandy Houston",
      regNumber: "(440) 410 - 3848",
      type: "Competitor",
      age: 18,
      weight: 140,
      height: 170,
      avatar: "SH",
    },
    {
      id: 6,
      name: "Andy Smith",
      regNumber: "(908) 458 - 3268",
      type: "Competitor",
      age: 12,
      weight: 130,
      height: 154,
      avatar: "AS",
    },
    {
      id: 7,
      name: "Lily Woods",
      regNumber: "(561) 892 - 1819",
      type: "Competitor",
      age: 40,
      weight: 130,
      height: 180,
      avatar: "LW",
    },
    {
      id: 8,
      name: "Patrick Meyer",
      regNumber: "(708) 582 - 5670",
      type: "Trainer",
      age: 22,
      weight: 150,
      height: 176,
      avatar: "PM",
    },
    {
      id: 9,
      name: "Francis Wilton",
      regNumber: "(216) 494 - 5864",
      type: "Competitor",
      age: 20,
      weight: 130,
      height: 166,
      avatar: "FW",
    },
    {
      id: 10,
      name: "Ernest Houston",
      regNumber: "(709) 197 - 6813",
      type: "Competitor",
      age: 24,
      weight: 130,
      height: 168,
      avatar: "EH",
    },
  ];

  const filteredEvents =
    searchQuery && !selectedEvent
      ? events.filter((event) =>
          event.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : events;

  const filteredParticipants = selectedEvent
    ? participants.filter((participant) => {
        if (activeTab === "All") return true;
        if (activeTab === "Trainers") return participant.type === "Trainer";
        if (activeTab === "Fighters") return participant.type === "Competitor";
        return true;
      })
    : [];

  const getAvatarColor = (name) => {
    const colors = [
      "bg-purple-500",
      "bg-pink-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleFighterClick = (fighter) => {
    setSelectedFighter(fighter);
  };

  const handleBackFromDetails = () => {
    setSelectedFighter(null);
  };

  const handleUpdateFighter = (updatedFighter) => {
    console.log("Updated fighter:", updatedFighter);
    setSelectedFighter(null);
  };

  const handleRestoreFighter = (fighter) => {
    console.log("Restore fighter:", fighter);
  };

  if (selectedFighter) {
    return (
      <FighterDetails
        fighter={selectedFighter}
        onBack={handleBackFromDetails}
        onUpdate={handleUpdateFighter}
        onRestore={handleRestoreFighter}
      />
    );
  }

  return (
    <div className="bg-[#0B1739] text-white min-h-screen p-10 m-8 rounded-lg">
      <div className="w-full mx-auto p-4">
        <h1 className="text-xl font-medium mb-4">Fighter & Trainer Checkin</h1>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-transparent border border-gray-700 text-white rounded-md pl-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Search for..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {!selectedEvent ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredEvents.map((event, index) => (
              <button
                key={index}
                className="bg-[#AEBFFF33] text-white text-left px-4 py-3 rounded-md truncate"
                onClick={() => setSelectedEvent(event)}
              >
                {event}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-xs font-medium text-gray-400 mb-2">
                EVENT NAME
              </h2>
              <div className="bg-[#AEBFFF33] text-white px-4 py-3 rounded-md">
                {selectedEvent}
              </div>
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-medium text-gray-100">
                  PARTICIPANTS
                </h2>
                <button
                  style={{
                    background:
                      "linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)",
                  }}
                  className="text-white py-1 px-3 rounded flex items-center hover:opacity-90"
                >
                  Add New
                </button>
              </div>
              <div className="flex mb-6 border border-gray-700 rounded-md p-1 w-fit">
                <button
                  className={`px-4 py-1 rounded-md text-sm ${
                    activeTab === "All"
                      ? "bg-indigo-700 text-white"
                      : "text-gray-300"
                  }`}
                  onClick={() => setActiveTab("All")}
                >
                  All
                </button>
                <button
                  className={`px-4 py-1 rounded-md text-sm ${
                    activeTab === "Trainers"
                      ? "bg-indigo-700 text-white"
                      : "text-gray-300"
                  }`}
                  onClick={() => setActiveTab("Trainers")}
                >
                  Trainers
                </button>
                <button
                  className={`px-4 py-1 rounded-md text-sm ${
                    activeTab === "Fighters"
                      ? "bg-indigo-700 text-white"
                      : "text-gray-300"
                  }`}
                  onClick={() => setActiveTab("Fighters")}
                >
                  Fighters
                </button>
              </div>
              <UserTable
                users={filteredParticipants}
                handleFighterClick={handleFighterClick}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
