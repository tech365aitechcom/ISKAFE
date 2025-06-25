import React, { use, useEffect, useState } from 'react'
import { User, Dumbbell, Phone, Camera, Trophy } from 'lucide-react'
import { City, Country, State } from 'country-state-city'
import {
  API_BASE_URL,
  apiConstants,
  experienceLevels,
  sportTypes,
  weightClasses,
} from '../../../../constants'
import axios from 'axios'
import useStore from '../../../../stores/useStore'
import { enqueueSnackbar } from 'notistack'
import { uploadToS3 } from '../../../../utils/uploadToS3'
import Link from 'next/link'
import Loader from '../../../_components/Loader'

const FightProfileForm = ({ userDetails, onSuccess }) => {
  const { user } = useStore()
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: '',
    lastName: '',
    profilePhoto: null,
    gender: '',
    dateOfBirth: '',
    height: '',
    weight: '',
    weightClass: '',
    country: '',
    state: '',
    city: '',

    // Contact & Social Info
    phoneNumber: '',
    email: '',
    instagram: '',
    youtube: '',
    facebook: '',

    // Fight Profile & Background
    bio: '',
    primaryGym: '',
    coachName: '',
    affiliations: '',
    trainingExperience: '',
    trainingStyle: '',
    credentials: '',

    // Achievements
    nationalRank: '',
    globalRank: '',
    achievements: '',
    recordHighlight: '',

    // Media
    imageGallery: [],
    videoHighlight: '',

    // Compliance
    medicalCertificate: null,
    licenseDocument: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const validatePhoneNumber = (number) => /^\+?[0-9]{10,15}$/.test(number)

  const validateName = (name) => /^[A-Za-z\s'-]+$/.test(name)

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const getAge = (dob) => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const countries = Country.getAllCountries()
  const states = formData.country
    ? State.getStatesOfCountry(formData.country)
    : []
  const cities =
    formData.country && formData.state
      ? City.getCitiesOfState(formData.country, formData.state)
      : []

  console.log(userDetails, 'userDetails in fighter profile form')

  const placeholder =
    'data:image/svg+xml;base64,' +
    btoa(`
  <svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 24 24" fill="#ccc">
    <circle cx="12" cy="8" r="4"/>
    <path d="M12 14c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"/>
  </svg>
`)

  useEffect(() => {
    if (userDetails) {
      const { fighterProfile = {}, dateOfBirth, ...rest } = userDetails

      const formattedDOB = dateOfBirth
        ? new Date(dateOfBirth).toISOString().split('T')[0]
        : ''

      setFormData((prev) => ({
        ...prev,
        ...rest,
        ...fighterProfile,
        dateOfBirth: formattedDOB,
      }))
    }
  }, [userDetails])

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value ?? '',
    }))
  }

  const handleFileChange = (e) => {
    const { name, files, multiple } = e.target
    if (files && files.length > 0) {
      if (multiple) {
        setFormData((prev) => ({
          ...prev,
          [name]: Array.from(files),
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: files[0],
        }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    if (!validateName(formData.firstName)) {
      enqueueSnackbar(
        'First name can only contain letters, spaces, apostrophes, or hyphens.',
        { variant: 'warning' }
      )
      setIsSubmitting(false)
      return
    }

    if (!formData.lastName.trim()) {
      enqueueSnackbar('Last name is required.', { variant: 'warning' })
      setIsSubmitting(false)
      return
    }

    if (!validateName(formData.lastName)) {
      enqueueSnackbar(
        'Last name can only contain letters, spaces, apostrophes, or hyphens.',
        { variant: 'warning' }
      )
      setIsSubmitting(false)
      return
    }

    if (!validateEmail(formData.email)) {
      enqueueSnackbar('Please enter a valid email address.', {
        variant: 'warning',
      })
      setIsSubmitting(false)
      return
    }

    if (!validatePhoneNumber(formData.phoneNumber)) {
      enqueueSnackbar('Please enter a valid phone number.', {
        variant: 'warning',
      })
      setIsSubmitting(false)
      return
    }

    if (!formData.dateOfBirth || getAge(formData.dateOfBirth) < 18) {
      enqueueSnackbar('You must be at least 18 years old.', {
        variant: 'warning',
      })
      setIsSubmitting(false)
      return
    }

    try {
      if (formData.profilePhoto && typeof formData.profilePhoto !== 'string') {
        formData.profilePhoto = await uploadToS3(formData.profilePhoto)
      }
      if (
        formData.imageGallery &&
        formData.imageGallery.length > 0 &&
        formData.imageGallery[0] &&
        typeof formData.imageGallery[0] !== 'string'
      ) {
        formData.imageGallery = await Promise.all(
          formData.imageGallery.map((file) => uploadToS3(file))
        )
      }
      if (
        formData.medicalCertificate &&
        typeof formData.medicalCertificate !== 'string'
      ) {
        formData.medicalCertificate = await uploadToS3(
          formData.medicalCertificate
        )
      }
      if (
        formData.licenseDocument &&
        typeof formData.licenseDocument !== 'string'
      ) {
        formData.licenseDocument = await uploadToS3(formData.licenseDocument)
      }
      const response = await axios.put(
        `${API_BASE_URL}/fighters/${user._id}`,
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
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='min-h-screen text-white bg-[#0B1739] py-6 px-4'>
      <div className='container mx-auto'>
        <div className='flex items-center gap-4 mb-6'>
          <h1 className='text-4xl font-bold'>Fighter Profile</h1>
        </div>

        {/* Basic Information */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-6'>
            <User className='w-6 h-6 text-blue-400' />
            <h2 className='text-2xl font-bold uppercase tracking-wide'>
              Basic Information
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            {/* Profile Photo */}
            <div className=''>
              <label className='block font-medium mb-2 text-gray-200'>
                Profile Photo <span className='text-red-400'>*</span>
              </label>

              <div className='my-4 flex items-center'>
                {formData.profilePhoto ? (
                  <img
                    src={
                      typeof formData.profilePhoto === 'string'
                        ? formData.profilePhoto
                        : URL.createObjectURL(formData.profilePhoto)
                    }
                    alt='Profile Preview'
                    className='w-32 h-32 object-cover rounded-full border-4 border-purple-500 shadow-md'
                  />
                ) : (
                  <div className='w-32 h-32 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-4 border-purple-500 flex items-center justify-center shadow-md'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={1.5}
                      stroke='currentColor'
                      className='w-14 h-14 text-gray-300'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0'
                      />
                    </svg>
                  </div>
                )}
              </div>

              <input
                type='file'
                name='profilePhoto'
                onChange={handleFileChange}
                accept='image/jpeg,image/jpg,image/png'
                className='w-full outline-none bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700'
              />

              <p className='text-xs text-gray-400 mt-1'>
                Upload a high-resolution square photo (headshot preferred).
                JPG/PNG, Max 5MB.
              </p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            {/* Basic Info Fields */}
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>
                First Name <span className='text-red-400'>*</span>
              </label>
              <input
                type='text'
                name='firstName'
                value={formData.firstName ?? ''}
                onChange={handleInputChange}
                placeholder='Enter full name'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                required
              />
            </div>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>
                Last Name <span className='text-red-400'>*</span>
              </label>
              <input
                type='text'
                name='lastName'
                value={formData.lastName ?? ''}
                onChange={handleInputChange}
                placeholder='Enter full name'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                required
              />
            </div>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>
                Nick name/User Name
              </label>
              <input
                type='text'
                name='nickName'
                value={formData.nickName ?? ''}
                onChange={handleInputChange}
                placeholder='Enter Nick Name'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>
                Gender<span className='text-red-400'>*</span>
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
              </select>
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>
                Date of Birth<span className='text-red-400'>*</span>
              </label>
              <input
                type='date'
                name='dateOfBirth'
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                required
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>
                Height<span className='text-red-400'>*</span>
              </label>
              <input
                type='text'
                name='height'
                value={formData.height ?? ''}
                onChange={handleInputChange}
                placeholder="e.g., 5'10 or 178 cm"
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                required
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>
                Weight<span className='text-red-400'>*</span>
              </label>
              <input
                type='text'
                name='weight'
                value={formData.weight ?? ''}
                onChange={handleInputChange}
                placeholder='e.g., 170 lbs or 77 kg'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                required
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>
                Weight Class<span className='text-red-400'>*</span>
              </label>
              <select
                name='weightClass'
                value={formData.weightClass}
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent text-white'
                required
              >
                <option value='' className='text-black'>
                  Select Weight Class
                </option>
                {weightClasses.map((weightClass) => (
                  <option
                    key={weightClass._id}
                    value={weightClass._id}
                    className='text-black'
                  >
                    {weightClass.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>
                Country <span className='text-red-500'>*</span>
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
              <label className='block font-medium mb-1'>
                State <span className='text-red-500'>*</span>
              </label>
              <select
                name='state'
                value={formData.state}
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent text-white'
                required
                disabled={!formData.country}
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
              <label className='block font-medium mb-1'>
                City<span className='text-red-500'>*</span>
              </label>
              <select
                name='city'
                value={formData.city}
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent text-white'
                required
                disabled={!formData.state}
              >
                <option value='' className='text-black'>
                  Select City
                </option>
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
        </div>

        {/* Contact & Social Information */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-6'>
            <Phone className='w-6 h-6 text-green-400' />
            <h2 className='text-2xl font-bold uppercase tracking-wide'>
              Contact & Social Media
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Phone Number</label>
              <input
                type='tel'
                name='phoneNumber'
                value={formData.phoneNumber ?? ''}
                onChange={handleInputChange}
                placeholder='+1 555-123-4567'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Email Address</label>
              <input
                type='email'
                name='email'
                value={formData.email ?? ''}
                onChange={handleInputChange}
                placeholder='fighter@example.com'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Instagram</label>
              <input
                type='url'
                name='instagram'
                value={formData.instagram ?? ''}
                onChange={handleInputChange}
                placeholder='https://instagram.com/userName'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>YouTube channel</label>
              <input
                type='url'
                name='youtube'
                value={formData.youtube ?? ''}
                onChange={handleInputChange}
                placeholder='https://youtube.com/channel'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded md:col-span-2'>
              <label className='block font-medium mb-2'>Facebook Profile</label>
              <input
                type='url'
                name='facebook'
                value={formData.facebook ?? ''}
                onChange={handleInputChange}
                placeholder='https://facebook.com/userName'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>
          </div>
        </div>

        {/* Fight Profile & Background */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-6'>
            <Dumbbell className='w-6 h-6 text-orange-400' />
            <h2 className='text-2xl font-bold uppercase tracking-wide'>
              Fight Profile & Background
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-[#00000061] p-2 rounded md:col-span-2'>
              <label className='block font-medium mb-2'>
                Fighter Biography
              </label>
              <textarea
                name='bio'
                value={formData.bio ?? ''}
                onChange={handleInputChange}
                placeholder='Write about your journey...'
                rows='4'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400 resize-none'
                maxLength={100}
              />
              <p className='text-xs text-gray-400 mt-1'>Max 100 characters</p>
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>
                Primary Gym / Club <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='primaryGym'
                value={formData.primaryGym ?? ''}
                onChange={handleInputChange}
                placeholder='Primary Gym / Club Name'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400 resize-none'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Coach Name</label>
              <input
                type='text'
                name='coachName'
                value={formData.coachName ?? ''}
                onChange={handleInputChange}
                placeholder='Primary coach or trainer'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded md:col-span-2'>
              <label className='block font-medium mb-2'>Affiliations</label>
              <input
                type='text'
                name='affiliations'
                value={formData.affiliations ?? ''}
                onChange={handleInputChange}
                placeholder='Teams, organizations, sponsors...'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>
                Training Experience
              </label>
              <select
                name='trainingExperience'
                value={formData.trainingExperience}
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent text-white'
              >
                <option value='' className='text-black'>
                  Select Experience Level
                </option>
                {experienceLevels.map((level) => (
                  <option key={level} value={level} className='text-black'>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Training Style</label>
              <select
                name='trainingStyle'
                value={formData.trainingStyle}
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent text-white'
              >
                <option value='' className='text-black'>
                  Select Training Style
                </option>
                {sportTypes.map((level) => (
                  <option key={level} value={level} className='text-black'>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div className='bg-[#00000061] p-2 rounded md:col-span-2'>
              <label className='block font-medium mb-2'>Credentials</label>
              <textarea
                name='credentials'
                value={formData.credentials ?? ''}
                onChange={handleInputChange}
                placeholder='Certifications, belts, rankings, special training...'
                rows='3'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400 resize-none'
              />
            </div>
          </div>
        </div>

        {/* Achievements & Career Milestones */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-6'>
            <Trophy className='w-6 h-6 text-yellow-400' />
            <h2 className='text-2xl font-bold uppercase tracking-wide'>
              Achievements & Career Milestones
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>National Rank</label>
              <input
                type='text'
                name='nationalRank'
                value={formData.nationalRank ?? ''}
                onChange={handleInputChange}
                placeholder='e.g., #5 in Lightweight Division'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Global Rank</label>
              <input
                type='text'
                name='globalRank'
                value={formData.globalRank ?? ''}
                onChange={handleInputChange}
                placeholder='e.g., #15 Worldwide'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Awards / Titles</label>
              <input
                type='text'
                name='achievements'
                value={formData.achievements ?? ''}
                onChange={handleInputChange}
                placeholder='e.g., Top Lightweight 2023'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>
                Record-Setting Highlights
              </label>
              <input
                type='url'
                name='recordHighlight'
                value={formData.recordHighlight ?? ''}
                onChange={handleInputChange}
                placeholder='e.g., Fastest KO – 0:23'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>
          </div>
        </div>

        {/*Media Uploads*/}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-6'>
            <Camera className='w-6 h-6 text-pink-400' />
            <h2 className='text-2xl font-bold uppercase tracking-wide'>
              Media Uploads
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Media Gallery</label>
              <input
                type='file'
                name='imageGallery'
                onChange={handleFileChange}
                accept='image/*'
                multiple
                className='w-full outline-none bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700'
              />
              <p className='text-xs text-gray-400 mt-1'>
                Images only, Max 5MB each
              </p>
              <div className='flex flex-wrap gap-2 mt-2'>
                {formData.imageGallery?.map((file, idx) => (
                  <img
                    key={idx}
                    src={
                      typeof file === 'string'
                        ? file
                        : URL.createObjectURL(file)
                    }
                    alt={`Preview ${idx}`}
                    className='w-24 h-24 object-cover'
                  />
                ))}
              </div>
            </div>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>
                Video Highlight URL
              </label>
              <input
                type='url'
                name='videoHighlight'
                value={formData.videoHighlight ?? ''}
                onChange={handleInputChange}
                placeholder='https://youtube.com/watch?v=...'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>
          </div>
        </div>
        {/* Upload License Document */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-6'>
            <Camera className='w-6 h-6 text-pink-400' />
            <h2 className='text-2xl font-bold uppercase tracking-wide'>
              Compliance Uploads
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>
                Upload Medical Certificate
                <span className='text-red-500'>*</span>
              </label>
              <input
                type='file'
                name='medicalCertificate'
                onChange={handleFileChange}
                accept='.pdf,.jpg,.jpeg,.png'
                className='w-full outline-none bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700'
                required
              />
              <p className='text-xs text-gray-400 mt-1'>PDF/Image, Max 5MB</p>

              {formData.medicalCertificate && (
                <div className='mt-2'>
                  <a href={formData.medicalCertificate} target='_blank'>
                    View Medical Certificate
                  </a>
                </div>
              )}
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>
                Upload License Document
                <span className='text-red-500'>*</span>
              </label>
              <input
                type='file'
                name='licenseDocument'
                onChange={handleFileChange}
                accept='.pdf,.jpg,.jpeg,.png'
                className='w-full outline-none bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700'
              />
              <p className='text-xs text-gray-400 mt-1'>PDF/Image, Max 5MB</p>
              {formData.licenseDocument && (
                <div className='mt-2'>
                  <a href={formData.licenseDocument} target='_blank'>
                    View License Document
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-center gap-4 mt-8'>
          <Link href={'/'}>
            <button
              type='button'
              className='bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-8 rounded transition duration-300 transform hover:scale-105'
            >
              Cancel
            </button>
          </Link>
          <button
            type='button'
            onClick={handleSubmit}
            className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-8 rounded transition duration-300 transform hover:scale-105 shadow-lg'
          >
            {isSubmitting ? <Loader /> : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FightProfileForm
