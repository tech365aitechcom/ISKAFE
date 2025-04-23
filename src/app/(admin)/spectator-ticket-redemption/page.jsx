"use client";
import React, { useState } from "react";
import { Search, Camera, X } from "lucide-react";

export default function SpectatorTicketRedemption() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [redeemCode, setRedeemCode] = useState("AWVGJ");

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

  const clearSelection = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="bg-[#0B1739] text-white min-h-screen p-10 m-8 rounded-lg">
      <div className="w-full mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold mb-2">
            Spectator Ticket Redemption
          </h1>
          <span className="text-sm text-gray-100 bg-[#0A1330] rounded p-[8px]">
            Instructions PDF
          </span>
        </div>
        <p className="text-gray-300 mb-8">
          You can (a) scan the customer's QR code or (b) select the event to
          manually enter the 4-digit code or search for the customer's ticket.
        </p>

        <div className="bg-transparent border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium mb-2">Scan QR Code</h2>
          <p className="text-gray-300 mb-4">
            You can (a) scan the customer's QR code or (b) select the event to
            manually enter the 4-digit code or search for the customer's ticket.
          </p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded flex items-center">
            <Camera size={18} className="mr-2" />
            Scan with Device Camera
          </button>
          <div className="border-t border-gray-700 my-6"></div>

          <h2 className="text-lg font-medium mb-6">
            Manually Access Event Tickets
          </h2>

          {!selectedEvent ? (
            <>
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-transparent border border-gray-700 text-white rounded-md pl-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Search for..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {events.map((event, index) => (
                  <button
                    key={index}
                    className="bg-[#AEBFFF33] hover:bg-gray-600 text-white text-left px-4 py-3 rounded-md truncate"
                    onClick={() => setSelectedEvent(event)}
                  >
                    {event}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center bg-[#AEBFFF33] p-3 rounded-md mb-4">
                <span className="flex-grow">{selectedEvent}</span>
                <button
                  onClick={clearSelection}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex space-x-2 w-fit p-[4px] rounded-lg mb-6 border border-[#797979]">
                <button className="bg-indigo-700 hover:bg-indigo-600 text-white py-2 px-5 rounded-lg">
                  Redeem
                </button>
                <button className="bg-transparent hover:bg-gray-600 text-white py-2 px-5 rounded-lg">
                  Search
                </button>
              </div>

              <div>
                <div className="bg-[#00000061] w-fit p-[8px] rounded-lg mb-6">
                  <label className="block text-sm text-gray-400 mb-1">
                    Code:
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      className="bg-transparent text-white text-lg font-medium focus:outline-none"
                      value={redeemCode}
                      onChange={(e) => setRedeemCode(e.target.value)}
                    />
                    <button className="text-gray-400 hover:text-white ml-2">
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded w-full md:w-auto">
                  Redeem Code
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
