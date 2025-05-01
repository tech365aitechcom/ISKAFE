'use client'
import { enqueueSnackbar } from 'notistack'
import axios from 'axios'
import React, { useState } from 'react'
import { API_BASE_URL, apiConstants } from '../../../../../constants'
import useUserStore from '../../../../../stores/userStore'

export const AddEventForm = ({ setShowAddEvent }) => {
  const user = useUserStore((state) => state.user)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sportType: '',
    startDate: '',
    endDate: '',
    venueName: '',
    location: '',
    registrationOpen: '',
    registrationClose: '',
    isPublished: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    try {
      e.preventDefault()
      const payload = {
        ...formData,
        createdBy: user?.id,
      }

      console.log('Form submitted:', payload)
      const response = await axios.post(`${API_BASE_URL}/events/add`, payload)
      console.log('Response:', response)
      if (response.status === apiConstants.create) {
        enqueueSnackbar(response.data.message, {
          variant: 'success',
        })
        setFormData({
          title: '',
          description: '',
          sportType: '',
          startDate: '',
          endDate: '',
          venueName: '',
          location: '',
          registrationOpen: '',
          registrationClose: '',
          isPublished: false,
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

  return (
    <div className='min-h-screen text-white bg-dark-blue-900'>
      <div className='w-full'>
        {/* Header with back button */}
        <div className='flex items-center gap-4 mb-6'>
          <button
            className='mr-2 text-white cursor-pointer'
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
          {/* BASIC DETAILS */}
          <h2 className='font-bold mb-4 uppercase text-sm'>Basic Details</h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            {/* Title Field */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Event Title<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='title'
                value={formData.title}
                onChange={handleChange}
                className='w-full outline-none'
                required
                placeholder='Eric'
              />
            </div>

            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Sport Type<span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <select
                  name='sportType'
                  value={formData.sportType}
                  onChange={handleChange}
                  className='w-full outline-none appearance-none'
                  required
                >
                  <option value='' className='text-black'>
                    Select Sport Type
                  </option>
                  <option value='Kick boxing' className='text-black'>
                    Kick boxing
                  </option>
                  <option value=' Muay Thai' className='text-black'>
                    Muay Thai
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

          {/* Description Field */}
          <div className='bg-[#00000061] p-2 rounded mb-6'>
            <label className='block text-sm font-medium mb-1'>
              Description<span className='text-red-500'>*</span>
            </label>
            <textarea
              name='description' // Corrected this field name
              value={formData.description}
              onChange={handleChange}
              rows='4'
              className='w-full outline-none resize-none'
              placeholder='Description'
            />
          </div>

          {/* Date and Location */}
          <h2 className='font-bold mb-4 uppercase text-sm'>Date & Location</h2>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
            {/* Event Start Date */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Event Start Date
              </label>
              <input
                type='date'
                name='startDate'
                value={formData.startDate}
                onChange={handleChange}
                className='w-full outline-none bg-transparent text-white'
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
                className='w-full outline-none bg-transparent text-white'
              />
            </div>

            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Venue Name
              </label>
              <input
                type='text'
                name='venueName'
                value={formData.venueName}
                onChange={handleChange}
                className='w-full outline-none'
                placeholder='Venue Name'
              />
            </div>
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>Location</label>
              <input
                type='text'
                name='location'
                value={formData.location}
                onChange={handleChange}
                className='w-full outline-none'
                placeholder='Location'
              />
            </div>
          </div>

          {/* Registration Config */}
          <h2 className='font-bold mb-4 uppercase text-sm'>
            Registration Config
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            {/* Registration Open */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Registration Open
              </label>
              <input
                type='date'
                name='registrationOpen'
                value={formData.registrationOpen}
                onChange={handleChange}
                className='w-full outline-none bg-transparent text-white'
              />
            </div>
            {/*  Registration Close */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Registration Close
              </label>
              <input
                type='date'
                name='registrationClose'
                value={formData.registrationClose}
                onChange={handleChange}
                className='w-full outline-none bg-transparent text-white'
              />
            </div>
          </div>

          <div className='flex items-center gap-4'>
            <span className=''>Publish Event</span>
            <button
              type='button'
              onClick={() =>
                setFormData((prevState) => ({
                  ...prevState,
                  isPublished: !prevState.isPublished,
                }))
              }
              className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out cursor-pointer ${
                formData.isPublished ? 'bg-violet-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                  formData.isPublished ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-center gap-4 mt-12'>
            <button
              type='submit'
              className='text-white font-medium py-2 px-6 rounded transition duration-200 cursor-pointer'
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
