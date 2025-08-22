'use client'

import { useState, useEffect } from 'react'
import { X, User, Plus, Loader2 } from 'lucide-react'
import { API_BASE_URL, apiConstants } from '../../../../../../../constants'
import useStore from '../../../../../../../stores/useStore'
import { enqueueSnackbar } from 'notistack'
import axios from 'axios'

export default function AddParticipantModal({
  isOpen,
  onClose,
  eventId,
  onParticipantAdded,
}) {
  const user = useStore((state) => state.user)
  const [adding, setAdding] = useState(false)
  const [registrationType, setRegistrationType] = useState('fighter')
  const [errors, setErrors] = useState({})

  // Function to reset form data
  const resetFormData = () => ({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
  })
  const [formData, setFormData] = useState(resetFormData())

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData(resetFormData())
      setRegistrationType('fighter')
      setErrors({})
    }
  }, [isOpen])

  // Handle registration type change and reset form data
  const handleRegistrationTypeChange = (newType) => {
    setRegistrationType(newType)
    setFormData(resetFormData()) // Reset form data when switching types
    setErrors({}) // Clear any existing errors
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    // For name fields, filter out invalid characters in real-time
    let processedValue = value
    if (name === 'firstName' || name === 'lastName') {
      // Allow letters, spaces, hyphens, apostrophes, and international characters
      processedValue = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s\-']/g, '')
    } else if (name === 'phoneNumber') {
      // Only allow digits, spaces, hyphens, parentheses, and plus sign
      processedValue = value.replace(/[^0-9\s\-\(\)\+]/g, '')
    } else if (name === 'email') {
      // Convert email to lowercase for consistency
      processedValue = value.toLowerCase().trim()
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }))

    // Real-time validation for specific fields (from signup)
    if (name === 'firstName' || name === 'lastName') {
      validateNameField(name, processedValue)
    } else if (name === 'email') {
      validateEmailField(processedValue)
    } else if (name === 'phoneNumber') {
      validatePhoneNumberField(processedValue)
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  // Validation helper functions (from signup)
  const validateLettersOnly = (text) => {
    const trimmed = text.trim();
    // Reject empty, only-spaces, or multiple consecutive spaces
    if (!trimmed || /\s{2,}/.test(trimmed)) return false;
    return /^[A-Za-zÀ-ÖØ-öø-ÿ'-]+(?: [A-Za-zÀ-ÖØ-öø-ÿ'-]+)*$/.test(trimmed);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateMobileNumber = (number) => {
    // Check if number contains only digits and has reasonable length (10-12 digits for our use case)
    const cleanNumber = number.replace(/[\s\-\(\)\+]/g, '');
    return /^\d{10,12}$/.test(cleanNumber);
  };

  // Individual field validation functions
  const validateNameField = (fieldName, value) => {
    if (value && !validateLettersOnly(value)) {
      const fieldDisplayName =
        fieldName === 'firstName' ? 'First Name' : 'Last Name';
      setErrors((prev) => ({
        ...prev,
        [fieldName]: `${fieldDisplayName} should contain only letters and spaces`,
      }));
    } else if (value && (value.trim().length < 2 || value.trim().length > 50)) {
      const fieldDisplayName =
        fieldName === 'firstName' ? 'First Name' : 'Last Name';
      setErrors((prev) => ({
        ...prev,
        [fieldName]: `${fieldDisplayName} must be between 2-50 characters`,
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: '',
      }));
    }
  };

  const validateEmailField = (email) => {
    if (email && !validateEmail(email)) {
      setErrors((prev) => ({
        ...prev,
        email: 'Please enter a valid email address',
      }));
    } else if (email && email.length > 100) {
      setErrors((prev) => ({
        ...prev,
        email: 'Email address must not exceed 100 characters',
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        email: '',
      }));
    }
  };

  const validatePhoneNumberField = (phoneNumber) => {
    if (phoneNumber && !validateMobileNumber(phoneNumber)) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: 'Phone number should contain 10-12 digits only',
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {}

    // Required fields validation using signup logic
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required'
    } else if (!validateLettersOnly(formData.firstName)) {
      newErrors.firstName = 'First name should contain only letters and spaces'
    } else if (formData.firstName.trim().length < 2 || formData.firstName.trim().length > 50) {
      newErrors.firstName = 'First name must be between 2-50 characters'
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required'
    } else if (!validateLettersOnly(formData.lastName)) {
      newErrors.lastName = 'Last name should contain only letters and spaces'
    } else if (formData.lastName.trim().length < 2 || formData.lastName.trim().length > 50) {
      newErrors.lastName = 'Last name must be between 2-50 characters'
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    } else if (formData.email.trim().length > 100) {
      newErrors.email = 'Email address must not exceed 100 characters'
    }

    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!validateMobileNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number should contain 10-12 digits only'
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required'
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
    } else {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--
      }

      if (birthDate > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future'
      } else if (age < 5) {
        newErrors.dateOfBirth = 'Participant must be at least 5 years old'
      } else if (age > 100) {
        newErrors.dateOfBirth = 'Please enter a valid date of birth'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddParticipant = async () => {
    try {
      setAdding(true)

      const trimmedFirstName = formData.firstName.trim()
      const trimmedLastName = formData.lastName.trim()
      const trimmedEmail = formData.email.trim()

      // Additional validation before submission (from signup logic)
      if (!validateLettersOnly(trimmedFirstName)) {
        enqueueSnackbar(
          'First name is invalid. Avoid multiple or trailing spaces.',
          { variant: 'warning' }
        )
        setAdding(false)
        return
      }

      if (!validateLettersOnly(trimmedLastName)) {
        enqueueSnackbar(
          'Last name is invalid. Avoid multiple or trailing spaces.',
          { variant: 'warning' }
        )
        setAdding(false)
        return
      }

      if (!validateEmail(trimmedEmail)) {
        enqueueSnackbar('Please enter a valid email address', {
          variant: 'warning',
        })
        setAdding(false)
        return
      }

      if (!validateMobileNumber(formData.phoneNumber)) {
        enqueueSnackbar('Phone number should contain 10-12 digits only', {
          variant: 'warning',
        })
        setAdding(false)
        return
      }

      // Final form validation
      if (!validateForm()) {
        setAdding(false)
        return
      }

      const registrationData = {
        registrationType: registrationType,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        phoneNumber: formData.phoneNumber?.trim() || '',
        dateOfBirth: formData.dateOfBirth || '',
        gender: formData.gender || '',
        status: 'Verified',
        paymentStatus: 'Paid',
        paymentMethod: 'cash',
        waiverAgreed: true,
        legalDisclaimerAccepted: true,
        medicalExamDone: false,
        checkInStatus: 'Not Checked',
        event: eventId,
      }

      console.log('Adding participant:', registrationData)

      const response = await axios.post(
        `${API_BASE_URL}/registrations`,
        registrationData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
        }
      )

      if (response.status === apiConstants.create) {
        enqueueSnackbar(`Participant added successfully!`, {
          variant: 'success',
        })
        onParticipantAdded?.()
        onClose()
      }
    } catch (err) {
      console.log(err)
      enqueueSnackbar(
        err.response?.data?.message || 'Failed to add participant',
        {
          variant: 'error',
        }
      )
    } finally {
      setAdding(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-[#0B1739] border border-[#343B4F] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='p-6 border-b border-[#343B4F]'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-bold text-white'>
              Add Participant to Event
            </h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-white transition-colors'
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='p-6'>
          {/* Registration Type Selection */}
          <div className='mb-6'>
            <label className='block text-sm font-medium text-white mb-2'>
              Registration Type
            </label>
            <div className='flex gap-4'>
              <label className='flex items-center'>
                <input
                  type='radio'
                  name='registrationType'
                  value='fighter'
                  checked={registrationType === 'fighter'}
                  onChange={(e) => handleRegistrationTypeChange(e.target.value)}
                  className='mr-2'
                />
                <span className='text-white'>Fighter</span>
              </label>
              <label className='flex items-center'>
                <input
                  type='radio'
                  name='registrationType'
                  value='trainer'
                  checked={registrationType === 'trainer'}
                  onChange={(e) => handleRegistrationTypeChange(e.target.value)}
                  className='mr-2'
                />
                <span className='text-white'>Trainer</span>
              </label>
              <label className='flex items-center'>
                <input
                  type='radio'
                  name='registrationType'
                  value='official'
                  checked={registrationType === 'official'}
                  onChange={(e) => handleRegistrationTypeChange(e.target.value)}
                  className='mr-2'
                />
                <span className='text-white'>Official</span>
              </label>
            </div>
          </div>

          {/* Participant Information Form */}
          <div className='mb-6'>
            <label className='block text-sm font-medium text-white mb-4'>
              Participant Information
            </label>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* First Name */}
              <div>
                <label className='block text-sm text-gray-300 mb-1'>
                  First Name <span className='text-red-400'>*</span>
                </label>
                <input
                  type='text'
                  name='firstName'
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder='Enter first name'
                  maxLength={50}
                  className={`w-full bg-[#07091D] border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none ${
                    errors.firstName
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-600 focus:border-blue-500'
                  }`}
                  required
                />
                {errors.firstName && (
                  <p className='text-red-400 text-xs mt-1'>
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className='block text-sm text-gray-300 mb-1'>
                  Last Name <span className='text-red-400'>*</span>
                </label>
                <input
                  type='text'
                  name='lastName'
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder='Enter last name'
                  maxLength={50}
                  className={`w-full bg-[#07091D] border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none ${
                    errors.lastName
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-600 focus:border-blue-500'
                  }`}
                  required
                />
                {errors.lastName && (
                  <p className='text-red-400 text-xs mt-1'>{errors.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className='block text-sm text-gray-300 mb-1'>
                  Email <span className='text-red-400'>*</span>
                </label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder='Enter email address'
                  className={`w-full bg-[#07091D] border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none ${
                    errors.email
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-600 focus:border-blue-500'
                  }`}
                  required
                />
                {errors.email && (
                  <p className='text-red-400 text-xs mt-1'>{errors.email}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className='block text-sm text-gray-300 mb-1'>
                  Phone Number <span className='text-red-400'>*</span>
                </label>
                <input
                  type='tel'
                  name='phoneNumber'
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder='e.g., +1 (555) 123-4567 or 555-123-4567'
                  maxLength={12}
                  className={`w-full bg-[#07091D] border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none ${
                    errors.phoneNumber
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-600 focus:border-blue-500'
                  }`}
                  required
                />
                {errors.phoneNumber && (
                  <p className='text-red-400 text-xs mt-1'>
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className='block text-sm text-gray-300 mb-1'>
                  Gender <span className='text-red-400'>*</span>
                </label>
                <select
                  name='gender'
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`w-full bg-[#07091D] border rounded-lg px-3 py-2 text-white focus:outline-none ${
                    errors.gender
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-600 focus:border-blue-500'
                  }`}
                  required
                >
                  <option value=''>Select Gender</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                  <option value='Other'>Other</option>
                </select>
                {errors.gender && (
                  <p className='text-red-400 text-xs mt-1'>{errors.gender}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className='block text-sm text-gray-300 mb-1'>
                  Date of Birth <span className='text-red-400'>*</span>
                </label>
                <input
                  type='date'
                  name='dateOfBirth'
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className={`w-full bg-[#07091D] border rounded-lg px-3 py-2 text-white focus:outline-none ${
                    errors.dateOfBirth
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-600 focus:border-blue-500'
                  }`}
                  required
                />
                {errors.dateOfBirth && (
                  <p className='text-red-400 text-xs mt-1'>
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='flex justify-end gap-4 p-6 border-t border-[#343B4F]'>
          <button
            onClick={onClose}
            disabled={adding}
            className='px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-white disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            onClick={handleAddParticipant}
            disabled={adding}
            className='flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white disabled:opacity-50'
          >
            {adding ? (
              <>
                <Loader2 className='animate-spin' size={16} />
                Adding...
              </>
            ) : (
              <>
                <Plus size={16} />
                Add Participant
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
