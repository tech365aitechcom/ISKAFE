'use client'
import { API_BASE_URL, apiConstants } from '../../../../../../../constants'
import axios from 'axios'
import { enqueueSnackbar } from 'notistack'
import React, { useState } from 'react'
import useStore from '../../../../../../../stores/useStore'

function DetailsButton({ fighter, onSuccess }) {
  const user = useStore((state) => state.user)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})  
  const [formData, setFormData] = useState({
    // Profile Info - auto-loaded from fighter profile
    competitor: `${fighter.firstName || ''} ${fighter.lastName || ''}`,
    dateAdded: fighter.createdAt ? new Date(fighter.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    gender: fighter.gender || '',
    
    // Weigh-In Info
    weight: fighter.walkAroundWeight || fighter.weight || '',
    isOfficialWeight: fighter.isOfficialWeight || false,
    
    // Physical Attributes
    height: fighter.height || '',
    
    // Fight Record - auto-calculated/editable
    record: fighter.systemRecord || '0-0-0',
    
    // Training Info
    gymName: fighter.gymName || '',
    
    // Medical/Payments
    paymentStatus: fighter.paymentStatus || 'Pending',
    missingPaymentsNotes: fighter.missingPaymentsNotes || '',
    medicalExamDone: fighter.medicalExamDone || false,
    
    // Licensing Compliance
    physicalRenewalDate: fighter.physicalRenewalDate ? new Date(fighter.physicalRenewalDate).toISOString().split('T')[0] : '',
    licenseRenewalDate: fighter.licenseRenewalDate ? new Date(fighter.licenseRenewalDate).toISOString().split('T')[0] : '',
    hotelConfirmationNumber: fighter.hotelConfirmationNumber || '',
    suspensions: fighter.suspensions || 'None', // readonly from platform
    
    // Safety & Emergency (NEW)
    emergencyContactName: fighter.emergencyContactName || '',
    emergencyContactPhone: fighter.emergencyContactPhone || '',
    
    // Regulatory (NEW)
    countryOfOrigin: fighter.countryOfOrigin || fighter.country || 'USA',
    
    // Experience (NEW)
    lastEvent: fighter.lastEvent || '',
    skillRank: fighter.skillRank || fighter.skillLevel || '',
    
    // Legal (NEW)
    parentalConsentUploaded: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const errors = {}
    const fighterAge = fighter.dateOfBirth ? 
      new Date().getFullYear() - new Date(fighter.dateOfBirth).getFullYear() : null

    // Required field validations
    if (!formData.weight || formData.weight <= 0) {
      errors.weight = 'Weight is required and must be greater than 0'
    }
    
    if (!formData.gymName?.trim()) {
      errors.gymName = 'Training facility is required'
    }
    
    if (!formData.paymentStatus) {
      errors.paymentStatus = 'Payment status is required'
    }
    
    if (!formData.emergencyContactName?.trim()) {
      errors.emergencyContactName = 'Emergency contact name is required (alphabetic only)'
    } else if (!/^[a-zA-Z\s]+$/.test(formData.emergencyContactName)) {
      errors.emergencyContactName = 'Emergency contact name must contain only letters and spaces'
    }
    
    if (!formData.emergencyContactPhone?.trim()) {
      errors.emergencyContactPhone = 'Emergency contact phone is required'
    } else if (!/^[+]?[1-9]\d{1,14}$/.test(formData.emergencyContactPhone.replace(/[\s-]/g, ''))) {
      errors.emergencyContactPhone = 'Must be a valid phone number (e.g., +1-555-123-4567)'
    }
    
    if (!formData.countryOfOrigin?.trim()) {
      errors.countryOfOrigin = 'Country of origin is required'
    }
    
    // Conditional validation for minors (under 18)
    if (fighterAge && fighterAge < 18) {
      if (!formData.parentalConsentUploaded) {
        errors.parentalConsentUploaded = 'Parental consent is required for minors under 18'
      }
    }
    
    // Enhanced validations
    if (formData.weight && (formData.weight < 50 || formData.weight > 500)) {
      errors.weight = 'Weight must be between 50 and 500 lbs'
    }
    
    if (formData.height && (formData.height < 36 || formData.height > 96)) {
      errors.height = 'Height must be between 36 and 96 inches'
    }
    
    // Date validations
    if (formData.physicalRenewalDate) {
      const renewalDate = new Date(formData.physicalRenewalDate)
      const today = new Date()
      if (renewalDate <= today) {
        errors.physicalRenewalDate = 'Physical renewal date must be in the future'
      }
    }
    
    if (formData.licenseRenewalDate) {
      const licenseDate = new Date(formData.licenseRenewalDate)
      const today = new Date()
      if (licenseDate <= today) {
        errors.licenseRenewalDate = 'License renewal date must be in the future'
      }
    }

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Clear previous errors
    setValidationErrors({})
    
    // Validate form
    const errors = validateForm()
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      enqueueSnackbar('Please fix the validation errors before submitting', {
        variant: 'error',
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await axios.put(
        `${API_BASE_URL}/registrations/${fighter._id}`,
        {
          ...formData,
          // Convert weight to number
          walkAroundWeight: parseFloat(formData.weight),
          weight: parseFloat(formData.weight),
          height: formData.height ? parseFloat(formData.height) : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      
      if (response.status === apiConstants.success || response.data.success) {
        enqueueSnackbar('Fighter details updated successfully', {
          variant: 'success',
        })
        setIsModalOpen(false)
        if (onSuccess) {
          onSuccess()
        }
      } else {
        throw new Error(response.data.message || 'Update failed')
      }
    } catch (error) {
      console.error('Update error:', error)
      enqueueSnackbar(
        error.response?.data?.message || error.message || 'An error occurred during update',
        { variant: 'error' }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenModal = () => {
    setValidationErrors({})
    setIsSubmitting(false)
    setIsModalOpen(true)
  }

  const handleRemoveFighter = async (id) => {
    if (confirm('Are you sure you want to remove this fighter?')) {
      try {
        const res = await axios.delete(`${API_BASE_URL}/registrations/${id}`, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        })
        if (res.status === apiConstants.success) {
          enqueueSnackbar(res.data.message, { variant: 'success' })
          setIsModalOpen(false)
          if (onSuccess) {
            onSuccess()
          }
        }
      } catch (error) {
        enqueueSnackbar('Failed to remove fighter', { variant: 'error' })
      }
    }
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        className='bg-green-600 px-3 py-1 rounded hover:bg-green-700'
      >
        Details
      </button>

      {isModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center z-50 p-4 overflow-y-auto'>
          <div className='bg-[#0B1739] rounded-lg p-6 w-full max-w-6xl my-4 max-h-[calc(100vh-2rem)] overflow-y-auto'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-bold'>
                {fighter.firstName} {fighter.lastName} - Fighter Details
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className='text-gray-400 hover:text-white text-2xl'
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-6'>

              {/* Profile Info (Readonly) */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Profile Information
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm mb-1 text-gray-400'>Competitor <span className='text-red-400'>*</span></label>
                    <input
                      type='text'
                      value={formData.competitor}
                      className='w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300'
                      readOnly
                    />
                  </div>
                  <div>
                    <label className='block text-sm mb-1 text-gray-400'>Date Added <span className='text-red-400'>*</span></label>
                    <input
                      type='date'
                      value={formData.dateAdded}
                      className='w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300'
                      readOnly
                    />
                  </div>
                  <div>
                    <label className='block text-sm mb-1 text-gray-400'>Gender <span className='text-red-400'>*</span></label>
                    <input
                      type='text'
                      value={formData.gender}
                      className='w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300'
                      readOnly
                    />
                  </div>
                  <div>
                    <label className='block text-sm mb-1 text-gray-400'>Age</label>
                    <input
                      type='text'
                      value={
                        fighter.dateOfBirth
                          ? new Date().getFullYear() - new Date(fighter.dateOfBirth).getFullYear()
                          : 'N/A'
                      }
                      className='w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300'
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Weigh-In Info */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Weigh-In Information
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm mb-1'>Weight (lbs) <span className='text-red-400'>*</span></label>
                    <input
                      type='number'
                      name='weight'
                      value={formData.weight}
                      onChange={handleChange}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.weight
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      placeholder='e.g., 170'
                      required
                      min='1'
                      step='0.1'
                    />
                    {validationErrors.weight && (
                      <p className='text-red-500 text-xs mt-1'>{validationErrors.weight}</p>
                    )}
                  </div>
                  <div className='flex items-center'>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        name='isOfficialWeight'
                        checked={formData.isOfficialWeight}
                        onChange={handleChange}
                        className='mr-2'
                      />
                      Official Weight Checkbox
                    </label>
                  </div>
                </div>
              </div>

              {/* Physical Attributes */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Physical Attributes
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-1 gap-4'>
                  <div>
                    <label className='block text-sm mb-1'>Height (inches)</label>
                    <input
                      type='number'
                      name='height'
                      value={formData.height}
                      onChange={handleChange}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.height
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      placeholder='e.g., 64'
                      min='36'
                      max='96'
                    />
                    {validationErrors.height && (
                      <p className='text-red-500 text-xs mt-1'>{validationErrors.height}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Fight Record */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Fight Record
                </h3>
                <div className='grid grid-cols-1 gap-4'>
                  <div>
                    <label className='block text-sm mb-1'>Record <span className='text-red-400'>*</span></label>
                    <input
                      type='text'
                      name='record'
                      value={formData.record}
                      onChange={handleChange}
                      className='w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2 focus:border-blue-500'
                      placeholder='e.g., 0-0-0'
                    />
                  </div>
                </div>
              </div>

              {/* Training Info */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Training Information
                </h3>
                <div className='grid grid-cols-1 gap-4'>
                  <div>
                    <label className='block text-sm mb-1'>Training Facility <span className='text-red-400'>*</span></label>
                    <input
                      type='text'
                      name='gymName'
                      value={formData.gymName}
                      onChange={handleChange}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.gymName
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      placeholder='Gym / Club Name'
                      required
                    />
                    {validationErrors.gymName && (
                      <p className='text-red-500 text-xs mt-1'>{validationErrors.gymName}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Medical / Payments */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Medical / Payments
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm mb-1'>Payment Status <span className='text-red-400'>*</span></label>
                    <select
                      name='paymentStatus'
                      value={formData.paymentStatus}
                      onChange={handleChange}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.paymentStatus
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      required
                    >
                      <option value=''>Select...</option>
                      <option value='Paid'>Paid</option>
                      <option value='Pending'>Pending</option>
                      <option value='Failed'>Failed</option>
                    </select>
                    {validationErrors.paymentStatus && (
                      <p className='text-red-500 text-xs mt-1'>{validationErrors.paymentStatus}</p>
                    )}
                  </div>
                  <div className='flex items-center'>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        name='medicalExamDone'
                        checked={formData.medicalExamDone}
                        onChange={handleChange}
                        className='mr-2'
                      />
                      Medical Exams Done <span className='text-red-400'>*</span>
                    </label>
                  </div>
                  <div className='md:col-span-2'>
                    <label className='block text-sm mb-1'>Missing Payments & Notes</label>
                    <textarea
                      name='missingPaymentsNotes'
                      value={formData.missingPaymentsNotes}
                      onChange={handleChange}
                      className='w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2 focus:border-blue-500'
                      placeholder='Add explanation...'
                      rows='3'
                    />
                  </div>
                </div>
              </div>

              {/* Licensing Compliance */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Licensing Compliance
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm mb-1'>Fighter Physical Renewal Date</label>
                    <input
                      type='date'
                      name='physicalRenewalDate'
                      value={formData.physicalRenewalDate}
                      onChange={handleChange}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.physicalRenewalDate
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                    />
                    {validationErrors.physicalRenewalDate && (
                      <p className='text-red-500 text-xs mt-1'>{validationErrors.physicalRenewalDate}</p>
                    )}
                  </div>
                  <div>
                    <label className='block text-sm mb-1'>Fighter License Renewal Date</label>
                    <input
                      type='date'
                      name='licenseRenewalDate'
                      value={formData.licenseRenewalDate}
                      onChange={handleChange}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.licenseRenewalDate
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                    />
                    {validationErrors.licenseRenewalDate && (
                      <p className='text-red-500 text-xs mt-1'>{validationErrors.licenseRenewalDate}</p>
                    )}
                  </div>
                  <div>
                    <label className='block text-sm mb-1'>Hotel Confirmation #</label>
                    <input
                      type='text'
                      name='hotelConfirmationNumber'
                      value={formData.hotelConfirmationNumber}
                      onChange={handleChange}
                      className='w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2 focus:border-blue-500'
                      placeholder='Optional'
                    />
                  </div>
                  <div>
                    <label className='block text-sm mb-1'>Suspensions <span className='text-red-400'>*</span></label>
                    <select
                      name='suspensions'
                      value={formData.suspensions}
                      className='w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300'
                      disabled
                    >
                      <option value='None'>None</option>
                      <option value='Warning'>Warning</option>
                      <option value='Flagged'>Flagged</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Safety & Emergency */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Safety & Emergency
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm mb-1'>Emergency Contact Name <span className='text-red-400'>*</span></label>
                    <input
                      type='text'
                      name='emergencyContactName'
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.emergencyContactName
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      placeholder='Parent / Coach Name'
                      required
                    />
                    {validationErrors.emergencyContactName && (
                      <p className='text-red-500 text-xs mt-1'>{validationErrors.emergencyContactName}</p>
                    )}
                  </div>
                  <div>
                    <label className='block text-sm mb-1'>Emergency Contact Phone <span className='text-red-400'>*</span></label>
                    <input
                      type='tel'
                      name='emergencyContactPhone'
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.emergencyContactPhone
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      placeholder='e.g., +1-555-123-4567'
                      required
                    />
                    {validationErrors.emergencyContactPhone && (
                      <p className='text-red-500 text-xs mt-1'>{validationErrors.emergencyContactPhone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Regulatory */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Regulatory
                </h3>
                <div className='grid grid-cols-1 gap-4'>
                  <div>
                    <label className='block text-sm mb-1'>Country of Origin <span className='text-red-400'>*</span></label>
                    <input
                      type='text'
                      name='countryOfOrigin'
                      value={formData.countryOfOrigin}
                      onChange={handleChange}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.countryOfOrigin
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      placeholder='e.g., USA, Canada'
                      required
                    />
                    {validationErrors.countryOfOrigin && (
                      <p className='text-red-500 text-xs mt-1'>{validationErrors.countryOfOrigin}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Experience
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm mb-1'>Last Event Participated In</label>
                    <input
                      type='text'
                      name='lastEvent'
                      value={formData.lastEvent}
                      onChange={handleChange}
                      className='w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2 focus:border-blue-500'
                      placeholder='e.g., SCFC 16'
                    />
                  </div>
                  <div>
                    <label className='block text-sm mb-1'>Skill Rank / Belt Level</label>
                    <input
                      type='text'
                      name='skillRank'
                      value={formData.skillRank}
                      onChange={handleChange}
                      className='w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2 focus:border-blue-500'
                      placeholder='Blue Belt, Beginner'
                    />
                  </div>
                </div>
              </div>

              {/* Legal */}
              {fighter.dateOfBirth && 
                new Date().getFullYear() - new Date(fighter.dateOfBirth).getFullYear() < 18 && (
                <div>
                  <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                    Legal (Required for Minors)
                  </h3>
                  <div className='grid grid-cols-1 gap-4'>
                    <div className='flex items-center'>
                      <label className='flex items-center'>
                        <input
                          type='checkbox'
                          name='parentalConsentUploaded'
                          checked={formData.parentalConsentUploaded}
                          onChange={handleChange}
                          className='mr-2'
                        />
                        Parental Consent Uploaded <span className='text-red-400'>*</span>
                      </label>
                    </div>
                    {validationErrors.parentalConsentUploaded && (
                      <p className='text-red-500 text-xs mt-1'>{validationErrors.parentalConsentUploaded}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Form Status */}
              {Object.keys(validationErrors).length > 0 && (
                <div className='bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4'>
                  <h4 className='text-red-400 font-semibold mb-2'>
                    Please fix the following errors:
                  </h4>
                  <ul className='text-red-300 text-sm space-y-1'>
                    {Object.values(validationErrors).map(
                      (error, index) => error && <li key={index}>• {error}</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Required Fields Notice */}
              <div className='bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-3'>
                <p className='text-blue-300 text-sm'>
                  <span className='text-red-400'>*</span> Required fields must be completed
                </p>
              </div>

              {/* Buttons */}
              <div className='flex justify-between items-center pt-6 border-t border-gray-600 bg-[#0B1739]'>
                <button
                  type='button'
                  onClick={() => handleRemoveFighter(fighter._id)}
                  className='bg-red-600 px-4 py-2 rounded hover:bg-red-700 text-white font-medium'
                  disabled={isSubmitting}
                >
                  Remove Fighter
                </button>

                <div className='flex gap-4'>
                  <button
                    type='button'
                    onClick={() => setIsModalOpen(false)}
                    className='bg-gray-600 px-4 py-2 rounded hover:bg-gray-700'
                    disabled={isSubmitting}
                  >
                    Close
                  </button>
                  <button
                    type='submit'
                    className={`px-4 py-2 rounded font-medium flex items-center gap-2 ${
                      isSubmitting
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && (
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    )}
                    {isSubmitting ? 'Updating...' : 'Update Details'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default DetailsButton
