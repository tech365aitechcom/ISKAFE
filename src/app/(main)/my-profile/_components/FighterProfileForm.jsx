import React, { useEffect, useState } from 'react'
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
    weightUnit: 'kg', // New field for weight unit
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
    recordHighlight: '', // Changed back to text from URL

    // Media
    imageGallery: [],
    videoHighlight: '',

    // Compliance
    medicalCertificate: null,
    licenseDocument: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false) // New state for save confirmation
  const [uploadedFiles, setUploadedFiles] = useState({
    medicalCertificate: null,
    licenseDocument: null,
    profilePhoto: null,
    imageGallery: [],
  })
  const [selectedFileNames, setSelectedFileNames] = useState({ // New state for file names
    profilePhoto: '',
    medicalCertificate: '',
    licenseDocument: '',
    imageGallery: [],
  })

  // Validation functions
  const validatePhoneNumber = (number) => /^\+?[0-9]{10,15}$/.test(number)
  const validateName = (name) => /^[A-Za-z\s'-]+$/.test(name)
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const validateUrl = (url) => {
    if (!url) return true
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  const validateTextInput = (text) => {
    if (!text) return true
    return /^[A-Za-zÀ-ÖØ-öø-ÿ\s\-.,'()&]+$/i.test(text)
  }

  const validateNumericRank = (rank) => {
    if (!rank) return true
    return /^[0-9]+$/.test(rank)
  }

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

  useEffect(() => {
    if (userDetails) {
      const { fighterProfile = {}, dateOfBirth, ...rest } = userDetails
      const formattedDOB = dateOfBirth
        ? new Date(dateOfBirth).toISOString().split('T')[0]
        : ''

      const updatedFormData = {
        ...rest,
        ...fighterProfile,
        dateOfBirth: formattedDOB,
        weightUnit: fighterProfile.weightUnit || 'kg', // Initialize weight unit
      }

      setFormData(updatedFormData)
      setUploadedFiles({
        medicalCertificate: fighterProfile.medicalCertificate || null,
        licenseDocument: fighterProfile.licenseDocument || null,
        profilePhoto: fighterProfile.profilePhoto || null,
        imageGallery: fighterProfile.imageGallery || [],
      })
      setSelectedFileNames({
        profilePhoto: fighterProfile.profilePhoto ? 'Profile photo uploaded' : '',
        medicalCertificate: fighterProfile.medicalCertificate ? 'Medical certificate uploaded' : '',
        licenseDocument: fighterProfile.licenseDocument ? 'License document uploaded' : '',
        imageGallery: fighterProfile.imageGallery?.length > 0 
          ? Array(fighterProfile.imageGallery.length).fill('Image uploaded') 
          : [],
      })
    }
  }, [userDetails])

  const handleInputChange = (e) => {
    const { name, value } = e.target
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
        setSelectedFileNames(prev => ({
          ...prev,
          [name]: Array.from(files).map(file => file.name)
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: files[0],
        }))
        setSelectedFileNames(prev => ({
          ...prev,
          [name]: files[0].name
        }))

        if (
          name === 'medicalCertificate' ||
          name === 'licenseDocument' ||
          name === 'profilePhoto'
        ) {
          setUploadedFiles((prev) => ({
            ...prev,
            [name]: files[0],
          }))
        }
      }
    }
  }

  const validateNumericInput = (value) =>
    /^[0-9]+(\.[0-9]+)?$/.test(String(value).trim())
  const validateHeightInput = (value) =>
    /^([0-9]{1,2}[''′]?[0-9]{0,2})$|^([0-9]{2,3}\s?(cm|CM)?)$/.test(
      String(value).trim()
    )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setIsSaved(false)

    // Basic validations
    if (!formData.firstName.trim()) {
      enqueueSnackbar('First name is required.', { variant: 'warning' })
      setIsSubmitting(false)
      return
    }

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

    if (formData.email && !validateEmail(formData.email)) {
      enqueueSnackbar('Please enter a valid email address.', {
        variant: 'warning',
      })
      setIsSubmitting(false)
      return
    }

    if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
      enqueueSnackbar('Please enter a valid phone number (10-15 digits).', {
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

    if (!formData.country || formData.country.trim() === '') {
      enqueueSnackbar('Country is required.', { variant: 'warning' })
      setIsSubmitting(false)
      return
    }

    if (!formData.state || formData.state.trim() === '') {
      enqueueSnackbar('State is required.', { variant: 'warning' })
      setIsSubmitting(false)
      return
    }

    if (!formData.city || formData.city.trim() === '') {
      enqueueSnackbar('City is required.', { variant: 'warning' })
      setIsSubmitting(false)
      return
    }

    if (!formData.primaryGym?.trim()) {
      enqueueSnackbar('Primary Gym / Club is required.', {
        variant: 'warning',
      })
      setIsSubmitting(false)
      return
    }

    if (!formData.profilePhoto && !uploadedFiles.profilePhoto) {
      enqueueSnackbar('Profile photo is required.', { variant: 'warning' })
      setIsSubmitting(false)
      return
    }

    if (!String(formData.weight).trim()) {
      enqueueSnackbar('Weight is required.', { variant: 'warning' })
      setIsSubmitting(false)
      return
    }

    if (!validateNumericInput(formData.weight)) {
      enqueueSnackbar('Weight must be a valid number.', { variant: 'warning' })
      setIsSubmitting(false)
      return
    }

    if (!String(formData.height).trim()) {
      enqueueSnackbar('Height is required.', { variant: 'warning' })
      setIsSubmitting(false)
      return
    }

    if (!validateHeightInput(formData.height)) {
      enqueueSnackbar("Height must be in a valid format like 5'10 or 180 cm.", {
        variant: 'warning',
      })
      setIsSubmitting(false)
      return
    }

    if (!formData.weightClass) {
      enqueueSnackbar('Weight class is required.', { variant: 'warning' })
      setIsSubmitting(false)
      return
    }

    if (!formData.medicalCertificate && !uploadedFiles.medicalCertificate) {
      enqueueSnackbar('Medical Certificate is required.', {
        variant: 'warning',
      })
      setIsSubmitting(false)
      return
    }

    if (!formData.licenseDocument && !uploadedFiles.licenseDocument) {
      enqueueSnackbar('License Document is required.', { variant: 'warning' })
      setIsSubmitting(false)
      return
    }

    // URL validations
    const urlFields = ['instagram', 'youtube', 'facebook', 'videoHighlight']
    for (const field of urlFields) {
      if (formData[field] && !validateUrl(formData[field])) {
        enqueueSnackbar(
          `Please enter a valid URL for ${field} (must start with http:// or https://)`,
          { variant: 'warning' }
        )
        setIsSubmitting(false)
        return
      }
    }

    // Text field validations
    const textFields = ['coachName', 'affiliations', 'recordHighlight'] // Added recordHighlight
    for (const field of textFields) {
      if (formData[field] && !validateTextInput(formData[field])) {
        enqueueSnackbar(
          `Please enter valid text for ${field} (letters and basic punctuation only)`,
          { variant: 'warning' }
        )
        setIsSubmitting(false)
        return
      }
    }

    // Numeric rank validations
    const rankFields = ['nationalRank', 'globalRank']
    for (const field of rankFields) {
      if (formData[field] && !validateNumericRank(formData[field])) {
        enqueueSnackbar(`Please enter numbers only for ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, { // Fixed message spacing
          variant: 'warning',
        })
        setIsSubmitting(false)
        return
      }
    }

    try {
      const payloadData = { ...formData }

      if (!payloadData.gender || payloadData.gender.trim() === '') {
        delete payloadData.gender
      }

      // Handle file uploads
      if (
        payloadData.profilePhoto &&
        typeof payloadData.profilePhoto !== 'string'
      ) {
        payloadData.profilePhoto = await uploadToS3(payloadData.profilePhoto)
        setUploadedFiles((prev) => ({
          ...prev,
          profilePhoto: payloadData.profilePhoto,
        }))
      } else if (uploadedFiles.profilePhoto) {
        payloadData.profilePhoto = uploadedFiles.profilePhoto
      }

      if (
        payloadData.imageGallery?.length > 0 &&
        typeof payloadData.imageGallery[0] !== 'string'
      ) {
        payloadData.imageGallery = await Promise.all(
          payloadData.imageGallery.map((file) => uploadToS3(file))
        )
        setUploadedFiles((prev) => ({
          ...prev,
          imageGallery: payloadData.imageGallery,
        }))
      } else if (uploadedFiles.imageGallery?.length > 0) {
        payloadData.imageGallery = uploadedFiles.imageGallery
      }

      if (
        payloadData.medicalCertificate &&
        typeof payloadData.medicalCertificate !== 'string'
      ) {
        payloadData.medicalCertificate = await uploadToS3(
          payloadData.medicalCertificate
        )
        setUploadedFiles((prev) => ({
          ...prev,
          medicalCertificate: payloadData.medicalCertificate,
        }))
      } else if (uploadedFiles.medicalCertificate) {
        payloadData.medicalCertificate = uploadedFiles.medicalCertificate
      }

      if (
        payloadData.licenseDocument &&
        typeof payloadData.licenseDocument !== 'string'
      ) {
        payloadData.licenseDocument = await uploadToS3(
          payloadData.licenseDocument
        )
        setUploadedFiles((prev) => ({
          ...prev,
          licenseDocument: payloadData.licenseDocument,
        }))
      } else if (uploadedFiles.licenseDocument) {
        payloadData.licenseDocument = uploadedFiles.licenseDocument
      }

      const response = await axios.put(
        `${API_BASE_URL}/fighters/${user._id}`,
        payloadData,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      )

      if (response.status === apiConstants.success) {
        enqueueSnackbar(response.data.message, { variant: 'success' })
        setIsSaved(true)
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
          {isSaved && (
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
              Saved Successfully
            </span>
          )}
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
                {formData.profilePhoto || uploadedFiles.profilePhoto ? (
                  <img
                    src={
                      typeof (
                        formData.profilePhoto || uploadedFiles.profilePhoto
                      ) === 'string'
                        ? formData.profilePhoto || uploadedFiles.profilePhoto
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

              <div className="flex flex-col">
                <input
                  type='file'
                  name='profilePhoto'
                  onChange={handleFileChange}
                  accept='image/jpeg,image/jpg,image/png'
                  className='w-full outline-none bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700'
                />
                {selectedFileNames.profilePhoto && (
                  <p className="text-sm text-gray-300 mt-1">
                    Selected: {selectedFileNames.profilePhoto}
                  </p>
                )}
              </div>

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
                placeholder='Enter first name'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                required
                disabled={isSubmitting}
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
                placeholder='Enter last name'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                required
                disabled={isSubmitting}
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
                placeholder='Enter nickname'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                placeholder="e.g., 5'10 or 180 cm"
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                required
                disabled={isSubmitting}
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>
                Weight<span className='text-red-400'>*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type='text'
                  name='weight'
                  value={formData.weight ?? ''}
                  onChange={handleInputChange}
                  placeholder='e.g., 170'
                  className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                  required
                  disabled={isSubmitting}
                />
                <select
                  name='weightUnit'
                  value={formData.weightUnit}
                  onChange={handleInputChange}
                  className='outline-none bg-transparent text-white'
                  disabled={isSubmitting}
                >
                  <option value='kg'>kg</option>
                  <option value='lbs'>lbs</option>
                </select>
              </div>
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={!formData.country || isSubmitting}
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
                disabled={!formData.state || isSubmitting}
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
                disabled={isSubmitting}
              />
              {formData.phoneNumber &&
                !validatePhoneNumber(formData.phoneNumber) && (
                  <p className='text-xs text-red-400 mt-1'>
                    Please enter a valid phone number (10-15 digits)
                  </p>
                )}
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
                disabled={isSubmitting}
              />
              {formData.email && !validateEmail(formData.email) && (
                <p className='text-xs text-red-400 mt-1'>
                  Please enter a valid email address
                </p>
              )}
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Instagram</label>
              <input
                type='url'
                name='instagram'
                value={formData.instagram ?? ''}
                onChange={handleInputChange}
                placeholder='https://instagram.com/username'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                disabled={isSubmitting}
              />
              {formData.instagram && !validateUrl(formData.instagram) && (
                <p className='text-xs text-red-400 mt-1'>
                  Please enter a valid URL starting with http:// or https://
                </p>
              )}
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
                disabled={isSubmitting}
              />
              {formData.youtube && !validateUrl(formData.youtube) && (
                <p className='text-xs text-red-400 mt-1'>
                  Please enter a valid URL starting with http:// or https://
                </p>
              )}
            </div>

            <div className='bg-[#00000061] p-2 rounded md:col-span-2'>
              <label className='block font-medium mb-2'>Facebook Profile</label>
              <input
                type='url'
                name='facebook'
                value={formData.facebook ?? ''}
                onChange={handleInputChange}
                placeholder='https://facebook.com/username'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                disabled={isSubmitting}
              />
              {formData.facebook && !validateUrl(formData.facebook) && (
                <p className='text-xs text-red-400 mt-1'>
                  Please enter a valid URL starting with http:// or https://
                </p>
              )}
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
                rows='6'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400 resize-none'
                maxLength={1000}
                disabled={isSubmitting}
              />
              <div className='flex justify-between'>
                <p className='text-xs text-gray-400 mt-1'>
                  Max 1000 characters
                </p>
                <p className='text-xs text-gray-400 mt-1'>
                  {formData.bio?.length || 0}/1000
                </p>
              </div>
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
                placeholder='Enter gym/club name'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400 resize-none'
                disabled={isSubmitting}
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Coach Name</label>
              <input
                type='text'
                name='coachName'
                value={formData.coachName ?? ''}
                onChange={handleInputChange}
                placeholder='Enter coach name'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                disabled={isSubmitting}
              />
              {formData.coachName && !validateTextInput(formData.coachName) && (
                <p className='text-xs text-red-400 mt-1'>
                  Letters and basic punctuation only
                </p>
              )}
            </div>

            <div className='bg-[#00000061] p-2 rounded md:col-span-2'>
              <label className='block font-medium mb-2'>Affiliations</label>
              <input
                type='text'
                name='affiliations'
                value={formData.affiliations ?? ''}
                onChange={handleInputChange}
                placeholder='Enter team or organization name'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                disabled={isSubmitting}
              />
              {formData.affiliations &&
                !validateTextInput(formData.affiliations) && (
                  <p className='text-xs text-red-400 mt-1'>
                    Letters and basic punctuation only
                  </p>
                )}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                placeholder='Enter rank number'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                inputMode='numeric'
                disabled={isSubmitting}
              />
              {formData.nationalRank &&
                !validateNumericRank(formData.nationalRank) && (
                  <p className='text-xs text-red-400 mt-1'>Numbers only</p>
                )}
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Global Rank</label>
              <input
                type='text'
                name='globalRank'
                value={formData.globalRank ?? ''}
                onChange={handleInputChange}
                placeholder='Enter rank number'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                inputMode='numeric'
                disabled={isSubmitting}
              />
              {formData.globalRank &&
                !validateNumericRank(formData.globalRank) && (
                  <p className='text-xs text-red-400 mt-1'>Numbers only</p>
                )}
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
                disabled={isSubmitting}
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>
                Record-Setting Highlights
              </label>
              <input
                type='text' // Changed from 'url' to 'text'
                name='recordHighlight'
                value={formData.recordHighlight ?? ''}
                onChange={handleInputChange}
                placeholder='Describe your record highlights'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                disabled={isSubmitting}
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
              <div className="flex flex-col">
                <input
                  type='file'
                  name='imageGallery'
                  onChange={handleFileChange}
                  accept='image/*'
                  multiple
                  className='w-full outline-none bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700'
                  disabled={isSubmitting}
                />
                {selectedFileNames.imageGallery.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-300">Selected files:</p>
                    <ul className="text-xs text-gray-400">
                      {selectedFileNames.imageGallery.map((name, idx) => (
                        <li key={idx}>{name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
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
                {uploadedFiles.imageGallery?.map((file, idx) => (
                  <img
                    key={`uploaded-${idx}`}
                    src={file}
                    alt={`Uploaded Preview ${idx}`}
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
                disabled={isSubmitting}
              />
              {formData.videoHighlight &&
                !validateUrl(formData.videoHighlight) && (
                  <p className='text-xs text-red-400 mt-1'>
                    Please enter a valid URL
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* Compliance Uploads */}
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
              <div className="flex flex-col">
                <input
                  type='file'
                  name='medicalCertificate'
                  onChange={handleFileChange}
                  accept='.pdf,.jpg,.jpeg,.png'
                  className='w-full outline-none bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700'
                  required
                  disabled={isSubmitting}
                />
                {selectedFileNames.medicalCertificate && (
                  <p className="text-sm text-gray-300 mt-1">
                    Selected: {selectedFileNames.medicalCertificate}
                  </p>
                )}
              </div>
              <p className='text-xs text-gray-400 mt-1'>PDF/Image, Max 5MB</p>

              {(formData.medicalCertificate ||
                uploadedFiles.medicalCertificate) && (
                <div className='mt-2'>
                  <a
                    href={
                      typeof (
                        formData.medicalCertificate ||
                        uploadedFiles.medicalCertificate
                      ) === 'string'
                        ? formData.medicalCertificate ||
                          uploadedFiles.medicalCertificate
                        : URL.createObjectURL(formData.medicalCertificate)
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-400 hover:underline'
                  >
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
              <div className="flex flex-col">
                <input
                  type='file'
                  name='licenseDocument'
                  onChange={handleFileChange}
                  accept='.pdf,.jpg,.jpeg,.png'
                  className='w-full outline-none bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700'
                  required
                  disabled={isSubmitting}
                />
                {selectedFileNames.licenseDocument && (
                  <p className="text-sm text-gray-300 mt-1">
                    Selected: {selectedFileNames.licenseDocument}
                  </p>
                )}
              </div>
              <p className='text-xs text-gray-400 mt-1'>PDF/Image, Max 5MB</p>
              {(formData.licenseDocument || uploadedFiles.licenseDocument) && (
                <div className='mt-2'>
                  <a
                    href={
                      typeof (
                        formData.licenseDocument ||
                        uploadedFiles.licenseDocument
                      ) === 'string'
                        ? formData.licenseDocument ||
                          uploadedFiles.licenseDocument
                        : URL.createObjectURL(formData.licenseDocument)
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-400 hover:underline'
                  >
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
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader /> : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FightProfileForm