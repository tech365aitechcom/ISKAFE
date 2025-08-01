"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Edit, Pencil, Save, Upload, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "../../../../../../constants";
import Loader from "../../../../../_components/Loader";
import Image from "next/image";
import { enqueueSnackbar } from "notistack";
import useStore from "../../../../../../stores/useStore";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const user = useStore((state) => state.user);
  const [eventId, setEventId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    registrationDeadline: "",
    registrationStartDate: "",
    endDate: "",
  });
  const [imageUploading, setImageUploading] = useState({
    poster: false,
    sanctioningBody: false,
    licenseCertificate: false,
  });

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (params?.id) {
      setEventId(params.id);
      fetchEventData(params.id);
    }
  }, [params]);

  const fetchEventData = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/events/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch event data");
      }
      const data = await response.json();
      if (data.success) {
        setEvent(data.data);
      } else {
        throw new Error(data.message || "Error fetching event");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEvent((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when user edits the field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleVenueChange = (e) => {
    const { name, value } = e.target;
    setEvent((prev) => ({
      ...prev,
      venue: {
        ...prev.venue,
        [name]: value,
      },
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setEvent((prev) => ({
      ...prev,
      venue: {
        ...prev.venue,
        address: {
          ...prev.venue?.address,
          [name]: value,
        },
      },
    }));
  };

  const handlePromoterChange = (e) => {
    const { name, value } = e.target;
    setEvent((prev) => ({
      ...prev,
      promoter: {
        ...prev.promoter,
        [name]: value,
      },
    }));
  };

  const handleUserIdChange = (e) => {
    const { name, value } = e.target;
    setEvent((prev) => ({
      ...prev,
      promoter: {
        ...prev.promoter,
        userId: {
          ...prev.promoter?.userId,
          [name]: value,
        },
      },
    }));
  };

  const handleSanctioningChange = (e) => {
    const { name, value } = e.target;
    setEvent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
const normalizeDate = (dateString) => {
  const date = new Date(dateString);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
};
 const validateDates = () => {
  const errors = {};
  let isValid = true;

  // Required fields validation
  if (!event.startDate) {
    errors.startDate = "Start date is required";
    isValid = false;
  }

  if (!event.endDate) {
    errors.endDate = "End date is required";
    isValid = false;
  }

  if (!event.registrationStartDate) {
    errors.registrationStartDate = "Registration start date is required";
    isValid = false;
  }

  if (!event.registrationDeadline) {
    errors.registrationDeadline = "Registration deadline is required";
    isValid = false;
  }

  // Only proceed with comparisons if we have all dates
  if (event.startDate && event.endDate && event.registrationStartDate && event.registrationDeadline) {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const regStart = new Date(event.registrationStartDate);
    const regDeadline = new Date(event.registrationDeadline);

    console.log("Date validation - Start:", startDate, "End:", endDate, "RegStart:", regStart, "RegDeadline:", regDeadline);

    // Backend validation rules:
    // 1. Registration start must be before registration deadline
    if (regStart >= regDeadline) {
      errors.registrationStartDate = "Registration start must be before deadline";
      isValid = false;
    }

    // 2. Registration deadline must be before event start
    if (regDeadline >= startDate) {
      errors.registrationDeadline = "Registration deadline must be before event start";
      isValid = false;
    }

    // 3. Registration start must be before event start
    if (regStart >= startDate) {
      errors.registrationStartDate = "Registration start must be before event start";
      isValid = false;
    }

    // 4. End date must be after start date
    if (endDate <= startDate) {
      errors.endDate = "End date must be after start date";
      isValid = false;
    }
  }

  console.log("Date validation result:", { isValid, errors });
  return { isValid, errors };
};

  const handleDateBlur = (e) => {
    const { isValid, errors } = validateDates();
    setValidationErrors(errors);
  };

  const validateEvent = () => {
    console.log("Validating event with current dates:");
    console.log("- Start Date:", event.startDate);
    console.log("- End Date:", event.endDate);
    console.log("- Registration Start:", event.registrationStartDate);
    console.log("- Registration Deadline:", event.registrationDeadline);
    
    const { isValid, errors } = validateDates();
    setValidationErrors(errors);
    
    if (!isValid) {
      console.log("Frontend validation failed:", errors);
      enqueueSnackbar("Please fix date validation errors: " + Object.values(errors).join(", "), { variant: "error" });
      return false;
    }
    
    // Check required fields
    if (!event.name?.trim()) {
      enqueueSnackbar("Event name is required", { variant: "error" });
      return false;
    }
    
    console.log("Frontend validation passed");
    return true;
  };

  const normalizeDateForServer = (date) =>
  new Date(new Date(date).getTime() - new Date(date).getTimezoneOffset() * 60000).toISOString();


const normalizeEventDates = (event) => ({
  ...event,
  startDate: normalizeDateForServer(event.startDate),
  endDate: normalizeDateForServer(event.endDate),
  registrationStartDate: normalizeDateForServer(event.registrationStartDate),
  registrationDeadline: normalizeDateForServer(event.registrationDeadline),
  weighInDateTime: normalizeDateForServer(event.weighInDateTime),
});


const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Form submitted, starting validation...");

  const normalizeDateForServer = (date) => {
    if (!date) return null;
    // Simply convert to ISO string without complex timezone manipulation
    return new Date(date).toISOString();
  };

  console.log("Validating event...");
  if (!validateEvent()) {
    console.log("Validation failed, returning early");
    return;
  }

  console.log("Validation passed, setting isEditing to true");
  setIsEditing(true);
  try {
    // Create a normalized event with all necessary fields
    const normalizedEvent = {
      // Basic fields
      name: event.name,
      format: event.format,
      koPolicy: event.koPolicy,
      sportType: event.sportType,
      poster: event.poster,
      
      // Dates
      startDate: normalizeDateForServer(event.startDate),
      endDate: normalizeDateForServer(event.endDate),
      registrationStartDate: normalizeDateForServer(event.registrationStartDate),
      registrationDeadline: normalizeDateForServer(event.registrationDeadline),
      weighInDateTime: normalizeDateForServer(event.weighInDateTime),
      
      // Times (as strings)
      rulesMeetingTime: event.rulesMeetingTime || "",
      spectatorDoorsOpenTime: event.spectatorDoorsOpenTime || "",
      fightStartTime: event.fightStartTime,
      
      // References (send only the IDs)
      venue: event.venue?._id || event.venue,
      promoter: event.promoter?._id || event.promoter,
      
      // Contact info
      iskaRepName: event.iskaRepName || "",
      iskaRepPhone: event.iskaRepPhone || "",
      
      // Descriptions
      briefDescription: event.briefDescription,
      fullDescription: event.fullDescription || "",
      rules: event.rules || "",
      
      // Other fields
      matchingMethod: event.matchingMethod,
      externalURL: event.externalURL || "",
      ageCategories: event.ageCategories || [],
      weightClasses: event.weightClasses || [],
      
      // Sectioning body
      sectioningBodyName: event.sectioningBodyName,
      sectioningBodyDescription: event.sectioningBodyDescription || "",
      sectioningBodyImage: event.sectioningBodyImage || "",
      
      // Publishing options
      isDraft: event.isDraft,
      publishBrackets: event.publishBrackets,
    };

    console.log("Checking required fields:");
    console.log("- weighInDateTime:", normalizedEvent.weighInDateTime);
    console.log("- venue (ID):", normalizedEvent.venue);
    console.log("- promoter (ID):", normalizedEvent.promoter);
    console.log("- briefDescription:", normalizedEvent.briefDescription);
    console.log("- sectioningBodyName:", normalizedEvent.sectioningBodyName);

    console.log("Making API call to:", `${API_BASE_URL}/events/${eventId}`);
    console.log("Current user:", user);
    console.log("Event creator:", event?.createdBy);
    console.log("Normalized dates being sent:");
    console.log("- Start Date:", normalizedEvent.startDate);
    console.log("- End Date:", normalizedEvent.endDate);
    console.log("- Registration Start:", normalizedEvent.registrationStartDate);
    console.log("- Registration Deadline:", normalizedEvent.registrationDeadline);
    console.log("Full Payload:", normalizedEvent);

    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify(normalizedEvent),
    });

    const data = await response.json();
    console.log("Server response:", data);

    if (!response.ok) {
      console.log("Server error response:", response.status, data);
      // Handle validation errors specifically
      if (response.status === 400 && data.error) {
        throw new Error(data.error);
      }
      // Handle 500 errors with more detail
      if (response.status === 500) {
        throw new Error(data.error || data.message || "Internal server error occurred");
      }
      throw new Error(data.message || "Failed to update event");
    }

    if (data.success) {
      enqueueSnackbar("Event updated successfully", { variant: "success" });
      // Optionally redirect back to events list
      // router.push("/admin/events");
    } else {
      throw new Error(data.message || "Failed to update event");
    }
  } catch (error) {
    console.error("Error updating event:", error);
    enqueueSnackbar(error.message || "Failed to update event", { variant: "error" });
  } finally {
    setIsEditing(false);
  }
};



  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading((prev) => ({ ...prev, [fieldName]: true }));

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Image upload failed");
      }

      // Update the appropriate field based on fieldName
      if (fieldName === "poster") {
        setEvent((prev) => ({ ...prev, poster: data.url }));
      } else if (fieldName === "sectioningBodyImage") {
        setEvent((prev) => ({ ...prev, sectioningBodyImage: data.url }));
      } else if (fieldName === "licenseCertificate") {
        setEvent((prev) => ({
          ...prev,
          promoter: {
            ...prev.promoter,
            licenseCertificate: data.url,
          },
        }));
      }

      enqueueSnackbar("Image uploaded successfully", { variant: "success" });
    } catch (err) {
      enqueueSnackbar(err.message || "Failed to upload image", {
        variant: "error",
      });
    } finally {
      setImageUploading((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const removeImage = (fieldName) => {
    if (fieldName === "poster") {
      setEvent((prev) => ({ ...prev, poster: "" }));
    } else if (fieldName === "sectioningBodyImage") {
      setEvent((prev) => ({ ...prev, sectioningBodyImage: "" }));
    } else if (fieldName === "licenseCertificate") {
      setEvent((prev) => ({
        ...prev,
        promoter: {
          ...prev.promoter,
          licenseCertificate: "",
        },
      }));
    }
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
          <div className="flex items-center gap-4">
            <Link href={`/admin/events/`}>
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
            <h1 className="text-2xl font-bold">Edit Event: {event.name}</h1>
          </div>
          <div className="relative w-64">
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
                  <li className="mx-4 py-3 border-b border-[#6C6C6C]">
                    Spectator Ticket Redemption
                  </li>
                  <li className="mx-4 py-3 border-b border-[#6C6C6C]">
                    Cash Payment Tokens
                  </li>
                  <li className="mx-4 py-3 border-b border-[#6C6C6C] border-t-2 border-t-gray-500">
                    Reports
                  </li>
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

        <form onSubmit={handleSubmit}>
          {/* Event Poster */}
          <div className="mb-6">
            <label className="text-sm mb-1 block">Event Poster</label>
            <div className="flex items-center gap-4 mb-2">
              <label className="relative cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#0A1330] border border-[#343B4F] rounded hover:bg-[#1a2240] transition-colors">
                  <Upload size={16} />
                  <span>{event.poster ? "Change Image" : "Upload Image"}</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "poster")}
                  disabled={imageUploading.poster}
                />
              </label>
              {event.poster && (
                <button
                  type="button"
                  onClick={() => removeImage("poster")}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                >
                  <X size={16} />
                  <span>Remove</span>
                </button>
              )}
            </div>
            {imageUploading.poster ? (
              <div className="flex items-center justify-center h-64 bg-[#0A1330] rounded-lg">
                <Loader size={24} />
              </div>
            ) : event.poster ? (
              <div className="relative w-full max-w-md h-64">
                <Image
                  src={event.poster}
                  alt="Event poster"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-[#0A1330] rounded-lg text-gray-400">
                No poster uploaded
              </div>
            )}
          </div>

          {/* Event Properties */}
          <div className="border border-[#343B4F] rounded-lg p-6 relative mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg">EVENT PROPERTIES</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
              {/* Event Name */}
              <div>
                <label className="text-sm mb-1 block">Event Name</label>
                <input
                  type="text"
                  name="name"
                  value={event.name || ""}
                  onChange={handleInputChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                  required
                />
              </div>

              {/* Event Format */}
              <div>
                <label className="text-sm mb-1 block">Event Format</label>
                <input
                  type="text"
                  name="format"
                  value={event.format || ""}
                  onChange={handleInputChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* KO Policy */}
              <div>
                <label className="text-sm mb-1 block">KO Policy</label>
                <input
                  type="text"
                  name="koPolicy"
                  value={event.koPolicy || ""}
                  onChange={handleInputChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Sport Type */}
              <div>
                <label className="text-sm mb-1 block">Sport Type</label>
                <input
                  type="text"
                  name="sportType"
                  value={event.sportType || ""}
                  onChange={handleInputChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="text-sm mb-1 block">Start Date</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={
                    event.startDate
                      ? new Date(event.startDate).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={handleInputChange}
                  onBlur={handleDateBlur}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <label className="text-sm mb-1 block">End Date</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={
                    event.endDate
                      ? new Date(event.endDate).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={handleInputChange}
                   onBlur={handleDateBlur}
                  className={`w-full bg-[#0A1330] border ${
                    validationErrors.endDate
                      ? "border-red-500"
                      : "border-[#343B4F]"
                  } rounded px-3 py-2`}
                  required
                />
                {validationErrors.endDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.endDate}
                  </p>
                )}
              </div>

              {/* Registration Start Date */}
              <div>
                <label className="text-sm mb-1 block">
                  Registration Start Date
                </label>
                <input
                  type="datetime-local"
                  name="registrationStartDate"
                  value={
                    event.registrationStartDate
                      ? new Date(event.registrationStartDate)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={handleInputChange}
                   onBlur={handleDateBlur}
                  className={`w-full bg-[#0A1330] border ${
                    validationErrors.registrationStartDate
                      ? "border-red-500"
                      : "border-[#343B4F]"
                  } rounded px-3 py-2`}
                />
                {validationErrors.registrationStartDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.registrationStartDate}
                  </p>
                )}
              </div>

              {/* Registration Deadline */}
              <div>
                <label className="text-sm mb-1 block">
                  Registration Deadline
                </label>
                <input
                  type="datetime-local"
                  name="registrationDeadline"
                  value={
                    event.registrationDeadline
                      ? new Date(event.registrationDeadline)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={handleInputChange}
                   onBlur={handleDateBlur}
                  className={`w-full bg-[#0A1330] border ${
                    validationErrors.registrationDeadline
                      ? "border-red-500"
                      : "border-[#343B4F]"
                  } rounded px-3 py-2`}
                />
                {validationErrors.registrationDeadline && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.registrationDeadline}
                  </p>
                )}
              </div>

              {/* Weigh-in Date/Time */}
              <div>
                <label className="text-sm mb-1 block">Weigh-in Date/Time</label>
                <input
                  type="datetime-local"
                  name="weighInDateTime"
                  value={
                    event.weighInDateTime
                      ? new Date(event.weighInDateTime)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={handleInputChange}
                  onBlur={handleDateBlur}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Rules Meeting Time */}
              <div>
                <label className="text-sm mb-1 block">Rules Meeting Time</label>
                <input
                  type="text"
                  name="rulesMeetingTime"
                  value={event.rulesMeetingTime || ""}
                  onChange={handleInputChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Spectator Doors Open Time */}
              <div>
                <label className="text-sm mb-1 block">
                  Spectator Doors Open Time
                </label>
                <input
                  type="text"
                  name="spectatorDoorsOpenTime"
                  value={event.spectatorDoorsOpenTime || ""}
                  onChange={handleInputChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Fight Start Time */}
              <div>
                <label className="text-sm mb-1 block">Fight Start Time</label>
                <input
                  type="text"
                  name="fightStartTime"
                  value={event.fightStartTime || ""}
                  onChange={handleInputChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Brief Description */}
              <div className="md:col-span-2">
                <label className="text-sm mb-1 block">Short Description</label>
                <textarea
                  name="briefDescription"
                  value={event.briefDescription || ""}
                  onChange={handleInputChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                  rows={3}
                />
              </div>

              {/* Full Description */}
              <div className="md:col-span-2">
                <label className="text-sm mb-1 block">Full Description</label>
                <textarea
                  name="fullDescription"
                  value={event.fullDescription || ""}
                  onChange={handleInputChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                  rows={5}
                />
              </div>

              {/* Rules */}
              <div className="md:col-span-2">
                <label className="text-sm mb-1 block">Rules</label>
                <textarea
                  name="rules"
                  value={event.rules || ""}
                  onChange={handleInputChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                  rows={5}
                />
              </div>

              {/* Matching Method */}
              <div>
                <label className="text-sm mb-1 block">Matching Method</label>
                <input
                  type="text"
                  name="matchingMethod"
                  value={event.matchingMethod || ""}
                  onChange={handleInputChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Age Categories */}
              <div>
                <label className="text-sm mb-1 block">
                  Age Categories (comma separated)
                </label>
                <input
                  type="text"
                  name="ageCategories"
                  value={event.ageCategories?.join(", ") || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEvent((prev) => ({
                      ...prev,
                      ageCategories: value
                        .split(",")
                        .map((item) => item.trim()),
                    }));
                  }}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Weight Classes */}
              <div>
                <label className="text-sm mb-1 block">
                  Weight Classes (comma separated)
                </label>
                <input
                  type="text"
                  name="weightClasses"
                  value={event.weightClasses?.join(", ") || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEvent((prev) => ({
                      ...prev,
                      weightClasses: value
                        .split(",")
                        .map((item) => item.trim()),
                    }));
                  }}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Sanctioning Body Name */}
              <div>
                <label className="text-sm mb-1 block">
                  Sanctioning Body Name
                </label>
                <input
                  type="text"
                  name="sectioningBodyName"
                  value={event.sectioningBodyName || ""}
                  onChange={handleInputChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Sanctioning Body Description */}
              <div>
                <label className="text-sm mb-1 block">
                  Sanctioning Body Description
                </label>
                <input
                  type="text"
                  name="sectioningBodyDescription"
                  value={event.sectioningBodyDescription || ""}
                  onChange={handleInputChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Sanctioning Body Image */}
              <div className="md:col-span-2">
                <label className="text-sm mb-1 block">
                  Sanctioning Body Logo
                </label>
                <div className="flex items-center gap-4 mb-2">
                  <label className="relative cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#0A1330] border border-[#343B4F] rounded hover:bg-[#1a2240] transition-colors">
                      <Upload size={16} />
                      <span>
                        {event.sectioningBodyImage
                          ? "Change Image"
                          : "Upload Image"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageUpload(e, "sectioningBodyImage")
                      }
                      disabled={imageUploading.sectioningBodyImage}
                    />
                  </label>
                  {event.sectioningBodyImage && (
                    <button
                      type="button"
                      onClick={() => removeImage("sectioningBodyImage")}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                    >
                      <X size={16} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                {imageUploading.sectioningBodyImage ? (
                  <div className="flex items-center justify-center h-32 bg-[#0A1330] rounded-lg">
                    <Loader size={24} />
                  </div>
                ) : event.sectioningBodyImage ? (
                  <div className="relative w-32 h-32">
                    <Image
                      src={event.sectioningBodyImage}
                      alt="Sanctioning body logo"
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 bg-[#0A1330] rounded-lg text-gray-400">
                    No logo uploaded
                  </div>
                )}
              </div>

              {/* ISKA Rep Name */}
              <div>
                <label className="text-sm mb-1 block">
                  ISKA Representative Name
                </label>
                <input
                  type="text"
                  name="iskaRepName"
                  value={event.iskaRepName || ""}
                  onChange={handleInputChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* ISKA Rep Phone */}
              <div>
                <label className="text-sm mb-1 block">
                  ISKA Representative Phone
                </label>
                <input
                  type="text"
                  name="iskaRepPhone"
                  value={event.iskaRepPhone || ""}
                  onChange={handleInputChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Venue Information */}
          <div className="border border-[#343B4F] rounded-lg p-6 relative mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg">VENUE INFORMATION</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
              {/* Venue Name */}
              <div>
                <label className="text-sm mb-1 block">Venue Name</label>
                <input
                  type="text"
                  name="name"
                  value={event.venue?.name || ""}
                  onChange={handleVenueChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Venue Contact Name */}
              <div>
                <label className="text-sm mb-1 block">Contact Name</label>
                <input
                  type="text"
                  name="contactName"
                  value={event.venue?.contactName || ""}
                  onChange={handleVenueChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Venue Contact Phone */}
              <div>
                <label className="text-sm mb-1 block">Contact Phone</label>
                <input
                  type="text"
                  name="contactPhone"
                  value={event.venue?.contactPhone || ""}
                  onChange={handleVenueChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Venue Contact Email */}
              <div>
                <label className="text-sm mb-1 block">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={event.venue?.contactEmail || ""}
                  onChange={handleVenueChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Venue Capacity */}
              <div>
                <label className="text-sm mb-1 block">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={event.venue?.capacity || ""}
                  onChange={handleVenueChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Venue Map Link */}
              <div>
                <label className="text-sm mb-1 block">Map Link</label>
                <input
                  type="text"
                  name="mapLink"
                  value={event.venue?.mapLink || ""}
                  onChange={handleVenueChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Venue Address - Street 1 */}
              <div>
                <label className="text-sm mb-1 block">Street Address 1</label>
                <input
                  type="text"
                  name="street1"
                  value={event.venue?.address?.street1 || ""}
                  onChange={handleAddressChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Venue Address - Street 2 */}
              <div>
                <label className="text-sm mb-1 block">Street Address 2</label>
                <input
                  type="text"
                  name="street2"
                  value={event.venue?.address?.street2 || ""}
                  onChange={handleAddressChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Venue Address - City */}
              <div>
                <label className="text-sm mb-1 block">City</label>
                <input
                  type="text"
                  name="city"
                  value={event.venue?.address?.city || ""}
                  onChange={handleAddressChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Venue Address - State */}
              <div>
                <label className="text-sm mb-1 block">State</label>
                <input
                  type="text"
                  name="state"
                  value={event.venue?.address?.state || ""}
                  onChange={handleAddressChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Venue Address - Postal Code */}
              <div>
                <label className="text-sm mb-1 block">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={event.venue?.address?.postalCode || ""}
                  onChange={handleAddressChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Venue Address - Country */}
              <div>
                <label className="text-sm mb-1 block">Country</label>
                <input
                  type="text"
                  name="country"
                  value={event.venue?.address?.country || ""}
                  onChange={handleAddressChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Promoter Information */}
          <div className="border border-[#343B4F] rounded-lg p-6 relative mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg">PROMOTER INFORMATION</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
              {/* Promoter Name */}
              <div>
                <label className="text-sm mb-1 block">Promoter Name</label>
                <input
                  type="text"
                  name="name"
                  value={event.promoter?.name || ""}
                  onChange={handlePromoterChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Promoter Abbreviation */}
              <div>
                <label className="text-sm mb-1 block">Abbreviation</label>
                <input
                  type="text"
                  name="abbreviation"
                  value={event.promoter?.abbreviation || ""}
                  onChange={handlePromoterChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Promoter Website */}
              <div>
                <label className="text-sm mb-1 block">Website URL</label>
                <input
                  type="text"
                  name="websiteURL"
                  value={event.promoter?.websiteURL || ""}
                  onChange={handlePromoterChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Sanctioning Body */}
              <div>
                <label className="text-sm mb-1 block">Sanctioning Body</label>
                <input
                  type="text"
                  name="sanctioningBody"
                  value={event.promoter?.sanctioningBody || ""}
                  onChange={handlePromoterChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* License Certificate */}
              <div className="md:col-span-2">
                <label className="text-sm mb-1 block">
                  License Certificate
                </label>
                <div className="flex items-center gap-4 mb-2">
                  <label className="relative cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#0A1330] border border-[#343B4F] rounded hover:bg-[#1a2240] transition-colors">
                      <Upload size={16} />
                      <span>
                        {event.promoter?.licenseCertificate
                          ? "Change Image"
                          : "Upload Image"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageUpload(e, "licenseCertificate")
                      }
                      disabled={imageUploading.licenseCertificate}
                    />
                  </label>
                  {event.promoter?.licenseCertificate && (
                    <button
                      type="button"
                      onClick={() => removeImage("licenseCertificate")}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                    >
                      <X size={16} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                {imageUploading.licenseCertificate ? (
                  <div className="flex items-center justify-center h-32 bg-[#0A1330] rounded-lg">
                    <Loader size={24} />
                  </div>
                ) : event.promoter?.licenseCertificate ? (
                  <div className="relative w-full max-w-md h-64">
                    <Image
                      src={event.promoter.licenseCertificate}
                      alt="License certificate"
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 bg-[#0A1330] rounded-lg text-gray-400">
                    No certificate uploaded
                  </div>
                )}
              </div>

              {/* Contact Person Name */}
              <div>
                <label className="text-sm mb-1 block">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  name="contactPersonName"
                  value={event.promoter?.contactPersonName || ""}
                  onChange={handlePromoterChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Alternate Phone Number */}
              <div>
                <label className="text-sm mb-1 block">
                  Alternate Phone Number
                </label>
                <input
                  type="text"
                  name="alternatePhoneNumber"
                  value={event.promoter?.alternatePhoneNumber || ""}
                  onChange={handlePromoterChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* User First Name */}
              <div>
                <label className="text-sm mb-1 block">User First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={event.promoter?.userId?.firstName || ""}
                  onChange={handleUserIdChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* User Last Name */}
              <div>
                <label className="text-sm mb-1 block">User Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={event.promoter?.userId?.lastName || ""}
                  onChange={handleUserIdChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* User Email */}
              <div>
                <label className="text-sm mb-1 block">User Email</label>
                <input
                  type="email"
                  name="email"
                  value={event.promoter?.userId?.email || ""}
                  onChange={handleUserIdChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* User Phone */}
              <div>
                <label className="text-sm mb-1 block">User Phone</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={event.promoter?.userId?.phoneNumber || ""}
                  onChange={handleUserIdChange}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="border border-[#343B4F] rounded-lg p-6 relative mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg">SYSTEM INFORMATION</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
              {/* Is Draft */}
              <div>
                <label className="text-sm mb-1 block">Is Draft</label>
                <select
                  name="isDraft"
                  value={event.isDraft ? "true" : "false"}
                  onChange={(e) => {
                    setEvent((prev) => ({
                      ...prev,
                      isDraft: e.target.value === "true",
                    }));
                  }}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              {/* Publish Brackets */}
              <div>
                <label className="text-sm mb-1 block">Publish Brackets</label>
                <select
                  name="publishBrackets"
                  value={event.publishBrackets ? "true" : "false"}
                  onChange={(e) => {
                    setEvent((prev) => ({
                      ...prev,
                      publishBrackets: e.target.value === "true",
                    }));
                  }}
                  className="w-full bg-[#0A1330] border border-[#343B4F] rounded px-3 py-2"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              disabled={isEditing}
            >
              {isEditing ? (
                <>
                  <Loader size={20} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
