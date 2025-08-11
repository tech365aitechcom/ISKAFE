"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Camera,
  X,
  Download,
  User,
  Ticket,
  Clock,
  Check,
  AlertCircle,
  Calendar,
  MapPin,
  Users,
  RefreshCw,
} from "lucide-react";
import { API_BASE_URL } from "../../../../constants";
import useStore from "../../../../stores/useStore";
import axiosInstance from "../../../../shared/axios";
import Loader from "../../../_components/Loader";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function SpectatorTicketRedemption() {
  const user = useStore((state) => state.user);

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [redeemCode, setRedeemCode] = useState("");
  const [quantityToRedeem, setQuantityToRedeem] = useState(1);
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("redeem");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [redemptions, setRedemptions] = useState([]);
  const [error, setError] = useState(null);

  // Load events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Load redemptions when event is selected
  useEffect(() => {
    if (selectedEvent) {
      fetchRedemptions();
    }
  }, [selectedEvent]);

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      const response = await axiosInstance.get("/events");

      if (response.data.success) {
        // Handle both array and object responses
        const eventsArray = Array.isArray(response.data.data)
          ? response.data.data
          : response.data.data.items || response.data.data.events || [];

        const eventsData = eventsArray.map((event) => ({
          id: event._id,
          name: event.name,
          date: event.startDate,
          location: event.venue?.name || "Location not set",
          registeredParticipants: event.registeredParticipants || 0,
          format: event.format,
          sportType: event.sportType,
        }));
        setEvents(eventsData);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events");
    } finally {
      setEventsLoading(false);
    }
  };

  // Fetch redemptions for selected event
  const fetchRedemptions = async () => {
    if (!selectedEvent) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/spectator-ticket/purchase/event/${selectedEvent.id}/redemption-logs`
      );

      if (response.data.success) {
        const redemptionsData = response.data.data.items.map((item) => ({
          id: `${item.ticketCode}-${item.redeemedAt}`, // Create unique ID from code and timestamp
          code: item.ticketCode,
          name: item.buyerName,
          type: item.tier,
          price: item.amountPaid / 100, // Convert cents to dollars
          redeemedAt: item.redeemedAt,
          redeemedBy: item.redeemedBy,
          redeemedByEmail: item.redeemedByEmail,
          status: "checked-in",
          entryMode: item.entryMode || "Manual",
          quantity: item.quantity,
          eventName: item.eventName,
          buyerEmail: item.buyerEmail,
        }));

        setRedemptions(redemptionsData);
      }
    } catch (err) {
      console.error("Error fetching redemptions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter events based on search query
  const filteredEvents = events.filter(
    (event) =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter redemptions based on status
  const filteredRedemptions =
    filterStatus === "all"
      ? redemptions
      : redemptions.filter((redemption) => redemption.status === filterStatus);

  // Handle QR code scan (using the same implementation as in event view)
  const handleScan = () => {
    // Create modal container
    const modal = document.createElement("div");
    modal.id = "qr-scanner-modal";
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.9); z-index: 9999; 
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 20px;
    `;

    // Create scanner container
    const scannerContainer = document.createElement("div");
    scannerContainer.id = "qr-reader";
    scannerContainer.style.cssText = `
      width: 100%; max-width: 500px; height: 400px;
      border: 3px solid #CB3CFF; border-radius: 10px; 
      background: #000; position: relative;
    `;

    // Create instructions
    const instructions = document.createElement("div");
    instructions.style.cssText =
      "color: white; text-align: center; margin: 20px 0; font-size: 16px;";
    instructions.innerHTML = "<p>Position QR code within the camera view</p>";

    // Create buttons
    const buttons = document.createElement("div");
    buttons.style.cssText = "display: flex; gap: 15px; margin-top: 20px;";

    const manualButton = document.createElement("button");
    manualButton.textContent = "Manual Entry";
    manualButton.style.cssText = `
      background: linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%);
      color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;
    `;

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.cssText = `
      background: #666; color: white; padding: 10px 20px; 
      border: none; border-radius: 5px; cursor: pointer;
    `;

    let html5QrcodeScanner = null;

    // Handle successful scan
    const onScanSuccess = (decodedText, decodedResult) => {
      console.log(`QR Code scanned: ${decodedText}`);

      // Try to extract ticket code from QR data
      let ticketCode = decodedText;

      // If QR contains JSON, try to parse it
      try {
        const qrData = JSON.parse(decodedText);
        if (qrData.ticketCode) {
          ticketCode = qrData.ticketCode;
        }
      } catch (e) {
        // If not JSON, use the raw text as ticket code
      }

      // Set the ticket code and clean up
      setRedeemCode(ticketCode);
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(console.error);
      }
      document.body.removeChild(modal);

      // Show success message
      alert(`QR code scanned successfully! Ticket code: ${ticketCode}`);
    };

    // Handle scan error
    const onScanError = (errorMessage) => {
      // Ignore frequent scan errors, they're normal when no QR code is visible
    };

    // Button event handlers
    const cleanup = () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(console.error);
      }
      if (modal.styleElement) {
        document.head.removeChild(modal.styleElement);
      }
      document.body.removeChild(modal);
    };

    manualButton.onclick = cleanup;
    cancelButton.onclick = cleanup;

    // Assemble modal
    buttons.appendChild(manualButton);
    buttons.appendChild(cancelButton);
    modal.appendChild(instructions);
    modal.appendChild(scannerContainer);
    modal.appendChild(buttons);
    document.body.appendChild(modal);

    // Start scanning after DOM is updated
    setTimeout(() => {
      // Add custom styles for the scanner
      const style = document.createElement("style");
      style.textContent = `
        #qr-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
        }
        #qr-reader__dashboard_section_csr {
          background: rgba(0,0,0,0.8) !important;
          color: white !important;
          border-radius: 0 0 10px 10px !important;
        }
        #qr-reader__dashboard_section_csr > div {
          color: white !important;
        }
      `;
      document.head.appendChild(style);

      html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          rememberLastUsedCamera: true,
          supportedScanTypes: [0], // Only QR codes
        },
        false
      );
      html5QrcodeScanner.render(onScanSuccess, onScanError);

      // Store style element for cleanup
      modal.styleElement = style;
    }, 200);
  };

  // Redeem ticket via API
  const handleRedeem = async () => {
    if (!redeemCode || !selectedEvent) return;

    if (quantityToRedeem <= 0) {
      alert("Invalid quantity. Please enter a value greater than 0.");
      return;
    }

    const confirmMessage = `Redeem ${quantityToRedeem} ticket(s) for code ${redeemCode.trim()}?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post("/spectator-ticket/redeem", {
        ticketCode: redeemCode.trim(),
        quantityToRedeem: quantityToRedeem,
        entryMode: "Manual",
        eventId: selectedEvent.id,
      });

      if (response.data.success) {
        const newRedemption = {
          id: Date.now().toString(),
          code: redeemCode,
          name: response.data.data?.spectatorName || "Spectator",
          type: response.data.data?.tierName || "General",
          price: response.data.data?.price || 0,
          redeemedAt: new Date().toISOString(),
          redeemedBy: user.firstName
            ? `${user.firstName} ${user.lastName}`
            : "Current Staff",
          status: "checked-in",
          entryMode: "manual",
          quantity: quantityToRedeem,
          remainingQuantity: response.data.data?.remainingQuantity || 0,
        };

        setRedemptions([...redemptions, newRedemption]);
        setRedeemCode("");
        setQuantityToRedeem(1);

        const successMessage = `✓ Successfully redeemed ${quantityToRedeem} ticket(s) for code ${redeemCode.trim()}!`;
        alert(successMessage);

        // Switch to redemption list tab to show the new entry
        setActiveTab("list");
      } else {
        alert(response.data.message || "Failed to redeem ticket");
      }
    } catch (error) {
      console.error("Error redeeming ticket:", error);
      alert(
        error.response?.data?.message ||
          "Error redeeming ticket. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Export data
  const handleExport = (format) => {
    if (filteredRedemptions.length === 0) {
      alert("No redemptions to export");
      return;
    }

    if (format === "csv") {
      const headers =
        "Ticket Code,Buyer Name,Buyer Email,Ticket Type,Price,Quantity,Redeemed At,Redeemed By,Redeemed By Email,Entry Mode,Event Name\n";
      const csvData = filteredRedemptions
        .map(
          (redemption) =>
            `${redemption.code},"${redemption.name}","${
              redemption.buyerEmail || ""
            }",${redemption.type},$${redemption.price?.toFixed(2) || "0.00"},${
              redemption.quantity
            },"${
              redemption.redeemedAt
                ? new Date(redemption.redeemedAt).toLocaleString()
                : "-"
            }","${redemption.redeemedBy || "-"}","${
              redemption.redeemedByEmail || ""
            }","${redemption.entryMode || "Manual"}","${
              redemption.eventName || selectedEvent?.name || ""
            }"`
        )
        .join("\n");

      const blob = new Blob([headers + csvData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `spectator-redemptions-${
        selectedEvent?.name || "all-events"
      }-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      alert(`PDF export functionality will be implemented soon`);
    }
  };

  return (
    <div className="bg-[#0B1739] text-white min-h-screen p-6 md:p-10 rounded-lg">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">
              Spectator Ticket Redemption
            </h1>
            <p className="text-gray-300 mt-4">
              Verify or redeem spectator tickets via QR scan or manual entry
            </p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              className="text-sm bg-[#0A1330] hover:bg-[#0A1330]/80 text-white px-4 py-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleExport("pdf")}
              disabled={filteredRedemptions.length === 0}
            >
              <Download size={16} className="mr-2" />
              Export PDF
            </button>
            <button
              className="text-sm bg-[#0A1330] hover:bg-[#0A1330]/80 text-white px-4 py-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleExport("csv")}
              disabled={filteredRedemptions.length === 0}
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
              className={`pb-2 px-4 ${
                activeTab === "redeem"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-gray-400"
              }`}
              onClick={() => setActiveTab("redeem")}
            >
              Ticket Redemption
            </button>
            <button
              className={`pb-2 px-4 ${
                activeTab === "list"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-gray-400"
              }`}
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
                    background:
                      "linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)",
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

                  {eventsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw
                        size={24}
                        className="animate-spin text-purple-400 mr-2"
                      />
                      <span className="text-gray-300">Loading events...</span>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <AlertCircle
                        size={32}
                        className="text-red-400 mx-auto mb-2"
                      />
                      <p className="text-red-400 mb-4">{error}</p>
                      <button
                        onClick={fetchEvents}
                        className="text-purple-400 hover:text-white transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar
                        size={32}
                        className="text-gray-400 mx-auto mb-2"
                      />
                      <p className="text-gray-400">
                        No events found matching your search
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {filteredEvents.map((event) => (
                        <button
                          key={event.id}
                          className="bg-[#AEBFFF33] hover:bg-gray-600 text-white text-left px-4 py-3 rounded-md transition-colors group"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium group-hover:text-purple-300 transition-colors">
                                {event.name}
                              </h3>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                  <MapPin size={14} />
                                  {event.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  {new Date(event.date).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users size={14} />
                                  {event.registeredParticipants}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-[#00000061] p-4 rounded-lg">
                        <label className="block text-sm text-gray-400 mb-2">
                          Ticket Code:
                        </label>
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

                      <div className="bg-[#00000061] p-4 rounded-lg">
                        <label className="block text-sm text-gray-400 mb-2">
                          Quantity to Redeem:
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="bg-transparent text-white text-lg font-medium focus:outline-none w-full"
                          placeholder="1"
                          value={quantityToRedeem}
                          onChange={(e) =>
                            setQuantityToRedeem(
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                        />
                      </div>
                    </div>

                    <button
                      style={{
                        background:
                          "linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)",
                      }}
                      className="text-white py-2 px-4 rounded w-full md:w-auto flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleRedeem}
                      disabled={!redeemCode || loading}
                    >
                      {loading ? (
                        <>
                          <RefreshCw size={16} className="animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Ticket size={16} className="mr-2" />
                          Redeem {quantityToRedeem} Ticket
                          {quantityToRedeem > 1 ? "s" : ""}
                        </>
                      )}
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
                  Ticket Redemptions ({filteredRedemptions.length})
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

              {filteredRedemptions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-800 text-left">
                        <th className="p-3 border-b border-gray-700">
                          Ticket Code
                        </th>
                        <th className="p-3 border-b border-gray-700">
                          Buyer Name
                        </th>
                        <th className="p-3 border-b border-gray-700">
                          Buyer Email
                        </th>
                        <th className="p-3 border-b border-gray-700">Type</th>
                        <th className="p-3 border-b border-gray-700 text-right">
                          Price
                        </th>
                        <th className="p-3 border-b border-gray-700">
                          Quantity
                        </th>
                        <th className="p-3 border-b border-gray-700">
                          Redeemed At
                        </th>
                        <th className="p-3 border-b border-gray-700">
                          Redeemed By
                        </th>
                        <th className="p-3 border-b border-gray-700">
                          Entry Mode
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRedemptions.map((redemption) => (
                        <tr
                          key={redemption.id}
                          className="border-b border-gray-700 hover:bg-gray-800/50"
                        >
                          <td className="p-3 font-mono">{redemption.code}</td>
                          <td className="p-3 flex items-center">
                            <User size={16} className="mr-2 text-gray-400" />
                            {redemption.name}
                          </td>
                          <td className="p-3 text-sm text-gray-300">
                            {redemption.buyerEmail || "-"}
                          </td>
                          <td className="p-3">
                            <span className="flex items-center">
                              <Ticket
                                size={16}
                                className="mr-2 text-gray-400"
                              />
                              {redemption.type}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            ${redemption.price?.toFixed(2) || "0.00"}
                          </td>
                          <td className="p-3 text-center">
                            {redemption.quantity}
                          </td>
                          <td className="p-3">
                            {redemption.redeemedAt ? (
                              <span className="flex items-center">
                                <Clock
                                  size={16}
                                  className="mr-2 text-gray-400"
                                />
                                {new Date(
                                  redemption.redeemedAt
                                ).toLocaleString()}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="p-3">
                            {redemption.redeemedBy || "-"}
                          </td>
                          <td className="p-3 capitalize">
                            {redemption.entryMode || "Manual"}
                          </td>
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
