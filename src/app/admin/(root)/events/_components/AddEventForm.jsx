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
import { AddVenuesForm } from '../../venues/_components/AddVenuesForm'
import Autocomplete from '../../../../_components/Autocomplete'
import { Country } from 'country-state-city'
import { uploadToS3 } from '../../../../../utils/uploadToS3'

export const AddEventForm = ({ setShowAddEvent }) => {
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
  const [loading, setLoading] = useState(true)
  const [promoters, setPromoters] = useState([])
  const [addNewVenue, setAddNewVenue] = useState(false)
  const [addNewPromoter, setAddNewPromoter] = useState(false)

  const getVenues = async () => {
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
      }
    }
  }

  const handleSubmit = async (e) => {
    try {
      e.preventDefault()
      console.log('Form submitted:', formData)

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
      enqueueSnackbar(
        error?.response?.data?.message || 'Something went wrong',
        {
          variant: 'error',
        }
      )
    }
  }

  const handleCancel = () => {
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

  useEffect(() => {
    if (formData.addNewVenue) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [formData.addNewVenue])

  return (
    <div className='min-h-screen text-white bg-dark-blue-900'>
      <div className='w-full'>
        {/* Header with back button */}
        <div className='flex items-center gap-4 mb-6'>
          <button
            className='mr-2 text-white'
            onClick={() => setShowAddEvent(false)}
          >
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
          {/* BASIC INFO SECTION */}
          <h2 className='font-bold mb-4 uppercase text-sm border-b border-gray-700 pb-2'>
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
                className='w-full outline-none bg-transparent'
                required
                placeholder='Enter Event Title'
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
                  className='w-full outline-none appearance-none bg-transparent'
                  required
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
                  className='w-full outline-none appearance-none bg-transparent'
                  required
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
                  className='w-full outline-none appearance-none bg-transparent'
                  required
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
              <input
                type='file'
                name='poster'
                onChange={handleChange}
                accept='image/jpeg,image/png'
                className='w-full outline-none bg-transparent'
              />
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
                className='w-full outline-none bg-transparent'
                required
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
                className='w-full outline-none bg-transparent'
              />
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
                className='w-full outline-none bg-transparent'
                required
              />
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
                className='w-full outline-none bg-transparent'
                required
              />
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
                className='w-full outline-none bg-transparent'
                required
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
                value={formData.rulesMeetingTime}
                onChange={handleChange}
                className='w-full outline-none bg-transparent'
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
                className='w-full outline-none bg-transparent'
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
                className='w-full outline-none bg-transparent'
                required
              />
            </div>
          </div>

          {/* VENUE SECTION */}
          <h2 className='font-bold mb-4 uppercase text-sm border-b border-gray-700 pb-2 mt-8'>
            Venue
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            {/* Venue Search/Select */}

            <Autocomplete
              label={'Search or select venue'}
              options={venues.map((venue) => {
                return {
                  label: `${venue.name} (${
                    venue.address.street1 +
                      ', ' +
                      venue.address.city +
                      ', ' +
                      Country.getCountryByCode(venue.address.country).name || ''
                  })`,
                  value: venue._id,
                }
              })}
              selected={formData.venue}
              onChange={(value) => handleChange('venue', value)}
              placeholder='Search venue name'
              required={true}
            />

            {/* Add New Venue */}
            <div className=''>
              <button
                type='button'
                onClick={() => setAddNewVenue(!addNewVenue)}
                className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                  addNewVenue
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {addNewVenue ? 'Cancel Add Venue' : 'Add New Venue'}
              </button>
            </div>
          </div>
          {addNewVenue && (
            <AddVenuesForm
              setShowAddVenues={() =>
                setFormData((prev) => ({
                  ...prev,
                  addNewVenue: false,
                }))
              }
              showBackButton={false}
            />
          )}
          {/* PROMOTER INFO SECTION */}
          <h2 className='font-bold mb-4 uppercase text-sm border-b border-gray-700 pb-2 mt-8'>
            Promoter Info
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            {/* Promoter */}
            <Autocomplete
              label={'Search or select promoter'}
              options={promoters.map((promoter) => {
                return {
                  label: `${promoter.user?.firstName || ''} ${
                    promoter.user?.middleName || ''
                  } ${promoter.user?.lastName || ''} (${
                    promoter.user?.email || ''
                  })`,
                  value: promoter._id,
                }
              })}
              selected={formData.promoter}
              onChange={(value) => handleChange('promoter', value)}
              placeholder='Search promoter name'
              required={true}
            />

            {/* Add New promoter */}
            <div className=''>
              <button
                type='button'
                onClick={() => setAddNewPromoter(!addNewPromoter)}
                className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                  addNewPromoter
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {addNewPromoter ? 'Cancel Add Promoter' : 'Add New Promoter'}
              </button>
            </div>
            {addNewVenue && (
              <AddVenuesForm
                setShowAddVenues={() =>
                  setFormData((prev) => ({
                    ...prev,
                    addNewVenue: false,
                  }))
                }
                showBackButton={false}
              />
            )}
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
                className='w-full outline-none bg-transparent'
                placeholder='Enter ISKA rep name'
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
                className='w-full outline-none bg-transparent'
                placeholder='Enter phone number'
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
                className='w-full outline-none resize-none bg-transparent'
                maxLength='255'
                required
                placeholder='Short summary'
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
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
            {/* Rules Info URL */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Rules Info
              </label>
              <input
                type='file'
                name='rules'
                accept='application/pdf'
                onChange={handleChange}
                className='w-full text-sm text-white file:mr-4 file:py-1 file:px-3 file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-black hover:file:bg-yellow-400'
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
                  value={formData.matchingMethod}
                  onChange={handleChange}
                  className='w-full outline-none appearance-none bg-transparent'
                  required
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
                className='w-full outline-none bg-transparent'
                placeholder='https://'
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
                onChange={(selectedIds) => {
                  setFormData((prev) => ({
                    ...prev,
                    ageCategories: selectedIds,
                  }))
                }}
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
                onChange={(selectedIds) => {
                  setFormData((prev) => ({
                    ...prev,
                    weightClasses: selectedIds,
                  }))
                }}
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
                className='w-full outline-none bg-transparent'
                placeholder='Enter Sectioning Body Name'
              />
            </div>
            {/* Image */}
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Sectioning body image
                <span className='text-red-500'>*</span>
              </label>
              <input
                type='file'
                name='sectioningBodyImage'
                required
                onChange={handleChange}
                accept='image/jpeg,image/png'
                className='w-full outline-none bg-transparent'
              />
              <p className='text-xs text-gray-400 mt-1'>
                JPG, PNG formats only
              </p>
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
                className='w-full outline-none resize-none bg-transparent'
                maxLength='255'
                required
                placeholder='Enter content...'
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
              onClick={() => {
                handleCancel()
                setShowAddEvent(false)
              }}
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
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
