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

  const handleCheckin = async (registrationId, formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/registrations/${registrationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          ...formData,
          checkInStatus: "Checked In",
          weighInDate: formData.weighInDate || new Date().toISOString().split('T')[0],
        }),
      });

      if (!response.ok) throw new Error("Check-in failed");

      const result = await response.json();

      if (result.success || result.data) {
        // Update local state
        setFighters((prev) =>
          prev.map((f) =>
            f._id === registrationId ? { ...f, checkInStatus: "Checked In", ...formData } : f
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
                  <td className="px-6 py-4">{fighter.skillLevel || fighter.category || "N/A"}</td>
                  <td className="px-6 py-4">
                    {fighter.walkAroundWeight || fighter.weight || "N/A"} {fighter.weightUnit || "lbs"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
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
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <CheckinForm
                        fighter={fighter}
                        onCheckin={(data) => handleCheckin(fighter._id, data)}
                      />
                      <DetailsButton fighter={fighter} />
                      <NoShowButton 
                        fighter={fighter}
                        onNoShow={(data) => handleCheckin(fighter._id, data)}
                      />
                    </div>
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
    weighInValue: fighter.walkAroundWeight || fighter.weight || "",
    weighInDate: new Date().toISOString().split('T')[0],
    isOfficialWeight: fighter.isOfficialWeight || false,
    heightInInches: fighter.height || "",
    category: fighter.skillLevel || fighter.category || "",
    trainingFacility: fighter.gymName || fighter.trainingFacility || "",
    requiredPaymentsPaid: fighter.paymentMethod === "cash" && fighter.cashCode ? "All" : "None",
    paymentNotes: fighter.paymentNotes || "",
    medicalExamDone: fighter.medicalExamDone || false,
    fightRecord: {
      wins: fighter.fightRecord?.wins || 0,
      losses: fighter.fightRecord?.losses || 0,
      draws: fighter.fightRecord?.draws || 0
    },
    skillRank: fighter.skillRank || "",
    suspensionStatus: fighter.suspensionStatus || "None",
    emergencyContact: { 
      name: fighter.emergencyContactName || "", 
      phone: fighter.emergencyContactPhone || "" 
    },
    countryOfOrigin: fighter.country || "",
    lastEvent: fighter.lastEvent || "",
    physicalRenewalDate: fighter.physicalRenewalDate || "",
    licenseRenewalDate: fighter.licenseRenewalDate || "",
    hotelConfirmationNumber: fighter.hotelConfirmationNumber || "",
    parentalConsentUploaded: fighter.parentalConsentUploaded || false,
    comments: fighter.comments || "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Required field validations
    if (!formData.weighInValue || formData.weighInValue <= 0) {
      errors.weighInValue = 'Weight is required and must be greater than 0';
    }

    if (!formData.weighInDate) {
      errors.weighInDate = 'Weigh-in date is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (!formData.emergencyContact.name || formData.emergencyContact.name.trim() === '') {
      errors.emergencyContactName = 'Emergency contact name is required';
    }

    if (!formData.emergencyContact.phone || formData.emergencyContact.phone.trim() === '') {
      errors.emergencyContactPhone = 'Emergency contact phone is required';
    }

    // NEW: Skill Rank required
    if (!formData.skillRank || formData.skillRank.trim() === '') {
      errors.skillRank = 'Skill rank/belt level is required';
    }

    // NEW: Medical Exam required to be confirmed
    if (!formData.medicalExamDone) {
      errors.medicalExamDone = 'Medical exam must be completed before check-in';
    }

    // NEW: Payment status required
    if (formData.requiredPaymentsPaid === 'None') {
      errors.requiredPaymentsPaid = 'Required payments must be completed';
    }

    // Enhanced name validation - no numbers or special characters except spaces, hyphens, apostrophes
    const namePattern = /^[a-zA-Z\s\-']+$/;
    if (formData.emergencyContact.name && !namePattern.test(formData.emergencyContact.name)) {
      errors.emergencyContactName = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Enhanced phone number format validation - only digits, spaces, hyphens, parentheses, plus
    const phonePattern = /^[\+]?[\d\s\-\(\)]{10,15}$/;
    if (formData.emergencyContact.phone && !phonePattern.test(formData.emergencyContact.phone.replace(/\s/g, ''))) {
      errors.emergencyContactPhone = 'Phone number can only contain digits, spaces, hyphens, parentheses, and plus sign';
    }

    // Enhanced weight validation - positive numbers only
    if (formData.weighInValue && (formData.weighInValue < 50 || formData.weighInValue > 500)) {
      errors.weighInValue = 'Weight must be between 50 and 500 lbs';
    }

    if (formData.weighInValue && formData.weighInValue < 0) {
      errors.weighInValue = 'Weight cannot be negative';
    }

    // Enhanced height validation - positive numbers only
    if (formData.heightInInches && formData.heightInInches < 0) {
      errors.heightInInches = 'Height cannot be negative';
    }

    if (formData.heightInInches && (formData.heightInInches < 36 || formData.heightInInches > 96)) {
      errors.heightInInches = 'Height must be between 36 and 96 inches';
    }

    // Fight record validation - non-negative integers only
    if (formData.fightRecord.wins < 0 || !Number.isInteger(Number(formData.fightRecord.wins))) {
      errors.fightRecordWins = 'Wins must be a non-negative integer';
    }

    if (formData.fightRecord.losses < 0 || !Number.isInteger(Number(formData.fightRecord.losses))) {
      errors.fightRecordLosses = 'Losses must be a non-negative integer';
    }

    if (formData.fightRecord.draws < 0 || !Number.isInteger(Number(formData.fightRecord.draws))) {
      errors.fightRecordDraws = 'Draws must be a non-negative integer';
    }

    // Date validations
    if (formData.weighInDate) {
      const weighInDate = new Date(formData.weighInDate);
      const today = new Date();
      const oneWeekAgo = new Date(today.setDate(today.getDate() - 7));
      const oneWeekFromNow = new Date(today.setDate(today.getDate() + 14));
      
      if (weighInDate < oneWeekAgo || weighInDate > oneWeekFromNow) {
        errors.weighInDate = 'Weigh-in date must be within the past week or next week';
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationErrors({});
    
    // Validate form
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      
      // Show error notification
      if (window.enqueueSnackbar) {
        window.enqueueSnackbar('Please fix the validation errors before submitting', { variant: 'error' });
      } else {
        alert('Please fix the validation errors before submitting');
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await onCheckin(formData);
      if (result.success) {
        setIsModalOpen(false);
        if (window.enqueueSnackbar) {
          window.enqueueSnackbar('Fighter checked in successfully', { variant: 'success' });
        }
      } else {
        if (window.enqueueSnackbar) {
          window.enqueueSnackbar(result.error || 'Check-in failed', { variant: 'error' });
        } else {
          alert(result.error || 'Check-in failed');
        }
      }
    } catch (error) {
      console.error('Check-in error:', error);
      if (window.enqueueSnackbar) {
        window.enqueueSnackbar('An error occurred during check-in', { variant: 'error' });
      } else {
        alert('An error occurred during check-in');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenModal = () => {
    setValidationErrors({}); // Clear previous validation errors
    setIsSubmitting(false);
    setIsModalOpen(true);
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
      >
        {fighter.checkInStatus ? "Update" : "Check-in"}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#0B1739] rounded-lg p-6 w-full max-w-4xl my-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {fighter.firstName} {fighter.lastName} - Check-in
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Fighter Information (Readonly) */}
              <div>
                <h3 className="font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2">Fighter Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-gray-400">Full Name</label>
                    <input
                      type="text"
                      value={`${fighter.firstName} ${fighter.lastName}`}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-400">Gender</label>
                    <input
                      type="text"
                      value={fighter.gender || 'N/A'}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-400">Date Registered</label>
                    <input
                      type="text"
                      value={fighter.createdAt ? new Date(fighter.createdAt).toLocaleDateString() : 'N/A'}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Weigh-in Section */}
              <div>
                <h3 className="font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2">Weigh-in Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Weight (lbs) *</label>
                    <input
                      type="number"
                      name="weighInValue"
                      value={formData.weighInValue}
                      onChange={handleChange}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.weighInValue 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      required
                      min="1"
                      step="0.1"
                    />
                    {validationErrors.weighInValue && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.weighInValue}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Weigh-in Date *</label>
                    <input
                      type="date"
                      name="weighInDate"
                      value={formData.weighInDate}
                      onChange={handleChange}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.weighInDate 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      required
                    />
                    {validationErrors.weighInDate && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.weighInDate}</p>
                    )}
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
                <h3 className="font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Height (inches)</label>
                    <input
                      type="number"
                      name="heightInInches"
                      value={formData.heightInInches}
                      onChange={handleChange}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.heightInInches 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      min="36"
                      max="96"
                    />
                    {validationErrors.heightInInches && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.heightInInches}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.category 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      required
                    >
                      <option value="">Select</option>
                      <option value="Novice">Novice</option>
                      <option value="Amateur">Amateur</option>
                      <option value="Professional">Professional</option>
                      <option value="Beginner (0-2 years)">Beginner (0-2 years)</option>
                      <option value="Intermediate (3-5 years)">Intermediate (3-5 years)</option>
                      <option value="Advanced (6-10 years)">Advanced (6-10 years)</option>
                      <option value="Expert (10+ years)">Expert (10+ years)</option>
                    </select>
                    {validationErrors.category && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.category}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Training Info */}
              <div>
                <h3 className="font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2">Training Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Training Facility</label>
                    <input
                      type="text"
                      name="trainingFacility"
                      value={formData.trainingFacility}
                      onChange={handleChange}
                      className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                      placeholder="e.g., Elite MMA Gym, Champions Dojo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Skill Rank/Belt Level *</label>
                    <input
                      type="text"
                      name="skillRank"
                      value={formData.skillRank}
                      onChange={handleChange}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.skillRank 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      placeholder="e.g., White Belt, Blue Belt, Brown Belt"
                      required
                    />
                    {validationErrors.skillRank && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.skillRank}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Fight Record */}
              <div>
                <h3 className="font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2">Fight Record</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Wins</label>
                    <input
                      type="number"
                      name="wins"
                      value={formData.fightRecord.wins}
                      onChange={(e) => {
                        const value = Math.max(0, parseInt(e.target.value) || 0);
                        setFormData(prev => ({
                          ...prev,
                          fightRecord: { ...prev.fightRecord, wins: value }
                        }));
                        if (validationErrors.fightRecordWins) {
                          setValidationErrors(prev => ({ ...prev, fightRecordWins: '' }));
                        }
                      }}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.fightRecordWins 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      min="0"
                      step="1"
                    />
                    {validationErrors.fightRecordWins && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.fightRecordWins}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Losses</label>
                    <input
                      type="number"
                      name="losses"
                      value={formData.fightRecord.losses}
                      onChange={(e) => {
                        const value = Math.max(0, parseInt(e.target.value) || 0);
                        setFormData(prev => ({
                          ...prev,
                          fightRecord: { ...prev.fightRecord, losses: value }
                        }));
                        if (validationErrors.fightRecordLosses) {
                          setValidationErrors(prev => ({ ...prev, fightRecordLosses: '' }));
                        }
                      }}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.fightRecordLosses 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      min="0"
                      step="1"
                    />
                    {validationErrors.fightRecordLosses && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.fightRecordLosses}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Draws</label>
                    <input
                      type="number"
                      name="draws"
                      value={formData.fightRecord.draws}
                      onChange={(e) => {
                        const value = Math.max(0, parseInt(e.target.value) || 0);
                        setFormData(prev => ({
                          ...prev,
                          fightRecord: { ...prev.fightRecord, draws: value }
                        }));
                        if (validationErrors.fightRecordDraws) {
                          setValidationErrors(prev => ({ ...prev, fightRecordDraws: '' }));
                        }
                      }}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.fightRecordDraws 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      min="0"
                      step="1"
                    />
                    {validationErrors.fightRecordDraws && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.fightRecordDraws}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Medical & Payments */}
              <div>
                <h3 className="font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2">Medical & Payments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Payments Status *</label>
                    <select
                      name="requiredPaymentsPaid"
                      value={formData.requiredPaymentsPaid}
                      onChange={handleChange}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.requiredPaymentsPaid 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      required
                    >
                      <option value="All">All Paid</option>
                      <option value="Partial">Partial</option>
                      <option value="None">None</option>
                    </select>
                    {validationErrors.requiredPaymentsPaid && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.requiredPaymentsPaid}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Payment Notes</label>
                    <input
                      type="text"
                      name="paymentNotes"
                      value={formData.paymentNotes}
                      onChange={handleChange}
                      className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                      placeholder="Payment method, confirmation number, etc."
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="medicalExamDone"
                      checked={formData.medicalExamDone}
                      onChange={handleChange}
                      className={`mr-2 ${validationErrors.medicalExamDone ? 'border-red-500' : ''}`}
                      required
                    />
                    <label className="text-sm">Medical Exam Completed *</label>
                  </div>
                  {validationErrors.medicalExamDone && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.medicalExamDone}</p>
                  )}
                </div>
              </div>

              {/* Suspension Status */}
              <div>
                <h3 className="font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2">Status & Compliance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-gray-400">Suspension Status (Readonly)</label>
                    <select
                      name="suspensionStatus"
                      value={formData.suspensionStatus}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300"
                      disabled
                    >
                      <option value="None">None</option>
                      <option value="Medical">Medical Suspension</option>
                      <option value="Disciplinary">Disciplinary Suspension</option>
                      <option value="Administrative">Administrative Suspension</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Contact admin to modify suspension status</p>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Hotel Confirmation Number</label>
                    <input
                      type="text"
                      name="hotelConfirmationNumber"
                      value={formData.hotelConfirmationNumber}
                      onChange={handleChange}
                      className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                      placeholder="e.g., CONF123456789"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="parentalConsentUploaded"
                      checked={formData.parentalConsentUploaded}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label className="text-sm">Parental Consent Uploaded (if under 18)</label>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Name *</label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContact.name}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          emergencyContact: {
                            ...prev.emergencyContact,
                            name: e.target.value,
                          },
                        }));
                        
                        // Clear validation error
                        if (validationErrors.emergencyContactName) {
                          setValidationErrors(prev => ({
                            ...prev,
                            emergencyContactName: ''
                          }));
                        }
                      }}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.emergencyContactName 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      required
                    />
                    {validationErrors.emergencyContactName && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.emergencyContactName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Phone *</label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContact.phone}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          emergencyContact: {
                            ...prev.emergencyContact,
                            phone: e.target.value,
                          },
                        }));
                        
                        // Clear validation error
                        if (validationErrors.emergencyContactPhone) {
                          setValidationErrors(prev => ({
                            ...prev,
                            emergencyContactPhone: ''
                          }));
                        }
                      }}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.emergencyContactPhone 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      required
                      placeholder="(555) 123-4567"
                    />
                    {validationErrors.emergencyContactPhone && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.emergencyContactPhone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Fields */}
              <div>
                <h3 className="font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Country of Origin</label>
                    <input
                      type="text"
                      name="countryOfOrigin"
                      value={formData.countryOfOrigin || ''}
                      onChange={handleChange}
                      placeholder="e.g., USA, Canada"
                      className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Last Event Participated</label>
                    <input
                      type="text"
                      name="lastEvent"
                      value={formData.lastEvent || ''}
                      onChange={handleChange}
                      placeholder="e.g., SCFC 16"
                      className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Legal & Compliance */}
              <div>
                <h3 className="font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2">Legal & Compliance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Fighter Physical Renewal Date</label>
                    <input
                      type="date"
                      name="physicalRenewalDate"
                      value={formData.physicalRenewalDate || ''}
                      onChange={handleChange}
                      className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                      title="Date when fighter's medical physical expires"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Fighter License Renewal Date</label>
                    <input
                      type="date"
                      name="licenseRenewalDate"
                      value={formData.licenseRenewalDate || ''}
                      onChange={handleChange}
                      className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                      title="Date when fighter's license expires"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm mb-1">Hotel Confirmation #</label>
                    <input
                      type="text"
                      name="hotelConfirmation"
                      value={formData.hotelConfirmation || ''}
                      onChange={handleChange}
                      className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="parentalConsent"
                        checked={formData.parentalConsent || false}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Parental Consent (if under 18)
                    </label>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div>
                <h3 className="font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2">Comments</h3>
                <label className="block text-sm mb-1">Comments/Notes</label>
                <textarea
                  name="comments"
                  value={formData.comments || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2"
                  placeholder="Additional notes or comments..."
                />
              </div>

              {/* Form Status */}
              {Object.keys(validationErrors).length > 0 && (
                <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4">
                  <h4 className="text-red-400 font-semibold mb-2">Please fix the following errors:</h4>
                  <ul className="text-red-300 text-sm space-y-1">
                    {Object.values(validationErrors).map((error, index) => (
                      error && <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Image Upload */}
              <div>
                <h3 className="font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2">Fighter Photo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Upload Fighter Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // For now, just store the filename
                          setFormData(prev => ({
                            ...prev,
                            fighterPhoto: file.name
                          }));
                        }
                      }}
                      className="w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                    <p className="text-xs text-gray-400 mt-1">Accepted formats: JPG, PNG, GIF (max 5MB)</p>
                  </div>
                  <div>
                    {fighter.profileImage && (
                      <div>
                        <label className="block text-sm mb-1 text-gray-400">Current Photo</label>
                        <div className="w-20 h-20 bg-gray-700 rounded border border-gray-600 flex items-center justify-center">
                          <span className="text-xs text-gray-400">Photo</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Required Fields Notice */}
              <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-3">
                <p className="text-blue-300 text-sm">
                  <span className="text-red-400">*</span> Required fields must be completed before check-in
                </p>
              </div>

              {/* Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-600 sticky bottom-0 bg-[#0B1739]">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to remove ${fighter.firstName} ${fighter.lastName} from this event? This action cannot be undone.`)) {
                      // TODO: Implement remove fighter functionality
                      alert('Remove Fighter functionality would be implemented here');
                    }
                  }}
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 text-white font-medium"
                  disabled={isSubmitting}
                >
                  Remove Fighter
                </button>
                
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded font-medium flex items-center gap-2 ${
                      isSubmitting 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {isSubmitting ? 'Processing...' : 'Confirm Check-in'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// No Show Button Component
function NoShowButton({ fighter, onNoShow }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleNoShow = async () => {
    const result = await onNoShow({
      checkInStatus: "No Show",
      weighInDate: new Date().toISOString().split('T')[0],
      comments: `Marked as No Show on ${new Date().toLocaleDateString()}`
    });
    if (result.success) {
      setIsConfirmOpen(false);
    }
  };

  if (fighter.checkInStatus === "Checked In") {
    return null; // Don't show No Show button if already checked in
  }

  return (
    <>
      <button
        onClick={() => setIsConfirmOpen(true)}
        className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-xs"
      >
        No Show
      </button>

      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#0B1739] rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-red-400">
              Mark as No Show?
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to mark {fighter.firstName} {fighter.lastName} as "No Show"? This action can be reversed later.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleNoShow}
                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
              >
                Confirm No Show
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Details Button Component
function DetailsButton({ fighter }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-green-600 px-3 py-1 rounded hover:bg-green-700"
      >
        Details
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#0B1739] rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {fighter.firstName} {fighter.lastName} - Profile Details
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-bold mb-2 text-blue-400">Personal Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-400">Name:</span> {fighter.firstName} {fighter.lastName}</div>
                  <div><span className="text-gray-400">Gender:</span> {fighter.gender || 'N/A'}</div>
                  <div><span className="text-gray-400">Date of Birth:</span> {fighter.dateOfBirth ? new Date(fighter.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
                  <div><span className="text-gray-400">Age:</span> {fighter.dateOfBirth ? new Date().getFullYear() - new Date(fighter.dateOfBirth).getFullYear() : 'N/A'}</div>
                  <div><span className="text-gray-400">Email:</span> {fighter.email}</div>
                  <div><span className="text-gray-400">Phone:</span> {fighter.phoneNumber}</div>
                </div>
              </div>

              {/* Physical Attributes */}
              <div>
                <h3 className="font-bold mb-2 text-blue-400">Physical Attributes</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-400">Height:</span> {fighter.height} {fighter.heightUnit || 'inches'}</div>
                  <div><span className="text-gray-400">Weight:</span> {fighter.walkAroundWeight} {fighter.weightUnit}</div>
                  <div><span className="text-gray-400">Weight Class:</span> {fighter.weightClass || 'N/A'}</div>
                  <div><span className="text-gray-400">Skill Level:</span> {fighter.skillLevel || 'N/A'}</div>
                  <div><span className="text-gray-400">Rule Style:</span> {fighter.ruleStyle || 'N/A'}</div>
                </div>
              </div>

              {/* Training Information */}
              <div>
                <h3 className="font-bold mb-2 text-blue-400">Training Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-400">Gym:</span> {fighter.gymName || 'N/A'}</div>
                  <div><span className="text-gray-400">Trainer:</span> {fighter.trainerName || 'N/A'}</div>
                  <div><span className="text-gray-400">Trainer Phone:</span> {fighter.trainerPhone || 'N/A'}</div>
                  <div><span className="text-gray-400">Trainer Email:</span> {fighter.trainerEmail || 'N/A'}</div>
                </div>
              </div>

              {/* Fighter Details */}
              <div>
                <h3 className="font-bold mb-2 text-blue-400">Fighter Details</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-400">Professional:</span> {fighter.proFighter ? 'Yes' : 'No'}</div>
                  <div><span className="text-gray-400">Paid to Fight:</span> {fighter.paidToFight ? 'Yes' : 'No'}</div>
                  <div><span className="text-gray-400">System Record:</span> {fighter.systemRecord || 'N/A'}</div>
                  <div><span className="text-gray-400">Additional Records:</span> {fighter.additionalRecords || 'N/A'}</div>
                </div>
              </div>

              {/* Payment & Legal */}
              <div>
                <h3 className="font-bold mb-2 text-blue-400">Payment & Legal</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-400">Payment Method:</span> {fighter.paymentMethod || 'N/A'}</div>
                  {fighter.cashCode && <div><span className="text-gray-400">Cash Code:</span> {fighter.cashCode}</div>}
                  <div><span className="text-gray-400">Adult Registration:</span> {fighter.isAdult ? 'Yes' : 'No'}</div>
                  <div><span className="text-gray-400">Legal Disclaimer:</span> {fighter.legalDisclaimerAccepted ? 'Accepted' : 'Not Accepted'}</div>
                </div>
              </div>

              {/* Admin Information */}
              <div>
                <h3 className="font-bold mb-2 text-blue-400">Admin Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-400">Status:</span> {fighter.status || 'Pending'}</div>
                  <div><span className="text-gray-400">Registration Date:</span> {fighter.createdAt ? new Date(fighter.createdAt).toLocaleDateString() : 'N/A'}</div>
                  <div><span className="text-gray-400">Check-in Status:</span> {fighter.checkInStatus || 'Not Checked'}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
