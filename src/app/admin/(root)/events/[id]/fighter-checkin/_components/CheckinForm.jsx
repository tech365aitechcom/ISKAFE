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

      enqueueSnackbar('Please fix the validation errors before submitting', {
        variant: 'error',
      })

      return
    }

    setIsSubmitting(true)

    try {
      const result = await onCheckin(formData)
      if (result.success) {
        setIsModalOpen(false)
        enqueueSnackbar('Fighter checked in successfully', {
          variant: 'success',
        })
      } else {
        enqueueSnackbar(result.error || 'Check-in failed', {
          variant: 'error',
        })
      }
    } catch (error) {
      console.error('Check-in error:', error)
      enqueueSnackbar('An error occurred during check-in', {
        variant: 'error',
      })
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
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                  <div>
                    <label className='block text-sm mb-1 text-gray-400'>
                      Serial No. / ID
                    </label>
                    <input
                      type='text'
                      value={fighter._id?.slice(-6).toUpperCase() || 'AUTO ID'}
                      className='w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300'
                      readOnly
                    />
                  </div>
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
                      Age
                    </label>
                    <input
                      type='text'
                      value={
                        fighter.dateOfBirth
                          ? new Date().getFullYear() -
                            new Date(fighter.dateOfBirth).getFullYear()
                          : 'N/A'
                      }
                      className='w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300'
                      readOnly
                    />
                  </div>
                  <div>
                    <label className='block text-sm mb-1 text-gray-400'>
                      Weight (Registered)
                    </label>
                    <input
                      type='text'
                      value={`${
                        fighter.walkAroundWeight || fighter.weight || 'N/A'
                      } ${fighter.weightUnit || 'lbs'}`}
                      className='w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-300'
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Weigh-in Section - Core Required Fields */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Weigh-in Details
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm mb-1'>
                      Weigh-In Value (lbs){' '}
                      <span className='text-red-400'>*</span>
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
                      placeholder='e.g., 170'
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
                      Weigh-In Date <span className='text-red-400'>*</span>
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
                      Check if Official Weight
                    </label>
                  </div>
                </div>
              </div>

              {/* Additional Required Fields */}
              <div>
                <h3 className='font-bold mb-3 text-blue-400 border-b border-gray-600 pb-2'>
                  Additional Details
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
                      placeholder='e.g., 68'
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
                      <option value=''>Novice / Amateur / Pro</option>
                      <option value='Novice'>Novice</option>
                      <option value='Amateur'>Amateur</option>
                      <option value='Professional'>Professional</option>
                    </select>
                    {validationErrors.category && (
                      <p className='text-red-500 text-xs mt-1'>
                        {validationErrors.category}
                      </p>
                    )}
                  </div>
                </div>
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
                    {isSubmitting ? 'Processing...' : 'Update Check-in Status'}
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
