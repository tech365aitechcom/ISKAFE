"use client"
import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../../../constants/index";
import EventCard from "../_components/EventCard";
import Loader from "../../_components/Loader";
import { getEventStatus, fetchTournamentSettings } from "../../../utils/eventUtils";
import { City, Country, State } from "country-state-city";
import Pagination from "../../_components/Pagination";

const EventsPage = () => {
  // Filters
  const [country, setCountry] = useState(""); // isoCode
  const [state, setState] = useState(""); // isoCode
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [keyword, setKeyword] = useState("");

  // Data & UI state
  const [events, setEvents] = useState([]);
  const [tournamentSettings, setTournamentSettings] = useState({});
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9;

  // Country / State / City lists
  const countries = Country.getAllCountries();
  const states = country ? State.getStatesOfCountry(country) : [];
  const cities = country && state ? City.getCitiesOfState(country, state) : [];

  // Helper to build a safe human-readable location string
  const buildLocation = (event) => {
    if (!event) return "";
    const addr = (event.venue && event.venue.address) || {};
    const parts = [
      event.venue && event.venue.name,
      addr.country,
      addr.state,
      addr.city,
      addr.street1,
      addr.street2,
      addr.postalCode,
    ];
    return parts.filter(Boolean).join(", ");
  };

  // Fetch events and tournament settings
  const getEvents = async ({ country: c, state: s, city: ci, date: d, keyword: k, page: p } = {}) => {
    setLoading(true);
    try {
      const currentPage = p || page;
      let queryParams = `?isPublished=true&page=${currentPage}&limit=${limit}`;

      if (c) queryParams += `&country=${encodeURIComponent(c)}`;
      if (s) queryParams += `&state=${encodeURIComponent(s)}`;
      if (ci) queryParams += `&city=${encodeURIComponent(ci)}`;
      if (d) queryParams += `&date=${encodeURIComponent(d)}`;
      if (k) queryParams += `&search=${encodeURIComponent(k)}`;

      const response = await axios.get(`${API_BASE_URL}/events${queryParams}`);
      const eventItems = (response && response.data && response.data.data && response.data.data.items) || [];
      const pagination = (response && response.data && response.data.data && response.data.data.pagination) || { totalPages: 1 };

      setEvents(eventItems);
      setTotalPages(pagination.totalPages || 1);

      // fetch tournament settings for each event concurrently
      const settingsPromises = eventItems.map(async (event) => {
        try {
          const settings = await fetchTournamentSettings(event._id);
          return { eventId: event._id, settings };
        } catch (err) {
          console.error(`Error fetching tournament settings for event ${event._id}:`, err);
          return { eventId: event._id, settings: null };
        }
      });

      const settingsResults = await Promise.all(settingsPromises);
      const settingsMap = {};
      settingsResults.forEach(({ eventId, settings }) => {
        settingsMap[eventId] = settings;
      });
      setTournamentSettings(settingsMap);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and whenever page changes (keeps current filters)
  useEffect(() => {
    const stateName = State.getStatesOfCountry(country).find((s) => s.isoCode === state)?.name;
    getEvents({ country, state: stateName, city, date, keyword, page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Search button handler
  const handleSearch = () => {
    // Convert state isoCode to name if API expects name
    const stateName = State.getStatesOfCountry(country).find((s) => s.isoCode === state)?.name;
    setPage(1); // reset to first page for new search
    getEvents({ country, state: stateName, city, date, keyword, page: 1 });
  };

  // Reset filters
  const handleReset = () => {
    setCountry("");
    setState("");
    setCity("");
    setDate("");
    setKeyword("");
    setPage(1);
    getEvents({ country: "", state: "", city: "", date: "", keyword: "", page: 1 });
  };

  return (
    <div className="relative w-full">
      <div className="bg-purple-900">
        <div className="absolute inset-0 bg-transparent opacity-90 pointer-events-none" />
        <div className="relative w-full max-w-6xl mx-auto px-4 pt-16 pb-32">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white">UPCOMING EVENTS AND</h1>
            <h1 className="text-4xl md:text-5xl font-bold text-red-500">TOURNAMENTS</h1>
          </div>

          <div className="absolute left-0 right-0 mx-auto px-4 w-full max-w-5xl" style={{ top: "70%" }}>
            <div className="bg-purple-950 rounded-xl p-8 shadow-xl">
              {/* Keyword Search */}
              <div className="mb-5">
                <label className="text-white text-sm mb-2 block">Keyword Search</label>
                <input
                  type="text"
                  className="w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search events by name or description..."
                />
              </div>

              <div className="grid grid-cols-1 mt-6 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-start">
                  <label className="text-white text-sm mb-2">Country</label>
                  <div className="relative w-full">
                    <select
                      className="appearance-none w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500"
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        setState("");
                        setCity("");
                      }}
                    >
                      <option value="" className="bg-purple-900">Select</option>
                      {countries.map((ct) => (
                        <option key={ct.isoCode} value={ct.isoCode} className="bg-purple-900">
                          {ct.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start">
                  <label className="text-white text-sm mb-2">State</label>
                  <div className="relative w-full">
                    <select
                      className="appearance-none w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500"
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value);
                        setCity("");
                      }}
                      disabled={!country}
                    >
                      <option value="" className="bg-purple-900">Select</option>
                      {states.map((s) => (
                        <option key={s.isoCode} value={s.isoCode} className="bg-purple-900">
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start">
                  <label className="text-white text-sm mb-2">City</label>
                  <div className="relative w-full">
                    <select
                      className="appearance-none w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={!country || !state}
                    >
                      <option value="" className="bg-purple-900">Select</option>
                      {cities.map((ct) => (
                        <option key={ct.name} value={ct.name} className="bg-purple-900">
                          {ct.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start">
                  <label className="text-white text-sm mb-2">Start Date</label>
                  <input
                    type="date"
                    className="w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="Select Date"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleSearch}
                  className="bg-red-500 text-white px-12 py-3 rounded font-medium hover:bg-red-600 transition-colors"
                >
                  Search
                </button>

                {(country || state || city || date || keyword) && (
                  <button
                    onClick={handleReset}
                    className="bg-gray-500 text-white ml-4 px-12 py-3 rounded font-medium hover:bg-gray-600 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-32 bg-black" />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-black">
          <Loader />
        </div>
      ) : (
        <div className="bg-black w-full mx-auto px-4 py-52 md:py-16 flex flex-wrap justify-center gap-10 items-center">
          {events.length === 0 ? (
            <div className="text-white text-center w-full">No events found.</div>
          ) : (
            events.map((event) => (
              <EventCard
                key={event._id}
                imageUrl={event.poster}
                id={event._id}
                imageAlt={event.name}
                location={buildLocation(event)}
                eventDate={event.startDate}
                name={event.name}
                description={event.briefDescription}
                status={getEventStatus(event.startDate, event.endDate)}
                registrationDeadline={event.registrationDeadline || event.startDate}
                tournamentSettings={tournamentSettings[event._id]}
              />
            ))
          )}
        </div>
      )}

      <div className="bg-black pb-8">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default EventsPage;
