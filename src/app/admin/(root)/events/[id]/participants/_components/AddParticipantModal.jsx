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
    }
  }, [isOpen])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddParticipant = async () => {
    // Validate form data
    if (
      !formData.firstName?.trim() ||
      !formData.lastName?.trim() ||
      !formData.email?.trim()
    ) {
      alert('Please fill in all required fields (First Name, Last Name, Email)')
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
                  className='w-full bg-[#07091D] border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500'
                  required
                />
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
                  className='w-full bg-[#07091D] border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500'
                  required
                />
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
                  className='w-full bg-[#07091D] border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500'
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className='block text-sm text-gray-300 mb-1'>
                  Phone Number
                </label>
                <input
                  type='tel'
                  name='phoneNumber'
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder='Enter phone number'
                  className='w-full bg-[#07091D] border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500'
                />
              </div>

              {/* Gender */}
              <div>
                <label className='block text-sm text-gray-300 mb-1'>
                  Gender
                </label>
                <select
                  name='gender'
                  value={formData.gender}
                  onChange={handleInputChange}
                  className='w-full bg-[#07091D] border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500'
                >
                  <option value=''>Select Gender</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label className='block text-sm text-gray-300 mb-1'>
                  Date of Birth
                </label>
                <input
                  type='date'
                  name='dateOfBirth'
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className='w-full bg-[#07091D] border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500'
                />
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
            disabled={
              !formData.firstName?.trim() ||
              !formData.lastName?.trim() ||
              !formData.email?.trim() ||
              adding
            }
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
