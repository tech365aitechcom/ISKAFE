"use client";
import React, { useEffect, useState } from "react";
import { ChevronDown, Edit, Pencil } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "../../../../../../constants";
import Loader from "../../../../../_components/Loader";
import Image from "next/image";

export default function EventDetailsPage() {
  const params = useParams();
  const [eventId, setEventId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
    ageCategories: event.ageCategories?.length > 0 ? event.ageCategories.join(", ") : "N/A",
    weightClasses: event.weightClasses?.length > 0 ? event.weightClasses.join(", ") : "N/A",
    status: {
      isDraft: event.isDraft ? "Yes" : "No",
      publishBrackets: event.publishBrackets ? "Yes" : "No",
    },
    createdBy: `${event.createdBy?.firstName || ""} ${event.createdBy?.lastName || ""}`.trim() || "N/A",
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
                  <li className="mx-4 py-3 border-b border-[#6C6C6C]">
                    Fighter Check-in
                  </li>
                  <li className="mx-4 py-3 border-b border-[#6C6C6C]">
                    Bout List
                  </li>
                  <li className="mx-4 py-3 border-b border-[#6C6C6C]">
                    Spectator Ticket Redemption
                  </li>
                  <li className="mx-4 py-3 border-b border-[#6C6C6C]">
                    Cash Payment Tokens
                  </li>
                  <li className="mx-4 py-3">Reports</li>
                </ul>
              </div>
            )}
          </div>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

          {/* Bout Count */}
          <div className="border border-[#343B4F] rounded-lg p-4 relative">
            <div className="flex justify-between items-start">
              <span className="text-sm text-[#AEB9E1]">Bout Count</span>
              <Link href={`/admin/events/${eventId}/tournament-brackets`}>
                <button className="">
                  <Pencil size={16} />
                </button>
              </Link>
            </div>
            <div className="mt-2">
              <h2 className="text-2xl font-bold">
                {formattedEvent.stats.boutCount.value}
              </h2>
              <p className="text-sm text-[#AEB9E1] mt-2 whitespace-pre-line">
                {formattedEvent.stats.boutCount.breakdown}
              </p>
            </div>
          </div>

          {/* Registration Fee */}
          <div className="border border-[#343B4F] rounded-lg p-4 relative">
            <div className="flex justify-between items-start">
              <span className="text-sm text-[#AEB9E1]">Registration Fee</span>
              <button className="">
                <Pencil size={16} />
              </button>
            </div>
            <div className="mt-2">
              <h2 className="text-2xl font-bold">
                <span>{formattedEvent.stats.registrationFee.fighter}</span>
                <span className="text-sm">/Fighter</span>
                <span className="ml-2">
                  {formattedEvent.stats.registrationFee.trainer}
                </span>
                <span className="text-sm">/Trainer</span>
              </h2>
              <p className="text-sm text-[#AEB9E1] mt-2 whitespace-pre-line">
                {formattedEvent.stats.registrationFee.breakdown}
              </p>
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

        {/* Event Properties */}
        <div className="border border-[#343B4F] rounded-lg p-6 relative mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg">EVENT PROPERTIES</h2>
          </div>

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
              <p className="font-medium">{formattedEvent.registrationStartDate}</p>
            </div>

            {/* Registration Deadline */}
            <div>
              <p className="text-sm mb-1">Registration Deadline</p>
              <p className="font-medium">{formattedEvent.registrationDeadline}</p>
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
              <p className="font-medium">{formattedEvent.spectatorDoorsOpenTime}</p>
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
              <p className="font-medium">{formattedEvent.promoter.abbreviation}</p>
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
              <p className="font-medium">{formattedEvent.promoter.sanctioningBody}</p>
            </div>

            {/* Contact Person */}
            <div>
              <p className="text-sm mb-1">Contact Person</p>
              <p className="font-medium">{formattedEvent.promoter.contactPerson}</p>
            </div>

            {/* Phone */}
            <div>
              <p className="text-sm mb-1">Phone</p>
              <p className="font-medium">{formattedEvent.promoter.phone}</p>
            </div>

            {/* Alternate Phone */}
            <div>
              <p className="text-sm mb-1">Alternate Phone</p>
              <p className="font-medium">{formattedEvent.promoter.alternatePhone}</p>
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
              <p className="font-medium">{formattedEvent.sanctioning.description}</p>
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
              <p className="font-medium">{formattedEvent.status.publishBrackets}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}