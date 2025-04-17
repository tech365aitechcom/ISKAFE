'use client'
import { Trash } from 'lucide-react'
import React, { useState } from 'react'

export const AddNewsForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    message: '',
    image: null,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const previewURL = URL.createObjectURL(file)
      setFormData((prevState) => ({
        ...prevState,
        image: previewURL,
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  return (
    <div className='min-h-screen text-white p-6 bg-dark-blue-900'>
      <div className='w-full'>
        {/* Header with back button */}
        <div className='flex items-center gap-4 mb-6'>
          <button className='mr-2 text-white cursor-pointer'>
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
          <h1 className='text-2xl font-bold'>Add New News</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Image Upload */}
          <div className='mb-8'>
            {formData.image ? (
              <div className='relative w-72 h-52 rounded-lg overflow-hidden border border-[#D9E2F930]'>
                <img
                  src={formData.image}
                  alt='Selected image'
                  className='w-full h-full object-cover'
                />
                <button
                  type='button'
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, image: null }))
                  }
                  className='absolute top-2 right-2 bg-[#14255D] p-1 rounded text-[#AEB9E1] shadow-md z-20 cursor-pointer'
                >
                  <Trash className='w-4 h-4' />
                </button>
              </div>
            ) : (
              <label
                htmlFor='profile-pic-upload'
                className='cursor-pointer border-2 border-dashed border-gray-500 rounded-lg flex flex-col items-center justify-center w-72 h-52 relative overflow-hidden'
              >
                <input
                  id='profile-pic-upload'
                  type='file'
                  accept='image/*'
                  onChange={handleFileChange}
                  className='absolute inset-0 opacity-0 cursor-pointer z-50'
                />

                <div className='bg-yellow-500 opacity-50 rounded-full p-2 mb-2 z-10'>
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
                      d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                </div>
                <p className='text-sm text-center text-[#AEB9E1] z-10'>
                  <span className='text-[#FEF200] mr-1'>Click to upload</span>
                  or drag and drop profile pic
                  <br />
                  SVG, PNG, JPG or GIF (max. 800 x 400px)
                </p>
              </label>
            )}
          </div>

          <h2 className='font-bold mb-4 uppercase text-sm'>Details</h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            {/* Title Field */}
            <div className='col-span-2'>
              <label className='block text-sm font-medium mb-1'>Title:</label>
              <input
                type='text'
                name='title'
                value={formData.title}
                onChange={handleChange}
                className='w-full bg-[#00000061] rounded-lg p-3 py-4 text-white resize-none'
                placeholder='Eric'
              />
            </div>

            {/* Date Field */}
            <div>
              <label className='block text-sm font-medium mb-1'>Date:</label>
              <input
                type='text'
                name='date'
                value={formData.date}
                onChange={handleChange}
                className='w-full bg-[#00000061] rounded-lg p-3 py-4 text-white resize-none'
                placeholder='Date'
              />
            </div>
          </div>

          {/* Body/Message Field */}
          <div className='mb-6'>
            <label className='block text-sm font-medium mb-1'>Body:</label>
            <textarea
              name='message'
              value={formData.message}
              onChange={handleChange}
              rows='6'
              className='w-full bg-[#00000061] rounded-lg p-3 py-4 text-white resize-none resize-none'
              placeholder='Message'
            />
          </div>
          {/* Action Buttons */}
          <div className='flex justify-center gap-4'>
            <button
              type='submit'
              className='text-white font-medium py-2 px-6 rounded transition duration-200'
              style={{
                background:
                  'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
            >
              Save News
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
