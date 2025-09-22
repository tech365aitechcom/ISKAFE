'use client'
import { enqueueSnackbar } from 'notistack'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import {
  ageCategories,
  API_BASE_URL,
  apiConstants,
  sportTypes,
  weightClasses,
} from '../../../../../constants'
import useStore from '../../../../../stores/useStore'
import { CustomMultiSelect } from '../../../../_components/CustomMultiSelect'
import MarkdownEditor from '../../../../_components/MarkdownEditor'
import Autocomplete from '../../../../_components/Autocomplete'
import { Country } from 'country-state-city'
import { uploadToS3 } from '../../../../../utils/uploadToS3'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Loader from '../../../../_components/Loader'

export const AddEventForm = ({ setShowAddEvent, redirectOrigin = '' }) => {
  const user = useStore((state) => state.user)

  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    format: 'Semi Contact',
    koPolicy: 'Not Allowed',
    sportType: 'Kickboxing',
    poster: null,

    // Dates & Schedule
    startDate: '',
    endDate: '',
    registrationStartDate: '',
    registrationDeadline: '',
    weighInDateTime: '',
    rulesMeetingTime: '',
    spectatorDoorsOpenTime: '',
    fightStartTime: '',

    // Venue
    venue: '',

    // Promoter
    promoter: '',
    iskaRepName: '',
    iskaRepPhone: '',

    // Descriptions
    briefDescription: '',
    fullDescription: '',
    rules: '',
    matchingMethod: 'On-site',
    externalUrl: '',
    ageCategories: [],
    weightClasses: [],

    // Sectioning Body Info
    sectioningBodyName: '',
    sectioningBodyDescription: '',
    sectioningBodyImage: null,

    // Publishing options
    isDraft: true,
    publishBrackets: false,
  })

  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(false)
  const [promoters, setPromoters] = useState([])
  const router = useRouter()

  const [submitting, setSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState({
    registrationDeadline: '',
    registrationStartDate: '',
    endDate: '',
    weighInDateTime: '',
  })

  const getVenues = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${API_BASE_URL}/venues?page=1&limit=200`
      )
      console.log('Response:', response.data)

      setVenues(response.data.data.items)
    } catch (error) {
      console.log('Error fetching venues:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPromoters = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${API_BASE_URL}/promoter?page=1&limit=200`
      )
      console.log('Response:', response.data)

      setPromoters(response.data.data.items)
    } catch (error) {
      console.log('Error fetching promoter:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getVenues()
    getPromoters()
  }, [])

  const validateDates = () => {
    const errors = {}
    let isValid = true

    // Required fields validation
    if (!formData.startDate) {
      errors.startDate = 'Start date is required'
      isValid = false
    }

    if (!formData.endDate) {
      errors.endDate = 'End date is required'
      isValid = false
    }

    if (!formData.registrationStartDate) {
      errors.registrationStartDate = 'Registration start date is required'
      isValid = false
    }

    if (!formData.registrationDeadline) {
      errors.registrationDeadline = 'Registration deadline is required'
      isValid = false
    }

    if (!formData.weighInDateTime) {
      errors.weighInDateTime = 'Weigh-in date and time is required'
      isValid = false
    }

    // Only proceed with comparisons if we have all dates
    if (
      formData.startDate &&
      formData.endDate &&
      formData.registrationStartDate &&
      formData.registrationDeadline &&
      formData.weighInDateTime
    ) {
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      const regStart = new Date(formData.registrationStartDate)
      const regDeadline = new Date(formData.registrationDeadline)
      const weighInDate = new Date(formData.weighInDateTime)

      // 1. Registration start must be before registration deadline
      if (regStart >= regDeadline) {
        errors.registrationStartDate = 'Registration start must be before deadline'
        isValid = false
      }

      // 2. Registration deadline must be before event start
      if (regDeadline >= startDate) {
        errors.registrationDeadline = 'Registration deadline must be before event start'
        isValid = false
      }

      // 3. Registration start must be before event start
      if (regStart >= startDate) {
        errors.registrationStartDate = 'Registration start must be before event start'
        isValid = false
      }

      // 4. End date must be after start date
      if (endDate <= startDate) {
        errors.endDate = 'End date must be after start date'
        isValid = false
      }

      // 5. Weigh-in must be after registration start date
      if (weighInDate <= regStart) {
        errors.weighInDateTime = 'Weigh-in must be after registration start date'
        isValid = false
      }

      // 6. Weigh-in must be before or on event start date
      if (weighInDate > startDate) {
        errors.weighInDateTime = 'Weigh-in must be before or on event start date'
        isValid = false
      }
    }

    return { isValid, errors }
  }

  const handleDateBlur = () => {
    const { isValid, errors } = validateDates()
    setValidationErrors(errors)
  }

  const handleChange = (eOrName, value) => {
    if (typeof eOrName === 'string') {
      const name = eOrName
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    } else if (eOrName?.target) {
      const { name, value, type, checked, files } = eOrName.target

      if (type === 'file') {
        setFormData((prevState) => ({
          ...prevState,
          [name]: files[0],
        }))
      } else if (type === 'checkbox') {
        setFormData((prevState) => ({
          ...prevState,
          [name]: checked,
        }))
      } else if (type === 'select-multiple') {
        const selectedOptions = Array.from(eOrName.target.selectedOptions).map(
          (option) => option.value
        )
        setFormData((prevState) => ({
          ...prevState,
          [name]: selectedOptions,
        }))
      } else {
        setFormData((prevState) => ({
          ...prevState,
          [name]: value,
        }))
        // Clear validation error when user edits the field
        if (validationErrors[name]) {
          setValidationErrors((prev) => ({ ...prev, [name]: '' }))
        }
      }
    }
    // Clear validation error for string parameters as well
    if (typeof eOrName === 'string' && validationErrors[eOrName]) {
      setValidationErrors((prev) => ({ ...prev, [eOrName]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    setSubmitting(true)
    try {
      e.preventDefault()
      console.log('Form submitted:', formData)

      // Validate dates before submission
      const { isValid, errors } = validateDates()
      setValidationErrors(errors)

      if (!isValid) {
        enqueueSnackbar(
          'Please fix date validation errors: ' +
            Object.values(errors).join(', '),
          { variant: 'error' }
        )
        setSubmitting(false)
        return
      }

      if (formData.poster && typeof formData.poster !== 'string') {
        formData.poster = await uploadToS3(formData.poster)
      }
      if (formData.rules && typeof formData.rules !== 'string') {
        formData.rules = await uploadToS3(formData.rules)
      }
      if (
        formData.sectioningBodyImage &&
        typeof formData.sectioningBodyImage !== 'string'
      ) {
        formData.sectioningBodyImage = await uploadToS3(
          formData.sectioningBodyImage
        )
      }

      if (formData.venue) {
        formData.venue = formData.venue?.value ?? ''
      }
      if (formData.promoter) {
        formData.promoter = formData.promoter?.value ?? ''
      }

      console.log('Form submitted:', formData)
      const response = await axios.post(`${API_BASE_URL}/events`, formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })

      if (response.status === apiConstants.create) {
        enqueueSnackbar(response.data.message, {
          variant: 'success',
        })
        // Reset form
        handleCancel()
      }
    } catch (error) {
      const errorMsg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong'

      enqueueSnackbar(errorMsg, { variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (redirectOrigin == 'addEvent' || redirectOrigin == 'addPromoter') {
      router.push('/admin/events')
    } else {
      setShowAddEvent(false)
    }
    setFormData({
      // Basic Info
      name: '',
      format: 'Semi Contact',
      koPolicy: 'Not Allowed',
      sportType: 'Kickboxing',
      poster: null,

      // Dates & Schedule
      startDate: '',
      endDate: '',
      registrationStartDate: '',
      registrationDeadline: '',
      weighInDateTime: '',
      rulesMeetingTime: '',
      spectatorDoorsOpenTime: '',
      fightStartTime: '',

      // Venue
      venue: '',

      // Promoter
      promoter: '',
      iskaRepName: '',
      iskaRepPhone: '',

      // Descriptions
      briefDescription: '',
      fullDescription: '',
      rules: '',
      matchingMethod: 'On-site',
      externalUrl: '',
      ageCategories: [],
      weightClasses: [],

      // Publishing options
      isDraft: true,
      publishBrackets: false,
    })
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader />
      </div>
    )
  }

  return (
    <div className='min-h-screen text-white bg-dark-blue-900'>
      <div className='w-full'>
        {/* Header with back button */}
        <div className='flex items-center gap-4 mb-6'>
          <button className='mr-2 text-white' onClick={handleCancel}>
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
                d='M10 19l-7-7m0 0l7-7m-7 7h18'
              />
            </svg>
          </button>
          <h1 className='text-2xl font-bold'>Add New Event</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* VENUE SECTION */}
          <h2 className='font-bold mb-4 uppercase text-sm border-b border-gray-700 pb-2 mt-8'>
            Venue <span className='text-red-500'>*</span>
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            {/* Venue Search/Select */}

            <Autocomplete
              label={'Search or Select venue'}
              options={venues.map((venue) => ({
                label: `${venue.name} (${venue.address.street1}, ${
                  venue.address.city
                }, ${
                  Country.getCountryByCode(venue.address.country).name || ''
                })`,
                value: venue._id,
              }))}
              selected={
                typeof formData.venue === 'string'
                  ? venues
                      .map((venue) => ({
                        label: `${venue.name} (${venue.address.street1}, ${
                          venue.address.city
                        }, ${
                          Country.getCountryByCode(venue.address.country)
                            .name || ''
                        })`,
                        value: venue._id,
                      }))
                      .find((v) => v.value === formData.venue)
                  : formData.venue
              }
              onChange={(value) => handleChange('venue', value)}
              placeholder='Search venue name'
              required={true}
            />

            {/* Add New Venue */}
            <button
              type='button'
              className='px-4 py-2 rounded-md font-medium transition-colors duration-200 bg-gray-200 text-gray-800 hover:bg-gray-300 w-fit h-fit'
              onClick={() =>
                router.push('/admin/venues?redirectOrigin=addEvent')
              }
            >
              Add New Venue
            </button>
          </div>

          {/* PROMOTER INFO SECTION */}
          <h2 className='font-bold mb-4 uppercase text-sm border-b border-gray-700 pb-2 mt-8'>
            Promoter Info <span className='text-red-500'>*</span>
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            {/* Promoter */}
            <Autocomplete
              label={'Search or Select promoter'}
              options={promoters.map((promoter) => ({
                label: `${promoter.user?.firstName || ''} ${
                  promoter.user?.middleName || ''
                } ${promoter.user?.lastName || ''} (${
                  promoter.user?.email || ''
                })`,
                value: promoter._id,
              }))}
              selected={
                typeof formData.promoter === 'string'
                  ? promoters
                      .map((promoter) => ({
                        label: `${promoter.user?.firstName || ''} ${
                          promoter.user?.middleName || ''
                        } ${promoter.user?.lastName || ''} (${
                          promoter.user?.email || ''
                        })`,
                        value: promoter._id,
                      }))
                      .find((p) => p.value === formData.promoter)
                  : formData.promoter
              }
              onChange={(value) => handleChange('promoter', value)}
              placeholder='Search promoter name'
              required={true}
            />

            {/* Add New promoter */}
            <button
              type='button'
              className='px-4 py-2 rounded-md font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 w-fit h-fit'
              onClick={() =>
                router.push('/admin/promoter?redirectOrigin=addEvent')
              }
            >
              Add New Promoter
            </button>
          </div>

          {!formData.venue || !formData.promoter ? (
            <p className='text-red-500 text-sm'>
              Please select venue and promoter to proceed with the event
              creation.
            </p>
          ) : null}

          {/* BASIC INFO SECTION */}
          <h2 className='font-bold my-4 uppercase text-sm border-b border-gray-700 pb-2'>
            Basic Info
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            {/* Event Name Field */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Name<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleChange}
                className='w-full outline-none bg-transparent  disabled:cursor-not-allowed'
                required
                placeholder='Enter Event Title'
                disabled={!formData.venue || !formData.promoter || submitting}
              />
            </div>

            {/* Event Format */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Format<span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <select
                  name='format'
                  value={formData.format}
                  onChange={handleChange}
                  className='w-full outline-none appearance-none bg-transparent disabled:cursor-not-allowed'
                  required
                  disabled={!formData.venue || !formData.promoter || submitting}
                >
                  <option value='Semi Contact' className='text-black'>
                    Semi Contact
                  </option>
                  <option value='Full Contact' className='text-black'>
                    Full Contact
                  </option>
                  <option value='Point Sparring' className='text-black'>
                    Point Sparring
                  </option>
                </select>
                <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white'>
                  <svg
                    className='fill-current h-4 w-4'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                  >
                    <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
                  </svg>
                </div>
              </div>
            </div>

            {/* KO Policy */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                KO Policy<span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <select
                  name='koPolicy'
                  value={formData.koPolicy}
                  onChange={handleChange}
                  className='w-full outline-none appearance-none bg-transparent disabled:cursor-not-allowed '
                  required
                  disabled={!formData.venue || !formData.promoter || submitting}
                >
                  <option value='Not Allowed' className='text-black'>
                    Not Allowed
                  </option>
                  <option value='Allowed' className='text-black'>
                    Allowed
                  </option>
                </select>
                <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white'>
                  <svg
                    className='fill-current h-4 w-4'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                  >
                    <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sport Type */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Sport Type<span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <select
                  name='sportType'
                  value={formData.sportType}
                  onChange={handleChange}
                  className='w-full outline-none appearance-none bg-transparent disabled:cursor-not-allowed'
                  required
                  disabled={!formData.venue || !formData.promoter || submitting}
                >
                  {sportTypes.map((level) => (
                    <option key={level} value={level} className='text-black'>
                      {level}
                    </option>
                  ))}
                </select>
                <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white'>
                  <svg
                    className='fill-current h-4 w-4'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                  >
                    <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
                  </svg>
                </div>
              </div>
            </div>

            {/* Event Poster */}
            <div className='bg-[#00000061] p-2 rounded col-span-2'>
              <label className='block text-sm font-medium mb-1'>Poster</label>

              {/* Custom file upload button */}
              <div className='relative inline-block'>
                <label
                  htmlFor='posterUpload'
                  className={`cursor-pointer inline-block file-btn py-2 px-4 rounded-full text-sm font-semibold ${
                    !formData.venue || !formData.promoter || submitting
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  Choose Poster
                </label>
                <input
                  id='posterUpload'
                  type='file'
                  name='poster'
                  onChange={handleChange}
                  accept='image/jpeg,image/png'
                  disabled={!formData.venue || !formData.promoter || submitting}
                  className='absolute inset-0 opacity-0 w-full h-full cursor-pointer'
                />
              </div>

              <p className='text-xs text-gray-400 mt-1'>
                JPG, PNG formats only
              </p>
            </div>
          </div>

          {/* DATES & SCHEDULE SECTION */}
          <h2 className='font-bold mb-4 uppercase text-sm border-b border-gray-700 pb-2 mt-8'>
            Dates & Schedule
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            {/* Event Start Date */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Event Start Date<span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                name='startDate'
                value={formData.startDate}
                onChange={handleChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                required
                disabled={!formData.venue || !formData.promoter || submitting}
              />
            </div>

            {/* Event End Date */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Event End Date
              </label>
              <input
                type='date'
                name='endDate'
                value={formData.endDate}
                onChange={handleChange}
                onBlur={handleDateBlur}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                disabled={!formData.venue || !formData.promoter || submitting}
              />
              {validationErrors.endDate && (
                <p className='text-red-500 text-xs mt-1'>
                  {validationErrors.endDate}
                </p>
              )}
            </div>

            {/* Registration Start Date */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Registration Start Date<span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                name='registrationStartDate'
                value={formData.registrationStartDate}
                onChange={handleChange}
                onBlur={handleDateBlur}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                required
                disabled={!formData.venue || !formData.promoter || submitting}
              />
              {validationErrors.registrationStartDate && (
                <p className='text-red-500 text-xs mt-1'>
                  {validationErrors.registrationStartDate}
                </p>
              )}
            </div>

            {/* Registration Deadline */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Registration Deadline<span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                name='registrationDeadline'
                value={formData.registrationDeadline}
                onChange={handleChange}
                onBlur={handleDateBlur}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                required
                disabled={!formData.venue || !formData.promoter || submitting}
              />
              {validationErrors.registrationDeadline && (
                <p className='text-red-500 text-xs mt-1'>
                  {validationErrors.registrationDeadline}
                </p>
              )}
            </div>

            {/* Weigh-in Date & Time */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Weigh-in Date & Time<span className='text-red-500'>*</span>
              </label>
              <input
                type='datetime-local'
                name='weighInDateTime'
                value={formData.weighInDateTime}
                onChange={handleChange}
                onBlur={handleDateBlur}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                required
                disabled={!formData.venue || !formData.promoter || submitting}
              />
              {validationErrors.weighInDateTime && (
                <p className='text-red-500 text-xs mt-1'>
                  {validationErrors.weighInDateTime}
                </p>
              )}
            </div>

            {/* Rules Meeting Time */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Rules Meeting Time
              </label>
              <input
                type='time'
                name='rulesMeetingTime'
                value={formData.rulesMeetingTime}
                onChange={handleChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                disabled={!formData.venue || !formData.promoter || submitting}
              />
            </div>

            {/* Spectator Doors Open Time */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Spectator Doors Open Time
              </label>
              <input
                type='time'
                name='spectatorDoorsOpenTime'
                value={formData.spectatorDoorsOpenTime}
                onChange={handleChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                disabled={!formData.venue || !formData.promoter || submitting}
              />
            </div>

            {/* Fight Start Time */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Fight Start Time<span className='text-red-500'>*</span>
              </label>
              <input
                type='time'
                name='fightStartTime'
                value={formData.fightStartTime}
                onChange={handleChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                required
                disabled={!formData.venue || !formData.promoter || submitting}
              />
            </div>
          </div>

          <h2 className='font-bold mb-4 uppercase text-sm border-b border-gray-700 pb-2 mt-8'>
            Iska Representative Info
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* ISKA Rep Name */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                ISKA Rep Name
              </label>
              <input
                type='text'
                name='iskaRepName'
                value={formData.iskaRepName}
                onChange={handleChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Enter ISKA rep name'
                disabled={!formData.venue || !formData.promoter || submitting}
              />
            </div>

            {/* ISKA Rep Phone */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                ISKA Rep Phone
              </label>
              <input
                type='tel'
                name='iskaRepPhone'
                value={formData.iskaRepPhone}
                onChange={handleChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Enter phone number'
                disabled={!formData.venue || !formData.promoter || submitting}
              />
            </div>
          </div>

          {/* DESCRIPTIONS SECTION */}
          <h2 className='font-bold mb-4 uppercase text-sm border-b border-gray-700 pb-2 mt-8'>
            Descriptions
          </h2>

          <div className='grid grid-cols-1 gap-4 mb-6'>
            {/* Brief Description */}
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Brief Description<span className='text-red-500'>*</span>
              </label>
              <textarea
                name='briefDescription'
                value={formData.briefDescription}
                onChange={handleChange}
                rows='3'
                className='w-full outline-none resize-none bg-transparent disabled:cursor-not-allowed'
                maxLength='255'
                required
                placeholder='Short summary'
                disabled={!formData.venue || !formData.promoter || submitting}
              />
              <p className='text-xs text-gray-400 mt-1'>Max 255 characters</p>
            </div>

            {/* Full Description */}
            <MarkdownEditor
              label={'Full Description'}
              value={formData.fullDescription}
              onChange={(text) =>
                setFormData((prev) => ({
                  ...prev,
                  fullDescription: text,
                }))
              }
              disabled={!formData.venue || !formData.promoter || submitting}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
            {/* Rules Info URL */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Upload Rules Info File
              </label>

              <div className='relative inline-block'>
                <label
                  htmlFor='rulesFile'
                  className={`cursor-pointer inline-block py-1 px-4 rounded-full text-sm font-semibold ${
                    !formData.venue || !formData.promoter || submitting
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  Choose File
                </label>
                <input
                  id='rulesFile'
                  type='file'
                  name='rules'
                  accept='application/pdf'
                  onChange={handleChange}
                  disabled={!formData.venue || !formData.promoter || submitting}
                  className='absolute inset-0 opacity-0 w-full h-full cursor-pointer'
                />
              </div>
            </div>

            {/* Matching Method */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Matching Method<span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <select
                  name='matchingMethod'
                  value={formData.matchingMethod}
                  onChange={handleChange}
                  className='w-full outline-none appearance-none bg-transparent disabled:cursor-not-allowed'
                  required
                  disabled={!formData.venue || !formData.promoter || submitting}
                >
                  <option value='On-site' className='text-black'>
                    On-site
                  </option>
                  <option value='Pre-Matched' className='text-black'>
                    Pre-Matched
                  </option>
                  <option value='Final' className='text-black'>
                    Final
                  </option>
                </select>
                <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white'>
                  <svg
                    className='fill-current h-4 w-4'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                  >
                    <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
                  </svg>
                </div>
              </div>
            </div>

            {/* External URL */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>URL</label>
              <input
                type='url'
                name='externalUrl'
                value={formData.externalUrl}
                onChange={handleChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='https://'
                disabled={!formData.venue || !formData.promoter || submitting}
              />
            </div>

            {/* Age Categories */}
            <div className='bg-[#00000061] py-1 px-2 rounded '>
              <label className='block text-sm font-medium mb-2'>
                Age Categories
              </label>
              <CustomMultiSelect
                label='Select Age Categories'
                options={ageCategories}
                value={formData.ageCategories}
                onChange={(selectedIds) => {
                  setFormData((prev) => ({
                    ...prev,
                    ageCategories: selectedIds,
                  }))
                }}
                disabled={!formData.venue || !formData.promoter || submitting}
              />
            </div>

            {/* Weight Classes */}
            <div className='bg-[#00000061] py-1 px-2 rounded'>
              <label className='block text-sm font-medium mb-2'>
                Weight Classes
              </label>
              <CustomMultiSelect
                label='Select Weight Classes'
                options={weightClasses}
                value={formData.weightClasses}
                onChange={(selectedIds) => {
                  setFormData((prev) => ({
                    ...prev,
                    weightClasses: selectedIds,
                  }))
                }}
                disabled={!formData.venue || !formData.promoter || submitting}
              />
            </div>
          </div>

          {/* Sectioning SECTION */}
          <h2 className='font-bold mb-4 uppercase text-sm border-b border-gray-700 pb-2 mt-8'>
            Sectioning Body Info
          </h2>

          <div className='my-4 grid grid-cols-1  gap-4'>
            {/* Name*/}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Sanctioning Body
                <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='sectioningBodyName'
                value={formData.sectioningBodyName}
                onChange={handleChange}
                required
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Enter Sectioning Body Name'
                disabled={!formData.venue || !formData.promoter || submitting}
              />
            </div>
            {/* Image */}
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Sectioning body image <span className='text-red-500'>*</span>
              </label>

              <div className='relative inline-block'>
                <label
                  htmlFor='sectioningBodyImage'
                  className={`cursor-pointer inline-block py-2 px-4 rounded-full text-sm font-semibold ${
                    !formData.venue || !formData.promoter || submitting
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : formData.sectioningBodyImage
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {formData.sectioningBodyImage ? 'Change Image' : 'Choose Image'}
                </label>
                <input
                  id='sectioningBodyImage'
                  type='file'
                  name='sectioningBodyImage'
                  required
                  onChange={handleChange}
                  accept='image/jpeg,image/png'
                  disabled={!formData.venue || !formData.promoter || submitting}
                  className='absolute inset-0 opacity-0 w-full h-full cursor-pointer'
                />
              </div>

              {formData.sectioningBodyImage ? (
                <p className='text-xs text-green-400 mt-1'>
                  ✓ Selected: {formData.sectioningBodyImage.name || 'Image selected'}
                </p>
              ) : (
                <p className='text-xs text-gray-400 mt-1'>Upload Logo/Image</p>
              )}
            </div>

            {/* description */}
            <div className='bg-[#00000061] p-2 rounded '>
              <label className='block text-sm font-medium mb-1'>
                Sectioning Body Description
                <span className='text-red-500'>*</span>
              </label>
              <textarea
                name='sectioningBodyDescription'
                value={formData.sectioningBodyDescription}
                onChange={handleChange}
                rows='3'
                className='w-full outline-none resize-none bg-transparent disabled:cursor-not-allowed'
                maxLength='255'
                required
                placeholder='Enter content...'
                disabled={!formData.venue || !formData.promoter || submitting}
              />
              <p className='text-xs text-gray-400 mt-1'>Max 255 characters</p>
            </div>
          </div>
          <div className=' space-y-2'>
            <div className='flex items-center'>
              <label className='inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  name='isDraft'
                  checked={formData.isDraft}
                  onChange={handleChange}
                  className='form-checkbox h-5 w-5'
                  disabled={!formData.venue || !formData.promoter || submitting}
                />
                <span className='ml-2'>Is Draft</span>
              </label>
            </div>

            <div className='flex items-center'>
              <label className='inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  name='publishBrackets'
                  checked={formData.publishBrackets}
                  onChange={handleChange}
                  className='form-checkbox h-5 w-5'
                  disabled={!formData.venue || !formData.promoter || submitting}
                />
                <span className='ml-2'>Publish Brackets</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-center gap-4 mt-12'>
            <button
              type='button'
              className='text-white font-medium py-2 px-6 rounded transition duration-200 bg-gray-600'
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='text-white font-medium py-2 px-6 rounded transition duration-200'
              style={{
                background:
                  'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
