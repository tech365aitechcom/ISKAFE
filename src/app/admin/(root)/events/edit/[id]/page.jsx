'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Edit, Pencil, Save, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  API_BASE_URL,
  sportTypes,
  ageCategories,
  weightClasses,
} from '../../../../../../constants'
import Loader from '../../../../../_components/Loader'
import Image from 'next/image'
import { enqueueSnackbar } from 'notistack'
import useStore from '../../../../../../stores/useStore'
import { uploadToS3 } from '../../../../../../utils/uploadToS3'
import Autocomplete from '../../../../../_components/Autocomplete'
import { Country } from 'country-state-city'
import axios from 'axios'
import { CustomMultiSelect } from '../../../../../_components/CustomMultiSelect'
import MarkdownEditor from '../../../../../_components/MarkdownEditor'

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const user = useStore((state) => state.user)
  const [eventId, setEventId] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [validationErrors, setValidationErrors] = useState({
    registrationDeadline: '',
    registrationStartDate: '',
    endDate: '',
  })
  const [selectedFiles, setSelectedFiles] = useState({
    poster: null,
    sectioningBodyImage: null,
    licenseCertificate: null,
    rules: null,
  })
  const [venues, setVenues] = useState([])
  const [promoters, setPromoters] = useState([])
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [selectedPromoter, setSelectedPromoter] = useState(null)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    if (params?.id) {
      setEventId(params.id)
      fetchEventData(params.id)
    }
  }, [params])

  useEffect(() => {
    getVenues()
    getPromoters()
  }, [])

  const getVenues = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/venues?page=1&limit=200`
      )
      console.log('Venues Response:', response.data)
      setVenues(response.data.data.items)
    } catch (error) {
      console.log('Error fetching venues:', error)
    }
  }

  const getPromoters = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/promoter?page=1&limit=200`
      )
      console.log('Promoters Response:', response.data)
      setPromoters(response.data.data.items)
    } catch (error) {
      console.log('Error fetching promoters:', error)
    }
  }

  const fetchEventData = async (id) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/events/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch event data')
      }
      const data = await response.json()
      if (data.success) {
        setEvent(data.data)

        // Set selected venue and promoter after event data is loaded
        if (data.data.venue) {
          const venueId = data.data.venue._id || data.data.venue
          setSelectedVenue({
            value: venueId,
            label: data.data.venue.name || venueId,
          })
        }
        if (data.data.promoter) {
          const promoterId = data.data.promoter._id || data.data.promoter
          const promoterName = data.data.promoter.userId
            ? `${data.data.promoter.userId.firstName || ''} ${
                data.data.promoter.userId.lastName || ''
              }`.trim()
            : promoterId
          setSelectedPromoter({ value: promoterId, label: promoterName })
        }
      } else {
        throw new Error(data.message || 'Error fetching event')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEvent((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear validation error when user edits the field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleVenueChange = (e) => {
    const { name, value } = e.target
    setEvent((prev) => ({
      ...prev,
      venue: {
        ...prev.venue,
        [name]: value,
      },
    }))
  }

  const handleAddressChange = (e) => {
    const { name, value } = e.target
    setEvent((prev) => ({
      ...prev,
      venue: {
        ...prev.venue,
        address: {
          ...prev.venue?.address,
          [name]: value,
        },
      },
    }))
  }

  const handlePromoterChange = (e) => {
    const { name, value } = e.target
    setEvent((prev) => ({
      ...prev,
      promoter: {
        ...prev.promoter,
        [name]: value,
      },
    }))
  }

  const handleUserIdChange = (e) => {
    const { name, value } = e.target
    setEvent((prev) => ({
      ...prev,
      promoter: {
        ...prev.promoter,
        userId: {
          ...prev.promoter?.userId,
          [name]: value,
        },
      },
    }))
  }

  const handleSanctioningChange = (e) => {
    const { name, value } = e.target
    setEvent((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  const normalizeDate = (dateString) => {
    const date = new Date(dateString)
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  }
  const validateDates = () => {
    const errors = {}
    let isValid = true

    // Required fields validation
    if (!event.startDate) {
      errors.startDate = 'Start date is required'
      isValid = false
    }

    if (!event.endDate) {
      errors.endDate = 'End date is required'
      isValid = false
    }

    if (!event.registrationStartDate) {
      errors.registrationStartDate = 'Registration start date is required'
      isValid = false
    }

    if (!event.registrationDeadline) {
      errors.registrationDeadline = 'Registration deadline is required'
      isValid = false
    }

    // Only proceed with comparisons if we have all dates
    if (
      event.startDate &&
      event.endDate &&
      event.registrationStartDate &&
      event.registrationDeadline
    ) {
      const startDate = new Date(event.startDate)
      const endDate = new Date(event.endDate)
      const regStart = new Date(event.registrationStartDate)
      const regDeadline = new Date(event.registrationDeadline)

      console.log(
        'Date validation - Start:',
        startDate,
        'End:',
        endDate,
        'RegStart:',
        regStart,
        'RegDeadline:',
        regDeadline
      )

      // Backend validation rules:
      // 1. Registration start must be before registration deadline
      if (regStart >= regDeadline) {
        errors.registrationStartDate =
          'Registration start must be before deadline'
        isValid = false
      }

      // 2. Registration deadline must be before event start
      if (regDeadline >= startDate) {
        errors.registrationDeadline =
          'Registration deadline must be before event start'
        isValid = false
      }

      // 3. Registration start must be before event start
      if (regStart >= startDate) {
        errors.registrationStartDate =
          'Registration start must be before event start'
        isValid = false
      }

      // 4. End date must be after start date
      if (endDate <= startDate) {
        errors.endDate = 'End date must be after start date'
        isValid = false
      }
    }

    console.log('Date validation result:', { isValid, errors })
    return { isValid, errors }
  }

  const handleDateBlur = (e) => {
    const { isValid, errors } = validateDates()
    setValidationErrors(errors)
  }

  const validateEvent = () => {
    console.log('Validating event with current dates:')
    console.log('- Start Date:', event.startDate)
    console.log('- End Date:', event.endDate)
    console.log('- Registration Start:', event.registrationStartDate)
    console.log('- Registration Deadline:', event.registrationDeadline)

    const { isValid, errors } = validateDates()
    setValidationErrors(errors)

    if (!isValid) {
      console.log('Frontend validation failed:', errors)
      enqueueSnackbar(
        'Please fix date validation errors: ' +
          Object.values(errors).join(', '),
        { variant: 'error' }
      )
      return false
    }

    // Check required fields
    const validationErrors = []

    if (!event.name?.trim()) {
      validationErrors.push('Event name is required')
    }

    if (!event.format?.trim()) {
      validationErrors.push('Event format is required')
    }

    if (!event.koPolicy?.trim()) {
      validationErrors.push('KO Policy is required')
    }

    if (!event.sportType?.trim()) {
      validationErrors.push('Sport Type is required')
    }

    if (!event.matchingMethod?.trim()) {
      validationErrors.push('Matching Method is required')
    }

    if (!event.briefDescription?.trim()) {
      validationErrors.push('Brief description is required')
    }

    if (!event.sectioningBodyName?.trim()) {
      validationErrors.push('Sanctioning Body Name is required')
    }

    if (!event.weighInDateTime) {
      validationErrors.push('Weigh-in date and time is required')
    }

    if (!event.fightStartTime?.trim()) {
      validationErrors.push('Fight start time is required')
    }

    if (!selectedVenue) {
      validationErrors.push('Venue selection is required')
    }

    if (!selectedPromoter) {
      validationErrors.push('Promoter selection is required')
    }

    if (validationErrors.length > 0) {
      enqueueSnackbar(
        'Please fix the following errors: ' + validationErrors.join(', '),
        { variant: 'error' }
      )
      return false
    }

    console.log('Frontend validation passed')
    return true
  }

  const normalizeDateForServer = (date) =>
    new Date(
      new Date(date).getTime() - new Date(date).getTimezoneOffset() * 60000
    ).toISOString()

  const normalizeEventDates = (event) => ({
    ...event,
    startDate: normalizeDateForServer(event.startDate),
    endDate: normalizeDateForServer(event.endDate),
    registrationStartDate: normalizeDateForServer(event.registrationStartDate),
    registrationDeadline: normalizeDateForServer(event.registrationDeadline),
    weighInDateTime: normalizeDateForServer(event.weighInDateTime),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('Form submitted, starting validation...')

    const normalizeDateForServer = (date) => {
      if (!date) return null
      // Simply convert to ISO string without complex timezone manipulation
      return new Date(date).toISOString()
    }

    console.log('Validating event...')
    if (!validateEvent()) {
      console.log('Validation failed, returning early')
      return
    }

    console.log('Validation passed, setting isEditing to true')
    setIsEditing(true)
    try {
      // Handle image uploads first
      let updatedEvent = { ...event }

      if (selectedFiles.poster) {
        console.log('Uploading poster...')
        updatedEvent.poster = await uploadToS3(selectedFiles.poster)
      }

      if (selectedFiles.sectioningBodyImage) {
        console.log('Uploading sectioning body image...')
        updatedEvent.sectioningBodyImage = await uploadToS3(
          selectedFiles.sectioningBodyImage
        )
      }

      if (selectedFiles.licenseCertificate) {
        console.log('Uploading license certificate...')
        if (!updatedEvent.promoter) updatedEvent.promoter = {}
        updatedEvent.promoter.licenseCertificate = await uploadToS3(
          selectedFiles.licenseCertificate
        )
      }

      if (selectedFiles.rules) {
        console.log('Uploading rules file...')
        updatedEvent.rules = await uploadToS3(selectedFiles.rules)
      }
      // Create a normalized event with all necessary fields
      const normalizedEvent = {
        // Basic fields
        name: updatedEvent.name,
        format: updatedEvent.format,
        koPolicy: updatedEvent.koPolicy,
        sportType: updatedEvent.sportType,
        poster: updatedEvent.poster,

        // Dates
        startDate: normalizeDateForServer(updatedEvent.startDate),
        endDate: normalizeDateForServer(updatedEvent.endDate),
        registrationStartDate: normalizeDateForServer(
          updatedEvent.registrationStartDate
        ),
        registrationDeadline: normalizeDateForServer(
          updatedEvent.registrationDeadline
        ),
        weighInDateTime: normalizeDateForServer(updatedEvent.weighInDateTime),

        // Times (as strings)
        rulesMeetingTime: updatedEvent.rulesMeetingTime || '',
        spectatorDoorsOpenTime: updatedEvent.spectatorDoorsOpenTime || '',
        fightStartTime: updatedEvent.fightStartTime,

        // References (send only the IDs)
        venue:
          selectedVenue?.value || updatedEvent.venue?._id || updatedEvent.venue,
        promoter:
          selectedPromoter?.value ||
          updatedEvent.promoter?._id ||
          updatedEvent.promoter,

        // Contact info
        iskaRepName: updatedEvent.iskaRepName || '',
        iskaRepPhone: updatedEvent.iskaRepPhone || '',

        // Descriptions
        briefDescription: updatedEvent.briefDescription,
        fullDescription: updatedEvent.fullDescription || '',
        rules: updatedEvent.rules || '',

        // Other fields
        matchingMethod: updatedEvent.matchingMethod,
        externalUrl: updatedEvent.externalUrl || '',
        ageCategories: updatedEvent.ageCategories || [],
        weightClasses: updatedEvent.weightClasses || [],

        // Sectioning body
        sectioningBodyName: updatedEvent.sectioningBodyName,
        sectioningBodyDescription: updatedEvent.sectioningBodyDescription || '',
        sectioningBodyImage: updatedEvent.sectioningBodyImage || '',

        // Publishing options
        isDraft: updatedEvent.isDraft,
        publishBrackets: updatedEvent.publishBrackets,
      }

      console.log('Checking required fields:')
      console.log('- weighInDateTime:', normalizedEvent.weighInDateTime)
      console.log('- venue (ID):', normalizedEvent.venue)
      console.log('- promoter (ID):', normalizedEvent.promoter)
      console.log('- briefDescription:', normalizedEvent.briefDescription)
      console.log('- sectioningBodyName:', normalizedEvent.sectioningBodyName)

      console.log('Making API call to:', `${API_BASE_URL}/events/${eventId}`)
      console.log('Current user:', user)
      console.log('Event creator:', event?.createdBy)
      console.log('Normalized dates being sent:')
      console.log('- Start Date:', normalizedEvent.startDate)
      console.log('- End Date:', normalizedEvent.endDate)
      console.log(
        '- Registration Start:',
        normalizedEvent.registrationStartDate
      )
      console.log(
        '- Registration Deadline:',
        normalizedEvent.registrationDeadline
      )
      console.log('Full Payload:', normalizedEvent)

      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(normalizedEvent),
      })

      const data = await response.json()
      console.log('Server response:', data)

      if (!response.ok) {
        console.log('Server error response:', response.status, data)
        // Handle validation errors specifically
        if (response.status === 400 && data.error) {
          throw new Error(data.error)
        }
        // Handle 500 errors with more detail
        if (response.status === 500) {
          throw new Error(
            data.error || data.message || 'Internal server error occurred'
          )
        }
        throw new Error(data.message || 'Failed to update event')
      }

      if (data.success) {
        enqueueSnackbar('Event updated successfully', { variant: 'success' })
        // Update local event state with new data
        setEvent(data.data || updatedEvent)
        // Clear selected files
        setSelectedFiles({
          poster: null,
          sectioningBodyImage: null,
          licenseCertificate: null,
          rules: null,
        })
        // Optionally redirect back to events list
        // router.push("/admin/events");
      } else {
        throw new Error(data.message || 'Failed to update event')
      }
    } catch (error) {
      console.error('Error updating event:', error)
      enqueueSnackbar(error.message || 'Failed to update event', {
        variant: 'error',
      })
    } finally {
      setIsEditing(false)
    }
  }

  const handleImageSelect = (e, fieldName) => {
    const file = e.target.files[0]
    if (!file) return

    // Update selected files state
    setSelectedFiles((prev) => ({ ...prev, [fieldName]: file }))

    enqueueSnackbar(
      `${fieldName} selected. It will be uploaded when you save the event.`,
      { variant: 'info' }
    )
  }

  const removeImage = (fieldName) => {
    if (fieldName === 'poster') {
      setEvent((prev) => ({ ...prev, poster: '' }))
      setSelectedFiles((prev) => ({ ...prev, poster: null }))
    } else if (fieldName === 'sectioningBodyImage') {
      setEvent((prev) => ({ ...prev, sectioningBodyImage: '' }))
      setSelectedFiles((prev) => ({ ...prev, sectioningBodyImage: null }))
    } else if (fieldName === 'licenseCertificate') {
      setEvent((prev) => ({
        ...prev,
        promoter: {
          ...prev.promoter,
          licenseCertificate: '',
        },
      }))
      setSelectedFiles((prev) => ({ ...prev, licenseCertificate: null }))
    } else if (fieldName === 'rules') {
      setEvent((prev) => ({ ...prev, rules: '' }))
      setSelectedFiles((prev) => ({ ...prev, rules: null }))
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen w-full bg-[#07091D]'>
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className='text-white p-8 flex justify-center'>
        <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full'>
          <p className='text-red-500'>Error: {error}</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className='text-white p-8 flex justify-center'>
        <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full'>
          <p>Event not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className='text-white p-8 flex justify-center relative overflow-hidden'>
      <div
        className='absolute -left-10 top-1/2 transform -translate-y-1/2 w-60 h-96 rounded-full opacity-70 blur-xl'
        style={{
          background:
            'linear-gradient(317.9deg, #6F113E 13.43%, rgba(111, 17, 62, 0) 93.61%)',
        }}
      ></div>
      <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
        {/* Header with back button */}
        <div className='flex items-center gap-4 mb-6'>
          <Link href={`/admin/events/`}>
            <button className='mr-2 text-white'>
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
          </Link>
          <h1 className='text-2xl font-bold'>Edit Event: {event.name}</h1>
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
                  Country.getCountryByCode(venue.address.country)?.name || ''
                })`,
                value: venue._id,
              }))}
              selected={selectedVenue}
              onChange={(value) => setSelectedVenue(value)}
              placeholder='Search venue name'
              required={true}
            />

            {/* Add New Venue */}
            <button
              type='button'
              className='px-4 py-2 rounded-md font-medium transition-colors duration-200 bg-gray-200 text-gray-800 hover:bg-gray-300 w-fit h-fit'
              onClick={() =>
                router.push('/admin/venues?redirectOrigin=editEvent')
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
                label: `${promoter.userId?.firstName || ''} ${
                  promoter.userId?.middleName || ''
                } ${promoter.userId?.lastName || ''} (${
                  promoter.userId?.email || ''
                })`,
                value: promoter._id,
              }))}
              selected={selectedPromoter}
              onChange={(value) => setSelectedPromoter(value)}
              placeholder='Search promoter name'
              required={true}
            />

            {/* Add New promoter */}
            <button
              type='button'
              className='px-4 py-2 rounded-md font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 w-fit h-fit'
              onClick={() =>
                router.push('/admin/promoter?redirectOrigin=editEvent')
              }
            >
              Add New Promoter
            </button>
          </div>

          {(!selectedVenue || !selectedPromoter) && (
            <p className='text-red-500 text-sm'>
              Please select venue and promoter to proceed with the event
              editing.
            </p>
          )}

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
                value={event.name || ''}
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                required
                placeholder='Enter Event Title'
                disabled={!selectedVenue || !selectedPromoter}
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
                  value={event.format || ''}
                  onChange={handleInputChange}
                  className='w-full outline-none appearance-none bg-transparent disabled:cursor-not-allowed'
                  required
                  disabled={!selectedVenue || !selectedPromoter}
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
                  value={event.koPolicy || ''}
                  onChange={handleInputChange}
                  className='w-full outline-none appearance-none bg-transparent disabled:cursor-not-allowed'
                  required
                  disabled={!selectedVenue || !selectedPromoter}
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
                  value={event.sportType || ''}
                  onChange={handleInputChange}
                  className='w-full outline-none appearance-none bg-transparent disabled:cursor-not-allowed'
                  required
                  disabled={!selectedVenue || !selectedPromoter}
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
                    !selectedVenue || !selectedPromoter
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
                  onChange={(e) => handleImageSelect(e, 'poster')}
                  accept='image/jpeg,image/png'
                  disabled={!selectedVenue || !selectedPromoter}
                  className='absolute inset-0 opacity-0 w-full h-full cursor-pointer'
                />
              </div>

              <p className='text-xs text-gray-400 mt-1'>
                JPG, PNG formats only
              </p>

              {selectedFiles.poster ? (
                <div className='flex items-center justify-center h-64 bg-[#0A1330] rounded-lg border-2 border-dashed border-yellow-400 mt-2'>
                  <div className='text-center'>
                    <p className='text-yellow-400 font-medium'>
                      New image selected: {selectedFiles.poster.name}
                    </p>
                    <p className='text-gray-400 text-sm mt-1'>
                      This image will be uploaded when you save the event
                    </p>
                  </div>
                </div>
              ) : event.poster ? (
                <div className='relative w-full max-w-md h-64 mt-2'>
                  <Image
                    src={event.poster}
                    alt='Event poster'
                    fill
                    className='object-contain rounded-lg'
                  />
                  <button
                    type='button'
                    onClick={() => removeImage('poster')}
                    className='absolute top-2 right-2 flex items-center gap-2 px-2 py-1 bg-red-600 hover:bg-red-700 rounded transition-colors text-sm'
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className='flex items-center justify-center h-64 bg-[#0A1330] rounded-lg text-gray-400 mt-2'>
                  No poster uploaded
                </div>
              )}
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
                value={
                  event.startDate
                    ? new Date(event.startDate).toISOString().split('T')[0]
                    : ''
                }
                onChange={handleInputChange}
                onBlur={handleDateBlur}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                required
                disabled={!selectedVenue || !selectedPromoter}
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
                value={
                  event.endDate
                    ? new Date(event.endDate).toISOString().split('T')[0]
                    : ''
                }
                onChange={handleInputChange}
                onBlur={handleDateBlur}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                disabled={!selectedVenue || !selectedPromoter}
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
                value={
                  event.registrationStartDate
                    ? new Date(event.registrationStartDate)
                        .toISOString()
                        .split('T')[0]
                    : ''
                }
                onChange={handleInputChange}
                onBlur={handleDateBlur}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                required
                disabled={!selectedVenue || !selectedPromoter}
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
                value={
                  event.registrationDeadline
                    ? new Date(event.registrationDeadline)
                        .toISOString()
                        .split('T')[0]
                    : ''
                }
                onChange={handleInputChange}
                onBlur={handleDateBlur}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                required
                disabled={!selectedVenue || !selectedPromoter}
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
                value={
                  event.weighInDateTime
                    ? new Date(event.weighInDateTime).toISOString().slice(0, 16)
                    : ''
                }
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                required
                disabled={!selectedVenue || !selectedPromoter}
              />
            </div>

            {/* Rules Meeting Time */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Rules Meeting Time
              </label>
              <input
                type='time'
                name='rulesMeetingTime'
                value={event.rulesMeetingTime || ''}
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                disabled={!selectedVenue || !selectedPromoter}
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
                value={event.spectatorDoorsOpenTime || ''}
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                disabled={!selectedVenue || !selectedPromoter}
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
                value={event.fightStartTime || ''}
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                required
                disabled={!selectedVenue || !selectedPromoter}
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
                value={event.iskaRepName || ''}
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Enter ISKA rep name'
                disabled={!selectedVenue || !selectedPromoter}
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
                value={event.iskaRepPhone || ''}
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Enter phone number'
                disabled={!selectedVenue || !selectedPromoter}
              />
            </div>
          </div>

          {/* DESCRIPTION SECTION */}
          <h2 className='font-bold mb-4 uppercase text-sm border-b border-gray-700 pb-2 mt-8'>
            Description
          </h2>

          <div className='grid grid-cols-1 gap-4 mb-6'>
            {/* Brief Description */}
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Short Description<span className='text-red-500'>*</span>
              </label>
              <textarea
                name='briefDescription'
                value={event.briefDescription || ''}
                onChange={handleInputChange}
                rows={3}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed resize-none'
                placeholder='Brief description about the event'
                maxLength={500}
                required
                disabled={!selectedVenue || !selectedPromoter}
              />
              <p className='text-xs text-gray-400 mt-1'>Max 500 characters</p>
            </div>

            {/* Full Description */}
            <div className='bg-[#00000061] p-2 rounded'>
              <MarkdownEditor
                label={'Full Description'}
                value={event.fullDescription || ''}
                onChange={(text) =>
                  setEvent((prev) => ({
                    ...prev,
                    fullDescription: text,
                  }))
                }
                disabled={!selectedVenue || !selectedPromoter}
              />
            </div>
          </div>

          {/* OTHER INFO SECTION */}
          <h2 className='font-bold mb-4 uppercase text-sm border-b border-gray-700 pb-2 mt-8'>
            Other Info
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            {/* External URL */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                External URL
              </label>
              <input
                type='url'
                name='externalUrl'
                value={event.externalUrl || ''}
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='https://example.com'
                disabled={!selectedVenue || !selectedPromoter}
              />
            </div>

            {/* Matching Method */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Matching Method<span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <select
                  name='matchingMethod'
                  value={event.matchingMethod || ''}
                  onChange={handleInputChange}
                  className='w-full outline-none appearance-none bg-transparent disabled:cursor-not-allowed'
                  required
                  disabled={!selectedVenue || !selectedPromoter}
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

            {/* Upload Rules Info File */}
            <div className='bg-[#00000061] p-2 rounded col-span-2'>
              <label className='block text-sm font-medium mb-1'>
                Upload Rules Info File
              </label>

              {/* Custom file upload button */}
              <div className='relative inline-block'>
                <label
                  htmlFor='rulesUpload'
                  className={`cursor-pointer inline-block file-btn py-2 px-4 rounded-full text-sm font-semibold ${
                    !selectedVenue || !selectedPromoter
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  Choose File
                </label>
                <input
                  id='rulesUpload'
                  type='file'
                  name='rules'
                  onChange={(e) => handleImageSelect(e, 'rules')}
                  accept='application/pdf'
                  disabled={!selectedVenue || !selectedPromoter}
                  className='absolute inset-0 opacity-0 w-full h-full cursor-pointer'
                />
              </div>

              <p className='text-xs text-gray-400 mt-1'>PDF format only</p>

              {selectedFiles.rules ? (
                <div className='flex items-center justify-center h-16 bg-[#0A1330] rounded-lg border-2 border-dashed border-yellow-400 mt-2'>
                  <div className='text-center'>
                    <p className='text-yellow-400 font-medium text-sm'>
                      New file: {selectedFiles.rules.name}
                    </p>
                    <p className='text-gray-400 text-xs mt-1'>
                      Will upload on save
                    </p>
                  </div>
                </div>
              ) : event.rules ? (
                <div className='flex items-center justify-center h-16 bg-[#0A1330] rounded-lg text-gray-400 mt-2'>
                  <a
                    href={event.rules}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-400 hover:text-blue-300'
                  >
                    View Current Rules File
                  </a>
                  <button
                    type='button'
                    onClick={() => removeImage('rules')}
                    className='ml-4 flex items-center gap-2 px-2 py-1 bg-red-600 hover:bg-red-700 rounded transition-colors text-sm'
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className='flex items-center justify-center h-16 bg-[#0A1330] rounded-lg text-gray-400 mt-2'>
                  No rules file uploaded
                </div>
              )}
            </div>
          </div>

          {/* CATEGORIES SECTION */}
          <h2 className='font-bold mb-4 uppercase text-sm border-b border-gray-700 pb-2 mt-8'>
            Categories
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            {/* Age Categories */}
            <div className='bg-[#00000061] py-1 px-2 rounded'>
              <label className='text-sm mb-2 block'>Age Categories</label>
              <CustomMultiSelect
                label='Select Age Categories'
                options={ageCategories}
                value={event.ageCategories || []}
                onChange={(selectedIds) => {
                  setEvent((prev) => ({
                    ...prev,
                    ageCategories: selectedIds,
                  }))
                }}
                disabled={!selectedVenue || !selectedPromoter}
              />
            </div>

            {/* Weight Classes */}
            <div className='bg-[#00000061] py-1 px-2 rounded'>
              <label className='text-sm mb-2 block'>Weight Classes</label>
              <CustomMultiSelect
                label='Select Weight Classes'
                options={weightClasses}
                value={event.weightClasses || []}
                onChange={(selectedIds) => {
                  setEvent((prev) => ({
                    ...prev,
                    weightClasses: selectedIds,
                  }))
                }}
                disabled={!selectedVenue || !selectedPromoter}
              />
            </div>
          </div>

          {/* SANCTIONING BODY SECTION */}
          <h2 className='font-bold mb-4 uppercase text-sm border-b border-gray-700 pb-2 mt-8'>
            Sanctioning Body
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            {/* Sanctioning Body Name */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Sanctioning Body Name<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='sectioningBodyName'
                value={event.sectioningBodyName || ''}
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Enter sanctioning body name'
                required
                disabled={!selectedVenue || !selectedPromoter}
              />
            </div>

            {/* Sanctioning Body Description */}
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Sanctioning Body Description
                <span className='text-red-500'>*</span>
              </label>
              <textarea
                name='sectioningBodyDescription'
                value={event.sectioningBodyDescription || ''}
                onChange={handleInputChange}
                rows={2}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed resize-none'
                placeholder='Enter sanctioning body description'
                maxLength={255}
                required
                disabled={!selectedVenue || !selectedPromoter}
              />
              <p className='text-xs text-gray-400 mt-1'>Max 255 characters</p>
            </div>

            {/* Sanctioning Body Logo */}
            <div className='bg-[#00000061] p-2 rounded col-span-2'>
              <label className='block text-sm font-medium mb-1'>
                Sanctioning Body Logo
              </label>

              {/* Custom file upload button */}
              <div className='relative inline-block'>
                <label
                  htmlFor='sectioningBodyImageUpload'
                  className={`cursor-pointer inline-block file-btn py-2 px-4 rounded-full text-sm font-semibold ${
                    !selectedVenue || !selectedPromoter
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  Choose Logo
                </label>
                <input
                  id='sectioningBodyImageUpload'
                  type='file'
                  name='sectioningBodyImage'
                  onChange={(e) => handleImageSelect(e, 'sectioningBodyImage')}
                  accept='image/jpeg,image/png'
                  disabled={!selectedVenue || !selectedPromoter}
                  className='absolute inset-0 opacity-0 w-full h-full cursor-pointer'
                />
              </div>

              <p className='text-xs text-gray-400 mt-1'>
                JPG, PNG formats only
              </p>

              {selectedFiles.sectioningBodyImage ? (
                <div className='flex items-center justify-center h-32 bg-[#0A1330] rounded-lg border-2 border-dashed border-yellow-400 mt-2'>
                  <div className='text-center'>
                    <p className='text-yellow-400 font-medium text-sm'>
                      New image: {selectedFiles.sectioningBodyImage.name}
                    </p>
                    <p className='text-gray-400 text-xs mt-1'>
                      Will upload on save
                    </p>
                  </div>
                </div>
              ) : event.sectioningBodyImage ? (
                <div className='relative w-32 h-32 mt-2'>
                  <Image
                    src={event.sectioningBodyImage}
                    alt='Sanctioning body logo'
                    fill
                    className='object-contain rounded-lg'
                  />
                  <button
                    type='button'
                    onClick={() => removeImage('sectioningBodyImage')}
                    className='absolute top-2 right-2 flex items-center gap-2 px-2 py-1 bg-red-600 hover:bg-red-700 rounded transition-colors text-sm'
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className='flex items-center justify-center h-32 bg-[#0A1330] rounded-lg text-gray-400 mt-2'>
                  No logo uploaded
                </div>
              )}
            </div>
          </div>

          {/* VENUE INFORMATION SECTION */}
          <h2 className='font-bold mb-4 uppercase text-sm border-b border-gray-700 pb-2 mt-8'>
            Venue Information
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            {/* Venue Name */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Venue Name
              </label>
              <input
                type='text'
                name='name'
                value={event.venue?.name || ''}
                onChange={handleVenueChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Venue name'
                disabled={!selectedVenue}
              />
            </div>

            {/* Contact Name */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Contact Name
              </label>
              <input
                type='text'
                name='contactName'
                value={event.venue?.contactName || ''}
                onChange={handleVenueChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Contact person name'
                disabled={!selectedVenue}
              />
            </div>

            {/* Contact Phone */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Contact Phone
              </label>
              <input
                type='tel'
                name='contactPhone'
                value={event.venue?.contactPhone || ''}
                onChange={handleVenueChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Phone number'
                disabled={!selectedVenue}
              />
            </div>

            {/* Contact Email */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Contact Email
              </label>
              <input
                type='email'
                name='contactEmail'
                value={event.venue?.contactEmail || ''}
                onChange={handleVenueChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Email address'
                disabled={!selectedVenue}
              />
            </div>

            {/* Capacity */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>Capacity</label>
              <input
                type='number'
                name='capacity'
                value={event.venue?.capacity || ''}
                onChange={handleVenueChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Maximum capacity'
                disabled={!selectedVenue}
              />
            </div>

            {/* Map Link */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>Map Link</label>
              <input
                type='url'
                name='mapLink'
                value={event.venue?.mapLink || ''}
                onChange={handleVenueChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Google Maps link'
                disabled={!selectedVenue}
              />
            </div>

            {/* Street Address 1 */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Street Address 1
              </label>
              <input
                type='text'
                name='street1'
                value={event.venue?.address?.street1 || ''}
                onChange={handleAddressChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Street address'
                disabled={!selectedVenue}
              />
            </div>

            {/* Street Address 2 */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Street Address 2
              </label>
              <input
                type='text'
                name='street2'
                value={event.venue?.address?.street2 || ''}
                onChange={handleAddressChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Apt, suite, unit, etc.'
                disabled={!selectedVenue}
              />
            </div>

            {/* City */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>City</label>
              <input
                type='text'
                name='city'
                value={event.venue?.address?.city || ''}
                onChange={handleAddressChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='City'
                disabled={!selectedVenue}
              />
            </div>

            {/* State */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                State/Province
              </label>
              <input
                type='text'
                name='state'
                value={event.venue?.address?.state || ''}
                onChange={handleAddressChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='State or Province'
                disabled={!selectedVenue}
              />
            </div>

            {/* Postal Code */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Postal Code
              </label>
              <input
                type='text'
                name='postalCode'
                value={event.venue?.address?.postalCode || ''}
                onChange={handleAddressChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='ZIP or Postal Code'
                disabled={!selectedVenue}
              />
            </div>

            {/* Country */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>Country</label>
              <input
                type='text'
                name='country'
                value={event.venue?.address?.country || ''}
                onChange={handleAddressChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Country'
                disabled={!selectedVenue}
              />
            </div>
          </div>

          {/* PROMOTER INFORMATION SECTION */}
          <h2 className='font-bold mb-4 uppercase text-sm border-b border-gray-700 pb-2 mt-8'>
            Promoter Information
          </h2>

          {/* Promoter Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            {/* Promoter Name */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Promoter Name
              </label>
              <input
                type='text'
                name='name'
                value={event.promoter?.name || ''}
                onChange={handlePromoterChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Promoter organization name'
                disabled={!selectedPromoter}
              />
            </div>

            {/* Abbreviation */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Abbreviation
              </label>
              <input
                type='text'
                name='abbreviation'
                value={event.promoter?.abbreviation || ''}
                onChange={handlePromoterChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Organization abbreviation'
                disabled={!selectedPromoter}
              />
            </div>

            {/* Website URL */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Website URL
              </label>
              <input
                type='url'
                name='websiteURL'
                value={event.promoter?.websiteURL || ''}
                onChange={handlePromoterChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='https://example.com'
                disabled={!selectedPromoter}
              />
            </div>

            {/* Sanctioning Body */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Sanctioning Body
              </label>
              <input
                type='text'
                name='sanctioningBody'
                value={event.promoter?.sanctioningBody || ''}
                onChange={handlePromoterChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Sanctioning organization'
                disabled={!selectedPromoter}
              />
            </div>

            {/* License Certificate */}
            <div className='bg-[#00000061] p-2 rounded col-span-2'>
              <label className='block text-sm font-medium mb-1'>
                License Certificate
              </label>

              {/* Custom file upload button */}
              <div className='relative inline-block'>
                <label
                  htmlFor='licenseCertificateUpload'
                  className={`cursor-pointer inline-block file-btn py-2 px-4 rounded-full text-sm font-semibold ${
                    !selectedPromoter
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  Choose Certificate
                </label>
                <input
                  id='licenseCertificateUpload'
                  type='file'
                  name='licenseCertificate'
                  onChange={(e) => handleImageSelect(e, 'licenseCertificate')}
                  accept='image/jpeg,image/png'
                  disabled={!selectedPromoter}
                  className='absolute inset-0 opacity-0 w-full h-full cursor-pointer'
                />
              </div>

              <p className='text-xs text-gray-400 mt-1'>
                JPG, PNG formats only
              </p>

              {selectedFiles.licenseCertificate ? (
                <div className='flex items-center justify-center h-32 bg-[#0A1330] rounded-lg border-2 border-dashed border-yellow-400 mt-2'>
                  <div className='text-center'>
                    <p className='text-yellow-400 font-medium text-sm'>
                      New certificate: {selectedFiles.licenseCertificate.name}
                    </p>
                    <p className='text-gray-400 text-xs mt-1'>
                      Will upload on save
                    </p>
                  </div>
                </div>
              ) : event.promoter?.licenseCertificate ? (
                <div className='relative w-full max-w-md h-64 mt-2'>
                  <Image
                    src={event.promoter.licenseCertificate}
                    alt='License certificate'
                    fill
                    className='object-contain rounded-lg'
                  />
                  <button
                    type='button'
                    onClick={() => removeImage('licenseCertificate')}
                    className='absolute top-2 right-2 flex items-center gap-2 px-2 py-1 bg-red-600 hover:bg-red-700 rounded transition-colors text-sm'
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className='flex items-center justify-center h-32 bg-[#0A1330] rounded-lg text-gray-400 mt-2'>
                  No certificate uploaded
                </div>
              )}
            </div>

            {/* Contact Person Name */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Contact Person Name
              </label>
              <input
                type='text'
                name='contactPersonName'
                value={event.promoter?.contactPersonName || ''}
                onChange={handlePromoterChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Contact person name'
                disabled={!selectedPromoter}
              />
            </div>

            {/* Alternate Phone Number */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Alternate Phone Number
              </label>
              <input
                type='tel'
                name='alternatePhoneNumber'
                value={event.promoter?.alternatePhoneNumber || ''}
                onChange={handlePromoterChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Alternative contact number'
                disabled={!selectedPromoter}
              />
            </div>

            {/* User First Name */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                User First Name
              </label>
              <input
                type='text'
                name='firstName'
                value={event.promoter?.userId?.firstName || ''}
                onChange={handleUserIdChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='First name'
                disabled={!selectedPromoter}
              />
            </div>

            {/* User Last Name */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                User Last Name
              </label>
              <input
                type='text'
                name='lastName'
                value={event.promoter?.userId?.lastName || ''}
                onChange={handleUserIdChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Last name'
                disabled={!selectedPromoter}
              />
            </div>

            {/* User Email */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                User Email
              </label>
              <input
                type='email'
                name='email'
                value={event.promoter?.userId?.email || ''}
                onChange={handleUserIdChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Email address'
                disabled={!selectedPromoter}
              />
            </div>

            {/* User Phone */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                User Phone
              </label>
              <input
                type='tel'
                name='phoneNumber'
                value={event.promoter?.userId?.phoneNumber || ''}
                onChange={handleUserIdChange}
                className='w-full outline-none bg-transparent disabled:cursor-not-allowed'
                placeholder='Phone number'
                disabled={!selectedPromoter}
              />
            </div>
          </div>

          {/* SYSTEM SETTINGS SECTION */}
          <h2 className='font-bold mb-4 uppercase text-sm border-b border-gray-700 pb-2 mt-8'>
            System Settings
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            {/* Is Draft */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>Is Draft</label>
              <div className='relative'>
                <select
                  name='isDraft'
                  value={event.isDraft ? 'true' : 'false'}
                  onChange={(e) => {
                    setEvent((prev) => ({
                      ...prev,
                      isDraft: e.target.value === 'true',
                    }))
                  }}
                  className='w-full outline-none appearance-none bg-transparent'
                >
                  <option value='true' className='text-black'>
                    Yes
                  </option>
                  <option value='false' className='text-black'>
                    No
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

            {/* Publish Brackets */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Publish Brackets
              </label>
              <div className='relative'>
                <select
                  name='publishBrackets'
                  value={event.publishBrackets ? 'true' : 'false'}
                  onChange={(e) => {
                    setEvent((prev) => ({
                      ...prev,
                      publishBrackets: e.target.value === 'true',
                    }))
                  }}
                  className='w-full outline-none appearance-none bg-transparent'
                >
                  <option value='true' className='text-black'>
                    Yes
                  </option>
                  <option value='false' className='text-black'>
                    No
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
          </div>

          {/* SUBMIT SECTION */}
          <div className='flex justify-end mt-8'>
            <button
              type='submit'
              className={`flex items-center gap-2 px-6 py-3 rounded font-semibold transition-colors ${
                isEditing || !selectedVenue || !selectedPromoter
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
              disabled={isEditing || !selectedVenue || !selectedPromoter}
            >
              {isEditing ? (
                <>
                  <Loader size={20} />
                  Saving Event...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
