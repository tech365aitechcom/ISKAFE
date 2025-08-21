'use client'

import React, { useState, useEffect } from 'react'
import { X, Upload, Calendar } from 'lucide-react'
import { API_BASE_URL } from '../../../../../../../constants'
import useStore from '../../../../../../../stores/useStore'
import { enqueueSnackbar } from 'notistack'

export default function SuspensionModal({ fighter, onClose, onSave }) {
  const user = useStore((state) => state.user)
  const [formData, setFormData] = useState({
    type: '',
    daysWithoutTraining: '',
    daysBeforeCompeting: '',
    incidentDate: '',
    description: '',
    indefinite: false,
    medicalClearance: false,
    medicalDocument: null,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [validationError, setValidationError] = useState('')
  const [existingSuspensions, setExistingSuspensions] = useState([])
  const [showExistingSuspensions, setShowExistingSuspensions] = useState(false)

  const suspensionTypes = ['Medical', 'Disciplinary']

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return 'Invalid Date'
    }
  }

  const getSuspensionStatus = (suspension) => {
    if (suspension.indefinite) return 'Indefinite'
    if (suspension.status === 'Closed') return 'Closed'

    const today = new Date()
    const incidentDate = new Date(suspension.incidentDate)

    // Calculate end dates based on suspension type
    let trainingEndDate = null
    let competingEndDate = null

    if (suspension.daysWithoutTraining) {
      trainingEndDate = new Date(incidentDate)
      trainingEndDate.setDate(
        incidentDate.getDate() + suspension.daysWithoutTraining
      )
    }

    if (suspension.daysBeforeCompeting) {
      competingEndDate = new Date(incidentDate)
      competingEndDate.setDate(
        incidentDate.getDate() + suspension.daysBeforeCompeting
      )
    }

    // Check if any suspension period is still active
    const isTrainingActive = trainingEndDate && today < trainingEndDate
    const isCompetingActive = competingEndDate && today < competingEndDate

    if (isTrainingActive || isCompetingActive) {
      return 'Active'
    } else if (trainingEndDate || competingEndDate) {
      return 'Expired'
    }

    return suspension.status || 'Active'
  }

  const getSuspensionDetails = (suspension) => {
    const details = []
    if (suspension.daysWithoutTraining) {
      details.push(`${suspension.daysWithoutTraining} days without training`)
    }
    if (suspension.daysBeforeCompeting) {
      details.push(`${suspension.daysBeforeCompeting} days before competing`)
    }
    if (suspension.indefinite) {
      details.push('Indefinite suspension')
    }
    return details.length > 0 ? details.join(', ') : 'No duration specified'
  }

  console.log('fighter.suspensions', fighter)
  useEffect(() => {
    // Check if fighter has existing suspensions
    if (fighter && fighter.suspensions && fighter.suspensions.length > 0) {
      setExistingSuspensions(fighter.suspensions)
      setShowExistingSuspensions(true)
    }
  }, [fighter])

  const validateForm = () => {
    const newErrors = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day for comparison

    // Validate incident date
    if (formData.incidentDate) {
      const incidentDate = new Date(formData.incidentDate)
      incidentDate.setHours(0, 0, 0, 0)

      if (incidentDate > today) {
        newErrors.incidentDate = 'Incident date cannot be in the future'
      }
    }

    // Validate training suspension days
    if (
      formData.daysWithoutTraining &&
      parseInt(formData.daysWithoutTraining) < 0
    ) {
      newErrors.daysWithoutTraining = 'Days without training cannot be negative'
    }

    // Validate competing suspension days
    if (
      formData.daysBeforeCompeting &&
      parseInt(formData.daysBeforeCompeting) < 0
    ) {
      newErrors.daysBeforeCompeting = 'Days before competing cannot be negative'
    }

    return newErrors
  }

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target

    // Clear previous errors for this field
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }))
    setValidationError('')

    if (type === 'file') {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }))
    } else if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))

      // Real-time validation
      if (
        name === 'incidentDate' ||
        name === 'daysWithoutTraining' ||
        name === 'daysBeforeCompeting' ||
        name === 'indefinite'
      ) {
        setTimeout(() => {
          const formErrors = validateForm()
          setErrors(formErrors)
        }, 100)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setValidationError('')
    setErrors({})

    try {
      // Comprehensive validation before submission
      const formErrors = validateForm()

      if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors)
        setValidationError('Please fix the validation errors before saving.')
        setLoading(false)
        return
      }

      // Validate required fields
      if (!formData.type) {
        setValidationError('Suspension type is required.')
        setLoading(false)
        return
      }

      if (!formData.incidentDate) {
        setValidationError('Incident date is required.')
        setLoading(false)
        return
      }

      if (!formData.description || formData.description.trim().length < 10) {
        setValidationError('Description is required (minimum 10 characters).')
        setLoading(false)
        return
      }

      // Create suspension data object according to the schema
      const suspensionData = {
        person: fighter._id,
        personType: 'Registration',
        status: 'Active',
        type: formData.type,
        incidentDate: formData.incidentDate,
        description: formData.description,
        indefinite: formData.indefinite,
        medicalClearance: formData.medicalClearance,
        createdBy: user._id,
      }

      // Add days only if specified and not indefinite
      if (!formData.indefinite) {
        if (formData.daysWithoutTraining) {
          suspensionData.daysWithoutTraining = parseInt(
            formData.daysWithoutTraining
          )
        }
        if (formData.daysBeforeCompeting) {
          suspensionData.daysBeforeCompeting = parseInt(
            formData.daysBeforeCompeting
          )
        }
      }

      console.log('Submitting suspension data:', suspensionData)

      const response = await fetch(`${API_BASE_URL}/suspensions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(suspensionData),
      })

      let responseData = {}
      try {
        responseData = await response.json()
      } catch (jsonError) {
        console.warn('Response is not valid JSON:', jsonError)
        // If response is not JSON but status is success, treat as success
        if (response.ok) {
          responseData = {
            success: true,
            message: 'Suspension created successfully',
          }
        }
      }

      console.log('Response status:', response.status)
      console.log('Response data:', responseData)

      if (response.ok) {
        // Success response - check for both success flag and 200/201 status
        if (
          responseData.success ||
          response.status === 200 ||
          response.status === 201
        ) {
          // Call onSave with the response data if available
          if (onSave && typeof onSave === 'function') {
            onSave(responseData.data || responseData)
          }

          // Update existing suspensions list with the new suspension
          const newSuspension = responseData.data || responseData
          if (newSuspension) {
            setExistingSuspensions((prev) => [...prev, newSuspension])
          }

          // Show success notification first
          if (typeof enqueueSnackbar === 'function') {
            enqueueSnackbar('Suspension added successfully!', {
              variant: 'success',
            })
          } else {
            alert('Suspension added successfully!')
          }

          // Close the modal with a small delay to ensure notification shows
          setTimeout(() => {
            if (onClose && typeof onClose === 'function') {
              onClose()
            }
          }, 100)
        } else {
          setValidationError(
            'Error adding suspension: ' +
              (responseData.message || 'Unknown error from server')
          )
        }
      } else {
        // Handle different HTTP status codes
        let errorMessage = 'Error adding suspension'

        if (response.status === 400) {
          errorMessage =
            'Invalid suspension data: ' +
            (responseData.message || 'Please check your inputs')
        } else if (response.status === 401) {
          errorMessage = 'Unauthorized: Please check your login status'
        } else if (response.status === 403) {
          errorMessage =
            'Forbidden: You do not have permission to add suspensions'
        } else if (response.status === 404) {
          errorMessage = 'API endpoint not found: Please contact support'
        } else if (response.status === 500) {
          errorMessage =
            'Server error: Please try again later or contact support'
        } else {
          errorMessage = `HTTP ${response.status}: ${
            responseData.message || 'Unknown error'
          }`
        }

        setValidationError(errorMessage)
      }
    } catch (err) {
      console.error('Suspension submission error:', err)
      setValidationError(
        'Network error: ' +
          err.message +
          '. Please check your connection and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'>
      <div className='bg-[#0B1739] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h2 className='text-xl font-bold text-white'>
              Add Suspension - {fighter.firstName} {fighter.lastName}
            </h2>
            {existingSuspensions.length > 0 && (
              <div className='flex items-center gap-2 mt-2'>
                <span className='text-yellow-400 text-sm'>
                  ⚠ Fighter has {existingSuspensions.length} existing
                  suspension(s)
                </span>
                {existingSuspensions.some(
                  (s) => getSuspensionStatus(s) === 'Active'
                ) && (
                  <span className='px-2 py-1 bg-red-500 bg-opacity-20 text-red-300 text-xs rounded'>
                    CURRENTLY SUSPENDED
                  </span>
                )}
              </div>
            )}
          </div>
          <button onClick={onClose} className='text-gray-400 hover:text-white'>
            <X size={24} />
          </button>
        </div>

        {/* Validation Error Display */}
        {validationError && (
          <div className='mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg'>
            <div className='flex items-center mb-2'>
              <span className='text-red-400 text-sm font-medium'>
                ⚠ Validation Error:
              </span>
            </div>
            <p className='text-red-300 text-sm'>{validationError}</p>
          </div>
        )}

        {/* Existing Suspensions Display */}
        {existingSuspensions.length > 0 && (
          <div className='mb-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-medium text-white'>
                Existing Suspensions ({existingSuspensions.length})
              </h3>
              <button
                type='button'
                onClick={() =>
                  setShowExistingSuspensions(!showExistingSuspensions)
                }
                className='text-blue-400 hover:text-blue-300 text-sm'
              >
                {showExistingSuspensions ? 'Hide' : 'Show'} Details
              </button>
            </div>

            {showExistingSuspensions && (
              <div className='space-y-3 max-h-60 overflow-y-auto'>
                {existingSuspensions.map((suspension, index) => {
                  const status = getSuspensionStatus(suspension)
                  const statusColor =
                    status === 'Active'
                      ? 'text-red-400'
                      : status === 'Expired'
                      ? 'text-gray-400'
                      : status === 'Closed'
                      ? 'text-green-400'
                      : 'text-yellow-400'

                  return (
                    <div
                      key={suspension._id || index}
                      className='bg-slate-800 rounded-lg p-4 border border-slate-600'
                    >
                      <div className='flex items-start justify-between mb-2'>
                        <div className='flex items-center gap-3'>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium bg-opacity-20 ${
                              suspension.type === 'Medical'
                                ? 'bg-blue-500 text-blue-300'
                                : 'bg-orange-500 text-orange-300'
                            }`}
                          >
                            {suspension.type}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${statusColor} bg-opacity-20`}
                          >
                            {status}
                          </span>
                          {suspension.medicalClearance && (
                            <span className='px-2 py-1 rounded text-xs font-medium bg-purple-500 bg-opacity-20 text-purple-300'>
                              Medical Clearance Required
                            </span>
                          )}
                        </div>
                        <span className='text-xs text-gray-400'>
                          {formatDate(suspension.createdAt)}
                        </span>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
                        <div>
                          <span className='text-gray-400'>Incident Date:</span>
                          <span className='ml-2 text-white'>
                            {formatDate(suspension.incidentDate)}
                          </span>
                        </div>
                        <div>
                          <span className='text-gray-400'>Duration:</span>
                          <span className='ml-2 text-white'>
                            {getSuspensionDetails(suspension)}
                          </span>
                        </div>
                      </div>

                      {suspension.description && (
                        <div className='mt-3 text-sm'>
                          <span className='text-gray-400'>Description:</span>
                          <p className='text-white mt-1 text-xs leading-relaxed'>
                            {suspension.description}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Suspension Type */}
          <div>
            <label className='block text-sm font-medium text-white mb-2'>
              Suspension Type <span className='text-red-400'>*</span>
            </label>
            <select
              name='type'
              value={formData.type}
              onChange={handleChange}
              className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
              required
            >
              <option value=''>Select Suspension Type</option>
              {suspensionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Incident Date */}
          <div>
            <label className='block text-sm font-medium text-white mb-2'>
              Incident Date <span className='text-red-400'>*</span>
            </label>
            <input
              type='date'
              name='incidentDate'
              value={formData.incidentDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full bg-[#07091D] border rounded px-3 py-2 text-white ${
                errors.incidentDate ? 'border-red-500' : 'border-gray-600'
              }`}
              required
            />
            {errors.incidentDate && (
              <div className='text-red-400 text-xs mt-1'>
                ⚠ {errors.incidentDate}
              </div>
            )}
          </div>

          {/* Suspension Duration */}
          <div>
            <div className='flex items-center gap-3 mb-4'>
              <input
                type='checkbox'
                name='indefinite'
                id='indefinite'
                checked={formData.indefinite}
                onChange={handleChange}
                className='w-4 h-4'
              />
              <label htmlFor='indefinite' className='text-white'>
                Indefinite suspension
              </label>
            </div>

            {!formData.indefinite && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-white mb-2'>
                    Days Without Training
                  </label>
                  <input
                    type='number'
                    name='daysWithoutTraining'
                    value={formData.daysWithoutTraining}
                    onChange={handleChange}
                    min='0'
                    max='3650'
                    className={`w-full bg-[#07091D] border rounded px-3 py-2 text-white placeholder-gray-400 ${
                      errors.daysWithoutTraining
                        ? 'border-red-500'
                        : 'border-gray-600'
                    }`}
                    placeholder='e.g., 30'
                  />
                  {errors.daysWithoutTraining && (
                    <div className='text-red-400 text-xs mt-1'>
                      ⚠ {errors.daysWithoutTraining}
                    </div>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-white mb-2'>
                    Days Before Competing
                  </label>
                  <input
                    type='number'
                    name='daysBeforeCompeting'
                    value={formData.daysBeforeCompeting}
                    onChange={handleChange}
                    min='0'
                    max='3650'
                    className={`w-full bg-[#07091D] border rounded px-3 py-2 text-white placeholder-gray-400 ${
                      errors.daysBeforeCompeting
                        ? 'border-red-500'
                        : 'border-gray-600'
                    }`}
                    placeholder='e.g., 60'
                  />
                  {errors.daysBeforeCompeting && (
                    <div className='text-red-400 text-xs mt-1'>
                      ⚠ {errors.daysBeforeCompeting}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Medical Clearance Required */}
          {formData.type === 'Medical' && (
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  name='medicalClearance'
                  id='medicalClearance'
                  checked={formData.medicalClearance}
                  onChange={handleChange}
                  className='w-4 h-4'
                />
                <label htmlFor='medicalClearance' className='text-white'>
                  Medical clearance required before lifting suspension
                </label>
              </div>

              {/* Medical Document Upload */}
              {formData.medicalClearance && (
                <div>
                  <label className='block text-sm font-medium text-white mb-2'>
                    Upload Medical Document
                  </label>
                  <div className='border-2 border-dashed border-gray-600 rounded-lg p-4'>
                    <div className='text-center'>
                      <Upload className='mx-auto h-12 w-12 text-gray-400' />
                      <div className='mt-2'>
                        <input
                          type='file'
                          name='medicalDocument'
                          onChange={handleChange}
                          accept='.pdf,.jpg,.jpeg,.png,.doc,.docx'
                          className='hidden'
                          id='medicalDocumentUpload'
                        />
                        <label
                          htmlFor='medicalDocumentUpload'
                          className='cursor-pointer inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-[#07091D] hover:bg-gray-700'
                        >
                          Choose File
                        </label>
                      </div>
                      <p className='mt-2 text-xs text-gray-400'>
                        PDF, DOC, DOCX, JPG, PNG up to 10MB
                      </p>
                      {formData.medicalDocument && (
                        <p className='mt-2 text-sm text-green-400'>
                          Selected: {formData.medicalDocument.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label className='block text-sm font-medium text-white mb-2'>
              Description <span className='text-red-400'>*</span>
            </label>
            <textarea
              name='description'
              value={formData.description}
              onChange={handleChange}
              rows='4'
              minLength='10'
              className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400'
              placeholder='Describe the incident and reason for suspension (minimum 10 characters)...'
              required
            />
            <div className='text-xs text-gray-400 mt-1'>
              {formData.description.length}/10 characters minimum
            </div>
          </div>

          {/* Fighter Info Display */}
          <div className='p-4 bg-[#07091D] rounded-lg'>
            <h3 className='text-sm font-medium text-white mb-2'>
              Fighter Information
            </h3>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-gray-400'>Name:</span>
                <span className='ml-2 text-white'>
                  {fighter.firstName} {fighter.lastName}
                </span>
              </div>
              <div>
                <span className='text-gray-400'>Email:</span>
                <span className='ml-2 text-white'>{fighter.email}</span>
              </div>
              <div>
                <span className='text-gray-400'>Weight Class:</span>
                <span className='ml-2 text-white'>
                  {fighter.weightClass || 'N/A'}
                </span>
              </div>
              <div>
                <span className='text-gray-400'>Training Experience:</span>
                <span className='ml-2 text-white'>
                  {fighter.trainingExperience || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end gap-4 pt-4 border-t border-gray-600'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-gray-300 border border-gray-600 rounded hover:bg-gray-700'
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50'
              disabled={
                loading ||
                !formData.type ||
                !formData.incidentDate ||
                !formData.description ||
                formData.description.trim().length < 10 ||
                validationError
              }
            >
              {loading ? 'Adding...' : 'Add Suspension'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
