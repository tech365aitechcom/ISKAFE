'use client'

import { useState, useEffect } from 'react'
import { X, User, Plus, Loader2 } from 'lucide-react'
import { API_BASE_URL } from '../../../../../../../constants'
import useStore from '../../../../../../../stores/useStore'

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
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
  })

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        gender: '',
        dateOfBirth: '',
      })
      setRegistrationType('fighter')
      setErrors({})
    }
  }, [isOpen])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Required fields
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!/^[\d\s\-\(\)\+]{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number (10-15 digits)'
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
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
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
    // Validate form data
    if (!validateForm()) {
      return
    }

    try {
      setAdding(true)

      const registrationData = {
        registrationType: registrationType,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber?.trim() || '',
        dateOfBirth: formData.dateOfBirth || '',
        gender: formData.gender || '',
        status: 'Approved',
        paymentStatus: 'Completed',
        paymentMethod: 'cash',
        waiverAgreed: true,
        legalDisclaimerAccepted: true,
        medicalExamDone: false,
        checkInStatus: 'Not Checked',
        event: eventId,
      }

      console.log('Adding participant:', registrationData)

      const response = await fetch(`${API_BASE_URL}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(registrationData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        console.log('Participant added successfully:', result)
        alert(
          `✅ ${formData.firstName} ${formData.lastName} has been added to the event as a ${registrationType}!`
        )
        onParticipantAdded?.()
        onClose()
      } else {
        console.error('Failed to add participant:', result)
        alert(
          `❌ Failed to add participant: ${result.message || 'Unknown error'}`
        )
      }
    } catch (err) {
      console.error('Error adding participant:', err)
      alert(`❌ Error adding participant: ${err.message}`)
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
                  onChange={(e) => setRegistrationType(e.target.value)}
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
                  onChange={(e) => setRegistrationType(e.target.value)}
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
                  onChange={(e) => setRegistrationType(e.target.value)}
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
                  className={`w-full bg-[#07091D] border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none ${
                    errors.firstName ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
                  }`}
                  required
                />
                {errors.firstName && (
                  <p className='text-red-400 text-xs mt-1'>{errors.firstName}</p>
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
                  className={`w-full bg-[#07091D] border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none ${
                    errors.lastName ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
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
                    errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
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
                  placeholder='Enter phone number'
                  className={`w-full bg-[#07091D] border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none ${
                    errors.phoneNumber ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
                  }`}
                  required
                />
                {errors.phoneNumber && (
                  <p className='text-red-400 text-xs mt-1'>{errors.phoneNumber}</p>
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
                    errors.gender ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
                  }`}
                  required
                >
                  <option value=''>Select Gender</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
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
                    errors.dateOfBirth ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
                  }`}
                  required
                />
                {errors.dateOfBirth && (
                  <p className='text-red-400 text-xs mt-1'>{errors.dateOfBirth}</p>
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
