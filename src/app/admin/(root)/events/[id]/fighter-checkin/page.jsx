"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../../../../../constants";
import Loader from "../../../../../_components/Loader";
import useStore from "../../../../../../stores/useStore";

export default function FighterCheckinPage() {
  const { id: eventId } = useParams();
  const user = useStore((state) => state.user);
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
          setFighters(Array.isArray(data.data.items) ? data.data.items : []);
        } else {
          throw new Error(data.message || "Error fetching fighters");
        }
      } catch (err) {
        setError(err.message);
        setFighters([]);
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

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Check-in failed: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      if (result.success) {
        // Update local state
        setFighters((prev) =>
          prev.map((f) =>
            f._id === fighterId 
              ? { 
                  ...f, 
                  checkInStatus: "Checked In",
                  weighInValue: formData.weighInValue,
                  weighInDate: formData.weighInDate,
                  isOfficialWeight: formData.isOfficialWeight,
                  category: formData.category,
                  height: formData.heightInInches
                } 
              : f
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
                <th className="px-4 py-3 text-left">Serial No.</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Age</th>
                <th className="px-4 py-3 text-left">Weight (Registered)</th>
                <th className="px-4 py-3 text-left">Height</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Weigh-In Value</th>
                <th className="px-4 py-3 text-left">Weigh-In Date</th>
                <th className="px-4 py-3 text-left">Official Weight</th>
                <th className="px-4 py-3 text-left">Check-In Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fighters.map((fighter, index) => {
                const age = fighter.dateOfBirth 
                  ? new Date().getFullYear() - new Date(fighter.dateOfBirth).getFullYear()
                  : "N/A";
                
                return (
                  <tr key={fighter._id} className="border-b border-[#343B4F]">
                    <td className="px-4 py-4">{index + 1}</td>
                    <td className="px-4 py-4">
                      {fighter.firstName} {fighter.lastName}
                    </td>
                    <td className="px-4 py-4">{age}</td>
                    <td className="px-4 py-4">
                      {fighter.weight || "N/A"} lbs
                    </td>
                    <td className="px-4 py-4">
                      {fighter.height || "N/A"}
                    </td>
                    <td className="px-4 py-4">{fighter.category || "N/A"}</td>
                    <td className="px-4 py-4">
                      {fighter.weighInValue || "-"}
                    </td>
                    <td className="px-4 py-4">
                      {fighter.weighInDate 
                        ? new Date(fighter.weighInDate).toLocaleDateString()
                        : "-"
                      }
                    </td>
                    <td className="px-4 py-4">
                      {fighter.isOfficialWeight ? "✓" : "-"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          fighter.checkInStatus === "Checked In"
                            ? "bg-green-500 text-white"
                            : fighter.checkInStatus === "No Show"
                            ? "bg-red-500 text-white"
                            : "bg-yellow-500 text-black"
                        }`}
                      >
                        {fighter.checkInStatus || "Not Checked"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <CheckinForm
                          fighter={fighter}
                          onCheckin={(fighterId, data) => handleCheckin(fighterId, data)}
                        />
                        <DetailsModal 
                          fighter={fighter} 
                          eventId={eventId}
                          setFighters={setFighters}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Quick Check-in Form - for basic weigh-in updates
function CheckinForm({ fighter, onCheckin }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    weighInValue: fighter.weighInValue || fighter.weight || "",
    weighInDate: new Date().toISOString().split('T')[0],
    isOfficialWeight: fighter.isOfficialWeight || false,
    category: fighter.category || "",
    emergencyContact: {
      name: fighter.emergencyContactName || "",
      phone: fighter.emergencyContactPhone || "",
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
    
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const dataToSend = {
        ...formData,
        checkInStatus: "Checked In"
      };
      
      const result = await onCheckin(fighter._id, dataToSend);
      
      if (result.success) {
        setIsModalOpen(false);
      } else {
        setError(result.error || "Check-in failed");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 px-2 py-1 text-sm rounded hover:bg-blue-700"
      >
        Update
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#0B1739] rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Quick Check-in: {fighter.firstName} {fighter.lastName}
            </h2>

            {error && (
              <div className="bg-red-500 text-white p-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Weigh-In Value (lbs) *
                </label>
                <input
                  type="number"
                  name="weighInValue"
                  value={formData.weighInValue}
                  onChange={handleChange}
                  className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                  required
                  min="50"
                  max="400"
                  step="0.1"
                  placeholder="e.g., 170.5"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Weigh-In Date *
                </label>
                <input
                  type="date"
                  name="weighInDate"
                  value={formData.weighInDate}
                  onChange={handleChange}
                  className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                  required
                  disabled={loading}
                >
                  <option value="">Select Category</option>
                  <option value="Novice">Novice</option>
                  <option value="Amateur">Amateur</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isOfficialWeight"
                  checked={formData.isOfficialWeight}
                  onChange={handleChange}
                  className="mr-2"
                  disabled={loading}
                />
                <label className="text-sm">Official Weight Approved</label>
              </div>

              <div className="border-t border-[#343B4F] pt-4">
                <h3 className="font-medium mb-3">Emergency Contact *</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Name *</label>
                    <input
                      type="text"
                      name="emergencyContact.name"
                      value={formData.emergencyContact.name}
                      onChange={handleChange}
                      className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                      required
                      placeholder="e.g., John Smith"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Phone *</label>
                    <input
                      type="tel"
                      name="emergencyContact.phone"
                      value={formData.emergencyContact.phone}
                      onChange={handleChange}
                      className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                      required
                      placeholder="e.g., +1-555-123-4567"
                      pattern="[+]?[0-9\s\-\(\)]{10,}"
                      title="Please enter a valid phone number (at least 10 digits)"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Checking In..." : "Complete Check-In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Comprehensive Details Modal - for full fighter profile management
function DetailsModal({ fighter, eventId, setFighters }) {
  const user = useStore((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  
  const [formData, setFormData] = useState({
    // Profile Info
    competitor: `${fighter?.firstName || ''} ${fighter?.lastName || ''}`,
    dateAdded: fighter?.createdAt ? new Date(fighter.createdAt).toLocaleDateString() : "N/A",
    gender: fighter?.gender || "N/A",
    email: fighter?.email || "N/A",
    dateOfBirth: fighter?.dateOfBirth || "N/A",
    
    // Weigh-In Info
    weighInValue: fighter?.weighInValue || fighter?.weight || "",
    weighInDate: new Date().toISOString().split('T')[0],
    isOfficialWeight: fighter?.isOfficialWeight || false,
    
    // Physical Attributes
    heightInInches: fighter?.height || "",
    
    // Fight Record
    systemRecord: fighter?.systemRecord || "0-0-0",
    
    // Training Info
    trainingFacility: fighter?.trainingFacility || "",
    
    // Medical & Payments
    requiredPaymentsPaid: fighter?.requiredPaymentsPaid || "All",
    missingPaymentsNotes: fighter?.missingPaymentsNotes || "",
    medicalExamDone: fighter?.medicalExamDone || false,
    
    // Licensing Compliance
    fighterPhysicalRenewalDate: fighter?.fighterPhysicalRenewalDate || "",
    fighterLicenseRenewalDate: fighter?.fighterLicenseRenewalDate || "",
    hotelConfirmationNumber: fighter?.hotelConfirmationNumber || "",
    suspensions: fighter?.suspensions || "None",
    
    // Emergency Contact
    emergencyContactName: fighter?.emergencyContactName || "",
    emergencyContactPhone: fighter?.emergencyContactPhone || "",
    
    // Additional Fields
    category: fighter?.category || "Novice",
    countryOfOrigin: fighter?.countryOfOrigin || "",
    lastEventParticipatedIn: fighter?.lastEventParticipatedIn || "",
    skillRankBeltLevel: fighter?.skillRankBeltLevel || "",
    parentalConsentUploaded: fighter?.parentalConsentUploaded || false,
    
    // Photo
    profilePhoto: fighter?.profilePhoto || ""
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const fighterId = fighter?._id;
      const fighterName = `${fighter?.firstName || 'Unknown'} ${fighter?.lastName || 'Fighter'}`;
      
      if (!fighterId) {
        alert("Fighter information is missing");
        setLoading(false);
        return;
      }

      // Handle photo upload if present
      let photoUrl = formData.profilePhoto;
      if (photoFile) {
        const photoFormData = new FormData();
        photoFormData.append('photo', photoFile);
        // TODO: Implement photo upload API call
        // const uploadResponse = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: photoFormData });
        // photoUrl = uploadResponse.data.url;
      }

      // Prepare data in the format expected by the API
      const updateData = {
        event: eventId,
        fighter: fighterId,
        category: formData.category || "Novice",
        weighInValue: parseFloat(formData.weighInValue) || 0,
        isOfficialWeight: formData.isOfficialWeight || false,
        weighInDate: formData.weighInDate ? new Date(formData.weighInDate).toISOString() : new Date().toISOString(),
        checkInStatus: "Checked In",
        heightInInches: parseInt(formData.heightInInches) || 0,
        fightRecord: {
          wins: parseInt(formData.systemRecord?.split('-')[0]) || 0,
          losses: parseInt(formData.systemRecord?.split('-')[1]) || 0,
          draws: parseInt(formData.systemRecord?.split('-')[2]) || 0
        },
        trainingFacility: formData.trainingFacility || "",
        requiredPaymentsPaid: formData.requiredPaymentsPaid || "All",
        paymentNotes: formData.missingPaymentsNotes || "",
        medicalExamDone: formData.medicalExamDone || false,
        physicalRenewalDate: formData.fighterPhysicalRenewalDate ? new Date(formData.fighterPhysicalRenewalDate).toISOString() : null,
        licenseRenewalDate: formData.fighterLicenseRenewalDate ? new Date(formData.fighterLicenseRenewalDate).toISOString() : null,
        hotelConfirmationNumber: formData.hotelConfirmationNumber || "",
        suspensionStatus: formData.suspensions || "None",
        emergencyContact: {
          name: formData.emergencyContactName || "",
          phone: formData.emergencyContactPhone || ""
        },
        lastEvent: formData.lastEventParticipatedIn || "",
        skillRank: formData.skillRankBeltLevel || "",
        parentalConsentUploaded: formData.parentalConsentUploaded || false
      };

      // Check if fighter already has a check-in record
      const checkResponse = await fetch(`${API_BASE_URL}/fighter-checkins?eventId=${eventId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      let existingCheckIn = null;
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.success && checkData.data) {
          existingCheckIn = checkData.data.find(checkin => checkin.fighter === fighterId);
        }
      }

      let response;
      if (existingCheckIn) {
        // Update existing check-in
        response = await fetch(`${API_BASE_URL}/fighter-checkins/${existingCheckIn._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify(updateData),
        });
      } else {
        // Create new check-in
        response = await fetch(`${API_BASE_URL}/fighter-checkins`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify(updateData),
        });
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to save fighter details: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Save failed");
      }

      // Update local state
      if (setFighters && fighterId) {
        setFighters((prev) =>
          prev.map((f) =>
            f._id === fighterId 
              ? { 
                  ...f, 
                  checkInStatus: "Checked In",
                  weighInValue: updateData.weighInValue,
                  weighInDate: updateData.weighInDate,
                  isOfficialWeight: updateData.isOfficialWeight,
                  category: updateData.category,
                  height: updateData.heightInInches
                } 
              : f
          )
        );
      }

      alert(`${fighterName} details updated successfully!`);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving fighter details:', error);
      alert(`Error saving fighter details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFighter = async () => {
    const fighterId = fighter?._id;
    const fighterName = `${fighter?.firstName || 'Unknown'} ${fighter?.lastName || 'Fighter'}`;
    
    if (!fighterId) {
      alert("Fighter information is missing");
      return;
    }

    if (confirm(`Are you sure you want to remove ${fighterName} from this event?`)) {
      try {
        setLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/registrations/${fighterId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to remove fighter: ${response.status} - ${errorData}`);
        }

        // Remove from local state
        if (setFighters) {
          setFighters((prev) => prev.filter((f) => f._id !== fighterId));
        }

        alert(`${fighterName} has been removed from the event.`);
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error removing fighter:', error);
        alert(`Error removing fighter: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file");
        return;
      }
      setPhotoFile(file);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-green-600 px-2 py-1 text-sm rounded hover:bg-green-700"
      >
        Details
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B1739] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  Fighter Profile Details: {formData.competitor}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                {/* Profile Info Section */}
                <div className="border border-[#343B4F] rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Competitor</label>
                      <input
                        type="text"
                        value={formData.competitor}
                        className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2 text-gray-400"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Date Added</label>
                      <input
                        type="text"
                        value={formData.dateAdded}
                        className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2 text-gray-400"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Gender</label>
                      <input
                        type="text"
                        value={formData.gender}
                        className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2 text-gray-400"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Weigh-In Info Section */}
                <div className="border border-[#343B4F] rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Weigh-In Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Weight (lbs) *</label>
                      <input
                        type="number"
                        name="weighInValue"
                        value={formData.weighInValue}
                        onChange={handleChange}
                        className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                        required
                        min="50"
                        max="400"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Weigh-In Date *</label>
                      <input
                        type="date"
                        name="weighInDate"
                        value={formData.weighInDate}
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

                {/* Physical Attributes Section */}
                <div className="border border-[#343B4F] rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Physical Attributes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Height (inches)</label>
                      <input
                        type="number"
                        name="heightInInches"
                        value={formData.heightInInches}
                        onChange={handleChange}
                        className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                        placeholder="e.g., 70"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category *</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                        required
                      >
                        <option value="Novice">Novice</option>
                        <option value="Amateur">Amateur</option>
                        <option value="Professional">Professional</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Fight Record Section */}
                <div className="border border-[#343B4F] rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Fight Record</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">System Record (W-L-D)</label>
                    <input
                      type="text"
                      name="systemRecord"
                      value={formData.systemRecord}
                      onChange={handleChange}
                      className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                      placeholder="e.g., 5-2-1"
                      pattern="[0-9]+-[0-9]+-[0-9]+"
                    />
                  </div>
                </div>

                {/* Training Info Section */}
                <div className="border border-[#343B4F] rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Training Information</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">Training Facility</label>
                    <input
                      type="text"
                      name="trainingFacility"
                      value={formData.trainingFacility}
                      onChange={handleChange}
                      className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                      placeholder="e.g., Warrior MMA Gym"
                    />
                  </div>
                </div>

                {/* Medical & Payments Section */}
                <div className="border border-[#343B4F] rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Medical & Payments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Required Payments Status</label>
                      <select
                        name="requiredPaymentsPaid"
                        value={formData.requiredPaymentsPaid}
                        onChange={handleChange}
                        className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                      >
                        <option value="All">All</option>
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
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Missing Payments Notes</label>
                    <textarea
                      name="missingPaymentsNotes"
                      value={formData.missingPaymentsNotes}
                      onChange={handleChange}
                      className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                      rows="2"
                      placeholder="Add explanation for missing payments..."
                    />
                  </div>
                </div>

                {/* Licensing Compliance Section */}
                <div className="border border-[#343B4F] rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Licensing & Compliance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Physical Renewal Date</label>
                      <input
                        type="date"
                        name="fighterPhysicalRenewalDate"
                        value={formData.fighterPhysicalRenewalDate}
                        onChange={handleChange}
                        className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">License Renewal Date</label>
                      <input
                        type="date"
                        name="fighterLicenseRenewalDate"
                        value={formData.fighterLicenseRenewalDate}
                        onChange={handleChange}
                        className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Hotel Confirmation #</label>
                      <input
                        type="text"
                        name="hotelConfirmationNumber"
                        value={formData.hotelConfirmationNumber}
                        onChange={handleChange}
                        className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                        placeholder="e.g., CONF123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Suspensions</label>
                      <select
                        name="suspensions"
                        value={formData.suspensions}
                        onChange={handleChange}
                        className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                      >
                        <option value="None">None</option>
                        <option value="Warning">Warning</option>
                        <option value="Flagged">Flagged</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact Section */}
                <div className="border border-[#343B4F] rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Emergency Contact *</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name *</label>
                      <input
                        type="text"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleChange}
                        className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                        required
                        placeholder="e.g., John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone *</label>
                      <input
                        type="tel"
                        name="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={handleChange}
                        className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                        required
                        placeholder="e.g., +1 (555) 123-4567"
                        pattern="[+]?[0-9\s\-\(\)]{10,}"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="border border-[#343B4F] rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Country of Origin</label>
                      <input
                        type="text"
                        name="countryOfOrigin"
                        value={formData.countryOfOrigin}
                        onChange={handleChange}
                        className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                        placeholder="e.g., USA, Canada"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Event Participated In</label>
                      <input
                        type="text"
                        name="lastEventParticipatedIn"
                        value={formData.lastEventParticipatedIn}
                        onChange={handleChange}
                        className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                        placeholder="e.g., SCFC 16"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Skill Rank / Belt Level</label>
                      <input
                        type="text"
                        name="skillRankBeltLevel"
                        value={formData.skillRankBeltLevel}
                        onChange={handleChange}
                        className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                        placeholder="e.g., Blue Belt, Beginner"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="parentalConsentUploaded"
                          checked={formData.parentalConsentUploaded}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        Parental Consent Uploaded (if under 18)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Photo Upload Section */}
                <div className="border border-[#343B4F] rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Photo Upload</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">Upload Fighter Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Max file size: 5MB. Supported formats: JPG, PNG, GIF
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-[#343B4F]">
                  <button
                    type="button"
                    onClick={handleRemoveFighter}
                    className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    Remove Fighter
                  </button>
                  
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="bg-gray-600 px-6 py-2 rounded hover:bg-gray-700"
                      disabled={loading}
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}