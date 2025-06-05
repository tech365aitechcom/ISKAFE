'use client'
import React, { useEffect, useState } from 'react'
import { User, MapPin, Bell } from 'lucide-react'
import { countries } from '../../../../constants'

const SpectatorProfileForm = ({ userDetails }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    country: '',
    stateProvince: '',
    city: '',
    communicationPreferences: [],
  })

  useEffect(() => {
    if (userDetails?.dateOfBirth) {
      const formattedDOB = new Date(userDetails.dateOfBirth)
        .toISOString()
        .split('T')[0]
      setFormData((prev) => ({
        ...prev,
        ...userDetails,
        dateOfBirth: formattedDOB,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        ...userDetails,
      }))
    }
  }, [userDetails])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === 'checkbox') {
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          [name]: [...prev[name], value],
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: prev[name].filter((item) => item !== value),
        }))
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = () => {
    const submitFormData = new FormData()
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        if (Array.isArray(formData[key])) {
          submitFormData.append(key, JSON.stringify(formData[key]))
        } else {
          submitFormData.append(key, formData[key])
        }
      }
    })

    console.log('Submitting form data...', formData)
  }

  return (
    <div className='min-h-screen text-white bg-[#0a0a1a] py-6 px-4'>
      <div className='w-full container mx-auto'>
        <div className='flex items-center gap-4 mb-6'>
          <h1 className='text-4xl font-bold'>Spectator Profile</h1>
        </div>

        {/* Personal Info */}
        <div className='flex items-center gap-2 mb-4'>
          <User className='w-6 h-6 text-blue-400' />
          <h2 className='font-bold uppercase text-lg'>Personal Information</h2>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          {[
            { label: 'First Name', name: 'firstName' },
            { label: 'Last Name', name: 'lastName' },
            { label: 'Email Address', name: 'email', type: 'email' },
            { label: 'Phone Number', name: 'phoneNumber' },
            { label: 'Date of Birth', name: 'dateOfBirth', type: 'date' },
          ].map((field) => (
            <div key={field.name} className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>
                {field.label}
                <span className='text-red-500'>*</span>
              </label>
              <input
                type={field.type || 'text'}
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                className={`${
                  field.type !== 'date'
                    ? 'w-full outline-none bg-transparent text-white disabled:text-gray-400'
                    : 'w-full p-3 outline-none bg-white/10 rounded-lg text-white border border-white/20 focus:border-purple-400 transition-colors'
                }`}
                required
              />
            </div>
          ))}

          {/* Gender Dropdown */}
          <div className='bg-[#00000061] p-2 rounded'>
            <label className='block font-medium mb-1'>
              Gender<span className='text-red-500'>*</span>
            </label>
            <select
              name='gender'
              value={formData.gender}
              onChange={handleInputChange}
              className='w-full outline-none bg-transparent text-white'
              required
            >
              <option value='' className='text-black'>
                Select Gender
              </option>
              <option value='male' className='text-black'>
                Male
              </option>
              <option value='female' className='text-black'>
                Female
              </option>
              <option value='other' className='text-black'>
                Other
              </option>
              <option value='prefer_not_to_say' className='text-black'>
                Prefer not to say
              </option>
            </select>
          </div>
        </div>

        {/* Address Info */}
        <div className='flex items-center gap-2 mb-4'>
          <MapPin className='w-6 h-6 text-red-400' />
          <h2 className='font-bold uppercase text-lg'>Address Information</h2>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          {[
            {
              label: 'Country',
              name: 'country',
              type: 'select',
              options: countries,
            },
            { label: 'State / Province', name: 'stateProvince' },
            { label: 'City', name: 'city' },
          ].map((field) =>
            field.type === 'select' ? (
              <div key={field.name} className='bg-[#00000061] p-2 rounded'>
                <label className='block font-medium mb-1'>
                  {field.label}
                  <span className='text-red-500'>*</span>
                </label>
                <select
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  className='w-full outline-none bg-transparent text-white'
                  required
                >
                  <option value='' className='text-black'>
                    Select {field.label}
                  </option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt} className='text-black'>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div key={field.name} className='bg-[#00000061] p-2 rounded'>
                <label className='block font-medium mb-1'>
                  {field.label}
                  <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  className='w-full outline-none bg-transparent text-white'
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  required
                />
              </div>
            )
          )}
        </div>

        {/* Preferences */}
        <div className='flex items-center gap-2 mb-4'>
          <Bell className='w-6 h-6 text-yellow-400' />
          <h2 className='font-bold uppercase text-lg'>Preferences</h2>
        </div>
        <div className='mb-6 bg-[#00000061] p-4 rounded'>
          <label className='block font-medium mb-2'>
            Communication Preferences
          </label>
          {['email', 'sms', 'push'].map((method) => (
            <div key={method} className='flex items-center gap-2 mb-2'>
              <input
                type='checkbox'
                name='communicationPreferences'
                value={method}
                checked={formData.communicationPreferences.includes(method)}
                onChange={handleInputChange}
                className='rounded text-yellow-400 bg-gray-700 border-gray-600 focus:ring-yellow-400'
              />
              <label htmlFor={method}>{method.toUpperCase()}</label>
            </div>
          ))}
          <p className='text-xs text-gray-400 mt-1'>
            Choose how you'd like to receive updates
          </p>
        </div>

        {/* Actions */}
        <div className='flex justify-center gap-4 mt-6'>
          <button
            type='button'
            onClick={() => console.log('Cancel')}
            className='bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded transition duration-200'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleSubmit}
            className='bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded transition duration-200'
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  )
}

export default SpectatorProfileForm
