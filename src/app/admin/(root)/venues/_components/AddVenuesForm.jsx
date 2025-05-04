'use client'
import React, { useState } from 'react'

export const AddVenuesForm = ({ setShowAddVenues }) => {
  const [formData, setState] = useState({
    venueName: '',
    name2: '',
    shortDescription: '',
    fullDescription: '',
    url: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log('Form submitted:', formData)
  }

  return (
    <div className='min-h-screen text-white'>
      <div className='w-full'>
        {/* Header with back button */}
        <div className='flex items-center gap-4 mb-6'>
          <button
            className='mr-2 text-white'
            onClick={() => setShowAddVenues(false)}
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
          <h1 className='text-2xl font-bold'>New Venue</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
            {/* Venue Name Field */}
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Venue Name<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='venueName'
                value={formData.venueName}
                onChange={handleChange}
                className='w-full outline-none'
                required
              />
            </div>
            {/* Name 2 Field */}
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>Name 2</label>
              <input
                type='text'
                name='name2'
                value={formData.name2}
                onChange={handleChange}
                className='w-full outline-none'
              />
            </div>
          </div>

          {/* Short Description */}
          <div className='bg-[#00000061] p-2 rounded mb-6'>
            <label className='block text-sm font-medium mb-1'>
              Short Description
            </label>
            <input
              type='text'
              name='shortDescription'
              value={formData.shortDescription}
              onChange={handleChange}
              className='w-full outline-none'
            />
          </div>

          {/* Full Description */}
          <div className='bg-[#00000061] p-2 rounded mb-6'>
            <label className='block text-sm font-medium mb-1'>
              Full Description
            </label>
            <textarea
              name='fullDescription'
              value={formData.fullDescription}
              onChange={handleChange}
              rows='1'
              className='w-full outline-none resize-none'
            />
          </div>

          {/* URL */}
          <div className='mb-8 grid grid-cols-1 md:grid-cols-2'>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>URL</label>
              <input
                type='url'
                name='url'
                value={formData.url}
                onChange={handleChange}
                className='w-full outline-none'
              />
            </div>
          </div>

          {/* Save Button */}
          <div className='flex justify-center'>
            <button
              type='submit'
              className='bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded transition duration-200'
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
