'use client'
import { enqueueSnackbar } from 'notistack'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { API_BASE_URL, apiConstants } from '../../../../../constants'
import useStore from '../../../../../stores/useStore'
import { CustomMultiSelect } from '../../../../_components/CustomMultiSelect'
import MarkdownEditor from '../../../../_components/MarkdownEditor'
import { AddVenuesForm } from '../../venues/_components/AddVenuesForm'
import Autocomplete from '../../../../_components/Autocomplete'

export const AddEventForm = ({ setShowAddEvent }) => {
  const user = useStore((state) => state.user)

  // Mock data for dropdown lists - replace with actual data from your API
  const ageCategories = [
    { _id: 'juniors', fullName: 'Juniors' },
    { _id: 'adults', fullName: 'Adults' },
    { _id: 'seniors', fullName: 'Seniors' },
  ]

  const weightClasses = [
    { _id: 'featherweight', fullName: 'Featherweight' },
    { _id: 'lightweight', fullName: 'Lightweight' },
    { _id: 'middleweight', fullName: 'Middleweight' },
    { _id: 'heavyweight', fullName: 'Heavyweight' },
  ]

  const venues = ['Venue 1', 'Venue 2', 'Venue 3']

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
    addNewVenue: false,

    // Promoter
    promoterName: '',
    promoterPhone: '',
    iskaRepName: '',
    iskaRepPhone: '',

    // Descriptions
    briefDescription: '',
    fullDescription: '',
    rulesInfoUrl: '',
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
    showBrackets: false,
  })

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
      const payload = new FormData()

      // Append all form data to FormData object
      Object.keys(formData).forEach((key) => {
        if (key === 'poster' && formData[key]) {
          payload.append(key, formData[key])
        } else if (Array.isArray(formData[key])) {
          // Handle arrays (for multi-select fields)
          if (formData[key].length > 0) {
            formData[key].forEach((value) => {
              payload.append(`${key}[]`, value)
            })
          } else {
            payload.append(key, '')
          }
        } else {
          payload.append(key, formData[key] || '')
        }
      })

      // Add creator ID
      payload.append('createdBy', user?.id)

      console.log('Form submitted:', Object.fromEntries(payload))
      const response = await axios.post(`${API_BASE_URL}/events/add`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.status === apiConstants.create) {
        enqueueSnackbar(response.data.message, {
          variant: 'success',
        })
        // Reset form
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
          addNewVenue: false,

          // Promoter Info
          promoterName: '',
          promoterPhone: '',
          iskaRepName: '',
          iskaRepPhone: '',

          // Descriptions
          briefDescription: '',
          fullDescription: '',
          rulesInfoUrl: '',
          matchingMethod: 'On-site',
          externalUrl: '',
          ageCategories: [],
          weightClasses: [],

          // Publishing options
          isPublished: false,
          isDraft: true,
          showBrackets: false,
        })
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
                  <option value='Kickboxing' className='text-black'>
                    Kickboxing
                  </option>
                  <option value='Muay Thai' className='text-black'>
                    Muay Thai
                  </option>
                  <option value='Boxing' className='text-black'>
                    Boxing
                  </option>
                  <option value='MMA' className='text-black'>
                    MMA
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
              options={venues}
              selected={formData.venue}
              onChange={(value) => handleChange('venue', value)}
              placeholder='Search venue name'
              required={true}
            />

            {/* Add New Venue */}
            <div className=''>
              <button
                type='button'
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    addNewVenue: !prev.addNewVenue,
                  }))
                }
                className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                  formData.addNewVenue
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {formData.addNewVenue ? 'Cancel Add Venue' : 'Add New Venue'}
              </button>
            </div>
          </div>
          {formData.addNewVenue && (
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
            {/* Promoter Name */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Promoter Name<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='promoterName'
                value={formData.promoterName}
                onChange={handleChange}
                className='w-full outline-none bg-transparent'
                required
                placeholder='Select or enter promoter'
              />
            </div>

            {/* Promoter Phone */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Promoter Phone
              </label>
              <input
                type='tel'
                name='promoterPhone'
                value={formData.promoterPhone}
                onChange={handleChange}
                className='w-full outline-none bg-transparent'
                placeholder='Enter phone number'
              />
            </div>

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
                Rules Info URL
              </label>
              <input
                type='url'
                name='rulesInfoUrl'
                value={formData.rulesInfoUrl}
                onChange={handleChange}
                className='w-full outline-none bg-transparent'
                placeholder='https://link-to-rules.pdf'
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
                name='poster'
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
                  name='showBrackets'
                  checked={formData.showBrackets}
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
                setShowAddEvent(false)
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
                  addNewVenue: false,

                  // Promoter Info
                  promoterName: '',
                  promoterPhone: '',
                  iskaRepName: '',
                  iskaRepPhone: '',

                  // Descriptions
                  briefDescription: '',
                  fullDescription: '',
                  rulesInfoUrl: '',
                  matchingMethod: 'On-site',
                  externalUrl: '',
                  ageCategories: [],
                  weightClasses: [],

                  // Publishing options
                  isPublished: false,
                  isDraft: true,
                  showBrackets: false,
                })
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
            <button
              type='button'
              className='text-white font-medium py-2 px-6 rounded transition duration-200 bg-blue-600'
              onClick={() => {
                // Update form state for publishing and submit
                setFormData((prev) => ({
                  ...prev,
                  isPublished: true,
                  isDraft: false,
                }))
                // Then submit the form
                document.forms[0].requestSubmit()
              }}
            >
              Publish
            </button>
            <button
              type='button'
              className='text-white font-medium py-2 px-6 rounded transition duration-200 bg-yellow-500'
              onClick={() => {
                // Update form state for draft and submit
                setFormData((prev) => ({
                  ...prev,
                  isPublished: false,
                  isDraft: true,
                }))
                // Then submit the form
                document.forms[0].requestSubmit()
              }}
            >
              Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
