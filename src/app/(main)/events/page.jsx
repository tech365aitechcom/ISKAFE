"use client";
import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../../../constants/index";
import EventCard from "../_components/EventCard";
import Loader from "../../_components/Loader";
import { getEventStatus } from "../../../utils/eventUtils";
import { City, Country, State } from "country-state-city";
import Pagination from "../../_components/Pagination";

const EventsPage = () => {
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9;

  const countries = Country.getAllCountries();
  const states = country ? State.getStatesOfCountry(country) : [];
  const cities = country && state ? City.getCitiesOfState(country, state) : [];

  const getEvents = async ({ country, state, city, date }) => {
    try {
      let queryParams = `?isPublished=true&page=${page}&limit=${limit}`;
      if (country) queryParams += `&country=${country}`;
      if (state) queryParams += `&state=${state}`;
      if (city) queryParams += `&city=${city}`;
      if (date) queryParams += `&date=${date}`;
      const response = await axios.get(`${API_BASE_URL}/events${queryParams}`);
      console.log("Response:", response.data);

      setEvents(response.data.data.items);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEvents({ country: "", state: "", city: "", date: "" });
  }, [page]);

  const handleSearch = () => {
    const stateName = State.getStatesOfCountry(country).find(
      (s) => s.isoCode === state
    )?.name;

    getEvents({ country, state: stateName, city, date });
  };

  const handleReset = () => {
    setCountry("");
    setState("");
    setCity("");
    setDate("");
    getEvents({ country: "", state: "", city: "", date: "" });
  };

  return (
    <div className="relative w-full">
      <div className="bg-purple-900">
        <div className="absolute inset-0 bg-transparent opacity-90 pointer-events-none"></div>
        <div className="relative w-full max-w-6xl mx-auto px-4 pt-16 pb-32">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              UPCOMING EVENTS AND
            </h1>
            <h1 className="text-4xl md:text-5xl font-bold text-red-500">
              TOURNAMENTS
            </h1>
          </div>
          <div
            className="absolute left-0 right-0 mx-auto px-4 w-full max-w-5xl"
            style={{ top: "70%" }}
          >
            <div className="bg-purple-950 rounded-xl p-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-start">
                  <label className="text-white text-sm mb-2">Country</label>
                  <div className="relative w-full">
                    <select
                      className="appearance-none w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    >
                      <option value="" className="bg-purple-900">
                        Select
                      </option>
                      {countries.map((country) => (
                        <option
                          key={country.isoCode}
                          value={country.isoCode}
                          className="bg-purple-900"
                        >
                          {country.name}
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
                      onChange={(e) => setState(e.target.value)}
                      disabled={!country} // disables unless a country is selected
                    >
                      <option value="" className="bg-purple-900">
                        Select
                      </option>
                      {states.map((state) => (
                        <option
                          key={state.isoCode}
                          value={state.isoCode}
                          className="bg-purple-900"
                        >
                          {state.name}
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
                    >
                      <option value="" className="bg-purple-900">
                        Select
                      </option>
                      {cities.map((city) => (
                        <option
                          key={city.name}
                          value={city.name}
                          className="bg-purple-900"
                        >
                          {city.name}
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
                {(country || state || city || date) && (
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
        <div className="w-full h-32 bg-black"></div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-black">
          <Loader />
        </div>
      ) : (
        <div className="bg-black w-full mx-auto px-4 py-52 md:py-16 flex flex-wrap justify-center gap-10 items-center">
          {events.map((event) => (
            <EventCard
              key={event._id}
              imageUrl={event.poster}
              id={event._id}
              imageAlt={event.name}
              location={
                event.venue?.name +
                ", " +
                event.venue?.address.country +
                ", " +
                event.venue?.address.state +
                ", " +
                event.venue?.address.city +
                ", " +
                event.venue?.address.street1 +
                ", " +
                event.venue?.address?.street2 +
                ", " +
                event.venue?.address.postalCode
              }
              eventDate={event.startDate}
              name={event.name}
              description={event.briefDescription}
              status={getEventStatus(event.startDate, event.endDate)}
              registrationDeadline={
                event.registrationDeadline || event.startDate
              } // 👈 ADD THIS LINE
            />
          ))}
        </div>
      )}
      <div className="bg-black pb-8">
        {/* Pagination Controls */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default EventsPage;
