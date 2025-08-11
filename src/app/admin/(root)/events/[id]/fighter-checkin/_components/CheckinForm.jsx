'use client'
import { API_BASE_URL, apiConstants } from '../../../../../../../constants'
import axios from 'axios'
import { enqueueSnackbar } from 'notistack'
import React, { useState } from 'react'

function CheckinForm({ fighter, onCheckin, onSuccess }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    weighInValue: fighter.walkAroundWeight || fighter.weight || '',
    weighInDate: new Date().toISOString().split('T')[0],
    isOfficialWeight: fighter.isOfficialWeight || false,
    heightInInches: fighter.height || '',
    category: fighter.skillLevel || fighter.category || '',
    trainingFacility: fighter.gymName || fighter.trainingFacility || '',
    requiredPaymentsPaid:
      fighter.paymentMethod === 'cash' && fighter.cashCode ? 'All' : 'None',
    paymentNotes: fighter.paymentNotes || '',
    medicalExamDone: fighter.medicalExamDone || false,
    fightRecord: {
      wins: fighter.fightRecord?.wins || 0,
      losses: fighter.fightRecord?.losses || 0,
      draws: fighter.fightRecord?.draws || 0,
    },
    skillRank: fighter.skillRank || '',
    suspensionStatus: fighter.suspensionStatus || 'None',
    emergencyContact: {
      name: fighter.emergencyContactName || '',
      phone: fighter.emergencyContactPhone || '',
    },
    countryOfOrigin: fighter.country || '',
    lastEvent: fighter.lastEvent || '',
    physicalRenewalDate: fighter.physicalRenewalDate || '',
    licenseRenewalDate: fighter.licenseRenewalDate || '',
    hotelConfirmationNumber: fighter.hotelConfirmationNumber || '',
    parentalConsentUploaded: fighter.parentalConsentUploaded || false,
    comments: fighter.comments || '',
  })

  const [validationErrors, setValidationErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRemoveFighter = async (id) => {
    if (confirm('Are you sure you want to remove this fighter?')) {
      try {
        const res = await axios.delete(`${API_BASE_URL}/registrations/${id}`)
        if (res.status === apiConstants.success) {
          enqueueSnackbar(res.data.message, { variant: 'success' })
          setIsModalOpen(false)
          onSuccess()
        }
      } catch (error) {
        enqueueSnackbar('Failed to remove fighter', { variant: 'error' })
      }
    }
  }

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

    // Required field validations
    if (!formData.weighInValue || formData.weighInValue <= 0) {
      errors.weighInValue = 'Weight is required and must be greater than 0'
    }

    if (!formData.weighInDate) {
      errors.weighInDate = 'Weigh-in date is required'
    }

    if (!formData.category) {
      errors.category = 'Category is required'
    }

    if (!formData.trainingFacility || formData.trainingFacility.trim() === '') {
      errors.trainingFacility = 'Training facility is required'
    }

    if (
      !formData.emergencyContact.name ||
      formData.emergencyContact.name.trim() === ''
    ) {
      errors.emergencyContactName = 'Emergency contact name is required'
    }

    if (
      !formData.emergencyContact.phone ||
      formData.emergencyContact.phone.trim() === ''
    ) {
      errors.emergencyContactPhone = 'Emergency contact phone is required'
    }

    if (!formData.countryOfOrigin || formData.countryOfOrigin.trim() === '') {
      errors.countryOfOrigin = 'Country of origin is required'
    }

    // Parental consent required if under 18
    const fighterAge = fighter.dateOfBirth
      ? new Date().getFullYear() - new Date(fighter.dateOfBirth).getFullYear()
      : null

    if (fighterAge && fighterAge < 18 && !formData.parentalConsentUploaded) {
      errors.parentalConsentUploaded =
        'Parental consent is required for fighters under 18'
    }

    // NEW: Skill Rank required
    if (!formData.skillRank || formData.skillRank.trim() === '') {
      errors.skillRank = 'Skill rank/belt level is required'
    }

    // NEW: Medical Exam required to be confirmed
    if (!formData.medicalExamDone) {
      errors.medicalExamDone = 'Medical exam must be completed before check-in'
    }

    // NEW: Payment status required
    if (formData.requiredPaymentsPaid === 'None') {
      errors.requiredPaymentsPaid = 'Required payments must be completed'
    }

    // Enhanced name validation - no numbers or special characters except spaces, hyphens, apostrophes
    const namePattern = /^[a-zA-Z\s\-']+$/
    if (
      formData.emergencyContact.name &&
      !namePattern.test(formData.emergencyContact.name)
    ) {
      errors.emergencyContactName =
        'Name can only contain letters, spaces, hyphens, and apostrophes'
    }

    // Enhanced phone number format validation - only digits, spaces, hyphens, parentheses, plus
    const phonePattern = /^[\+]?[\d\s\-\(\)]{10,15}$/
    if (
      formData.emergencyContact.phone &&
      !phonePattern.test(formData.emergencyContact.phone.replace(/\s/g, ''))
    ) {
      errors.emergencyContactPhone =
        'Phone number can only contain digits, spaces, hyphens, parentheses, and plus sign'
    }

    // Enhanced weight validation - positive numbers only
    if (
      formData.weighInValue &&
      (formData.weighInValue < 50 || formData.weighInValue > 500)
    ) {
      errors.weighInValue = 'Weight must be between 50 and 500 lbs'
    }

    if (formData.weighInValue && formData.weighInValue < 0) {
      errors.weighInValue = 'Weight cannot be negative'
    }

    // Enhanced height validation - positive numbers only
    if (formData.heightInInches && formData.heightInInches < 0) {
      errors.heightInInches = 'Height cannot be negative'
    }

    if (
      formData.heightInInches &&
      (formData.heightInInches < 36 || formData.heightInInches > 96)
    ) {
      errors.heightInInches = 'Height must be between 36 and 96 inches'
    }

    // Fight record validation - non-negative integers only
    if (
      formData.fightRecord.wins < 0 ||
      !Number.isInteger(Number(formData.fightRecord.wins))
    ) {
      errors.fightRecordWins = 'Wins must be a non-negative integer'
    }

    if (
      formData.fightRecord.losses < 0 ||
      !Number.isInteger(Number(formData.fightRecord.losses))
    ) {
      errors.fightRecordLosses = 'Losses must be a non-negative integer'
    }

    if (
      formData.fightRecord.draws < 0 ||
      !Number.isInteger(Number(formData.fightRecord.draws))
    ) {
      errors.fightRecordDraws = 'Draws must be a non-negative integer'
    }

    // Date validations
    if (formData.weighInDate) {
      const weighInDate = new Date(formData.weighInDate)
      const today = new Date()
      const oneWeekAgo = new Date(today.setDate(today.getDate() - 7))
      const oneWeekFromNow = new Date(today.setDate(today.getDate() + 14))

      if (weighInDate < oneWeekAgo || weighInDate > oneWeekFromNow) {
        errors.weighInDate =
          'Weigh-in date must be within the past week or next week'
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

      // Show error notification
      if (window.enqueueSnackbar) {
        window.enqueueSnackbar(
          'Please fix the validation errors before submitting',
          { variant: 'error' }
        )
      } else {
        alert('Please fix the validation errors before submitting')
      }
      return
    }

    setIsSubmitting(true)

    try {
      const result = await onCheckin(formData)
      if (result.success) {
        setIsModalOpen(false)
        if (window.enqueueSnackbar) {
          window.enqueueSnackbar('Fighter checked in successfully', {
            variant: 'success',
          })
        }
      } else {
        if (window.enqueueSnackbar) {
          window.enqueueSnackbar(result.error || 'Check-in failed', {
            variant: 'error',
          })
        } else {
          alert(result.error || 'Check-in failed')
        }
      }
    } catch (error) {
      console.error('Check-in error:', error)
      if (window.enqueueSnackbar) {
        window.enqueueSnackbar('An error occurred during check-in', {
          variant: 'error',
        })
      } else {
        alert('An error occurred during check-in')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenModal = () => {
    setValidationErrors({}) // Clear previous validation errors
    setIsSubmitting(false)
    setIsModalOpen(true)
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        className='bg-blue-600 px-3 py-1 rounded hover:bg-blue-700'
      >
        {fighter.checkInStatus ? 'Update' : 'Check-in'}
      </button>

      {isModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center z-50 p-4 overflow-y-auto'>
          <div className='bg-[#0B1739] rounded-lg p-6 w-full max-w-4xl my-4 max-h-[calc(100vh-2rem)] overflow-y-auto'>
            <h2 className='text-xl font-bold mb-4'>
              {fighter.firstName} {fighter.lastName} - Check-in
            </h2>

            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Fighter Information (Readonly) */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Fighter Information
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm mb-1 text-gray-400'>
                      Full Name
                    </label>
                    <input
                      type='text'
                      value={`${fighter.firstName} ${fighter.lastName}`}
                      className='w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300'
                      readOnly
                    />
                  </div>
                  <div>
                    <label className='block text-sm mb-1 text-gray-400'>
                      Gender
                    </label>
                    <input
                      type='text'
                      value={fighter.gender || 'N/A'}
                      className='w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300'
                      readOnly
                    />
                  </div>
                  <div>
                    <label className='block text-sm mb-1 text-gray-400'>
                      Date Registered
                    </label>
                    <input
                      type='text'
                      value={
                        fighter.createdAt
                          ? new Date(fighter.createdAt).toLocaleDateString()
                          : 'N/A'
                      }
                      className='w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300'
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Weigh-in Section */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Weigh-in Details
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm mb-1'>
                      Weight (lbs) <span className='text-red-400'>*</span>
                    </label>
                    <input
                      type='number'
                      name='weighInValue'
                      value={formData.weighInValue}
                      onChange={handleChange}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.weighInValue
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      required
                      min='1'
                      step='0.1'
                    />
                    {validationErrors.weighInValue && (
                      <p className='text-red-500 text-xs mt-1'>
                        {validationErrors.weighInValue}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className='block text-sm mb-1'>
                      Weigh-in Date <span className='text-red-400'>*</span>
                    </label>
                    <input
                      type='date'
                      name='weighInDate'
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
                      <p className='text-red-500 text-xs mt-1'>
                        {validationErrors.weighInDate}
                      </p>
                    )}
                  </div>
                  <div className='flex items-end'>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        name='isOfficialWeight'
                        checked={formData.isOfficialWeight}
                        onChange={handleChange}
                        className='mr-2'
                      />
                      Official Weight
                    </label>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Personal Details
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm mb-1'>
                      Height (inches)
                    </label>
                    <input
                      type='number'
                      name='heightInInches'
                      value={formData.heightInInches}
                      onChange={handleChange}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.heightInInches
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      min='36'
                      max='96'
                    />
                    {validationErrors.heightInInches && (
                      <p className='text-red-500 text-xs mt-1'>
                        {validationErrors.heightInInches}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm mb-1'>
                      Category <span className='text-red-400'>*</span>
                    </label>
                    <select
                      name='category'
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.category
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      required
                    >
                      <option value=''>Select</option>
                      <option value='Novice'>Novice</option>
                      <option value='Amateur'>Amateur</option>
                      <option value='Professional'>Professional</option>
                      <option value='Beginner (0-2 years)'>
                        Beginner (0-2 years)
                      </option>
                      <option value='Intermediate (3-5 years)'>
                        Intermediate (3-5 years)
                      </option>
                      <option value='Advanced (6-10 years)'>
                        Advanced (6-10 years)
                      </option>
                      <option value='Expert (10+ years)'>
                        Expert (10+ years)
                      </option>
                    </select>
                    {validationErrors.category && (
                      <p className='text-red-500 text-xs mt-1'>
                        {validationErrors.category}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Training Info */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Training Information
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm mb-1'>
                      Training Facility <span className='text-red-400'>*</span>
                    </label>
                    <input
                      type='text'
                      name='trainingFacility'
                      value={formData.trainingFacility}
                      onChange={handleChange}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.trainingFacility
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      placeholder='e.g., Elite MMA Gym, Champions Dojo'
                      required
                    />
                    {validationErrors.trainingFacility && (
                      <p className='text-red-500 text-xs mt-1'>
                        {validationErrors.trainingFacility}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className='block text-sm mb-1'>
                      Skill Rank/Belt Level{' '}
                      <span className='text-red-400'>*</span>
                    </label>
                    <input
                      type='text'
                      name='skillRank'
                      value={formData.skillRank}
                      onChange={handleChange}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.skillRank
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      placeholder='e.g., White Belt, Blue Belt, Brown Belt'
                      required
                    />
                    {validationErrors.skillRank && (
                      <p className='text-red-500 text-xs mt-1'>
                        {validationErrors.skillRank}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Fight Record */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Fight Record
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm mb-1'>Wins</label>
                    <input
                      type='number'
                      name='wins'
                      value={formData.fightRecord.wins}
                      onChange={(e) => {
                        const value = Math.max(0, parseInt(e.target.value) || 0)
                        setFormData((prev) => ({
                          ...prev,
                          fightRecord: { ...prev.fightRecord, wins: value },
                        }))
                        if (validationErrors.fightRecordWins) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            fightRecordWins: '',
                          }))
                        }
                      }}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.fightRecordWins
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      min='0'
                      step='1'
                    />
                    {validationErrors.fightRecordWins && (
                      <p className='text-red-500 text-xs mt-1'>
                        {validationErrors.fightRecordWins}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className='block text-sm mb-1'>Losses</label>
                    <input
                      type='number'
                      name='losses'
                      value={formData.fightRecord.losses}
                      onChange={(e) => {
                        const value = Math.max(0, parseInt(e.target.value) || 0)
                        setFormData((prev) => ({
                          ...prev,
                          fightRecord: { ...prev.fightRecord, losses: value },
                        }))
                        if (validationErrors.fightRecordLosses) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            fightRecordLosses: '',
                          }))
                        }
                      }}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.fightRecordLosses
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      min='0'
                      step='1'
                    />
                    {validationErrors.fightRecordLosses && (
                      <p className='text-red-500 text-xs mt-1'>
                        {validationErrors.fightRecordLosses}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className='block text-sm mb-1'>Draws</label>
                    <input
                      type='number'
                      name='draws'
                      value={formData.fightRecord.draws}
                      onChange={(e) => {
                        const value = Math.max(0, parseInt(e.target.value) || 0)
                        setFormData((prev) => ({
                          ...prev,
                          fightRecord: { ...prev.fightRecord, draws: value },
                        }))
                        if (validationErrors.fightRecordDraws) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            fightRecordDraws: '',
                          }))
                        }
                      }}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.fightRecordDraws
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      min='0'
                      step='1'
                    />
                    {validationErrors.fightRecordDraws && (
                      <p className='text-red-500 text-xs mt-1'>
                        {validationErrors.fightRecordDraws}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Medical & Payments */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Medical & Payments
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm mb-1'>
                      Payments Status <span className='text-red-400'>*</span>
                    </label>
                    <select
                      name='requiredPaymentsPaid'
                      value={formData.requiredPaymentsPaid}
                      onChange={handleChange}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.requiredPaymentsPaid
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      required
                    >
                      <option value='All'>All Paid</option>
                      <option value='Partial'>Partial</option>
                      <option value='None'>None</option>
                    </select>
                    {validationErrors.requiredPaymentsPaid && (
                      <p className='text-red-500 text-xs mt-1'>
                        {validationErrors.requiredPaymentsPaid}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm mb-1'>Payment Notes</label>
                    <input
                      type='text'
                      name='paymentNotes'
                      value={formData.paymentNotes}
                      onChange={handleChange}
                      className='w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2'
                      placeholder='Payment method, confirmation number, etc.'
                    />
                  </div>
                </div>

                <div className='mt-4'>
                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      name='medicalExamDone'
                      checked={formData.medicalExamDone}
                      onChange={handleChange}
                      className={`mr-2 ${
                        validationErrors.medicalExamDone ? 'border-red-500' : ''
                      }`}
                      required
                    />
                    <label className='text-sm'>
                      Medical Exam Completed{' '}
                      <span className='text-red-400'>*</span>
                    </label>
                  </div>
                  {validationErrors.medicalExamDone && (
                    <p className='text-red-500 text-xs mt-1'>
                      {validationErrors.medicalExamDone}
                    </p>
                  )}
                </div>
              </div>

              {/* Suspension Status */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Status & Compliance
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm mb-1 text-gray-400'>
                      Suspension Status (Readonly)
                    </label>
                    <select
                      name='suspensionStatus'
                      value={formData.suspensionStatus}
                      className='w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300'
                      disabled
                    >
                      <option value='None'>None</option>
                      <option value='Medical'>Medical Suspension</option>
                      <option value='Disciplinary'>
                        Disciplinary Suspension
                      </option>
                      <option value='Administrative'>
                        Administrative Suspension
                      </option>
                    </select>
                    <p className='text-xs text-gray-400 mt-1'>
                      Contact admin to modify suspension status
                    </p>
                  </div>

                  <div>
                    <label className='block text-sm mb-1'>
                      Hotel Confirmation Number
                    </label>
                    <input
                      type='text'
                      name='hotelConfirmationNumber'
                      value={formData.hotelConfirmationNumber}
                      onChange={handleChange}
                      className='w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2'
                      placeholder='e.g., CONF123456789'
                    />
                  </div>
                </div>

                <div className='mt-4'>
                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      name='parentalConsentUploaded'
                      checked={formData.parentalConsentUploaded}
                      onChange={handleChange}
                      className={`mr-2 ${
                        validationErrors.parentalConsentUploaded
                          ? 'border-red-500'
                          : ''
                      }`}
                    />
                    <label className='text-sm'>
                      Parental Consent Uploaded (if under 18){' '}
                      <span className='text-red-400'>*</span>
                    </label>
                  </div>
                  {validationErrors.parentalConsentUploaded && (
                    <p className='text-red-500 text-xs mt-1'>
                      {validationErrors.parentalConsentUploaded}
                    </p>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Emergency Contact
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm mb-1'>
                      Name <span className='text-red-400'>*</span>
                    </label>
                    <input
                      type='text'
                      name='emergencyContactName'
                      value={formData.emergencyContact.name}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          emergencyContact: {
                            ...prev.emergencyContact,
                            name: e.target.value,
                          },
                        }))

                        // Clear validation error
                        if (validationErrors.emergencyContactName) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            emergencyContactName: '',
                          }))
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
                      <p className='text-red-500 text-xs mt-1'>
                        {validationErrors.emergencyContactName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className='block text-sm mb-1'>
                      Phone <span className='text-red-400'>*</span>
                    </label>
                    <input
                      type='tel'
                      name='emergencyContactPhone'
                      value={formData.emergencyContact.phone}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          emergencyContact: {
                            ...prev.emergencyContact,
                            phone: e.target.value,
                          },
                        }))

                        // Clear validation error
                        if (validationErrors.emergencyContactPhone) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            emergencyContactPhone: '',
                          }))
                        }
                      }}
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.emergencyContactPhone
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      required
                      placeholder='(555) 123-4567'
                    />
                    {validationErrors.emergencyContactPhone && (
                      <p className='text-red-500 text-xs mt-1'>
                        {validationErrors.emergencyContactPhone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Fields */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Additional Information
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm mb-1'>
                      Country of Origin <span className='text-red-400'>*</span>
                    </label>
                    <input
                      type='text'
                      name='countryOfOrigin'
                      value={formData.countryOfOrigin || ''}
                      onChange={handleChange}
                      placeholder='e.g., USA, Canada'
                      className={`w-full bg-[#07091D] border rounded px-3 py-2 ${
                        validationErrors.countryOfOrigin
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#343B4F] focus:border-blue-500'
                      }`}
                      required
                    />
                    {validationErrors.countryOfOrigin && (
                      <p className='text-red-500 text-xs mt-1'>
                        {validationErrors.countryOfOrigin}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className='block text-sm mb-1'>
                      Last Event Participated
                    </label>
                    <input
                      type='text'
                      name='lastEvent'
                      value={formData.lastEvent || ''}
                      onChange={handleChange}
                      placeholder='e.g., SCFC 16'
                      className='w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2'
                    />
                  </div>
                </div>
              </div>

              {/* Legal & Compliance */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Legal & Compliance
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm mb-1'>
                      Fighter Physical Renewal Date
                    </label>
                    <input
                      type='date'
                      name='physicalRenewalDate'
                      value={formData.physicalRenewalDate || ''}
                      onChange={handleChange}
                      className='w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2'
                      title="Date when fighter's medical physical expires"
                    />
                  </div>
                  <div>
                    <label className='block text-sm mb-1'>
                      Fighter License Renewal Date
                    </label>
                    <input
                      type='date'
                      name='licenseRenewalDate'
                      value={formData.licenseRenewalDate || ''}
                      onChange={handleChange}
                      className='w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2'
                      title="Date when fighter's license expires"
                    />
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
                  <div>
                    <label className='block text-sm mb-1'>
                      Hotel Confirmation #
                    </label>
                    <input
                      type='text'
                      name='hotelConfirmation'
                      value={formData.hotelConfirmation || ''}
                      onChange={handleChange}
                      className='w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2'
                    />
                  </div>
                  <div className='flex items-end'>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        name='parentalConsent'
                        checked={formData.parentalConsent || false}
                        onChange={handleChange}
                        className='mr-2'
                      />
                      Parental Consent (if under 18)
                    </label>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Comments
                </h3>
                <label className='block text-sm mb-1'>Comments/Notes</label>
                <textarea
                  name='comments'
                  value={formData.comments || ''}
                  onChange={handleChange}
                  rows={3}
                  className='w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2'
                  placeholder='Additional notes or comments...'
                />
              </div>

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

              {/* Image Upload */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Fighter Photo
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm mb-1'>
                      Upload Fighter Photo
                    </label>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          // For now, just store the filename
                          setFormData((prev) => ({
                            ...prev,
                            fighterPhoto: file.name,
                          }))
                        }
                      }}
                      className='w-full bg-[#07091D] border border-[#343B4F] rounded px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700'
                    />
                    <p className='text-xs text-gray-400 mt-1'>
                      Accepted formats: JPG, PNG, GIF (max 5MB)
                    </p>
                  </div>
                  <div>
                    {fighter.profileImage && (
                      <div>
                        <label className='block text-sm mb-1 text-gray-400'>
                          Current Photo
                        </label>
                        <div className='w-20 h-20 bg-gray-700 rounded border border-gray-600 flex items-center justify-center'>
                          <span className='text-xs text-gray-400'>Photo</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Required Fields Notice */}
              <div className='bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-3'>
                <p className='text-blue-300 text-sm'>
                  <span className='text-red-400'>*</span> Required fields must
                  be completed before check-in
                </p>
              </div>

              {/* Buttons */}
              <div className='flex justify-between items-center pt-6 border-t border-gray-600 bg-[#0B1739]'>
                <button
                  type='button'
                  onClick={() => {
                    handleRemoveFighter(fighter._id)
                  }}
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
                    Cancel
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
                    {isSubmitting ? 'Processing...' : 'Confirm Check-in'}
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

export default CheckinForm
