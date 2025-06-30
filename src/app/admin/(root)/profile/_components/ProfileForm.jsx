'use client'
import { Trash } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { City, Country, State } from 'country-state-city'
import axios from 'axios'
import useStore from '../../../../../stores/useStore'
import { enqueueSnackbar } from 'notistack'
import { API_BASE_URL, apiConstants } from '../../../../../constants'
import { uploadToS3 } from '../../../../../utils/uploadToS3'

export const ProfileForm = ({
  isEditable,
  userDetails,
  onSuccess,
  setType,
}) => {
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
    postalCode: '',
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

  const handleChange = (e) => {
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

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prevState) => ({
        ...prevState,
        profilePhoto: file,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // ===== Frontend Validation =====
    const nameRegex = /^[a-zA-Z\s'-]+$/
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^[0-9]{7,15}$/
    const zipRegex = /^[0-9]{4,10}$/

    // Add validation for profile photo
    if (!formData.profilePhoto) {
      return enqueueSnackbar('Profile photo is required', { variant: 'error' })
    }

    if (!nameRegex.test(formData.firstName)) {
      return enqueueSnackbar('Invalid First Name. Only alphabets allowed.', { variant: 'error' })
    }

    if (!nameRegex.test(formData.lastName)) {
      return enqueueSnackbar('Invalid Last Name. Only alphabets allowed.', { variant: 'error' })
    }

    if (!emailRegex.test(formData.email)) {
      return enqueueSnackbar('Invalid Email format.', { variant: 'error' })
    }

    if (!phoneRegex.test(formData.phoneNumber)) {
      return enqueueSnackbar('Invalid Phone Number. Only digits allowed (7–15 digits).', { variant: 'error' })
    }

    if (!formData.country) {
      return enqueueSnackbar('Country is required.', { variant: 'error' })
    }

    if (!formData.state) {
      return enqueueSnackbar('State is required.', { variant: 'error' })
    }

    if (!formData.city) {
      return enqueueSnackbar('City is required.', { variant: 'error' })
    }

    if (!formData.postalCode) {
      return enqueueSnackbar('ZIP Code is required.', { variant: 'error' })
    }

    if (!zipRegex.test(formData.postalCode)) {
      return enqueueSnackbar('Invalid ZIP Code. Only digits allowed (4–10 digits).', { variant: 'error' })
    }

    if (formData.dateOfBirth) {
      const dobDate = new Date(formData.dateOfBirth)
      const today = new Date()
      if (dobDate >= today) {
        return enqueueSnackbar('Date of Birth must be in the past.', { variant: 'error' })
      }
    }

    try {
      if (formData.profilePhoto && typeof formData.profilePhoto !== 'string') {
        formData.profilePhoto = await uploadToS3(formData.profilePhoto)
      }

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
        setType('View Profile')
      }
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || 'Something went wrong',
        { variant: 'error' }
      )
    }
  }

  return (
    <div className='min-h-screen text-white bg-dark-blue-900 mt-4'>
      <div className='w-full'>
        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Profile Picture */}
          <div className='mb-8'>
            <label className='block text-sm font-medium mb-2'>
              Profile Photo<span className='text-red-500'>*</span>
              <span className='text-xs text-gray-400 ml-2'>(Required)</span>
            </label>
            
            {isEditable ? (
              formData.profilePhoto ? (
                <div className='relative w-72 h-64 rounded-lg overflow-hidden border border-[#D9E2F930]'>
                  <img
                    src={
                      typeof formData.profilePhoto == 'string'
                        ? formData.profilePhoto
                        : URL.createObjectURL(formData.profilePhoto)
                    }
                    alt='Selected image'
                    className='w-full h-full object-cover'
                  />
                  <button
                    type='button'
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, profilePhoto: null }))
                    }
                    className='absolute top-2 right-2 bg-[#14255D] p-1 rounded text-[#AEB9E1] shadow-md z-20'
                  >
                    <Trash className='w-4 h-4' />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor='profile-pic-upload'
                  className='cursor-pointer border-2 border-dashed border-gray-500 rounded-lg flex flex-col items-center justify-center w-72 h-52 relative overflow-hidden'
                >
                  <input
                    id='profile-pic-upload'
                    type='file'
                    accept='image/*'
                    onChange={handleFileChange}
                    className='absolute inset-0 opacity-0 cursor-pointer z-50'
                    required
                  />

                  <div className='bg-yellow-500 opacity-50 rounded-full p-2 mb-2 z-10'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-6 w-6'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                  </div>
                  <p className='text-sm text-center text-[#AEB9E1] z-10'>
                    <span className='text-[#FEF200] mr-1'>Click to upload</span>
                    or drag and drop profile pic
                    <br />
                    SVG, PNG, JPG or GIF (max. 800 x 400px)
                  </p>
                </label>
              )
            ) : (
              <div className='relative w-72 h-64 rounded-lg overflow-hidden border border-[#D9E2F930] bg-[#0B122A] flex items-center justify-center'>
                {formData.profilePhoto ? (
                  <img
                    src={formData.profilePhoto}
                    alt='Profile photo'
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='flex flex-col items-center text-[#AEB9E1]'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-10 w-10 mb-2 text-[#FEF200]'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                    <p className='text-sm text-center'>
                      No profile photo available
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PERSONAL DETAILS */}
          <h2 className='font-bold mb-4 uppercase text-sm'>Personal Details</h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            {/* First Name Field */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                First Name<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='firstName'
                value={formData.firstName}
                onChange={handleChange}
                className='w-full outline-none'
                required
                disabled={!isEditable}
                placeholder='Enter First Name'
              />
            </div>

            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Last Name<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='lastName'
                value={formData.lastName}
                onChange={handleChange}
                className='w-full outline-none'
                required
                placeholder='Enter Last Name'
                disabled={!isEditable}
              />
            </div>

            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Email Address<span className='text-red-500'>*</span>
              </label>
              <input
                type='email'
                name='email'
                placeholder='Enter Email Address'
                value={formData.email}
                onChange={handleChange}
                className='w-full outline-none'
                required
                disabled={!isEditable}
              />
            </div>

            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Mobile Number<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='phoneNumber'
                placeholder='Enter Mobile Number'
                value={formData.phoneNumber}
                onChange={handleChange}
                className='w-full outline-none'
                required
                disabled={!isEditable}
              />
            </div>
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Date of Birth <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                name='dateOfBirth'
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={!isEditable}
                className='w-full outline-none bg-transparent text-white'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>
                Gender<span className='text-red-500'>*</span>
              </label>
              <select
                name='gender'
                value={formData.gender}
                onChange={handleChange}
                className='w-full outline-none bg-transparent text-white'
                required
                disabled={!isEditable}
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

          {/* Address Details */}
          <h2 className='font-bold mb-4 uppercase text-sm'>Address</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>Country<span className='text-red-500'>*</span></label>
              <select
                name='country'
                value={formData.country}
                onChange={handleChange}
                className='w-full outline-none bg-transparent text-white'
                disabled={!isEditable}
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
              <label className='block font-medium mb-1'>State <span className='text-red-500'>*</span></label> 
              <select
                name='state'
                value={formData.state}
                onChange={handleChange}
                className='w-full outline-none bg-transparent text-white'
                disabled={!isEditable}
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
              <label className='text-white font-medium'>ZIP Code</label> <span className='text-red-500'>*</span>
              <input
                type='text'
                name='postalCode'
                value={formData.postalCode}
                onChange={handleChange}
                placeholder='Enter ZIP Code'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                disabled={!isEditable}
              />
            </div>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='text-white font-medium'>City<span className='text-red-500'>*</span></label>
              <select
                name='city'
                value={formData.city}
                onChange={handleChange}
                className='w-full outline-none bg-transparent text-white'
                disabled={!isEditable}
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
                  onChange={handleChange}
                  className='rounded text-yellow-400 bg-gray-700 border-gray-600 focus:ring-yellow-400'
                  disabled={!isEditable}
                />
                <label htmlFor={method}>{method.toUpperCase()}</label>
              </div>
            ))}
            <p className='text-xs text-gray-400 mt-1'>
              Choose how you'd like to receive updates
            </p>
          </div>

          {/* Action Buttons */}
          {isEditable && (
            <div className='flex justify-center gap-4 mt-12'>
              <button
                type='submit'
                className='text-white font-medium py-2 px-6 rounded transition duration-200'
                style={{
                  background:
                    'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
                }}
              >
                Save
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}