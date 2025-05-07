'use client'
import React, { useState } from 'react'

export const AddVenuesForm = ({ setShowAddVenues, showBackButton = true }) => {
  const [formData, setFormData] = useState({
    // Basic Info
    venueName: '',
    duplicateCheck: true,

    // Address Info
    street1: '',
    street2: '',
    city: '',
    state: '',
    country: 'United States',
    zipCode: '',

    // Contact Info
    contactPersonName: '',
    contactEmail: '',
    contactPhoneNumber: '',

    // Venue Details
    capacity: '',
    status: 'Active',

    // Media
    uploadImages: null,

    // Map
    mapLocationLink: '',

    // Status Scheduler
    autoStatusChange: false,
    scheduledStatus: '',
    statusChangeDate: '',
  })

  const [errors, setErrors] = useState({})

  const validateField = (name, value) => {
    switch (name) {
      case 'venueName':
        return value.trim() === ''
          ? 'Venue name is required'
          : value.length > 100
          ? 'Maximum 100 characters allowed'
          : ''
      case 'street1':
        return value.trim() === '' ? 'Street address is required' : ''
      case 'city':
        return value.trim() === '' ? 'City is required' : ''
      case 'state':
        return value.trim() === '' ? 'State is required' : ''
      case 'country':
        return value.trim() === '' ? 'Country is required' : ''
      case 'zipCode':
        return value.trim() === ''
          ? 'ZIP code is required'
          : !/^\d{5}(-\d{4})?$/.test(value)
          ? 'Enter a valid ZIP code'
          : ''
      case 'contactPersonName':
        return value.trim() === ''
          ? 'Contact person name is required'
          : value.length > 50
          ? 'Maximum 50 characters allowed'
          : ''
      case 'contactEmail':
        return value.trim() === ''
          ? 'Email is required'
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? 'Enter a valid email address'
          : ''
      case 'contactPhoneNumber':
        return value.trim() === ''
          ? 'Phone number is required'
          : !/^\+\d{1,3}-\d{3,}-\d{3,}$/.test(value)
          ? 'Enter a valid phone number format'
          : ''
      case 'capacity':
        return value.trim() === ''
          ? 'Capacity is required'
          : isNaN(value) || parseInt(value) <= 0
          ? 'Enter a positive number'
          : ''
      case 'status':
        return value.trim() === '' ? 'Status is required' : ''
      case 'mapLocationLink':
        if (value.trim() !== '' && !value.startsWith('https://')) {
          return 'Enter a valid URL'
        }
        return ''
      case 'uploadImages':
        if (value && value.size > 5 * 1024 * 1024) {
          return 'Image must be less than 5MB'
        }
        return ''
      default:
        return ''
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    const newValue =
      type === 'checkbox' ? checked : type === 'file' ? files[0] || null : value

    setFormData((prevState) => ({
      ...prevState,
      [name]: newValue,
    }))

    // Validate field if it's required
    if (
      [
        'venueName',
        'street1',
        'city',
        'state',
        'country',
        'zipCode',
        'contactPersonName',
        'contactEmail',
        'contactPhoneNumber',
        'capacity',
        'status',
      ].includes(name)
    ) {
      const error = validateField(name, newValue)
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    let isValid = true

    // Validate all required fields
    Object.keys(formData).forEach((field) => {
      if (
        [
          'venueName',
          'street1',
          'city',
          'state',
          'country',
          'zipCode',
          'contactPersonName',
          'contactEmail',
          'contactPhoneNumber',
          'capacity',
          'status',
        ].includes(field)
      ) {
        const error = validateField(field, formData[field])
        if (error) {
          newErrors[field] = error
          isValid = false
        }
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      // Handle form submission logic here
      console.log('Form submitted:', formData)
      // You would typically send this data to an API endpoint
    } else {
      console.log('Form has errors')
    }
  }

  const handleCancel = () => {
    setFormData({
      venueName: '',
      duplicateCheck: true,
      street1: '',
      street2: '',
      city: '',
      state: '',
      country: 'United States',
      zipCode: '',
      contactPersonName: '',
      contactEmail: '',
      contactPhoneNumber: '',
      capacity: '',
      status: 'Active',
      uploadImages: null,
      mapLocationLink: '',
      autoStatusChange: false,
      scheduledStatus: '',
      statusChangeDate: '',
    })
    setShowAddVenues(false)
  }

  return (
    <div className='min-h-screen text-white w-full'>
      <div className='w-full'>
        {/* Header with back button */}
        <div className='flex items-center gap-4 mb-6'>
          {showBackButton && (
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
          )}
          <h1 className='text-2xl font-bold'>Add New Venue</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Basic Info Section */}
          <div className='mb-6'>
            <h2 className='text-lg font-semibold mb-3'>Basic Info</h2>
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
                placeholder='Enter venue name'
                maxLength={100}
                className='w-full bg-transparent outline-none'
                required
              />
              {errors.venueName && (
                <p className='text-red-500 text-xs mt-1'>{errors.venueName}</p>
              )}
            </div>

            {/* Duplicate Venue Check */}
            <div className='flex items-center pt-4'>
              <input
                type='checkbox'
                name='duplicateCheck'
                checked={formData.duplicateCheck}
                onChange={handleChange}
                className='mr-2'
              />
              <label className='text-sm font-medium'>
                Duplicate Venue Check
              </label>
            </div>
          </div>

          {/* Address Info Section */}
          <div className='mb-6'>
            <h2 className='text-lg font-semibold mb-3'>Address Info</h2>
            <div className='grid grid-cols-1 gap-4'>
              {/* Street 1 */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  Street 1<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='street1'
                  value={formData.street1}
                  onChange={handleChange}
                  placeholder='123 Arena Road'
                  className='w-full bg-transparent outline-none'
                  required
                />
                {errors.street1 && (
                  <p className='text-red-500 text-xs mt-1'>{errors.street1}</p>
                )}
              </div>

              {/* Street 2 */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  Street 2 (Optional)
                </label>
                <input
                  type='text'
                  name='street2'
                  value={formData.street2}
                  onChange={handleChange}
                  placeholder='Suite 402'
                  className='w-full bg-transparent outline-none'
                />
              </div>

              {/* City */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  City<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='city'
                  value={formData.city}
                  onChange={handleChange}
                  placeholder='Los Angeles'
                  className='w-full bg-transparent outline-none'
                  required
                />
                {errors.city && (
                  <p className='text-red-500 text-xs mt-1'>{errors.city}</p>
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* State/Province */}
                <div className='bg-[#00000061] p-2 rounded'>
                  <label className='block text-sm font-medium mb-1'>
                    State / Province<span className='text-red-500'>*</span>
                  </label>
                  <select
                    name='state'
                    value={formData.state}
                    onChange={handleChange}
                    className='w-full bg-transparent outline-none'
                    required
                  >
                    <option value='' className='text-black'>
                      Select State
                    </option>
                    <option value='AL' className='text-black'>
                      Alabama
                    </option>
                    <option value='AK' className='text-black'>
                      Alaska
                    </option>
                    <option value='AZ' className='text-black'>
                      Arizona
                    </option>
                    <option value='CA' className='text-black'>
                      California
                    </option>
                    {/* Add more states as needed */}
                  </select>
                  {errors.state && (
                    <p className='text-red-500 text-xs mt-1'>{errors.state}</p>
                  )}
                </div>

                {/* Country */}
                <div className='bg-[#00000061] p-2 rounded'>
                  <label className='block text-sm font-medium mb-1'>
                    Country<span className='text-red-500'>*</span>
                  </label>
                  <select
                    name='country'
                    value={formData.country}
                    onChange={handleChange}
                    className='w-full bg-transparent outline-none'
                    required
                  >
                    <option value='United States' className='text-black'>
                      United States
                    </option>
                    <option value='Canada' className='text-black'>
                      Canada
                    </option>
                    {/* Add more countries as needed */}
                  </select>
                  {errors.country && (
                    <p className='text-red-500 text-xs mt-1'>
                      {errors.country}
                    </p>
                  )}
                </div>
              </div>

              {/* ZIP/Postal Code */}
              <div className='bg-[#00000061] p-2 rounded md:w-1/2'>
                <label className='block text-sm font-medium mb-1'>
                  ZIP / Postal Code<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='zipCode'
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder='90210'
                  className='w-full bg-transparent outline-none'
                  required
                />
                {errors.zipCode && (
                  <p className='text-red-500 text-xs mt-1'>{errors.zipCode}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className='mb-6'>
            <h2 className='text-lg font-semibold mb-3'>Contact Info</h2>
            <div className='grid grid-cols-1 gap-4'>
              {/* Contact Person Name */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  Contact Person Name<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='contactPersonName'
                  value={formData.contactPersonName}
                  onChange={handleChange}
                  placeholder='John Doe'
                  maxLength={50}
                  className='w-full bg-transparent outline-none'
                  required
                />
                {errors.contactPersonName && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors.contactPersonName}
                  </p>
                )}
              </div>

              {/* Contact Email */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  Contact Email<span className='text-red-500'>*</span>
                </label>
                <input
                  type='email'
                  name='contactEmail'
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder='contact@venue.com'
                  className='w-full bg-transparent outline-none'
                  required
                />
                {errors.contactEmail && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors.contactEmail}
                  </p>
                )}
              </div>

              {/* Contact Phone Number */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  Contact Phone Number<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='contactPhoneNumber'
                  value={formData.contactPhoneNumber}
                  onChange={handleChange}
                  placeholder='+1-555-123456'
                  className='w-full bg-transparent outline-none'
                  required
                />
                {errors.contactPhoneNumber && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors.contactPhoneNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Venue Details Section */}
          <div className='mb-6'>
            <h2 className='text-lg font-semibold mb-3'>Venue Details</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Capacity */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  Capacity<span className='text-red-500'>*</span>
                </label>
                <input
                  type='number'
                  name='capacity'
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder='300'
                  min='1'
                  className='w-full bg-transparent outline-none'
                  required
                />
                {errors.capacity && (
                  <p className='text-red-500 text-xs mt-1'>{errors.capacity}</p>
                )}
              </div>

              {/* Status */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  Status<span className='text-red-500'>*</span>
                </label>
                <select
                  name='status'
                  value={formData.status}
                  onChange={handleChange}
                  className='w-full bg-transparent outline-none'
                  required
                >
                  <option value='Active' className='text-black'>
                    Active
                  </option>
                  <option value='Inactive' className='text-black'>
                    Inactive
                  </option>
                  <option value='Upcoming' className='text-black'>
                    Upcoming
                  </option>
                  <option value='Cancelled' className='text-black'>
                    Cancelled
                  </option>
                </select>
                {errors.status && (
                  <p className='text-red-500 text-xs mt-1'>{errors.status}</p>
                )}
              </div>
            </div>
          </div>

          {/* Media Section */}
          <div className='mb-6'>
            <h2 className='text-lg font-semibold mb-3'>Media</h2>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Upload Images (Optional)
              </label>
              <input
                type='file'
                name='uploadImages'
                onChange={handleChange}
                accept='.jpg,.jpeg,.png'
                className='w-full bg-transparent outline-none'
              />
              <p className='text-xs text-gray-400 mt-1'>
                Max 5 MB image formats
              </p>
              {errors.uploadImages && (
                <p className='text-red-500 text-xs mt-1'>
                  {errors.uploadImages}
                </p>
              )}
            </div>
          </div>

          {/* Map Section */}
          <div className='mb-6'>
            <h2 className='text-lg font-semibold mb-3'>Map</h2>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Map Location Link (Optional)
              </label>
              <input
                type='url'
                name='mapLocationLink'
                value={formData.mapLocationLink}
                onChange={handleChange}
                placeholder='Paste Google Maps URL'
                className='w-full bg-transparent outline-none'
              />
              {errors.mapLocationLink && (
                <p className='text-red-500 text-xs mt-1'>
                  {errors.mapLocationLink}
                </p>
              )}
            </div>
          </div>

          {/* Status Scheduler Section */}
          <div className='mb-6'>
            <h2 className='text-lg font-semibold mb-3'>Status Scheduler</h2>
            <div className='grid grid-cols-1 gap-4'>
              {/* Auto Status Change */}
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  name='autoStatusChange'
                  checked={formData.autoStatusChange}
                  onChange={handleChange}
                  className='mr-2'
                />
                <label className='text-sm font-medium'>
                  Enable status scheduling
                </label>
              </div>

              {formData.autoStatusChange && (
                <>
                  {/* Scheduled Status */}
                  <div className='bg-[#00000061] p-2 rounded'>
                    <label className='block text-sm font-medium mb-1'>
                      Scheduled Status
                    </label>
                    <select
                      name='scheduledStatus'
                      value={formData.scheduledStatus}
                      onChange={handleChange}
                      className='w-full bg-transparent outline-none'
                    >
                      <option value='' className='text-black'>
                        Select Status
                      </option>
                      <option value='Cancelled' className='text-black'>
                        Cancelled
                      </option>
                      <option value='Archived' className='text-black'>
                        Archived
                      </option>
                    </select>
                  </div>

                  {/* Status Change Date */}
                  <div className='bg-[#00000061] p-2 rounded'>
                    <label className='block text-sm font-medium mb-1'>
                      Status Change Date
                    </label>
                    <input
                      type='date'
                      name='statusChangeDate'
                      value={formData.statusChangeDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className='w-full bg-transparent outline-none'
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Admin Controls */}
          <div className='flex justify-center gap-4 mt-8'>
            <button
              type='submit'
              className='bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded transition duration-200'
            >
              Save
            </button>
            <button
              type='button'
              onClick={handleCancel}
              className='bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded transition duration-200'
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
