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
  User2,
} from 'lucide-react'
import { Country, State } from 'country-state-city'
import { enqueueSnackbar } from 'notistack'
import { API_BASE_URL, apiConstants } from '../../../../constants'
import axios from 'axios'
import useStore from '../../../../stores/useStore'
import { uploadToS3 } from '../../../../utils/uploadToS3'
import moment from 'moment'
import Autocomplete from '../../../_components/Autocomplete'
import Loader from '../../../_components/Loader'
import Link from 'next/link'

const TrainerProfileForm = ({ userDetails, onSuccess }) => {
  const { user } = useStore()
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
    weightUnit: 'kg', // New field for weight unit

    // Gym Info
    gymName: '',
    gymLocation: '',
    yearsOfExperience: '',
    trainerType: '',
    preferredRuleSets: [],

    // Credentials
    certification: null,
    bio: '',

    // Public Profile
    instagram: '',
    facebook: '',
    youtube: '',
    affiliatedFighters: [],

    // Emergency Info
    emergencyContactName: '',
    emergencyContactNumber: '',

    // Event Info
    associatedEvents: [],
    accreditationType: '',

    // Suspension Info
    isSuspended: false,
    suspensionType: '',
    suspensionNotes: '',
    suspensionStartDate: '',
    suspensionEndDate: '',
    medicalClearance: false,
    medicalDocument: null,
  })
  const countries = Country.getAllCountries()
  const states = formData.country
    ? State.getStatesOfCountry(formData.country)
    : []
  const [fighters, setFighters] = useState([])
  const [events, setEvents] = useState([])
  const [existingTrainerProfile, setExistingTrainerProfile] = useState(false)
  const [loading, setLoading] = useState(false)
  const [buttonStates, setButtonStates] = useState({
    draft: false,
    submit: false,
    publish: false,
  })
  const [originalFormData, setOriginalFormData] = useState({}) // Store original data for comparison

  // Check if any submission is in progress
  const isFormDisabled = Object.values(buttonStates).some((state) => state)

  const validatePhoneNumber = (number) => {
    if (!number) return false
    // More comprehensive phone validation - allows spaces, dashes, parentheses
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,20}$/
    return phoneRegex.test(number.replace(/\s/g, ''))
  }

  const validateName = (name) => /^[A-Za-z\s'-]+$/.test(name)

  const validateGymName = (gymName) => {
    if (!gymName) return true // Allow empty since it's not required
    // Allow letters, numbers, spaces, apostrophes, hyphens, and ampersands
    return /^[A-Za-z0-9\s'&-]+$/.test(gymName)
  }

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

  useEffect(() => {
    if (userDetails) {
      const {
        trainerProfile = {},
        suspension = {},
        dateOfBirth,
        ...rest
      } = userDetails

      // Format DOB
      const formattedDOB = dateOfBirth
        ? moment(dateOfBirth).format('YYYY-MM-DD')
        : ''
      let affiliatedFighters = []
      let associatedEvents = []
      if (trainerProfile) {
        console.log('trainerProfile', trainerProfile)
        setExistingTrainerProfile(true)

        // affiliatedFighters: convert to [{ label, value }]
        affiliatedFighters =
          trainerProfile.affiliatedFighters?.map((fighter) => ({
            label: `${fighter.userId?.firstName || ''} ${
              fighter.userId?.lastName || ''
            } (${fighter.userId?.email || ''})`,
            value: fighter._id,
          })) ?? []

        // associatedEvents: convert to [{ label, value }]
        associatedEvents =
          trainerProfile.associatedEvents?.map((event) => ({
            label: event.name,
            value: event._id,
          })) ?? []
      }

      // Format suspension start date
      const suspensionStartDate = suspension?.incidentDate
        ? moment(suspension?.incidentDate).format('YYYY-MM-DD')
        : ''

      // Calculate suspension end date
      const suspensionEndDate =
        suspension?.incidentDate && suspension?.daysWithoutTraining
          ? moment(suspension?.incidentDate)
              .add(suspension?.daysWithoutTraining, 'days')
              .format('YYYY-MM-DD')
          : ''

      const updatedFormData = {
        ...formData,
        ...rest,
        ...trainerProfile,
        dateOfBirth: formattedDOB,
        age: moment().diff(dateOfBirth, 'years'),
        affiliatedFighters,
        associatedEvents,
        suspensionStartDate,
        suspensionEndDate,
        suspensionNotes: suspension?.description || '',
        suspensionType: suspension?.type || '',
        // Preserve existing weightUnit if API doesn't return it, otherwise use API value or default to 'kg'
        weightUnit: trainerProfile?.weightUnit || formData?.weightUnit || 'kg',
      }

      setFormData(updatedFormData)
      setOriginalFormData(updatedFormData) // Store original data for comparison
    }
  }, [userDetails])

  useEffect(() => {
    setLoading(true)
    const getEvents = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/events?isPublished=true`
        )
        console.log('Response:', response.data)

        setEvents(response.data.data.items)
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }
    getEvents()
  }, [])

  useEffect(() => {
    const getFighters = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`${API_BASE_URL}/fighters`)
        console.log('Fighters Response:', response.data)

        setFighters(response.data.data.items)
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }
    getFighters()
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === 'checkbox') {
      if (name === 'preferredRuleSets') {
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
      // Calculate age when dateOfBirth changes
      if (name === 'dateOfBirth' && value) {
        const calculatedAge = getAge(value)
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          age: calculatedAge >= 0 ? calculatedAge : '',
        }))
      } else if (name === 'gymName') {
        // Filter out invalid characters for gym name
        const filteredValue = value.replace(/[^A-Za-z0-9\s'&-]/g, '')
        setFormData((prev) => ({
          ...prev,
          [name]: filteredValue,
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }))
      }
    }
  }

  const handleAutocompleteChange = (eOrName, value) => {
    if (typeof eOrName === 'object' && eOrName?.target) {
      const { name, value, type, checked } = eOrName.target
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }))
    } else {
      const name = eOrName
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
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

  const validateUrl = (url) => {
    if (!url) return true // Allow empty
    return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
      url
    )
  }

  const validateNumeric = (value) => {
    if (!value) return false
    // Allows numbers with optional decimal point and optional units (cm, kg, lbs, etc.)
    return /^[\d]+(\.\d+)?\s*(cm|kg|lbs|ft|in)?$/i.test(value)
  }

  const validateForm = () => {
    // Basic Info Validation
    if (!formData.firstName.trim()) {
      enqueueSnackbar('First name is required.', { variant: 'warning' })
      return false
    }

    if (
      formData.isSuspended &&
      formData.suspensionStartDate &&
      formData.suspensionEndDate
    ) {
      const start = moment(formData.suspensionStartDate)
      const end = moment(formData.suspensionEndDate)
      if (end.isBefore(start)) {
        enqueueSnackbar(
          'Suspension End Date cannot be earlier than Start Date.',
          {
            variant: 'warning',
          }
        )
        return false
      }
    }

    if (!validateName(formData.firstName)) {
      enqueueSnackbar(
        'First name can only contain letters, spaces, apostrophes, or hyphens.',
        { variant: 'warning' }
      )
      return false
    }

    if (!formData.lastName.trim()) {
      enqueueSnackbar('Last name is required.', { variant: 'warning' })
      return false
    }

    if (!validateName(formData.lastName)) {
      enqueueSnackbar(
        'Last name can only contain letters, spaces, apostrophes, or hyphens.',
        { variant: 'warning' }
      )
      return false
    }

    if (!validateEmail(formData.email)) {
      enqueueSnackbar('Please enter a valid email address.', {
        variant: 'warning',
      })
      return false
    }

    if (!validatePhoneNumber(formData.phoneNumber)) {
      enqueueSnackbar(
        'Please enter a valid phone number (10-15 digits, with optional country code).',
        {
          variant: 'warning',
        }
      )
      return false
    }

    if (!formData.dateOfBirth || getAge(formData.dateOfBirth) < 18) {
      enqueueSnackbar(
        'Age must be at least 18 years old. Please check your date of birth.',
        {
          variant: 'warning',
        }
      )
      return false
    }

    if (!formData.height) {
      enqueueSnackbar('Height is required.', { variant: 'warning' })
      return false
    }

    if (!formData.weight) {
      enqueueSnackbar('Weight is required.', { variant: 'warning' })
      return false
    }

    // Gym Info Validation
    if (!formData.yearsOfExperience) {
      enqueueSnackbar('Years of experience is required.', {
        variant: 'warning',
      })
      return false
    }

    if (formData.gymName && !validateGymName(formData.gymName)) {
      enqueueSnackbar(
        'Gym name can only contain letters, numbers, spaces, apostrophes, hyphens, and ampersands.',
        { variant: 'warning' }
      )
      return false
    }

    if (!formData.country) {
      enqueueSnackbar('Country is required.', { variant: 'warning' })
      return false
    }

    if (!formData.trainerType) {
      enqueueSnackbar('Please select a trainer type.', {
        variant: 'warning',
      })
      return false
    }

    if (formData.preferredRuleSets.length === 0) {
      enqueueSnackbar('At least one preferred rule set is required.', {
        variant: 'warning',
      })
      return false
    }

    // Emergency Info Validation
    if (!formData.emergencyContactName.trim()) {
      enqueueSnackbar('Emergency contact name is required.', {
        variant: 'warning',
      })
      return false
    }

    if (!validateName(formData.emergencyContactName)) {
      enqueueSnackbar(
        'Emergency contact name can only contain letters, spaces, apostrophes, or hyphens.',
        { variant: 'warning' }
      )
      return false
    }

    if (!validatePhoneNumber(formData.emergencyContactNumber)) {
      enqueueSnackbar(
        'Please enter a valid emergency contact number (10-15 digits, with optional country code).',
        {
          variant: 'warning',
        }
      )
      return false
    }

    if (formData.instagram && !validateUrl(formData.instagram)) {
      enqueueSnackbar(
        'Please enter a valid Instagram URL (e.g., https://instagram.com/username)',
        {
          variant: 'warning',
        }
      )
      return false
    }

    if (formData.facebook && !validateUrl(formData.facebook)) {
      enqueueSnackbar(
        'Please enter a valid Facebook URL (e.g., https://facebook.com/username)',
        {
          variant: 'warning',
        }
      )
      return false
    }

    if (formData.youtube && !validateUrl(formData.youtube)) {
      enqueueSnackbar(
        'Please enter a valid YouTube URL (e.g., https://youtube.com/channel)',
        {
          variant: 'warning',
        }
      )
      return false
    }

    // Height and Weight Validation (BR-266)
    if (!validateNumeric(formData.height)) {
      enqueueSnackbar('Please enter a valid height (e.g., 5.10 or 180cm)', {
        variant: 'warning',
      })
      return false
    }

    if (!validateNumeric(formData.weight)) {
      enqueueSnackbar('Please enter a valid weight (e.g., 175 lbs or 70kg)', {
        variant: 'warning',
      })
      return false
    }

    // Bio Length Validation (BR-267)
    if (formData.bio && formData.bio.length > 1000) {
      enqueueSnackbar('Bio cannot exceed 1000 characters', {
        variant: 'warning',
      })
      return false
    }

    return true
  }

  // Function to check if any changes have been made
  const hasFormChanged = () => {
    // Check if original data exists
    if (!originalFormData || Object.keys(originalFormData).length === 0) {
      return true // If no original data, allow save (first time save)
    }

    // Compare form fields (excluding file fields which are handled separately)
    const fieldsToCompare = [
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'country',
      'dateOfBirth',
      'age',
      'gender',
      'height',
      'weight',
      'weightUnit',
      'gymName',
      'gymLocation',
      'yearsOfExperience',
      'trainerType',
      'bio',
      'instagram',
      'facebook',
      'youtube',
      'emergencyContactName',
      'emergencyContactNumber',
      'accreditationType',
      'isSuspended',
      'suspensionType',
      'suspensionNotes',
      'suspensionStartDate',
      'suspensionEndDate',
      'medicalClearance',
    ]

    for (const field of fieldsToCompare) {
      const originalValue = originalFormData[field] || ''
      const currentValue = formData[field] || ''
      if (originalValue !== currentValue) {
        return true
      }
    }

    // Check array fields separately
    const originalPreferredRuleSets = originalFormData.preferredRuleSets || []
    const currentPreferredRuleSets = formData.preferredRuleSets || []
    if (
      JSON.stringify(originalPreferredRuleSets.sort()) !==
      JSON.stringify(currentPreferredRuleSets.sort())
    ) {
      return true
    }

    // Check affiliated fighters
    const originalFighters = originalFormData.affiliatedFighters || []
    const currentFighters = formData.affiliatedFighters || []
    if (JSON.stringify(originalFighters) !== JSON.stringify(currentFighters)) {
      return true
    }

    // Check associated events
    const originalEvents = originalFormData.associatedEvents || []
    const currentEvents = formData.associatedEvents || []
    if (JSON.stringify(originalEvents) !== JSON.stringify(currentEvents)) {
      return true
    }

    // Check if new files have been selected (File objects indicate new uploads)
    if (formData.profilePhoto instanceof File) return true
    if (formData.certification instanceof File) return true
    if (formData.medicalDocument instanceof File) return true

    return false
  }

  const handleSubmit = async (e, action) => {
    e.preventDefault()

    // Set loading state for specific button
    setButtonStates((prev) => ({ ...prev, [action]: true }))

    // Check if any changes have been made
    if (!hasFormChanged()) {
      enqueueSnackbar(
        'No changes detected. Please make changes before saving.',
        {
          variant: 'info',
        }
      )
      setButtonStates((prev) => ({ ...prev, [action]: false }))
      return
    }

    if (!validateForm()) {
      setButtonStates((prev) => ({ ...prev, [action]: false }))
      return
    }

    try {
      if (formData.profilePhoto && typeof formData.profilePhoto !== 'string') {
        formData.profilePhoto = await uploadToS3(formData.profilePhoto)
      }
      if (
        formData.medicalDocument &&
        typeof formData.medicalDocument !== 'string'
      ) {
        formData.medicalDocument = await uploadToS3(formData.medicalDocument)
      }
      if (
        formData.certification &&
        typeof formData.certification !== 'string'
      ) {
        formData.certification = await uploadToS3(formData.certification)
      }

      if (Array.isArray(formData.affiliatedFighters)) {
        formData.affiliatedFighters = formData.affiliatedFighters.map(
          (fighter) => fighter.value
        )
      }
      if (Array.isArray(formData.associatedEvents)) {
        formData.associatedEvents = formData.associatedEvents.map(
          (event) => event.value
        )
      }
      let payload = {
        ...formData,
      }
      if (payload.gender === '') {
        delete payload.gender
      }

      // In validateForm():
      if (formData.isSuspended) {
        if (!formData.suspensionType) {
          enqueueSnackbar('Suspension type is required.', {
            variant: 'warning',
          })
          return false
        }
        if (!formData.suspensionStartDate) {
          enqueueSnackbar('Suspension start date is required.', {
            variant: 'warning',
          })
          return false
        }
        if (!formData.suspensionEndDate) {
          enqueueSnackbar('Suspension end date is required.', {
            variant: 'warning',
          })
          return false
        }
      }
      if (formData.isSuspended) {
        payload = {
          ...payload,
          daysWithoutTraining: moment(formData.suspensionEndDate).diff(
            moment(formData.suspensionStartDate),
            'days'
          ),
        }
      }
      if (action === 'submit') {
        payload = {
          ...payload,
          isDraft: false,
          isSubmitted: true,
        }
      } else if (action === 'draft') {
        payload = {
          ...payload,
          isDraft: true,
          isSubmitted: false,
        }
      } else {
        payload = {
          ...payload,
          isDraft: false,
          isSubmitted: true,
        }
      }

      let response = null
      if (existingTrainerProfile) {
        response = await axios.put(
          `${API_BASE_URL}/trainers/${user._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        )
      } else {
        response = await axios.post(`${API_BASE_URL}/trainers`, payload, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        })
      }

      if (
        response.status === apiConstants.success ||
        response.status === apiConstants.create
      ) {
        let message = ''
        if (action === 'draft') {
          message = 'Profile saved as draft successfully!'
        } else if (action === 'submit') {
          message = 'Profile submitted successfully!'
        } else {
          message = existingTrainerProfile
            ? 'Profile updated successfully!'
            : 'Profile created successfully!'
        }

        enqueueSnackbar(message, { variant: 'success' })

        // Update original form data to current form data after successful save
        setOriginalFormData({ ...formData })

        onSuccess()
      }
    } catch (error) {
      console.log(error)
      enqueueSnackbar(
        error?.response?.data?.message || 'Something went wrong',
        { variant: 'error' }
      )
    } finally {
      // Reset loading state for specific button
      setButtonStates((prev) => ({ ...prev, [action]: false }))
    }
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

  if (loading) {
    return (
      <div className='min-h-screen text-white bg-[#0B1739] py-6 px-4'>
        <div className='w-full container mx-auto'>
          <div className='flex items-center gap-4 mb-6'>
            <h1 className='text-4xl font-bold'>Trainer Profile</h1>
          </div>
          <div className='flex items-center justify-center'>
            <Loader />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen text-white bg-[#0B1739] py-6 px-4'>
      <div className='w-full container mx-auto'>
        <div className='flex items-center gap-4 mb-6'>
          <h1 className='text-4xl font-bold'>Trainer Profile</h1>
        </div>
        <form>
          {/* Personal Information */}
          <div className='flex items-center gap-2 mb-4'>
            <User className='w-6 h-6 text-blue-400' />
            <h2 className='font-bold uppercase text-lg'>
              Personal Information
            </h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            {/* Profile Photo */}
            <div className=''>
              <label className='block font-medium mb-2 text-gray-200'>
                Profile Photo
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
                disabled={isFormDisabled}
                className='w-full outline-none bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
              />

              <p className='text-xs text-gray-400 mt-1'>
                Trainer image for identification. JPG/PNG, Max 2MB.
              </p>
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            {[
              { label: 'First Name', name: 'firstName', required: true },
              { label: 'Last Name', name: 'lastName', required: true },
              {
                label: 'Email Address',
                name: 'email',
                type: 'email',
                required: true,
              },
              {
                label: 'Phone Number',
                name: 'phoneNumber',
                type: 'tel',
                required: true,
              },
              {
                label: 'Date of Birth',
                name: 'dateOfBirth',
                type: 'date',
                required: true,
              },
              { label: 'Age', name: 'age', disabled: true, required: true },
              {
                label: 'Height',
                name: 'height',
                placeholder: 'e.g., 5.10 or 180cm',
                required: true,
              },
            ].map((field, index) => (
              <div key={field.name} className='bg-[#00000061] p-2 rounded'>
                <label className='block font-medium mb-1'>
                  {field.label}
                  <span className='text-red-500'>
                    {field.required ? '*' : ''}
                  </span>
                </label>
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  placeholder={
                    field.placeholder || `Enter ${field.label.toLowerCase()}`
                  }
                  disabled={field.disabled || isFormDisabled}
                  className='w-full outline-none bg-transparent text-white disabled:text-gray-400 disabled:cursor-not-allowed'
                  required={field.required}
                />
              </div>
            ))}

            {/* Weight with Unit Selector */}
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>
                Weight<span className='text-red-500'>*</span>
              </label>
              <div className='flex items-center gap-2'>
                <input
                  type='text'
                  name='weight'
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder='e.g., 170'
                  className='w-full outline-none bg-transparent text-white disabled:text-gray-400 disabled:cursor-not-allowed'
                  required
                  disabled={isFormDisabled}
                />
                <select
                  name='weightUnit'
                  value={formData.weightUnit}
                  onChange={handleInputChange}
                  className='outline-none bg-transparent text-white disabled:text-gray-400 disabled:cursor-not-allowed'
                  disabled={isFormDisabled}
                >
                  <option value='kg' className='text-black'>
                    kg
                  </option>
                  <option value='lbs' className='text-black'>
                    lbs
                  </option>
                </select>
              </div>
            </div>

            {/* Country Dropdown */}
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>
                Country / Nationality<span className='text-red-500'>*</span>
              </label>
              <select
                name='country'
                value={formData.country}
                onChange={handleInputChange}
                disabled={isFormDisabled}
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400 disabled:cursor-not-allowed'
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

            {/* Gender Dropdown */}
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>Gender</label>
              <select
                name='gender'
                value={formData.gender}
                onChange={handleInputChange}
                disabled={isFormDisabled}
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400 disabled:cursor-not-allowed'
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
                disabled={isFormDisabled}
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400 disabled:cursor-not-allowed'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>Gym Location</label>
              <select
                name='gymLocation'
                value={formData.gymLocation}
                onChange={handleInputChange}
                disabled={isFormDisabled}
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400 disabled:cursor-not-allowed'
              >
                <option value='' className='text-black'>
                  Select Location
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
                Years of Experience<span className='text-red-500'>*</span>
              </label>
              <select
                name='yearsOfExperience'
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                disabled={isFormDisabled}
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400 disabled:cursor-not-allowed'
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
                disabled={isFormDisabled}
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400 disabled:cursor-not-allowed'
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
              Preferred Rule Sets<span className='text-red-500'>*</span>
            </label>
            <div className='grid grid-cols-3 md:grid-cols-4 gap-2'>
              {fightingStyles.map((style) => (
                <div key={style} className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    name='preferredRuleSets'
                    value={style.toLowerCase().replace(' ', '-')}
                    checked={formData.preferredRuleSets.includes(
                      style.toLowerCase().replace(' ', '-')
                    )}
                    onChange={handleInputChange}
                    disabled={isFormDisabled}
                    className='rounded text-yellow-400 bg-gray-700 border-gray-600 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed'
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
                name='certification'
                onChange={handleFileChange}
                accept='.pdf,image/jpeg,image/jpg'
                disabled={isFormDisabled}
                className='w-full outline-none bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
              />
              <p className='text-xs text-gray-400 mt-2'>PDF/JPG, Max 5MB</p>
              {formData.certification && (
                <div className='mt-2'>
                  <a
                    href={formData.certification}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    View Certification
                  </a>
                </div>
              )}
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>
                Bio / Achievements
              </label>
              <textarea
                name='bio'
                value={formData.bio}
                onChange={handleInputChange}
                placeholder='Describe experience...'
                rows='4'
                disabled={isFormDisabled}
                className='w-full outline-none bg-transparent text-white resize-none disabled:text-gray-400 disabled:cursor-not-allowed'
                maxLength={1000}
              />
              <p className='text-xs text-gray-400 mt-1'>
                {formData.bio.length}/1000 characters
              </p>
            </div>
          </div>
          {/* Social Media */}
          <div className='flex items-center gap-2 mb-4'>
            <Share className='text-yellow-400' />
            <h2 className='font-bold uppercase text-lg'>Social Media</h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>Instagram</label>
              <input
                type='url'
                name='instagram'
                value={formData.instagram}
                onChange={handleInputChange}
                placeholder='https://instagram.com/username'
                disabled={isFormDisabled}
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400 disabled:cursor-not-allowed'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>Facebook</label>
              <input
                type='url'
                name='facebook'
                value={formData.facebook}
                onChange={handleInputChange}
                placeholder='https://facebook.com/username'
                disabled={isFormDisabled}
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400 disabled:cursor-not-allowed'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>YouTube</label>
              <input
                type='url'
                name='youtube'
                value={formData.youtube}
                onChange={handleInputChange}
                placeholder='https://youtube.com/channel'
                disabled={isFormDisabled}
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400 disabled:cursor-not-allowed'
              />
            </div>
          </div>
          {/* Affiliated Fighters */}
          <div className='flex items-center gap-2 mb-4'>
            <User2 className='w-6 h-6 text-violet-400' />
            <h2 className='font-bold uppercase text-lg'>Affiliated Fighters</h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <Autocomplete
              label='Search Fighter'
              multiple
              selected={formData.affiliatedFighters}
              onChange={(value) =>
                handleAutocompleteChange('affiliatedFighters', value)
              }
              options={fighters.map((fighter) => ({
                label:
                  fighter.user?.firstName +
                  ' ' +
                  fighter.user?.lastName +
                  ' (' +
                  fighter.user?.email +
                  ')',
                value: fighter._id,
                key: fighter._id,
              }))}
              placeholder='Search fighter name'
              disabled={isFormDisabled}
            />
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
                disabled={isFormDisabled}
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400 disabled:cursor-not-allowed'
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
                disabled={isFormDisabled}
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400 disabled:cursor-not-allowed'
                required
              />
            </div>
          </div>
          {/* Event Association */}
          <div className='flex items-center gap-2 mb-4'>
            <Calendar className='w-6 h-6 text-violet-400' />
            <h2 className='font-bold uppercase text-lg'>Event Association</h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <Autocomplete
              label='Search Events'
              multiple
              selected={formData.associatedEvents}
              onChange={(value) =>
                handleAutocompleteChange('associatedEvents', value)
              }
              options={[
                ...events.map((event) => ({
                  label: event.name,
                  value: event._id,
                  key: event._id,
                })),
              ]}
              placeholder='Search event name'
              disabled={isFormDisabled}
            />

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-1'>
                Accreditation Type
              </label>
              <select
                name='accreditationType'
                value={formData.accreditationType}
                onChange={handleInputChange}
                disabled={isFormDisabled}
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400 disabled:cursor-not-allowed'
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
                disabled={isFormDisabled}
                className='rounded text-yellow-400 bg-gray-700 border-gray-600 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed'
              />
              <label>Is Suspended?</label>
            </div>

            {formData.isSuspended && (
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='bg-[#00000030] p-2 rounded'>
                  <label className='block font-medium mb-1'>
                    Suspension Type
                    <span className='text-red-500'>*</span>
                  </label>
                  <select
                    name='suspensionType'
                    value={formData.suspensionType}
                    onChange={handleInputChange}
                    disabled={isFormDisabled}
                    className='w-full outline-none bg-transparent text-white disabled:text-gray-400 disabled:cursor-not-allowed'
                    required={formData.isSuspended}
                  >
                    <option value='' className='text-black'>
                      Select Reason
                    </option>
                    <option value='Disciplinary' className='text-black'>
                      Disciplinary
                    </option>
                    <option value='Medical' className='text-black'>
                      Medical
                    </option>
                    <option value='administrative' className='text-black'>
                      Administrative
                    </option>
                  </select>
                </div>

                <div className='bg-[#00000030] p-2 rounded'>
                  <label className='block font-medium mb-1'>
                    Suspension Start Date{' '}
                    <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='date'
                    name='suspensionStartDate'
                    value={formData.suspensionStartDate}
                    onChange={handleInputChange}
                    disabled={isFormDisabled}
                    className='w-full outline-none bg-transparent text-white disabled:text-gray-400 disabled:cursor-not-allowed'
                    required={formData.isSuspended}
                  />
                </div>

                <div className='bg-[#00000030] p-2 rounded'>
                  <label className='block font-medium mb-1'>
                    Suspension End Date <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='date'
                    name='suspensionEndDate'
                    value={formData.suspensionEndDate}
                    onChange={handleInputChange}
                    disabled={isFormDisabled}
                    className='w-full outline-none bg-transparent text-white disabled:text-gray-400 disabled:cursor-not-allowed'
                    required={formData.isSuspended}
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
                    placeholder='Enter Reason or note (Optional)'
                    rows='3'
                    disabled={isFormDisabled}
                    className='w-full outline-none bg-transparent text-white resize-none disabled:text-gray-400 disabled:cursor-not-allowed'
                    maxLength={500}
                  />
                  <p className='text-xs text-gray-400 mt-1'>
                    Max 500 characters (Optional)
                  </p>
                </div>

                <div className='md:col-span-3 flex items-center gap-2'>
                  <input
                    type='checkbox'
                    name='medicalClearance'
                    checked={formData.medicalClearance}
                    onChange={handleInputChange}
                    disabled={isFormDisabled}
                    className='rounded text-yellow-400 bg-gray-700 border-gray-600 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed'
                  />
                  <label>Medical Clearance Required</label>
                </div>

                {formData.medicalClearance && (
                  <div className='md:col-span-3 bg-[#00000030] p-2 rounded'>
                    <label className='block font-medium mb-1'>
                      Upload Medical Docs
                    </label>
                    <input
                      type='file'
                      name='medicalDocument'
                      onChange={handleFileChange}
                      accept='.pdf,image/jpeg,image/jpg'
                      disabled={isFormDisabled}
                      className='w-full outline-none bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    />
                    <p className='text-xs text-gray-400 mt-1'>
                      PDF/JPG, Max 5MB
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Actions */}
          <div className='flex justify-center gap-4 mt-6'>
            <button
              type='button'
              className='bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-8 rounded transition duration-300 transform hover:scale-105 disabled:opacity-50'
              onClick={(e) => handleSubmit(e, 'draft')}
              disabled={buttonStates.draft}
            >
              {buttonStates.draft ? 'Saving...' : 'Save as Draft'}
            </button>

            <button
              type='button'
              className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded transition duration-300 transform hover:scale-105 disabled:opacity-50'
              onClick={(e) => handleSubmit(e, 'submit')}
              disabled={buttonStates.submit}
            >
              {buttonStates.submit ? 'Submitting...' : 'Submit Profile'}
            </button>

            {existingTrainerProfile && (
              <button
                type='button'
                className='bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded transition duration-300 transform hover:scale-105 disabled:opacity-50'
                onClick={(e) => handleSubmit(e, 'publish')}
                disabled={buttonStates.publish}
              >
                {buttonStates.publish ? 'Editing...' : 'Edit Profile'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default TrainerProfileForm
