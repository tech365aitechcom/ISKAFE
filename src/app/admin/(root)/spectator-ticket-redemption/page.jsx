"use client";
import React, { useState } from "react";
import { Search, Camera, X, Download, User, Ticket, Clock, Check, AlertCircle } from "lucide-react";

export default function SpectatorTicketRedemption() {
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [redeemCode, setRedeemCode] = useState("");
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState("redeem");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock data - replace with API calls
  const events = [
    { id: 1, name: "IKF Point Muay Thai - Mexico (03/22/2025)", date: "2025-03-22", location: "Mexico City" },
    { id: 2, name: "ISCF MMA Technical Bouts (03/29/2025)", date: "2025-03-29", location: "Las Vegas" },
    // More events...
  ];

  const mockTickets = [
    {
      id: "8231",
      code: "AWVGJ",
      name: "David Smith",
      type: "General Admission",
      price: 35,
      redeemedAt: "2025-05-10T10:02:00",
      redeemedBy: "Amanda (Staff-02)",
      status: "checked-in",
      entryMode: "qr-scan"
    },
    // More tickets...
  ];

  // Filter tickets based on status
  const filteredTickets = filterStatus === "all" 
    ? tickets 
    : tickets.filter(ticket => ticket.status === filterStatus);

  // Handle QR code scan
  const handleScan = () => {
    // In a real app, this would open device camera
    alert("QR scanner would open here");
  };

  // Redeem ticket
  const handleRedeem = () => {
    if (!redeemCode) return;
    
    // In a real app, this would call an API
    const newTicket = {
      id: Date.now().toString(),
      code: redeemCode,
      name: "New Spectator",
      type: "General Admission",
      price: 35,
      redeemedAt: new Date().toISOString(),
      redeemedBy: "Current User",
      status: "checked-in",
      entryMode: "manual"
    };
    
    setTickets([...tickets, newTicket]);
    setRedeemCode("");
  };

  // Export data
  const handleExport = (format) => {
    alert(`Would export ${format} file`);
  };

  return (
    <div className="bg-[#0B1739] text-white min-h-screen p-6 md:p-10 rounded-lg">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Spectator Ticket Redemption</h1>
            <p className="text-gray-300 mt-2">
              Verify or redeem spectator tickets via QR scan or manual entry
            </p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button 
              className="text-sm bg-[#0A1330] hover:bg-[#0A1330]/80 text-white px-4 py-2 rounded flex items-center"
              onClick={() => handleExport("pdf")}
            >
              <Download size={16} className="mr-2" />
              Export PDF
            </button>
            <button 
              className="text-sm bg-[#0A1330] hover:bg-[#0A1330]/80 text-white px-4 py-2 rounded flex items-center"
              onClick={() => handleExport("csv")}
            >
              <Download size={16} className="mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-transparent border border-gray-700 rounded-lg p-6 mb-6">
          {/* Tabs */}
          <div className="flex border-b border-gray-700 mb-6">
            <button
              className={`pb-2 px-4 ${activeTab === "redeem" ? "text-purple-400 border-b-2 border-purple-400" : "text-gray-400"}`}
              onClick={() => setActiveTab("redeem")}
            >
              Ticket Redemption
            </button>
            <button
              className={`pb-2 px-4 ${activeTab === "list" ? "text-purple-400 border-b-2 border-purple-400" : "text-gray-400"}`}
              onClick={() => setActiveTab("list")}
            >
              Redemption List
            </button>
          </div>

          {activeTab === "redeem" ? (
            <>
              {/* QR Scan Section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-3">Scan QR Code</h2>
                <p className="text-gray-300 mb-4">
                  Use your device camera to scan the spectator's ticket QR code
                </p>
                <button
                  style={{
                    background: "linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)",
                  }}
                  className="text-white py-2 px-4 rounded flex items-center hover:opacity-90"
                  onClick={handleScan}
                >
                  <Camera size={18} className="mr-2" />
                  Scan with Device Camera
                </button>
              </div>

              <div className="border-t border-gray-700 my-6"></div>

              {/* Manual Entry Section */}
              <h2 className="text-lg font-medium mb-6">Manual Ticket Entry</h2>

              {!selectedEvent ? (
                <>
                  <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="bg-transparent border border-gray-700 text-white rounded-md pl-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {events.map((event) => (
                      <button
                        key={event.id}
                        className="bg-[#AEBFFF33] hover:bg-gray-600 text-white text-left px-4 py-3 rounded-md truncate"
                        onClick={() => setSelectedEvent(event)}
                      >
                        {event.name} - {event.location}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between bg-[#AEBFFF33] p-3 rounded-md mb-6">
                    <div>
                      <h3 className="font-medium">{selectedEvent.name}</h3>
                      <p className="text-sm text-gray-300">
                        {selectedEvent.date} • {selectedEvent.location}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="mb-8">
                    <div className="bg-[#00000061] p-4 rounded-lg mb-4">
                      <label className="block text-sm text-gray-400 mb-2">Ticket Code:</label>
                      <div className="flex items-center">
                        <input
                          type="text"
                          className="bg-transparent text-white text-lg font-medium focus:outline-none w-full"
                          placeholder="Enter 4-6 digit code"
                          value={redeemCode}
                          onChange={(e) => setRedeemCode(e.target.value)}
                          maxLength={6}
                        />
                        {redeemCode && (
                          <button 
                            onClick={() => setRedeemCode("")}
                            className="text-gray-400 hover:text-white ml-2"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      style={{
                        background: "linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)",
                      }}
                      className="text-white py-2 px-4 rounded w-full md:w-auto"
                      onClick={handleRedeem}
                      disabled={!redeemCode}
                    >
                      Redeem Ticket
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            /* Tickets List View */
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h2 className="text-lg font-medium mb-4 md:mb-0">
                  Ticket Redemptions ({tickets.length})
                </h2>
                <div className="flex space-x-2">
                  <select
                    className="bg-[#0A1330] border border-gray-700 text-white rounded px-3 py-1"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="checked-in">Checked In</option>
                    <option value="not-checked-in">Not Checked In</option>
                  </select>
                  <input
                    type="text"
                    className="bg-[#0A1330] border border-gray-700 text-white rounded px-3 py-1"
                    placeholder="Search tickets..."
                  />
                </div>
              </div>

              {tickets.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-800 text-left">
                        <th className="p-3 border-b border-gray-700">Ticket Code</th>
                        <th className="p-3 border-b border-gray-700">Spectator</th>
                        <th className="p-3 border-b border-gray-700">Type</th>
                        <th className="p-3 border-b border-gray-700 text-right">Price</th>
                        <th className="p-3 border-b border-gray-700">Redeemed At</th>
                        <th className="p-3 border-b border-gray-700">Redeemed By</th>
                        <th className="p-3 border-b border-gray-700">Status</th>
                        <th className="p-3 border-b border-gray-700">Entry Mode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets.map((ticket) => (
                        <tr key={ticket.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                          <td className="p-3 font-mono">{ticket.code}</td>
                          <td className="p-3 flex items-center">
                            <User size={16} className="mr-2 text-gray-400" />
                            {ticket.name}
                          </td>
                          <td className="p-3">
                            <span className="flex items-center">
                              <Ticket size={16} className="mr-2 text-gray-400" />
                              {ticket.type}
                            </span>
                          </td>
                          <td className="p-3 text-right">${ticket.price}</td>
                          <td className="p-3">
                            {ticket.redeemedAt ? (
                              <span className="flex items-center">
                                <Clock size={16} className="mr-2 text-gray-400" />
                                {new Date(ticket.redeemedAt).toLocaleString()}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="p-3">{ticket.redeemedBy || '-'}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              ticket.status === 'checked-in' 
                                ? 'bg-green-900 text-green-300' 
                                : 'bg-gray-700 text-gray-300'
                            }`}>
                              {ticket.status === 'checked-in' ? (
                                <Check size={12} className="mr-1" />
                              ) : (
                                <AlertCircle size={12} className="mr-1" />
                              )}
                              {ticket.status === 'checked-in' ? 'Checked In' : 'Not Checked In'}
                            </span>
                          </td>
                          <td className="p-3 capitalize">{ticket.entryMode.replace('-', ' ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p>No ticket redemptions yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}