"use client";
import React, { useEffect, useState } from "react";
import { ChevronDown, Edit, Pencil, Plus, Trash2, Save, Ticket, DollarSign, Calendar, Users, Camera, Search, X, Download, User, Clock, Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "../../../../../../constants";
import Loader from "../../../../../_components/Loader";
import Image from "next/image";
import axiosInstance from "../../../../../../shared/axios";
// import { useRouter } from "next/router";
import TournamentSettingsModal from "../../_components/TournamentSettingsModal";

export default function EventDetailsPage() {
  // const router = useRouter();
  const params = useParams();
  const [eventId, setEventId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [tournamentSettings, setTournamentSettings] = useState({
    simpleFees: {
      fighterFee: 0,
      trainerFee: 0,
      currency: "$",
    },
    detailedFees: [],
    bracketSettings: {
      maxFightersPerBracket: 0,
    },
    ruleStyles: {
      semiContact: [],
      fullContact: [],
    },
    numBrackets: 0,
  });
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spectatorTickets, setSpectatorTickets] = useState(null);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [showTierForm, setShowTierForm] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [editingTierIndex, setEditingTierIndex] = useState(null);
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [redemptionCode, setRedemptionCode] = useState("");
  const [redemptions, setRedemptions] = useState([]);
  const [activeRedemptionTab, setActiveRedemptionTab] = useState("redeem");
  const [ticketToRedeem, setTicketToRedeem] = useState(null);
  const [quantityToRedeem, setQuantityToRedeem] = useState(1);
  const [showEmailSearch, setShowEmailSearch] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [emailSearchResults, setEmailSearchResults] = useState([]);
  const [currentTier, setCurrentTier] = useState({
    order: 1,
    name: "",
    price: 0,
    capacity: 0,
    remaining: 0,
    description: "",
    availabilityMode: "Online",
    salesStartDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
    salesEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    limitPerUser: 2,
    refundPolicyNotes: ""
  });

  const initializeTournamentSettings = async (eventId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tournament-setting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: eventId,
          simpleFees: {
            fighterFee: 0,
            trainerFee: 0,
            currency: "$",
          },
          detailedFees: [],
          bracketSettings: {
            maxFightersPerBracket: 0,
          },
          ruleStyles: {
            semiContact: [],
            fullContact: [],
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`API Error ${response.status}:`, errorData);
        throw new Error(`Failed to initialize tournament settings: ${response.status} - ${errorData}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (err) {
      console.error("Error initializing tournament settings:", err);
      throw err;
    }
  };

  const fetchSpectatorTickets = async (id) => {
    try {
      setTicketsLoading(true);
      const response = await axiosInstance.get(`/spectator-ticket/${id}`);
      
      if (response.data.success) {
        setSpectatorTickets(response.data.data);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setSpectatorTickets(null);
      } else {
        console.error("Error fetching spectator tickets:", err);
        setSpectatorTickets(null);
      }
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleAddNewTier = () => {
    const nextOrder = spectatorTickets?.tiers ? spectatorTickets.tiers.length + 1 : 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    const twoWeeksLater = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    setCurrentTier({
      order: nextOrder,
      name: "",
      price: 0,
      capacity: 0,
      remaining: 0,
      description: "",
      availabilityMode: "Online",
      salesStartDate: today.toISOString(),
      salesEndDate: twoWeeksLater.toISOString(),
      limitPerUser: 2,
      refundPolicyNotes: ""
    });
    setEditingTier(null);
    setEditingTierIndex(null);
    setShowTierForm(true);
  };

  const handleEditTier = (tier, index) => {
    setCurrentTier({ ...tier });
    setEditingTier(tier);
    setEditingTierIndex(index);
    setShowTierForm(true);
  };

  const validateTier = () => {
    const errors = [];
    
    if (!currentTier.name.trim()) {
      errors.push("Name is required (max 64 characters)");
    } else if (currentTier.name.length > 64) {
      errors.push("Name must be 64 characters or less");
    }
    
    if (!currentTier.description.trim()) {
      errors.push("Description is required (max 128 characters)");
    } else if (currentTier.description.length > 128) {
      errors.push("Description must be 128 characters or less");
    }
    
    if (currentTier.price < 0) {
      errors.push("Price must be 0 or greater");
    }
    
    if (currentTier.capacity <= 0) {
      errors.push("Capacity must be greater than 0");
    }

    if (currentTier.remaining < 0) {
      errors.push("Remaining cannot be negative");
    }

    if (currentTier.remaining > currentTier.capacity) {
      errors.push("Remaining cannot exceed capacity");
    }

    if (currentTier.limitPerUser <= 0) {
      errors.push("Limit per user must be greater than 0");
    }

    if (!currentTier.salesStartDate) {
      errors.push("Sales start date is required");
    }

    if (!currentTier.salesEndDate) {
      errors.push("Sales end date is required");
    }

    if (currentTier.salesStartDate && currentTier.salesEndDate) {
      const startDate = new Date(currentTier.salesStartDate);
      const endDate = new Date(currentTier.salesEndDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of today for comparison
      
      if (startDate < today) {
        errors.push("Sales start date must be today or later");
      }
      
      if (startDate >= endDate) {
        errors.push("Sales end date must be after sales start date");
      }
    }

    return errors;
  };

  const saveTier = async () => {
    const validationErrors = validateTier();
    if (validationErrors.length > 0) {
      alert("Please fix the following errors:\n\n" + validationErrors.join("\n"));
      return;
    }

    try {
      setTicketsLoading(true);
      
      let updatedTiers = [];
      if (spectatorTickets?.tiers) {
        if (editingTier && editingTierIndex !== null) {
          // Update existing tier
          updatedTiers = spectatorTickets.tiers.map((tier, index) => 
            index === editingTierIndex ? { ...currentTier } : tier
          );
        } else {
          // Add new tier
          updatedTiers = [...spectatorTickets.tiers, { ...currentTier, remaining: currentTier.capacity }];
        }
      } else {
        // First tier
        updatedTiers = [{ ...currentTier, remaining: currentTier.capacity }];
      }

      let response;
      const requestData = {
        eventId: eventId,
        tiers: updatedTiers
      };

      if (spectatorTickets) {
        // Update existing
        response = await axiosInstance.put(`/spectator-ticket/${eventId}`, requestData);
      } else {
        // Create new
        response = await axiosInstance.post('/spectator-ticket', requestData);
      }

      if (response.data.success) {
        setSpectatorTickets(response.data.data);
        setShowTierForm(false);
        alert(editingTier ? "Tier updated successfully!" : "Tier added successfully!");
      }
    } catch (err) {
      console.error("Error saving tier:", err);
      alert(`Error saving tier: ${err.message}`);
    } finally {
      setTicketsLoading(false);
    }
  };

  const deleteTier = async () => {
    if (!editingTier || editingTierIndex === null) return;
    
    if (!confirm("Are you sure you want to delete this tier?")) return;

    try {
      setTicketsLoading(true);
      
      // Remove the tier by index
      const updatedTiers = spectatorTickets.tiers.filter((_, index) => index !== editingTierIndex);

      console.log('Original tiers:', spectatorTickets.tiers.length);
      console.log('Updated tiers:', updatedTiers.length);
      console.log('Deleting tier at index:', editingTierIndex);

      if (updatedTiers.length === 0) {
        // If no tiers left, delete the entire spectator ticket
        const response = await axiosInstance.delete(`/spectator-ticket/${eventId}`);

        setSpectatorTickets(null);
        setShowTierForm(false);
        alert("All tiers deleted. Spectator tickets removed!");
      } else {
        // Update with remaining tiers
        const response = await axiosInstance.put(`/spectator-ticket/${eventId}`, {
          eventId: eventId,
          tiers: updatedTiers
        });

        if (response.data.success) {
          setSpectatorTickets(response.data.data);
          setShowTierForm(false);
          alert("Tier deleted successfully!");
        }
      }
    } catch (err) {
      console.error("Error deleting tier:", err);
      alert(`Error deleting tier: ${err.message}`);
    } finally {
      setTicketsLoading(false);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Redemption functions
  const handleQRScan = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera access is not supported in this browser. Please use manual code entry.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      
      // Create a simple QR scanner modal
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.9); z-index: 9999; 
        display: flex; flex-direction: column; align-items: center; justify-content: center;
      `;
      
      const video = document.createElement('video');
      video.style.cssText = 'width: 80%; max-width: 400px; height: auto; border: 3px solid #CB3CFF; border-radius: 10px;';
      video.srcObject = stream;
      video.play();
      
      const instructions = document.createElement('div');
      instructions.style.cssText = 'color: white; text-align: center; margin: 20px; font-size: 16px;';
      instructions.innerHTML = `
        <p>Position QR code within the frame</p>
        <p style="font-size: 14px; margin-top: 10px; color: #ccc;">Camera scanning is simulated. Click "Manual Entry" to continue.</p>
      `;
      
      const buttons = document.createElement('div');
      buttons.style.cssText = 'display: flex; gap: 15px; margin-top: 20px;';
      
      const manualButton = document.createElement('button');
      manualButton.textContent = 'Manual Entry';
      manualButton.style.cssText = `
        background: linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%);
        color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;
      `;
      
      const cancelButton = document.createElement('button');
      cancelButton.textContent = 'Cancel';
      cancelButton.style.cssText = `
        background: #666; color: white; padding: 10px 20px; 
        border: none; border-radius: 5px; cursor: pointer;
      `;
      
      manualButton.onclick = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
        // Focus on manual entry input
        setTimeout(() => {
          const codeInput = document.querySelector('input[placeholder*="ticket code"]');
          if (codeInput) codeInput.focus();
        }, 100);
      };
      
      cancelButton.onclick = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
      };
      
      buttons.appendChild(manualButton);
      buttons.appendChild(cancelButton);
      
      modal.appendChild(video);
      modal.appendChild(instructions);
      modal.appendChild(buttons);
      
      document.body.appendChild(modal);
      
    } catch (error) {
      console.error('Camera access error:', error);
      alert("Unable to access camera. Please use manual code entry instead.");
    }
  };

  const validateTicketCode = async () => {
    if (!redemptionCode.trim()) {
      alert("Please enter a ticket code");
      return;
    }

    // Basic format validation
    const codePattern = /^[A-Z0-9]{4,8}$/;
    if (!codePattern.test(redemptionCode.trim())) {
      alert("Invalid ticket code format. Please enter a 4-8 character alphanumeric code.");
      return;
    }

    try {
      setTicketsLoading(true);
      
      // First try to get ticket info (simulate validation)
      // In a real implementation, you'd have a separate validate endpoint
      const response = await axiosInstance.get(`/spectator-ticket/validate/${redemptionCode.trim()}`);

      if (response.data.success) {
        setTicketToRedeem({
          spectatorName: response.data.data.spectatorName || "Unknown Spectator",
          tierName: response.data.data.tierName || "General Admission",
          quantity: response.data.data.quantity || 1,
          price: response.data.data.price || 0,
          isValid: true
        });
        alert("✓ Valid ticket found! You can now redeem it.");
      }
    } catch (err) {
      console.error("Error validating ticket:", err);
      
      // If validation endpoint doesn't exist, fall back to mock validation
      if (err.response?.status === 404) {
        // Mock validation for demo purposes
        const mockTicket = {
          spectatorName: "Demo Spectator",
          tierName: "General Admission", 
          quantity: 1,
          price: 3500, // $35.00 in cents
          isValid: true
        };
        setTicketToRedeem(mockTicket);
        alert("✓ Valid ticket found! (Demo mode - using mock data)");
      } else {
        setTicketToRedeem(null);
        alert(`❌ Error validating ticket: ${err.response?.data?.message || "Invalid ticket code"}`);
      }
    } finally {
      setTicketsLoading(false);
    }
  };

  const redeemTicket = async () => {
    if (!redemptionCode.trim()) {
      alert("Please enter a ticket code");
      return;
    }

    if (!ticketToRedeem) {
      alert("Please validate the ticket code first before redeeming.");
      return;
    }

    if (quantityToRedeem <= 0 || quantityToRedeem > (ticketToRedeem.quantity || 1)) {
      alert(`Invalid quantity. Please enter a value between 1 and ${ticketToRedeem.quantity || 1}.`);
      return;
    }

    const confirmMessage = quantityToRedeem === ticketToRedeem.quantity
      ? `Redeem all ${quantityToRedeem} ticket(s) for ${ticketToRedeem.spectatorName}?`
      : `Redeem ${quantityToRedeem} of ${ticketToRedeem.quantity} ticket(s) for ${ticketToRedeem.spectatorName}? ${ticketToRedeem.quantity - quantityToRedeem} will remain available.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setTicketsLoading(true);
      const response = await axiosInstance.post('/spectator-ticket/redeem', {
        ticketCode: redemptionCode.trim(),
        quantityToRedeem: quantityToRedeem,
        entryMode: "Manual",
        eventId: eventId
      });

      if (response.data.success) {
        const newRedemption = {
          id: Date.now().toString(),
          code: redemptionCode,
          name: ticketToRedeem.spectatorName || "Spectator",
          type: ticketToRedeem.tierName || "General",
          price: ticketToRedeem.price || 0,
          redeemedAt: new Date().toISOString(),
          redeemedBy: "Current Staff",
          status: "checked-in",
          entryMode: "manual",
          quantity: quantityToRedeem,
          remainingQuantity: (ticketToRedeem.quantity || 1) - quantityToRedeem
        };
        
        setRedemptions([...redemptions, newRedemption]);
        setRedemptionCode("");
        setTicketToRedeem(null);
        setQuantityToRedeem(1);
        
        const successMessage = newRedemption.remainingQuantity > 0
          ? `✓ Successfully redeemed ${quantityToRedeem} ticket(s)! ${newRedemption.remainingQuantity} remaining for this code.`
          : `✓ Successfully redeemed all ${quantityToRedeem} ticket(s)!`;
        
        alert(successMessage);

        // Switch to redemption list tab to show the new entry
        setActiveRedemptionTab("list");
      }
    } catch (err) {
      console.error("Error redeeming ticket:", err);
      const errorMessage = err.response?.data?.message || err.message;
      
      // Handle specific error cases
      if (errorMessage.includes("already redeemed")) {
        alert("❌ This ticket has already been redeemed.");
      } else if (errorMessage.includes("not found")) {
        alert("❌ Ticket code not found. Please check the code and try again.");
      } else if (errorMessage.includes("expired")) {
        alert("❌ This ticket has expired and cannot be redeemed.");
      } else {
        alert(`❌ Error redeeming ticket: ${errorMessage}`);
      }
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleExportRedemptions = (format) => {
    alert(`Would export ${format} file with ${redemptions.length} redemptions`);
  };

  const searchTicketsByEmail = async () => {
    if (!searchEmail.trim()) {
      alert("Please enter an email address");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(searchEmail.trim())) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      setTicketsLoading(true);
      const response = await axiosInstance.get(`/spectator-ticket/search-by-email/${eventId}?email=${encodeURIComponent(searchEmail.trim())}`);
      
      if (response.data.success && response.data.data.length > 0) {
        setEmailSearchResults(response.data.data);
        alert(`Found ${response.data.data.length} ticket(s) for this email address.`);
      } else {
        setEmailSearchResults([]);
        alert("No tickets found for this email address.");
      }
    } catch (err) {
      console.error("Error searching tickets by email:", err);
      
      // Mock search results for demo
      if (err.response?.status === 404) {
        const mockResults = [
          {
            ticketCode: "DEMO123",
            spectatorName: "Demo User",
            tierName: "General Admission",
            quantity: 2,
            purchaseDate: new Date().toISOString(),
            status: "active"
          }
        ];
        setEmailSearchResults(mockResults);
        alert(`Found ${mockResults.length} ticket(s) for this email address. (Demo mode)`);
      } else {
        setEmailSearchResults([]);
        alert(`Error searching tickets: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setTicketsLoading(false);
    }
  };

  const selectTicketFromEmail = (ticket) => {
    setRedemptionCode(ticket.ticketCode);
    setTicketToRedeem({
      spectatorName: ticket.spectatorName,
      tierName: ticket.tierName,
      quantity: ticket.quantity,
      price: ticket.price || 3500,
      isValid: true
    });
    setShowEmailSearch(false);
    setSearchEmail("");
    setEmailSearchResults([]);
    alert(`Selected ticket ${ticket.ticketCode} for ${ticket.spectatorName}`);
  };

  useEffect(() => {
    if (params?.id) {
      setEventId(params.id);
      fetchEventData(params.id);
    }
  }, [params]);

  useEffect(() => {
    if (eventId) {
      fetchTournamentSettings(eventId);
      fetchSpectatorTickets(eventId);
    }
  }, [eventId]);

  const fetchTournamentSettings = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tournament-setting/${id}`);

      if (response.status === 404) {
        // Settings don't exist, initialize them
        try {
          const initializedSettings = await initializeTournamentSettings(id);
          setTournamentSettings({
            simpleFees: initializedSettings.simpleFees || {
              fighterFee: 0,
              trainerFee: 0,
              currency: "$",
            },
            bracketSettings: initializedSettings.bracketSettings || {
              maxFightersPerBracket: 0,
            },
            numBrackets: initializedSettings.numBrackets || 0,
          });
        } catch (initError) {
          console.error("Failed to initialize tournament settings:", initError);
          // Set default values even if initialization fails
          setTournamentSettings({
            simpleFees: {
              fighterFee: 0,
              trainerFee: 0,
              currency: "$",
            },
            bracketSettings: {
              maxFightersPerBracket: 0,
            },
            numBrackets: 0,
          });
        }
        return;
      }

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`API Error ${response.status}:`, errorData);
        throw new Error(`Failed to fetch tournament settings: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setTournamentSettings({
          simpleFees: data.data.simpleFees || {
            fighterFee: 0,
            trainerFee: 0,
            currency: "$",
          },
          bracketSettings: data.data.bracketSettings || {
            maxFightersPerBracket: 0,
          },
          numBrackets: data.data.numBrackets || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching tournament settings:", err);
      // Set default values if everything fails
      setTournamentSettings({
        simpleFees: {
          fighterFee: 0,
          trainerFee: 0,
          currency: "$",
        },
        bracketSettings: {
          maxFightersPerBracket: 0,
        },
        numBrackets: 0,
      });
    }
  };

  const fetchEventData = async (id) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/events/${id}`);
      if (response.data.success) {
        setEvent(response.data.data);
      } else {
        throw new Error(response.data.message || "Error fetching event");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return "N/A";
    if (typeof address === "string") return address;

    const { street1, street2, city, state, postalCode, country } = address;
    return [street1, street2, `${city}, ${state} ${postalCode}`, country]
      .filter(Boolean)
      .join(", ");
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[#07091D]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white p-8 flex justify-center">
        <div className="bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-white p-8 flex justify-center">
        <div className="bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full">
          <p>Event not found</p>
        </div>
      </div>
    );
  }

  // Format the event data to match your component's structure
  const formattedEvent = {
    name: event.name,
    poster: event.poster,
    format: event.format,
    koPolicy: event.koPolicy,
    sportType: event.sportType,
    startDate: formatDate(event.startDate),
    endDate: formatDate(event.endDate),
    registrationStartDate: formatDate(event.registrationStartDate),
    registrationDeadline: formatDate(event.registrationDeadline),
    weighInDateTime: formatDateTime(event.weighInDateTime),
    rulesMeetingTime: event.rulesMeetingTime || "N/A",
    spectatorDoorsOpenTime: event.spectatorDoorsOpenTime || "N/A",
    fightStartTime: event.fightStartTime || "N/A",
    promoter: {
      name: event.promoter?.userId?.name || "N/A",
      abbreviation: event.promoter?.abbreviation || "N/A",
      website: event.promoter?.websiteURL || "N/A",
      about: event.promoter?.aboutUs || "N/A",
      sanctioningBody: event.promoter?.sanctioningBody || "N/A",
      contactPerson: event.promoter?.contactPersonName || "N/A",
      phone: event.promoter?.userId?.phoneNumber || "N/A",
      alternatePhone: event.promoter?.alternatePhoneNumber || "N/A",
      email: event.promoter?.userId?.email || "N/A",
    },
    iskaRep: {
      name: event.iskaRepName || "N/A",
      phone: event.iskaRepPhone || "N/A",
    },
    venue: {
      name: event.venue?.name || "N/A",
      contactName: event.venue?.contactName || "N/A",
      contactPhone: event.venue?.contactPhone || "N/A",
      contactEmail: event.venue?.contactEmail || "N/A",
      capacity: event.venue?.capacity || "N/A",
      mapLink: event.venue?.mapLink || "N/A",
      address: formatAddress(event.venue?.address),
    },
    shortDescription: event.briefDescription || "N/A",
    fullDescription: event.fullDescription || "N/A",
    rules: event.rules || "N/A",
    matchingMethod: event.matchingMethod || "N/A",
    sanctioning: {
      name: event.sectioningBodyName || "N/A",
      description: event.sectioningBodyDescription || "N/A",
      image: event.sectioningBodyImage || null,
    },
    ageCategories:
      event.ageCategories?.length > 0 ? event.ageCategories.join(", ") : "N/A",
    weightClasses:
      event.weightClasses?.length > 0 ? event.weightClasses.join(", ") : "N/A",
    status: {
      isDraft: event.isDraft ? "Yes" : "No",
      publishBrackets: event.publishBrackets ? "Yes" : "No",
    },
    createdBy:
      `${event.createdBy?.firstName || ""} ${
        event.createdBy?.lastName || ""
      }`.trim() || "N/A",
    createdAt: formatDateTime(event.createdAt),
    updatedAt: formatDateTime(event.updatedAt),
    stats: {
      bracketCount: {
        value: 0,
        breakdown: "No breakdown available",
      },
      boutCount: {
        value: 0,
        breakdown: "No breakdown available",
      },
      registrationFee: {
        fighter: "$0",
        trainer: "$0",
        breakdown: "No breakdown available",
      },
      participants: {
        value: event.registeredParticipants || 0,
        breakdown: `Fighters: ${event.registeredFighters?.length || 0}`,
      },
      spectatorPayments: {
        totalFees: "$0.00",
        totalCollected: "$0.00",
        netRevenue: "$0.00",
        breakdown: "No payments recorded",
      },
      registrationPayments: {
        totalCollected: "$0.00",
        totalParticipants: 0,
        breakdown: "No payments recorded",
      },
      tournamentResults: {
        bracketCount: event.brackets?.length || 0,
        boutCount: event.matches?.length || 0,
        breakdown: `${event.brackets?.length || 0} brackets, ${
          event.matches?.length || 0
        } bouts`,
      },
      tournamentSettings: {
        simpleFees: {
          fighterFee: 0,
          trainerFee: 0,
          currency: "$",
        },
        bracketSettings: {
          maxFightersPerBracket: "N/A",
        },
        numBrackets: "N/A",
      },
    },
  };

  return (
    <div className="text-white p-8 flex justify-center relative overflow-hidden">
      <div
        className="absolute -left-10 top-1/2 transform -translate-y-1/2 w-60 h-96 rounded-full opacity-70 blur-xl"
        style={{
          background:
            "linear-gradient(317.9deg, #6F113E 13.43%, rgba(111, 17, 62, 0) 93.61%)",
        }}
      ></div>
      <div className="bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50">
        <div className="flex justify-between mb-6">
          {/* Header with back button */}
          <div className="flex items-center gap-4 ">
            <Link href={`/admin/events`}>
              <button className="mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
            </Link>
            <h1 className="text-2xl font-bold">{formattedEvent.name}</h1>
          </div>
          <div className="relative w-64">
            {/* Dropdown Button */}
            <button
              onClick={toggleDropdown}
              className="flex items-center justify-between w-full px-4 py-2 bg-[#0A1330] border border-white rounded-lg"
            >
              <span>Features</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute w-full mt-2 bg-[#081028] shadow-lg z-10">
                <ul className="py-1">
                  <Link href={`/admin/events/${eventId}/fighter-checkin`}>
                    <li className="mx-4 py-3 border-b border-[#6C6C6C] hover:bg-[#0f1a40] cursor-pointer">
                      Fighter Check-in
                    </li>
                  </Link>
                  <Link href={`/admin/events/${eventId}/tournament-brackets`}>
                    <li className="mx-4 py-3 border-b border-[#6C6C6C] hover:bg-[#0f1a40] cursor-pointer">
                      Tournament Brackets
                    </li>
                  </Link>
                  <Link href={`/admin/events/${eventId}/participants`}>
                    <li className="mx-4 py-3 border-b border-[#6C6C6C] hover:bg-[#0f1a40] cursor-pointer">
                      Event Participants
                    </li>
                  </Link>
                  <Link href={`/admin/events/${eventId}/bout-list`}>
                    <li className="mx-4 py-3 border-b border-[#6C6C6C] hover:bg-[#0f1a40] cursor-pointer">
                      Bout List & Results
                    </li>
                  </Link>
                  <Link href={`/admin/events/${eventId}/fight-card`}>
                    <li className="mx-4 py-3 border-b border-[#6C6C6C] hover:bg-[#0f1a40] cursor-pointer">
                      Fight Card Overview
                    </li>
                  </Link>
                  <Link href={`/admin/events/${eventId}/fighter-card`}>
                    <li className="mx-4 py-3 border-b border-[#6C6C6C] hover:bg-[#0f1a40] cursor-pointer">
                      Fighter Card
                    </li>
                  </Link>
                  <li 
                    className="mx-4 py-3 border-b border-[#6C6C6C] hover:bg-[#0f1a40] cursor-pointer"
                    onClick={() => {
                      setShowRedemptionModal(true);
                      setIsOpen(false);
                    }}
                  >
                    Spectator Ticket Redemption
                  </li>
                  <li className="mx-4 py-3 border-b border-[#6C6C6C]">
                    Cash Payment Tokens
                  </li>
                  <li className="mx-4 py-3 border-b border-[#6C6C6C] border-t-2 border-t-gray-500">Reports</li>
                  <Link href={`/admin/events/${eventId}/spectator-payments`}>
                    <li className="mx-4 py-3 border-b border-[#6C6C6C] hover:bg-[#0f1a40] cursor-pointer">
                      Spectator Payments
                    </li>
                  </Link>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="border border-[#343B4F] rounded-lg p-4 relative">
            <div className="flex justify-between items-start">
              <span className="text-sm text-[#AEB9E1]">Tournament Results</span>
              <Link href={`/admin/events/${eventId}/tournament-results`}>
                <button className="">
                  <Pencil size={16} />
                </button>
              </Link>
            </div>
            <div className="mt-2">
              <h2 className="text-2xl font-bold">
                {formattedEvent.stats.tournamentResults.bracketCount} Brackets
              </h2>
              <p className="text-sm text-[#AEB9E1] mt-2 whitespace-pre-line">
                {formattedEvent.stats.tournamentResults.breakdown}
              </p>
            </div>
          </div>
          <div className="border border-[#343B4F] rounded-lg p-4 relative">
            <div className="flex justify-between items-start">
              <span className="text-sm text-[#AEB9E1]">
                Registration Payments
              </span>
              <Link href={`/admin/events/${eventId}/registration-payments`}>
                <button className="">
                  <Pencil size={16} />
                </button>
              </Link>
            </div>
            <div className="mt-2">
              <h2 className="text-2xl font-bold">
                {formattedEvent.stats.registrationPayments.totalCollected}
              </h2>
              <p className="text-sm text-[#AEB9E1] mt-2 whitespace-pre-line">
                Participants:{" "}
                {formattedEvent.stats.registrationPayments.totalParticipants}
              </p>
            </div>
          </div>
          <div className="border border-[#343B4F] rounded-lg p-4 relative">
            <div className="flex justify-between items-start">
              <span className="text-sm text-[#AEB9E1]">Spectator Payments</span>
              <Link href={`/admin/events/${eventId}/spectator-payments`}>
                <button className="">
                  <Pencil size={16} />
                </button>
              </Link>
            </div>
            <div className="mt-2">
              <h2 className="text-2xl font-bold">
                {formattedEvent.stats.spectatorPayments.totalCollected}
              </h2>
              <p className="text-sm text-[#AEB9E1] mt-2 whitespace-pre-line">
                Fees: {formattedEvent.stats.spectatorPayments.totalFees}
                <br />
                Net: {formattedEvent.stats.spectatorPayments.netRevenue}
              </p>
            </div>
          </div>

          {/* Bracket Count */}
          <div className="border border-[#343B4F] rounded-lg p-4 relative">
            <div className="flex justify-between items-start">
              <span className="text-sm text-[#AEB9E1]">Bracket Count</span>
              <button className="">
                <Pencil size={16} />
              </button>
            </div>
            <div className="mt-2">
              <h2 className="text-2xl font-bold">
                {formattedEvent.stats.bracketCount.value}
              </h2>
              <p className="text-sm text-[#AEB9E1] mt-2 whitespace-pre-line">
                {formattedEvent.stats.bracketCount.breakdown}
              </p>
            </div>
          </div>

          {/* Bout Management */}
          <div className="border border-[#343B4F] rounded-lg p-4 relative">
            <div className="flex justify-between items-start">
              <span className="text-sm text-[#AEB9E1]">Tournament Brackets & Bouts</span>
              <Link href={`/admin/events/${eventId}/tournament-brackets`}>
                <button className="hover:text-blue-400" title="Manage Tournament Brackets & Bouts">
                  <Pencil size={16} />
                </button>
              </Link>
            </div>
            <div className="mt-2">
              <h2 className="text-2xl font-bold">
                {formattedEvent.stats.boutCount.value} Bouts
              </h2>
              <p className="text-sm text-[#AEB9E1] mt-2 whitespace-pre-line">
                Click to manage brackets and bouts
              </p>
            </div>
          </div>

          {/* Registration Fee */}
          <div className="border border-[#343B4F] rounded-lg p-4 relative">
            <div className="flex justify-between items-start">
              <span className="text-sm text-[#AEB9E1]">
                Tournament Settings
              </span>
              <button
                onClick={() => setSettingsModalVisible(true)}
                className="text-white hover:text-gray-300"
              >
                <Pencil size={16} />
              </button>
            </div>
            <div className="mt-2 space-y-2">
              <div>
                <p className="text-sm text-[#AEB9E1]">
                  Fighter Registration Fee
                </p>
                <p className="font-medium">
                  {tournamentSettings.simpleFees.currency}
                  {tournamentSettings.simpleFees.fighterFee}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#AEB9E1]">
                  Trainer Registration Fee
                </p>
                <p className="font-medium">
                  {tournamentSettings.simpleFees.currency}
                  {tournamentSettings.simpleFees.trainerFee}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#AEB9E1]">
                  Max Fighters per Bracket
                </p>
                <p className="font-medium">
                  {tournamentSettings.bracketSettings.maxFightersPerBracket ||
                    "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#AEB9E1]">
                  Num Registration Brackets
                </p>
                <p className="font-medium">
                  {tournamentSettings.numBrackets || "N/A"}
                </p>
              </div>
            </div>
          </div>
          {/* Participants */}
          <div className="border border-[#343B4F] rounded-lg p-4 relative">
            <div className="flex justify-between items-start">
              <span className="text-sm text-[#AEB9E1]">Participants</span>
            </div>
            <div className="mt-2">
              <h2 className="text-2xl font-bold">
                {formattedEvent.stats.participants.value}
              </h2>
              <p className="text-sm text-[#AEB9E1] mt-2 whitespace-pre-line">
                {formattedEvent.stats.participants.breakdown}
              </p>
            </div>
          </div>
        </div>

        {/* Spectator Ticketing Section */}
        <div className="border border-[#343B4F] rounded-lg p-6 relative mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg">SPECTATOR TICKETING</h2>
            <button
              onClick={handleAddNewTier}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-[#CB3CFF] to-[#7F25FB] rounded-lg text-sm hover:opacity-90"
            >
              <Plus size={16} className="mr-2" />
              Add New Tier
            </button>
          </div>

          {ticketsLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}

          {!ticketsLoading && (!spectatorTickets || !spectatorTickets.tiers || spectatorTickets.tiers.length === 0) && (
            <div className="text-center py-12 text-[#AEB9E1]">
              <Ticket size={48} className="mx-auto mb-4 text-[#343B4F]" />
              <h3 className="text-lg font-medium mb-2">No Ticket Tiers Created</h3>
              <p className="mb-4">Create ticket tiers for spectators to purchase and attend your event</p>
            </div>
          )}

          {!ticketsLoading && spectatorTickets?.tiers && spectatorTickets.tiers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
              {spectatorTickets.tiers.map((tier, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex-1 mr-4">
                    <p className="text-sm mb-1">Tier {tier.order} - {tier.name}</p>
                    <p className="font-medium">
                      ${(tier.price / 100).toFixed(2)} • {tier.remaining}/{tier.capacity} remaining
                    </p>
                  </div>
                  <button
                    onClick={() => handleEditTier(tier, index)}
                    className="text-white hover:text-gray-300 p-2 rounded-lg hover:bg-[#343B4F] transition-colors"
                    title="Edit tier"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tier Form Modal */}
        {showTierForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-medium mb-6">
                {editingTier ? 'Edit Tier' : 'Add New Tier'}
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#AEB9E1] mb-1">Order</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full bg-[#0A1330] border border-[#343B4F] text-white rounded px-3 py-2 text-sm"
                      value={currentTier.order}
                      onChange={(e) => setCurrentTier({...currentTier, order: parseInt(e.target.value) || 1})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#AEB9E1] mb-1">Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full bg-[#0A1330] border border-[#343B4F] text-white rounded px-3 py-2 text-sm"
                      value={currentTier.price / 100}
                      onChange={(e) => setCurrentTier({...currentTier, price: Math.round((parseFloat(e.target.value) || 0) * 100)})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#AEB9E1] mb-1">Name (Required - 64 characters max)</label>
                  <input
                    type="text"
                    maxLength="64"
                    className="w-full bg-[#0A1330] border border-[#343B4F] text-white rounded px-3 py-2 text-sm"
                    value={currentTier.name}
                    onChange={(e) => setCurrentTier({...currentTier, name: e.target.value})}
                    placeholder="e.g., General Admission"
                  />
                  <p className="text-xs text-[#AEB9E1] mt-1">{currentTier.name.length}/64 characters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#AEB9E1] mb-1">Capacity</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full bg-[#0A1330] border border-[#343B4F] text-white rounded px-3 py-2 text-sm"
                      value={currentTier.capacity}
                      onChange={(e) => {
                        const capacity = parseInt(e.target.value) || 0;
                        setCurrentTier({...currentTier, capacity, remaining: editingTier ? currentTier.remaining : capacity});
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#AEB9E1] mb-1">Remaining</label>
                    <input
                      type="number"
                      className="w-full bg-[#0A1330] border border-[#343B4F] text-white rounded px-3 py-2 text-sm"
                      value={currentTier.remaining}
                      onChange={(e) => setCurrentTier({...currentTier, remaining: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#AEB9E1] mb-1">Description (Required - 128 characters max)</label>
                  <textarea
                    maxLength="128"
                    rows="3"
                    className="w-full bg-[#0A1330] border border-[#343B4F] text-white rounded px-3 py-2 text-sm"
                    value={currentTier.description}
                    onChange={(e) => setCurrentTier({...currentTier, description: e.target.value})}
                    placeholder="Brief description of what this ticket includes"
                  />
                  <p className="text-xs text-[#AEB9E1] mt-1">{currentTier.description.length}/128 characters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#AEB9E1] mb-1">Availability Mode</label>
                    <select
                      className="w-full bg-[#0A1330] border border-[#343B4F] text-white rounded px-3 py-2 text-sm"
                      value={currentTier.availabilityMode}
                      onChange={(e) => setCurrentTier({...currentTier, availabilityMode: e.target.value})}
                    >
                      <option value="Online">Online Only</option>
                      <option value="OnSite">On-Site Only</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-[#AEB9E1] mb-1">Limit Per User</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full bg-[#0A1330] border border-[#343B4F] text-white rounded px-3 py-2 text-sm"
                      value={currentTier.limitPerUser}
                      onChange={(e) => setCurrentTier({...currentTier, limitPerUser: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#AEB9E1] mb-1">Sales Start Date</label>
                    <input
                      type="datetime-local"
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full bg-[#0A1330] border border-[#343B4F] text-white rounded px-3 py-2 text-sm"
                      value={currentTier.salesStartDate ? new Date(currentTier.salesStartDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setCurrentTier({...currentTier, salesStartDate: new Date(e.target.value).toISOString()})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#AEB9E1] mb-1">Sales End Date</label>
                    <input
                      type="datetime-local"
                      min={currentTier.salesStartDate ? new Date(currentTier.salesStartDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)}
                      className="w-full bg-[#0A1330] border border-[#343B4F] text-white rounded px-3 py-2 text-sm"
                      value={currentTier.salesEndDate ? new Date(currentTier.salesEndDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setCurrentTier({...currentTier, salesEndDate: new Date(e.target.value).toISOString()})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#AEB9E1] mb-1">Refund Policy Notes</label>
                  <input
                    type="text"
                    className="w-full bg-[#0A1330] border border-[#343B4F] text-white rounded px-3 py-2 text-sm"
                    value={currentTier.refundPolicyNotes}
                    onChange={(e) => setCurrentTier({...currentTier, refundPolicyNotes: e.target.value})}
                    placeholder="e.g., Non-refundable or Refundable up to 7 days before event"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                {editingTier && (
                  <button
                    onClick={deleteTier}
                    disabled={ticketsLoading}
                    className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </button>
                )}
                <button
                  onClick={() => setShowTierForm(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors border border-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={saveTier}
                  disabled={ticketsLoading}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-[#CB3CFF] to-[#7F25FB] rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
                >
                  <Save size={16} className="mr-2" />
                  {editingTier ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Spectator Ticket Redemption Modal */}
        {showRedemptionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Spectator Ticket Redemption</h2>
                    <p className="text-gray-300 text-sm mt-1">Event: {formattedEvent.name}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      className="text-sm bg-[#0A1330] hover:bg-[#0A1330]/80 text-white px-3 py-2 rounded flex items-center"
                      onClick={() => handleExportRedemptions("pdf")}
                    >
                      <Download size={14} className="mr-1" />
                      PDF
                    </button>
                    <button 
                      className="text-sm bg-[#0A1330] hover:bg-[#0A1330]/80 text-white px-3 py-2 rounded flex items-center"
                      onClick={() => handleExportRedemptions("csv")}
                    >
                      <Download size={14} className="mr-1" />
                      CSV
                    </button>
                    <button
                      onClick={() => setShowRedemptionModal(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-700 mb-6">
                  <button
                    className={`pb-2 px-4 ${activeRedemptionTab === "redeem" ? "text-purple-400 border-b-2 border-purple-400" : "text-gray-400"}`}
                    onClick={() => setActiveRedemptionTab("redeem")}
                  >
                    Ticket Redemption
                  </button>
                  <button
                    className={`pb-2 px-4 ${activeRedemptionTab === "list" ? "text-purple-400 border-b-2 border-purple-400" : "text-gray-400"}`}
                    onClick={() => setActiveRedemptionTab("list")}
                  >
                    Redemption List ({redemptions.length})
                  </button>
                </div>

                {activeRedemptionTab === "redeem" ? (
                  <>
                    {/* QR Scan Section */}
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-3">Scan QR Code</h3>
                      <p className="text-gray-300 mb-4">
                        Use your device camera to scan the spectator's ticket QR code
                      </p>
                      <button
                        style={{
                          background: "linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)",
                        }}
                        className="text-white py-2 px-4 rounded flex items-center hover:opacity-90"
                        onClick={handleQRScan}
                      >
                        <Camera size={18} className="mr-2" />
                        Scan with Device Camera
                      </button>
                    </div>

                    <div className="border-t border-gray-700 my-6"></div>

                    {/* Email Search Section */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Find Lost Ticket Code</h3>
                        <button
                          onClick={() => setShowEmailSearch(!showEmailSearch)}
                          className="text-sm text-purple-400 hover:text-purple-300"
                        >
                          {showEmailSearch ? "Hide Email Search" : "Search by Email"}
                        </button>
                      </div>
                      
                      {showEmailSearch && (
                        <div className="bg-[#0A1330] p-4 rounded-lg mb-4">
                          <p className="text-gray-300 text-sm mb-3">
                            If a spectator has lost their ticket code, search by their email address:
                          </p>
                          <div className="flex gap-3 mb-4">
                            <input
                              type="email"
                              className="flex-1 bg-[#0B1739] border border-gray-600 text-white rounded px-3 py-2"
                              placeholder="Enter spectator's email address"
                              value={searchEmail}
                              onChange={(e) => setSearchEmail(e.target.value)}
                            />
                            <button
                              onClick={searchTicketsByEmail}
                              disabled={!searchEmail || ticketsLoading}
                              className="bg-gradient-to-r from-[#CB3CFF] to-[#7F25FB] text-white px-4 py-2 rounded disabled:opacity-50"
                            >
                              {ticketsLoading ? "Searching..." : "Search"}
                            </button>
                          </div>
                          
                          {emailSearchResults.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-green-400 text-sm">Found {emailSearchResults.length} ticket(s):</p>
                              {emailSearchResults.map((ticket, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-[#0B1739] rounded border border-gray-600">
                                  <div>
                                    <p className="text-white font-medium">{ticket.ticketCode}</p>
                                    <p className="text-gray-300 text-sm">{ticket.spectatorName} • {ticket.tierName} • Qty: {ticket.quantity}</p>
                                  </div>
                                  <button
                                    onClick={() => selectTicketFromEmail(ticket)}
                                    className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
                                  >
                                    Select
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-700 my-6"></div>

                    {/* Manual Entry Section */}
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-4">Manual Ticket Entry</h3>
                      
                      <div className="bg-[#0A1330] p-4 rounded-lg mb-4">
                        <label className="block text-sm text-gray-400 mb-2">Ticket Code:</label>
                        <div className="flex items-center mb-4">
                          <input
                            type="text"
                            className="bg-transparent text-white text-lg font-medium focus:outline-none w-full"
                            placeholder="Enter ticket code (e.g., 7FOD3Q)"
                            value={redemptionCode}
                            onChange={(e) => setRedemptionCode(e.target.value.toUpperCase())}
                            maxLength={10}
                          />
                          {redemptionCode && (
                            <button 
                              onClick={() => {
                                setRedemptionCode("");
                                setTicketToRedeem(null);
                              }}
                              className="text-gray-400 hover:text-white ml-2"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>

                        {ticketToRedeem && (
                          <div className="mb-4 p-3 bg-[#0B1739] rounded border border-green-500">
                            <p className="text-green-400 text-sm mb-2">✓ Valid Ticket Found</p>
                            <p className="text-white"><strong>Spectator:</strong> {ticketToRedeem.spectatorName}</p>
                            <p className="text-white"><strong>Type:</strong> {ticketToRedeem.tierName}</p>
                            <p className="text-white"><strong>Available Quantity:</strong> {ticketToRedeem.quantity}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Quantity to Redeem:</label>
                            <input
                              type="number"
                              min="1"
                              max={ticketToRedeem?.quantity || 1}
                              className="w-full bg-[#0B1739] border border-gray-600 text-white rounded px-3 py-2"
                              value={quantityToRedeem}
                              onChange={(e) => setQuantityToRedeem(parseInt(e.target.value) || 1)}
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              className="bg-[#0A1330] hover:bg-[#0f1a40] text-white py-2 px-4 rounded mr-2"
                              onClick={validateTicketCode}
                              disabled={!redemptionCode || ticketsLoading}
                            >
                              {ticketsLoading ? "Validating..." : "Validate Code"}
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        style={{
                          background: "linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)",
                        }}
                        className="text-white py-2 px-4 rounded w-full md:w-auto disabled:opacity-50"
                        onClick={redeemTicket}
                        disabled={!redemptionCode || ticketsLoading}
                      >
                        {ticketsLoading ? "Redeeming..." : "Redeem Ticket"}
                      </button>
                    </div>
                  </>
                ) : (
                  /* Redemption List */
                  <div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                      <h3 className="text-lg font-medium mb-4 md:mb-0">
                        Ticket Redemptions ({redemptions.length})
                      </h3>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          className="bg-[#0A1330] border border-gray-700 text-white rounded px-3 py-1 text-sm"
                          placeholder="Search redemptions..."
                        />
                      </div>
                    </div>

                    {redemptions.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-[#0A1330] text-left">
                              <th className="p-3 border-b border-gray-700 text-sm">Code</th>
                              <th className="p-3 border-b border-gray-700 text-sm">Spectator</th>
                              <th className="p-3 border-b border-gray-700 text-sm">Type</th>
                              <th className="p-3 border-b border-gray-700 text-sm">Qty</th>
                              <th className="p-3 border-b border-gray-700 text-sm">Price</th>
                              <th className="p-3 border-b border-gray-700 text-sm">Redeemed At</th>
                              <th className="p-3 border-b border-gray-700 text-sm">Staff Member</th>
                              <th className="p-3 border-b border-gray-700 text-sm">Entry Mode</th>
                              <th className="p-3 border-b border-gray-700 text-sm">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {redemptions.map((redemption) => (
                              <tr key={redemption.id} className="border-b border-gray-700 hover:bg-[#0A1330]/50">
                                <td className="p-3 font-mono text-sm">{redemption.code}</td>
                                <td className="p-3 text-sm">
                                  <div className="flex items-center">
                                    <User size={14} className="mr-2 text-gray-400" />
                                    <div>
                                      <p className="font-medium">{redemption.name}</p>
                                      {redemption.remainingQuantity > 0 && (
                                        <p className="text-xs text-yellow-400">
                                          {redemption.remainingQuantity} remaining
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 text-sm">
                                  <span className="flex items-center">
                                    <Ticket size={14} className="mr-2 text-gray-400" />
                                    {redemption.type}
                                  </span>
                                </td>
                                <td className="p-3 text-sm font-medium">{redemption.quantity}</td>
                                <td className="p-3 text-sm">
                                  <span className="flex items-center">
                                    <DollarSign size={14} className="mr-1 text-gray-400" />
                                    ${((redemption.price || 0) / 100).toFixed(2)}
                                  </span>
                                </td>
                                <td className="p-3 text-sm">
                                  <span className="flex items-center">
                                    <Clock size={14} className="mr-2 text-gray-400" />
                                    <div>
                                      <p>{new Date(redemption.redeemedAt).toLocaleDateString()}</p>
                                      <p className="text-xs text-gray-400">
                                        {new Date(redemption.redeemedAt).toLocaleTimeString()}
                                      </p>
                                    </div>
                                  </span>
                                </td>
                                <td className="p-3 text-sm">
                                  <div className="flex items-center">
                                    <User size={14} className="mr-2 text-gray-400" />
                                    {redemption.redeemedBy}
                                  </div>
                                </td>
                                <td className="p-3 text-sm">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                    redemption.entryMode === 'qr-scan' 
                                      ? 'bg-purple-900 text-purple-300' 
                                      : 'bg-blue-900 text-blue-300'
                                  }`}>
                                    {redemption.entryMode === 'qr-scan' ? <Camera size={10} className="mr-1" /> : <Search size={10} className="mr-1" />}
                                    {redemption.entryMode === 'qr-scan' ? 'QR Scan' : 'Manual'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-900 text-green-300">
                                    <Check size={10} className="mr-1" />
                                    Redeemed
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <Ticket size={48} className="mx-auto mb-4 text-gray-600" />
                        <p>No ticket redemptions yet</p>
                        <p className="text-sm mt-2">Redeemed tickets will appear here</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Event Properties */}
        <div className="border border-[#343B4F] rounded-lg p-6 relative mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg">EVENT PROPERTIES</h2>
          </div>
          {/* Event Poster */}
          {formattedEvent.poster && (
            <div className="mb-6">
              <Image
                src={formattedEvent.poster}
                alt="Event poster"
                width={300}
                height={400}
                className="rounded-lg"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
            {/* Event Name */}
            <div>
              <p className="text-sm mb-1">Event Name</p>
              <p className="font-medium">{formattedEvent.name}</p>
            </div>

            {/* Event Format */}
            <div>
              <p className="text-sm mb-1">Event Format</p>
              <p className="font-medium">{formattedEvent.format}</p>
            </div>

            {/* KO Policy */}
            <div>
              <p className="text-sm mb-1">KO Policy</p>
              <p className="font-medium">{formattedEvent.koPolicy}</p>
            </div>

            {/* Sport Type */}
            <div>
              <p className="text-sm mb-1">Sport Type</p>
              <p className="font-medium">{formattedEvent.sportType}</p>
            </div>

            {/* Start Date */}
            <div>
              <p className="text-sm mb-1">Start Date</p>
              <p className="font-medium">{formattedEvent.startDate}</p>
            </div>

            {/* End Date */}
            <div>
              <p className="text-sm mb-1">End Date</p>
              <p className="font-medium">{formattedEvent.endDate}</p>
            </div>

            {/* Registration Start Date */}
            <div>
              <p className="text-sm mb-1">Registration Start Date</p>
              <p className="font-medium">
                {formattedEvent.registrationStartDate}
              </p>
            </div>

            {/* Registration Deadline */}
            <div>
              <p className="text-sm mb-1">Registration Deadline</p>
              <p className="font-medium">
                {formattedEvent.registrationDeadline}
              </p>
            </div>

            {/* Weigh-in Date/Time */}
            <div>
              <p className="text-sm mb-1">Weigh-in Date/Time</p>
              <p className="font-medium">{formattedEvent.weighInDateTime}</p>
            </div>

            {/* Rules Meeting Time */}
            <div>
              <p className="text-sm mb-1">Rules Meeting Time</p>
              <p className="font-medium">{formattedEvent.rulesMeetingTime}</p>
            </div>

            {/* Spectator Doors Open Time */}
            <div>
              <p className="text-sm mb-1">Spectator Doors Open Time</p>
              <p className="font-medium">
                {formattedEvent.spectatorDoorsOpenTime}
              </p>
            </div>

            {/* Fight Start Time */}
            <div>
              <p className="text-sm mb-1">Fight Start Time</p>
              <p className="font-medium">{formattedEvent.fightStartTime}</p>
            </div>

            {/* Matching Method */}
            <div>
              <p className="text-sm mb-1">Matching Method</p>
              <p className="font-medium">{formattedEvent.matchingMethod}</p>
            </div>

            {/* Age Categories */}
            <div>
              <p className="text-sm mb-1">Age Categories</p>
              <p className="font-medium">{formattedEvent.ageCategories}</p>
            </div>

            {/* Weight Classes */}
            <div>
              <p className="text-sm mb-1">Weight Classes</p>
              <p className="font-medium">{formattedEvent.weightClasses}</p>
            </div>

            {/* Short Description */}
            <div className="md:col-span-2">
              <p className="text-sm mb-1">Short Description</p>
              <p className="font-medium">{formattedEvent.shortDescription}</p>
            </div>

            {/* Full Description */}
            <div className="md:col-span-2">
              <p className="text-sm mb-1">Full Description</p>
              <p className="font-medium">{formattedEvent.fullDescription}</p>
            </div>

            {/* Rules */}
            <div className="md:col-span-2">
              <p className="text-sm mb-1">Rules</p>
              <p className="font-medium">{formattedEvent.rules}</p>
            </div>
          </div>
        </div>

        {/* Venue Information */}
        <div className="border border-[#343B4F] rounded-lg p-6 relative mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg">VENUE INFORMATION</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
            {/* Venue Name */}
            <div>
              <p className="text-sm mb-1">Venue Name</p>
              <p className="font-medium">{formattedEvent.venue.name}</p>
            </div>

            {/* Venue Address */}
            <div>
              <p className="text-sm mb-1">Venue Address</p>
              <p className="font-medium">{formattedEvent.venue.address}</p>
            </div>

            {/* Venue Contact Name */}
            <div>
              <p className="text-sm mb-1">Contact Name</p>
              <p className="font-medium">{formattedEvent.venue.contactName}</p>
            </div>

            {/* Venue Contact Phone */}
            <div>
              <p className="text-sm mb-1">Contact Phone</p>
              <p className="font-medium">{formattedEvent.venue.contactPhone}</p>
            </div>

            {/* Venue Contact Email */}
            <div>
              <p className="text-sm mb-1">Contact Email</p>
              <p className="font-medium">{formattedEvent.venue.contactEmail}</p>
            </div>

            {/* Venue Capacity */}
            <div>
              <p className="text-sm mb-1">Capacity</p>
              <p className="font-medium">{formattedEvent.venue.capacity}</p>
            </div>

            {/* Venue Map Link */}
            <div className="md:col-span-2">
              <p className="text-sm mb-1">Map Link</p>
              {formattedEvent.venue.mapLink !== "N/A" ? (
                <a
                  href={formattedEvent.venue.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-400 hover:underline"
                >
                  View on Map
                </a>
              ) : (
                <p className="font-medium">N/A</p>
              )}
            </div>
          </div>
        </div>

        {/* Promoter Information */}
        <div className="border border-[#343B4F] rounded-lg p-6 relative mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg">PROMOTER INFORMATION</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
            {/* Promoter Name */}
            <div>
              <p className="text-sm mb-1">Promoter Name</p>
              <p className="font-medium">{formattedEvent.promoter.name}</p>
            </div>

            {/* Promoter Abbreviation */}
            <div>
              <p className="text-sm mb-1">Abbreviation</p>
              <p className="font-medium">
                {formattedEvent.promoter.abbreviation}
              </p>
            </div>

            {/* Promoter Website */}
            <div>
              <p className="text-sm mb-1">Website</p>
              {formattedEvent.promoter.website !== "N/A" ? (
                <a
                  href={formattedEvent.promoter.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-400 hover:underline"
                >
                  {formattedEvent.promoter.website}
                </a>
              ) : (
                <p className="font-medium">N/A</p>
              )}
            </div>

            {/* Sanctioning Body */}
            <div>
              <p className="text-sm mb-1">Sanctioning Body</p>
              <p className="font-medium">
                {formattedEvent.promoter.sanctioningBody}
              </p>
            </div>

            {/* Contact Person */}
            <div>
              <p className="text-sm mb-1">Contact Person</p>
              <p className="font-medium">
                {formattedEvent.promoter.contactPerson}
              </p>
            </div>

            {/* Phone */}
            <div>
              <p className="text-sm mb-1">Phone</p>
              <p className="font-medium">{formattedEvent.promoter.phone}</p>
            </div>

            {/* Alternate Phone */}
            <div>
              <p className="text-sm mb-1">Alternate Phone</p>
              <p className="font-medium">
                {formattedEvent.promoter.alternatePhone}
              </p>
            </div>

            {/* Email */}
            <div>
              <p className="text-sm mb-1">Email</p>
              <p className="font-medium">{formattedEvent.promoter.email}</p>
            </div>

            {/* About Promoter */}
            <div className="md:col-span-2">
              <p className="text-sm mb-1">About</p>
              <p className="font-medium">{formattedEvent.promoter.about}</p>
            </div>
          </div>
        </div>

        {/* Sanctioning Information */}
        <div className="border border-[#343B4F] rounded-lg p-6 relative mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg">SANCTIONING INFORMATION</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
            {/* Sanctioning Body Name */}
            <div>
              <p className="text-sm mb-1">Sanctioning Body</p>
              <p className="font-medium">{formattedEvent.sanctioning.name}</p>
            </div>

            {/* Sanctioning Body Image */}
            {formattedEvent.sanctioning.image && (
              <div className="md:col-span-2">
                <p className="text-sm mb-1">Sanctioning Body Logo</p>
                <Image
                  src={formattedEvent.sanctioning.image}
                  alt="Sanctioning body logo"
                  width={150}
                  height={150}
                  className="rounded-lg"
                />
              </div>
            )}

            {/* Sanctioning Body Description */}
            <div className="md:col-span-2">
              <p className="text-sm mb-1">Description</p>
              <p className="font-medium">
                {formattedEvent.sanctioning.description}
              </p>
            </div>
          </div>
        </div>

        {/* ISKA Representative */}
        <div className="border border-[#343B4F] rounded-lg p-6 relative mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg">ISKA REPRESENTATIVE</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
            {/* ISKA Rep Name */}
            <div>
              <p className="text-sm mb-1">Name</p>
              <p className="font-medium">{formattedEvent.iskaRep.name}</p>
            </div>

            {/* ISKA Rep Phone */}
            <div>
              <p className="text-sm mb-1">Phone</p>
              <p className="font-medium">{formattedEvent.iskaRep.phone}</p>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="border border-[#343B4F] rounded-lg p-6 relative mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg">SYSTEM INFORMATION</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
            {/* Created By */}
            <div>
              <p className="text-sm mb-1">Created By</p>
              <p className="font-medium">{formattedEvent.createdBy}</p>
            </div>

            {/* Created At */}
            <div>
              <p className="text-sm mb-1">Created At</p>
              <p className="font-medium">{formattedEvent.createdAt}</p>
            </div>

            {/* Updated At */}
            <div>
              <p className="text-sm mb-1">Updated At</p>
              <p className="font-medium">{formattedEvent.updatedAt}</p>
            </div>

            {/* Is Draft */}
            <div>
              <p className="text-sm mb-1">Is Draft</p>
              <p className="font-medium">{formattedEvent.status.isDraft}</p>
            </div>

            {/* Publish Brackets */}
            <div>
              <p className="text-sm mb-1">Publish Brackets</p>
              <p className="font-medium">
                {formattedEvent.status.publishBrackets}
              </p>
            </div>
          </div>
        </div>
      </div>
      <TournamentSettingsModal
        eventId={eventId}
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        onSave={(updatedSettings) => {
          setTournamentSettings(updatedSettings);
        }}
        initialSettings={tournamentSettings} // Pass current settings to modal
      />
    </div>
  );
}
