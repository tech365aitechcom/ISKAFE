'use client'
import React, { useEffect, useState } from 'react'
import { User, MapPin, Bell } from 'lucide-react'
import { API_BASE_URL, apiConstants } from '../../../../constants'
import useStore from '../../../../stores/useStore'
import axios from 'axios'
import { City, Country, State } from 'country-state-city'
import { enqueueSnackbar } from 'notistack'

const SpectatorProfileForm = ({ userDetails }) => {
  const { user } = useStore()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    country: '',
    state: '',
    city: '',
    communicationPreferences: [],
  })

  const countries = Country.getAllCountries()
  const states = formData.country
    ? State.getStatesOfCountry(formData.country)
    : []
  const cities =
    formData.country && formData.state
      ? City.getCitiesOfState(formData.country, formData.state)
      : []

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.put(
        `${API_BASE_URL}/auth/users/${user._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      )
      if (response.status === apiConstants.success) {
        enqueueSnackbar(response.data.message, { variant: 'success' })
        onSuccess()
      }
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || 'Something went wrong',
        { variant: 'error' }
      )
    }
  }
  return (
    <div className='min-h-screen text-white bg-[#0B1739] py-6 px-4'>
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
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
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
              <option value='Male' className='text-black'>
                Male
              </option>
              <option value='Female' className='text-black'>
                Female
              </option>
              <option value='Other' className='text-black'>
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
          <div className='bg-[#00000061] p-2 rounded'>
            <label className='block font-medium mb-1'>Country</label>
            <select
              name='country'
              value={formData.country}
              onChange={handleInputChange}
              className='w-full outline-none bg-transparent text-white'
            >
              <option value='' className='text-black'>
                Select Country
              </option>
              {countries.map((country) => (
                <option
                  key={country.isoCode}
                  value={country.isoCode}
                  className='text-black'
                >
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <div className='bg-[#00000061] p-2 rounded'>
            <label className='block font-medium mb-1'>State</label>
            <select
              name='state'
              value={formData.state}
              onChange={handleInputChange}
              className='w-full outline-none bg-transparent text-white'
            >
              <option value='' className='text-black'>
                Select State
              </option>
              {states.map((state) => (
                <option
                  key={state.isoCode}
                  value={state.isoCode}
                  className='text-black'
                >
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          <div className='bg-[#00000061] p-2 rounded'>
            <label className='text-white font-medium'>City</label>
            <select
              name='city'
              value={formData.city}
              onChange={handleInputChange}
              className='w-full outline-none bg-transparent text-white'
            >
              <option value=''>Select City</option>
              {cities.map((city) => (
                <option
                  key={city.name}
                  value={city.name}
                  className='text-black'
                >
                  {city.name}
                </option>
              ))}
            </select>
          </div>
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
