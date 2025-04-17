'use client'
import React, { useState } from 'react'

export const AddPromoterForm = () => {
  const [formData, setFormData] = useState({
    promoterName: '',
    abbreviations: '',
    url: '',
    about: '',
    administration: '',
    phoneNumber: '',
    country: '',
    stateProvince: '',
    city: '',
    street1: '',
    street2: '',
    profilePic: null,
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
        profilePic: previewURL,
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
          <button className='text-white cursor-pointer'>
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
          <h1 className='text-xl font-medium'>New Promoter</h1>
        </div>

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

          {/* DETAILS Section */}
          <div className='mb-6'>
            <h2 className='text-sm font-bold mb-4'>DETAILS</h2>

            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4'>
              {/* Promoter Name Field */}
              <div>
                <label className='block text-xs font-medium mb-1'>
                  Promoter Name<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='promoterName'
                  value={formData.promoterName}
                  onChange={handleChange}
                  className='w-full bg-[#00000061] rounded-lg p-3 py-4 text-white'
                />
              </div>

              {/* Abbreviations Field */}
              <div>
                <label className='block text-xs font-medium mb-1'>
                  Abbreviations
                </label>
                <input
                  type='text'
                  name='abbreviations'
                  value={formData.abbreviations}
                  onChange={handleChange}
                  className='w-full bg-[#00000061] rounded-lg p-3 py-4 text-white'
                />
              </div>

              {/* URL Field */}
              <div>
                <label className='block text-xs font-medium mb-1'>URL</label>
                <input
                  type='text'
                  name='url'
                  value={formData.url}
                  onChange={handleChange}
                  className='w-full bg-[#00000061] rounded-lg p-3 py-4 text-white'
                />
              </div>
            </div>

            {/* About Field */}
            <div className='mb-2'>
              <label className='block text-xs font-medium mb-1'>About</label>
              <textarea
                name='about'
                value={formData.about}
                onChange={handleChange}
                rows='3'
                className='w-full bg-[#00000061] rounded-lg p-3 py-4 text-white resize-none'
              />
            </div>

            {/* URL Note */}
            <div className='mb-4'>
              <p className='text-xs text-gray-400'>
                Note: You MUST enter the full URL including the http or https
                prefix. E.g. 'https://example.com', not just 'example.com'
              </p>
            </div>
          </div>

          {/* ADMINISTRATION DETAILS Section */}
          <div className='mb-6'>
            <h2 className='text-sm font-bold mb-4'>ADMINISTRATION DETAILS</h2>

            {/* Administration Field */}
            <div className='mb-4'>
              <label className='block text-xs font-medium mb-1'>
                Administrations
              </label>
              <div className='relative mb-4'>
                <input
                  type='text'
                  name='administration'
                  placeholder='Start typing for person name'
                  value={formData.administration}
                  onChange={handleChange}
                  className='w-72 bg-[#00102F] rounded p-2 pl-8 text-white border border-[#131E3E]'
                />
                <div className='absolute left-2 top-3'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 text-gray-400'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4'>
              {/* Phone Number Field */}
              <div>
                <label className='block text-xs font-medium mb-1'>
                  Phone Number
                </label>
                <input
                  type='text'
                  name='phoneNumber'
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className='w-full bg-[#00000061] rounded-lg p-3 py-4 text-white'
                />
              </div>

              {/* Country Field */}
              <div>
                <label className='block text-xs font-medium mb-1'>
                  Country<span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <select
                    name='country'
                    value={formData.country}
                    onChange={handleChange}
                    className='w-full bg-[#00000061] rounded-lg p-3 py-4 text-white appearance-none'
                  >
                    <option value='United States'>United States</option>
                    <option value='Canada'>Canada</option>
                    <option value='UK'>UK</option>
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

              {/* State/Province Field */}
              <div>
                <label className='block text-xs font-medium mb-1'>
                  State/Province<span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <select
                    name='stateProvince'
                    value={formData.stateProvince}
                    onChange={handleChange}
                    className='w-full bg-[#00000061] rounded-lg p-3 py-4 text-white appearance-none'
                  >
                    <option value='United States'>United States</option>
                    <option value='Other'>Other</option>
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

              {/* City Field */}
              <div>
                <label className='block text-xs font-medium mb-1'>
                  City<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='city'
                  value={formData.city}
                  onChange={handleChange}
                  className='w-full bg-[#00000061] rounded-lg p-3 py-4 text-white'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
              {/* Street 1 Field */}
              <div>
                <label className='block text-xs font-medium mb-1'>
                  Street 1
                </label>
                <input
                  type='text'
                  name='street1'
                  value={formData.street1}
                  onChange={handleChange}
                  className='w-full bg-[#00000061] rounded-lg p-3 py-4 text-white'
                />
              </div>

              {/* Street 2 Field */}
              <div>
                <label className='block text-xs font-medium mb-1'>
                  Street 2
                </label>
                <input
                  type='text'
                  name='street2'
                  value={formData.street2}
                  onChange={handleChange}
                  className='w-full bg-[#00000061] rounded-lg p-3 py-4 text-white'
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className='flex justify-center gap-4'>
            <button
              type='submit'
              className='text-white font-medium py-2 px-6 rounded transition duration-200'
              style={{
                background:
                  'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
            >
              Save Promoter
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
