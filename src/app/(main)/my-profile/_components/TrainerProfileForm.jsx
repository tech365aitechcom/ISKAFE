'use client'
import React, { useEffect, useState } from 'react'
import {
  User,
  Phone,
  Award,
  Dumbbell,
  AlertTriangle,
  Calendar,
  Share,
} from 'lucide-react'
import { countries } from '../../../../constants'

const TrainerProfileForm = () => {
  const [formData, setFormData] = useState({
    // Basic Info
    profilePhoto: null,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    country: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    height: '',
    weight: '',

    // Gym Info
    gymName: '',
    gymLocation: '',
    yearsOfExperience: '',
    trainerType: '',
    preferredStyles: '',

    // Credentials
    certifications: null,
    bio: '',

    // Public Profile
    instagram: '',
    facebook: '',
    youtubeUrl: '',
    affiliatedFighters: '',

    // Emergency Info
    emergencyContactName: '',
    emergencyContactNumber: '',

    // Event Info
    associatedEvents: '',
    accreditationType: '',

    // Suspension Info
    isSuspended: false,
    suspensionType: '',
    suspensionNotes: '',
    suspensionStartDate: '',
    suspensionEndDate: '',
    medicalClearance: false,
    medicalDocs: null,
  })

  const [previewImages, setPreviewImages] = useState({
    profilePhoto: '',
    certifications: '',
    medicalDocs: '',
  })

  useEffect(() => {
    const dummyData = {
      // Basic Info
      profilePhoto: null,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+1 123-456-7890',
      country: 'United States',
      dateOfBirth: '1990-05-15',
      age: '34',
      gender: 'Male',
      height: '6\'0"',
      weight: '185',

      // Gym Info
      gymName: 'Iron Fist MMA',
      gymLocation: 'Los Angeles, CA',
      yearsOfExperience: '8',
      trainerType: 'Strength & Conditioning',
      preferredStyles: 'Muay Thai, Brazilian Jiu-Jitsu',

      // Credentials
      certifications: null,
      bio: 'Multiple-time amateur champion, BJJ purple belt',

      // Public Profile
      instagram: 'https://instagram.com/johndoe',
      facebook: 'https://facebook.com/johndoe',
      youtubeUrl: 'https://youtube.com/@johndoe',
      affiliatedFighters: 'Jane Doe, Mike Smith',

      // Emergency Info
      emergencyContactName: 'Mary Doe',
      emergencyContactNumber: '+1 987-654-3210',

      // Event Info
      associatedEvents: 'Fight Night LA, West Coast Open',
      accreditationType: 'Fighter',

      // Suspension Info
      isSuspended: true,
      suspensionType: 'Medical',
      suspensionNotes: 'Concussion protocol',
      suspensionStartDate: '2024-12-01',
      suspensionEndDate: '2025-01-15',
      medicalClearance: false,
      medicalDocs: null,
    }

    setFormData(dummyData)
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === 'checkbox') {
      if (name === 'preferredStyles') {
        setFormData((prev) => ({
          ...prev,
          [name]: checked
            ? [...prev[name], value]
            : prev[name].filter((item) => item !== value),
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: checked,
        }))
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    const file = files[0]

    if (file) {
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }))

      if (name === 'profilePhoto') {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviewImages((prev) => ({
            ...prev,
            profilePhoto: e.target.result,
          }))
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const handleSubmit = () => {
    // Create FormData object for submission
    const submitFormData = new FormData()

    // Append all form fields to FormData
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        if (Array.isArray(formData[key])) {
          formData[key].forEach((value) => {
            submitFormData.append(`${key}[]`, value)
          })
        } else {
          submitFormData.append(key, formData[key])
        }
      }
    })

    // In a real application, you would send this FormData to your API
    console.log('Submitting form data...')
  }

  const fightingStyles = [
    'Boxing',
    'Muay Thai',
    'Brazilian Jiu-Jitsu',
    'Wrestling',
    'Karate',
    'Judo',
    'Taekwondo',
    'Kickboxing',
  ]

  return (
    <div className='min-h-screen text-white bg-[#0a0a1a] py-6 px-4'>
      <div className='w-full container mx-auto'>
        <div className='flex items-center gap-4 mb-6'>
          <h1 className='text-4xl font-bold'>Trainer Profile</h1>
        </div>
        {/* Personal Information */}
        <div className='flex items-center gap-2 mb-4'>
          <User className='w-6 h-6 text-blue-400' />
          <h2 className='font-bold uppercase text-lg'>Personal Information</h2>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          {/* Profile Photo */}
          <div className=''>
            <label className='block font-medium mb-2'>
              Profile Photo <span className='text-red-400'>*</span>
            </label>
            {previewImages.profilePhoto && (
              <div className='my-4 flex'>
                <img
                  src={previewImages.profilePhoto}
                  alt='Profile Preview'
                  className='w-32 h-32 object-cover rounded-full border-4 border-purple-500'
                />
              </div>
            )}
            <input
              type='file'
              name='profilePhoto'
              onChange={handleFileChange}
              accept='image/jpeg,image/jpg,image/png'
              className='w-full outline-none bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700'
            />
            <p className='text-xs text-gray-400 mt-1'>JPG/PNG, Max 2MB</p>
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          {[
            { label: 'First Name', name: 'firstName' },
            { label: 'Last Name', name: 'lastName' },
            { label: 'Email Address', name: 'email', type: 'email' },
            { label: 'Phone Number', name: 'phoneNumber', type: 'tel' },
            { label: 'Date of Birth', name: 'dateOfBirth', type: 'date' },
            { label: 'Age', name: 'age', disabled: true },
            { label: 'Height', name: 'height', placeholder: 'e.g., 5\'10"' },
            { label: 'Weight', name: 'weight', placeholder: 'e.g., 175 lbs' },
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
                placeholder={
                  field.placeholder || `Enter ${field.label.toLowerCase()}`
                }
                disabled={field.disabled}
                className={`${
                  field.type !== 'date'
                    ? 'w-full outline-none bg-transparent text-white disabled:text-gray-400'
                    : 'w-full p-3 outline-none bg-white/10 rounded-lg text-white border border-white/20 focus:border-purple-400 transition-colors'
                }`}
                required={!field.disabled}
              />
            </div>
          ))}

          {/* Country Dropdown */}
          <div className='bg-[#00000061] p-2 rounded'>
            <label className='block font-medium mb-1'>
              Country / Nationality<span className='text-red-500'>*</span>
            </label>
            <select
              name='country'
              value={formData.country}
              onChange={handleInputChange}
              className='w-full outline-none bg-transparent text-white'
              required
            >
              <option value='' className='text-black'>
                Select Country
              </option>
              {countries.map((country) => (
                <option
                  key={country}
                  value={country.toLowerCase().replace(' ', '-')}
                  className='text-black'
                >
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Dropdown */}
          <div className='bg-[#00000061] p-2 rounded'>
            <label className='block font-medium mb-1'>Gender</label>
            <select
              name='gender'
              value={formData.gender}
              onChange={handleInputChange}
              className='w-full outline-none bg-transparent text-white'
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
            </select>
          </div>
        </div>
        {/* Gym Information */}
        <div className='flex items-center gap-2 mb-4'>
          <Dumbbell className='w-6 h-6 text-orange-400' />
          <h2 className='font-bold uppercase text-lg'>Gym Information</h2>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          <div className='bg-[#00000061] p-2 rounded'>
            <label className='block font-medium mb-1'>Gym Name</label>
            <input
              type='text'
              name='gymName'
              value={formData.gymName}
              onChange={handleInputChange}
              placeholder='e.g., Elite Training Center'
              className='w-full outline-none bg-transparent text-white'
            />
          </div>

          <div className='bg-[#00000061] p-2 rounded'>
            <label className='block font-medium mb-1'>Gym Location</label>
            <select
              name='gymLocation'
              value={formData.gymLocation}
              onChange={handleInputChange}
              className='w-full outline-none bg-transparent text-white'
            >
              <option value='' className='text-black'>
                Select Location
              </option>
              <option value='new-york' className='text-black'>
                New York, USA
              </option>
              <option value='los-angeles' className='text-black'>
                Los Angeles, USA
              </option>
              <option value='london' className='text-black'>
                London, UK
              </option>
              <option value='tokyo' className='text-black'>
                Tokyo, Japan
              </option>
              <option value='sao-paulo' className='text-black'>
                São Paulo, Brazil
              </option>
              <option value='other' className='text-black'>
                Other
              </option>
            </select>
          </div>

          <div className='bg-[#00000061] p-2 rounded'>
            <label className='block font-medium mb-1'>
              Years of Experience<span className='text-red-500'>*</span>
            </label>
            <select
              name='yearsOfExperience'
              value={formData.yearsOfExperience}
              onChange={handleInputChange}
              className='w-full outline-none bg-transparent text-white'
              required
            >
              <option value='' className='text-black'>
                Select Experience
              </option>
              <option value='1' className='text-black'>
                1 year
              </option>
              <option value='2' className='text-black'>
                2 years
              </option>
              <option value='3' className='text-black'>
                3 years
              </option>
              <option value='5' className='text-black'>
                5 years
              </option>
              <option value='10+' className='text-black'>
                10+ years
              </option>
            </select>
          </div>

          <div className='bg-[#00000061] p-2 rounded'>
            <label className='block font-medium mb-1'>
              Trainer Type<span className='text-red-500'>*</span>
            </label>
            <select
              name='trainerType'
              value={formData.trainerType}
              onChange={handleInputChange}
              className='w-full outline-none bg-transparent text-white'
              required
            >
              <option value='' className='text-black'>
                Select Trainer Type
              </option>
              <option value='coach' className='text-black'>
                Coach
              </option>
              <option value='cutman' className='text-black'>
                Cutman
              </option>
              <option value='assistant' className='text-black'>
                Assistant
              </option>
            </select>
          </div>
        </div>
        {/* Fighting Styles */}
        <div className='mb-6 bg-[#00000061] p-4 rounded'>
          <label className='block font-medium mb-2'>
            Preferred Fighting Styles<span className='text-red-500'>*</span>
          </label>
          <div className='grid grid-cols-3 md:grid-cols-4 gap-2'>
            {fightingStyles.map((style) => (
              <div key={style} className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  name='preferredStyles'
                  value={style.toLowerCase().replace(' ', '-')}
                  checked={formData.preferredStyles.includes(
                    style.toLowerCase().replace(' ', '-')
                  )}
                  onChange={handleInputChange}
                  className='rounded text-yellow-400 bg-gray-700 border-gray-600 focus:ring-yellow-400'
                />
                <label>{style}</label>
              </div>
            ))}
          </div>
        </div>
        {/* Credentials */}
        <div className='flex items-center gap-2 mb-4'>
          <Award className='w-6 h-6 text-orange-400' />
          <h2 className='font-bold uppercase text-lg'>Credentials</h2>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          <div className='bg-[#00000061] p-2 rounded'>
            <label className='block font-medium mb-1'>Certifications</label>
            <input
              type='file'
              name='certifications'
              onChange={handleFileChange}
              accept='.pdf,image/jpeg,image/jpg'
              className='w-full outline-none bg-transparent text-white'
            />
            <p className='text-xs text-gray-400 mt-1'>PDF/JPG, Max 5MB</p>
          </div>

          <div className='bg-[#00000061] p-2 rounded'>
            <label className='block font-medium mb-1'>Bio / Achievements</label>
            <textarea
              name='bio'
              value={formData.bio}
              onChange={handleInputChange}
              placeholder='Describe your career achievements'
              rows='4'
              className='w-full outline-none bg-transparent text-white resize-none'
            />
            <p className='text-xs text-gray-400 mt-1'>Max 1000 characters</p>
          </div>
        </div>
        {/* Social Media */}
        <div className='flex items-center gap-2 mb-4'>
          <Share className='text-yellow-400' />
          <h2 className='font-bold uppercase text-lg'>Social Media</h2>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          <div className='bg-[#00000061] p-2 rounded'>
            <label className='block font-medium mb-1'>Instagram URL</label>
            <input
              type='url'
              name='instagram'
              value={formData.instagram}
              onChange={handleInputChange}
              placeholder='https://instagram.com/username'
              className='w-full outline-none bg-transparent text-white'
            />
          </div>

          <div className='bg-[#00000061] p-2 rounded'>
            <label className='block font-medium mb-1'>Facebook URL</label>
            <input
              type='url'
              name='facebook'
              value={formData.facebook}
              onChange={handleInputChange}
              placeholder='https://facebook.com/username'
              className='w-full outline-none bg-transparent text-white'
            />
          </div>

          <div className='bg-[#00000061] p-2 rounded'>
            <label className='block font-medium mb-1'>YouTube URL</label>
            <input
              type='url'
              name='youtubeUrl'
              value={formData.youtubeUrl}
              onChange={handleInputChange}
              placeholder='https://youtube.com/channel'
              className='w-full outline-none bg-transparent text-white'
            />
          </div>
        </div>
        {/* Emergency Contact */}
        <div className='flex items-center gap-2 mb-4'>
          <Phone className='w-6 h-6 text-green-400' />
          <h2 className='font-bold uppercase text-lg'>Emergency Contact</h2>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          <div className='bg-[#00000061] p-2 rounded'>
            <label className='block font-medium mb-1'>
              Emergency Contact Name<span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              name='emergencyContactName'
              value={formData.emergencyContactName}
              onChange={handleInputChange}
              placeholder='Full Name'
              className='w-full outline-none bg-transparent text-white'
              required
            />
          </div>

          <div className='bg-[#00000061] p-2 rounded'>
            <label className='block font-medium mb-1'>
              Emergency Contact Number<span className='text-red-500'>*</span>
            </label>
            <input
              type='tel'
              name='emergencyContactNumber'
              value={formData.emergencyContactNumber}
              onChange={handleInputChange}
              placeholder='+1 555-123-4567'
              className='w-full outline-none bg-transparent text-white'
              required
            />
          </div>
        </div>
        {/* Event Information */}
        <div className='flex items-center gap-2 mb-4'>
          <Calendar className='w-6 h-6 text-violet-400' />
          <h2 className='font-bold uppercase text-lg'>Event Information</h2>
        </div>{' '}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          <div className='bg-[#00000061] p-2 rounded'>
            <label className='block font-medium mb-1'>Associated Events</label>
            <select
              name='associatedEvents'
              value={formData.associatedEvents}
              onChange={handleInputChange}
              className='w-full outline-none bg-transparent text-white'
            >
              <option value='' className='text-black'>
                Select Event
              </option>
              <option value='event1' className='text-black'>
                Championship Finals 2025
              </option>
              <option value='event2' className='text-black'>
                Regional Tournament June
              </option>
              <option value='event3' className='text-black'>
                International Showcase
              </option>
              <option value='event4' className='text-black'>
                Qualifying Rounds 2025
              </option>
            </select>
          </div>

          <div className='bg-[#00000061] p-2 rounded'>
            <label className='block font-medium mb-1'>Accreditation Type</label>
            <select
              name='accreditationType'
              value={formData.accreditationType}
              onChange={handleInputChange}
              className='w-full outline-none bg-transparent text-white'
            >
              <option value='' className='text-black'>
                Select Role
              </option>
              <option value='coach' className='text-black'>
                Coach
              </option>
              <option value='cutman' className='text-black'>
                Cutman
              </option>
              <option value='assistant' className='text-black'>
                Assistant
              </option>
            </select>
          </div>
        </div>
        {/* Suspension Information */}
        <div className='flex items-center gap-2 mb-4'>
          <AlertTriangle className='w-6 h-6 text-yellow-400' />
          <h2 className='font-bold uppercase text-lg'>
            Suspension Information
          </h2>
        </div>
        <div className='mb-6 bg-[#00000061] p-2 rounded'>
          <div className='flex items-center gap-2 mb-4'>
            <input
              type='checkbox'
              name='isSuspended'
              checked={formData.isSuspended}
              onChange={handleInputChange}
              className='rounded text-yellow-400 bg-gray-700 border-gray-600 focus:ring-yellow-400'
            />
            <label>Is Suspended?</label>
          </div>

          {formData.isSuspended && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='bg-[#00000030] p-2 rounded'>
                <label className='block font-medium mb-1'>
                  Suspension Type
                </label>
                <select
                  name='suspensionType'
                  value={formData.suspensionType}
                  onChange={handleInputChange}
                  className='w-full outline-none bg-transparent text-white'
                >
                  <option value='' className='text-black'>
                    Select Reason
                  </option>
                  <option value='disciplinary' className='text-black'>
                    Disciplinary
                  </option>
                  <option value='medical' className='text-black'>
                    Medical
                  </option>
                  <option value='administrative' className='text-black'>
                    Administrative
                  </option>
                </select>
              </div>

              <div className='bg-[#00000030] p-2 rounded'>
                <label className='block font-medium mb-1'>Start Date</label>
                <input
                  type='date'
                  name='suspensionStartDate'
                  value={formData.suspensionStartDate}
                  onChange={handleInputChange}
                  className='w-full outline-none bg-transparent text-white'
                />
              </div>

              <div className='bg-[#00000030] p-2 rounded'>
                <label className='block font-medium mb-1'>End Date</label>
                <input
                  type='date'
                  name='suspensionEndDate'
                  value={formData.suspensionEndDate}
                  onChange={handleInputChange}
                  className='w-full outline-none bg-transparent text-white'
                />
              </div>

              <div className='md:col-span-3 bg-[#00000030] p-2 rounded'>
                <label className='block font-medium mb-1'>
                  Suspension Notes
                </label>
                <textarea
                  name='suspensionNotes'
                  value={formData.suspensionNotes}
                  onChange={handleInputChange}
                  placeholder='Max 200 characters'
                  rows='3'
                  className='w-full outline-none bg-transparent text-white resize-none'
                />
              </div>

              <div className='md:col-span-3 flex items-center gap-2'>
                <input
                  type='checkbox'
                  name='medicalClearance'
                  checked={formData.medicalClearance}
                  onChange={handleInputChange}
                  className='rounded text-yellow-400 bg-gray-700 border-gray-600 focus:ring-yellow-400'
                />
                <label>Medical Clearance Required</label>
              </div>

              {formData.medicalClearance && (
                <div className='md:col-span-3 bg-[#00000030] p-2 rounded'>
                  <label className='block font-medium mb-1'>
                    Medical Documentation
                  </label>
                  <input
                    type='file'
                    name='medicalDocs'
                    onChange={handleFileChange}
                    accept='.pdf,image/jpeg,image/jpg'
                    className='w-full outline-none bg-transparent text-white'
                  />
                  <p className='text-xs text-gray-400 mt-1'>PDF/JPG, Max 5MB</p>
                </div>
              )}
            </div>
          )}
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

export default TrainerProfileForm
