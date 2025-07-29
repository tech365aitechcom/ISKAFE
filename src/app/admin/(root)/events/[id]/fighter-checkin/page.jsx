"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../../../../../constants";
import Loader from "../../../../../_components/Loader";
import useStore from "../../../../../../stores/useStore";

export default function FighterCheckinPage() {
  const { id: eventId } = useParams();
  const user = useStore((state) => state.user)
  const [fighters, setFighters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch registered fighters
  useEffect(() => {
    const fetchFighters = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/registrations/event/${eventId}?registrationType=fighter`
        );

        if (!response.ok) throw new Error("Failed to fetch fighters");
        const data = await response.json();

        if (data.success) {
          // Access the items array from the nested data structure
          setFighters(Array.isArray(data.data.items) ? data.data.items : []);
        } else {
          throw new Error(data.message || "Error fetching fighters");
        }
      } catch (err) {
        setError(err.message);
        setFighters([]); // Ensure fighters is always an array
      } finally {
        setLoading(false);
      }
    };

    fetchFighters();
  }, [eventId]);

  const handleCheckin = async (fighterId, formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/fighter-checkins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          event: eventId,
          fighter: fighterId,
          ...formData,
        }),
      });

      if (!response.ok) throw new Error("Check-in failed");

      const result = await response.json();

      if (result.success) {
        // Update local state
        setFighters((prev) =>
          prev.map((f) =>
            f._id === fighterId ? { ...f, checkInStatus: "Checked In" } : f
          )
        );
        return { success: true };
      } else {
        throw new Error(result.message || "Check-in failed");
      }
    } catch (err) {
      console.error("Check-in error:", err);
      return { success: false, error: err.message };
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[#07091D]">
        <Loader />
      </div>
    );

  if (error)
    return (
      <div className="text-white p-8">
        <div className="bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg">
          <p className="text-red-500">Error: {error}</p>
          <Link href={`/admin/events/view/${eventId}`}>
            <button className="mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
              Back to Event
            </button>
          </Link>
        </div>
      </div>
    );

  return (
    <div className="text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fighter Check-in</h1>
        <Link href={`/admin/events/view/${eventId}`}>
          <button className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
            Back to Event
          </button>
        </Link>
      </div>

      {fighters.length === 0 ? (
        <div className="bg-[#0B1739] rounded-lg p-6 text-center">
          <p>No fighters registered for this event yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#0B1739] rounded-lg">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Age</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Weight</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fighters.map((fighter, index) => (
                <tr key={fighter._id} className="border-b border-[#343B4F]">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">
                    {fighter.firstName} {fighter.lastName}
                  </td>
                  <td className="px-6 py-4">
                    {fighter.dateOfBirth 
                      ? new Date().getFullYear() - new Date(fighter.dateOfBirth).getFullYear()
                      : "N/A"
                    }
                  </td>
                  <td className="px-6 py-4">{fighter.category || "N/A"}</td>
                  <td className="px-6 py-4">
                    {fighter.weight || "N/A"} {fighter.weightUnit || "lbs"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded ${
                        fighter.checkInStatus === "Checked In"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    >
                      {fighter.checkInStatus || "Not Checked"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <CheckinForm
                      fighter={fighter}
                      onCheckin={(data) => handleCheckin(fighter._id, data)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Keep the CheckinForm component the same as before
function CheckinForm({ fighter, onCheckin }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    weighInValue: fighter.weight || "",
    isOfficialWeight: false,
    heightInInches: fighter.height || "",
    category: fighter.category || "",
    trainingFacility: fighter.trainingFacility || "",
    requiredPaymentsPaid: "All",
    medicalExamDone: false,
    emergencyContact: { name: "", phone: "" },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await onCheckin(formData);
    if (result.success) setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
      >
        {fighter.checkInStatus ? "Update" : "Check-in"}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#0B1739] rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {fighter.firstName} {fighter.lastName} - Check-in
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Weigh-in Section */}
              <div className="md:col-span-2">
                <h3 className="font-bold mb-2">Weigh-in Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Weight (lbs)</label>
                    <input
                      type="number"
                      name="weighInValue"
                      value={formData.weighInValue}
                      onChange={handleChange}
                      className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isOfficialWeight"
                        checked={formData.isOfficialWeight}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Official Weight
                    </label>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div>
                <label className="block text-sm mb-1">Height (inches)</label>
                <input
                  type="number"
                  name="heightInInches"
                  value={formData.heightInInches}
                  onChange={handleChange}
                  className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                  required
                >
                  <option value="">Select</option>
                  <option value="Novice">Novice</option>
                  <option value="Amateur">Amateur</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>

              {/* Training Info */}
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Training Facility</label>
                <input
                  type="text"
                  name="trainingFacility"
                  value={formData.trainingFacility}
                  onChange={handleChange}
                  className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                />
              </div>

              {/* Medical & Payments */}
              <div>
                <label className="block text-sm mb-1">Payments Status</label>
                <select
                  name="requiredPaymentsPaid"
                  value={formData.requiredPaymentsPaid}
                  onChange={handleChange}
                  className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                >
                  <option value="All">All Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="None">None</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="medicalExamDone"
                    checked={formData.medicalExamDone}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Medical Exam Completed
                </label>
              </div>

              {/* Emergency Contact */}
              <div className="md:col-span-2">
                <h3 className="font-bold mb-2">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Name</label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContact.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          emergencyContact: {
                            ...prev.emergencyContact,
                            name: e.target.value,
                          },
                        }))
                      }
                      className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Phone</label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContact.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          emergencyContact: {
                            ...prev.emergencyContact,
                            phone: e.target.value,
                          },
                        }))
                      }
                      className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                >
                  Confirm Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
