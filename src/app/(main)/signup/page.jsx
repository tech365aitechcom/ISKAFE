"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "01/01/2000",
    country: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch countries from API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://api.npoint.io/900fa8cc45c942a0c38e"
        );
        const data = await response.json();

        // Sort countries alphabetically
        const sortedCountries = data.sort((a, b) =>
          a.country.localeCompare(b.country)
        );

        setCountries(sortedCountries);
        setFilteredCountries(sortedCountries);
      } catch (err) {
        console.error("Error fetching countries:", err);
        setError("Failed to load countries. Please try again.");
      }
    };

    fetchCountries();
  }, []);

  // Filter countries based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = countries.filter((country) =>
        country.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(countries);
    }
  }, [searchTerm, countries]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleCountrySearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const selectCountry = (country) => {
    setFormData({
      ...formData,
      country: country.country,
    });
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Validate country selection
      if (!formData.country) {
        throw new Error("Please select a country");
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Registration data ready to be sent:", formData);

      // The actual API call would go here
      // const response = await axios.post('/api/signup', formData);
    } catch (err) {
      setError(err.message || "An error occurred during registration");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-transparent px-28 py-6">
      <div className="flex w-full">
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-b from-purple-900 to-black items-center justify-center">
          <div className="p-12">
            <img
              src="/gloves.png"
              alt="Red boxing glove"
              className="max-w-full h-auto transform -rotate-12"
            />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-white">Sign Up</h1>
              <span className="text-xs text-red-500">
                *Indicates Mandatory Fields
              </span>
            </div>
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-2 rounded mb-4">
                {error}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name*"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded border border-gray-700 bg-transparent text-white"
                    required
                  />
                </div>
                <div className="w-1/2">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name*"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded border border-gray-700 bg-transparent text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email*"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded border border-gray-700 bg-transparent text-white"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password*"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded border border-gray-700 bg-transparent text-white"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password*"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded border border-gray-700 bg-transparent text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Date of Birth*
                </label>
                <input
                  type="text"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded border border-yellow-500 bg-transparent text-white"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-gray-400 text-sm mb-1">
                  Country*
                </label>
                <div
                  className="w-full px-4 py-3 rounded border border-yellow-500 bg-transparent text-white flex justify-between items-center cursor-pointer"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span>{formData.country || "Select a country"}</span>
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={isDropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                    />
                  </svg>
                </div>

                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded shadow-lg max-h-60 overflow-y-auto">
                    <div className="sticky top-0 bg-gray-800 p-2">
                      <input
                        type="text"
                        placeholder="Search countries..."
                        value={searchTerm}
                        onChange={handleCountrySearch}
                        className="w-full px-3 py-2 rounded border border-gray-700 bg-transparent text-white"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white"
                          onClick={() => selectCountry(country)}
                        >
                          {country.country}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-400">
                        No countries found
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-red-500 text-white py-3 rounded font-medium hover:bg-red-600 transition duration-300 flex items-center justify-center mt-4"
                disabled={isLoading}
              >
                {isLoading ? "Signing Up..." : "Sign Up"}
              </button>
              <div className="text-center text-white mt-4">
                Already have an account?{" "}
                <Link href="/login" className="text-yellow-500 hover:underline">
                  Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
