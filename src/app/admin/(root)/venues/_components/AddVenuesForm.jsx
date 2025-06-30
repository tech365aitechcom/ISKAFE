'use client'
import axios from 'axios'
import { enqueueSnackbar } from 'notistack'
import React, { useState } from 'react'
import { Country, State } from 'country-state-city'
import { uploadToS3 } from '../../../../../utils/uploadToS3'
import useStore from '../../../../../stores/useStore'
import { API_BASE_URL, apiConstants } from '../../../../../constants'
import { Trash } from 'lucide-react'
import Loader from '../../../../_components/Loader'
import { useRouter } from 'next/navigation'

export const AddVenuesForm = ({
  setShowAddVenueForm,
  showBackButton = true,
  redirectOrigin = '',
}) => {
  const user = useStore((state) => state.user)
  const [formData, setFormData] = useState({
    name: '',

    address: {
      street1: '',
      street2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
    },

    contactName: '',
    contactPhone: '',
    contactEmail: '',

    capacity: '',
    mapLink: '',

    media: [],

    status: 'Active',
    autoStatusChange: false,
    scheduledStatus: '',
    statusChangeDate: '',
  })
  const router = useRouter()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const countries = Country.getAllCountries()
  const states = formData.address.country
    ? State.getStatesOfCountry(formData.address.country)
    : []

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
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
      case 'postalCode':
        return value.trim() === '' ? 'ZIP code is required' : ''
      case 'contactName':
        return value.trim() === ''
          ? 'Contact person name is required'
          : value.length > 50
          ? 'Maximum 50 characters allowed'
          : ''
      case 'contactEmail':
        return value.trim() === '' ? 'Email is required' : ''
      case 'contactPhone':
        return value.trim() === '' ? 'Phone number is required' : ''
      case 'capacity':
        return value.trim() === ''
          ? 'Capacity is required'
          : isNaN(value) || parseInt(value) <= 0
          ? 'Enter a positive number'
          : ''
      case 'status':
        return value.trim() === '' ? 'Status is required' : ''
      case 'mapLink':
        if (value.trim() !== '' && !value.startsWith('https://')) {
          return 'Enter a valid URL'
        }
        return ''
      case 'media':
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

    // Handle nested address fields
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setFormData((prevState) => ({
        ...prevState,
        address: {
          ...prevState.address,
          [addressField]: type === 'checkbox' ? checked : value,
        },
      }))

      // Validate nested address fields
      const error = validateField(addressField, value)
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }))
      return
    }

    // Handle file uploads for media
    if (name === 'media' && files && files.length > 0) {
      // Create a copy of the current media array
      const updatedMedia = [...formData.media]
      // Add the new files
      for (let i = 0; i < files.length; i++) {
        updatedMedia.push(files[i])
      }

      setFormData((prevState) => ({
        ...prevState,
        media: updatedMedia,
      }))
      return
    }

    // Handle regular fields
    const newValue = type === 'checkbox' ? checked : value

    setFormData((prevState) => ({
      ...prevState,
      [name]: newValue,
    }))

    // Validate field
    const error = validateField(name, newValue)
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    let isValid = true

    // Validate main fields
    const mainFields = [
      'name',
      'contactName',
      'contactEmail',
      'contactPhone',
      'capacity',
      'status',
    ]
    mainFields.forEach((field) => {
      const error = validateField(field, formData[field])
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    })

    // Validate address fields
    const addressFields = ['street1', 'city', 'state', 'postalCode', 'country']
    addressFields.forEach((field) => {
      const error = validateField(field, formData.address[field])
      if (error) {
        newErrors[`address.${field}`] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const validateName = (name) => /^[A-Za-z\s'-]+$/.test(name)
  const validatePhoneNumber = (number) => /^\+?[0-9]{10,15}$/.test(number)
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validateCity = (name) => /^[A-Za-z\s'-]+$/.test(name)
  const validPostalCode = (postalCode) => /^\d+$/.test(postalCode)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateName(formData.name)) {
      enqueueSnackbar(
        'Name can only contain letters, spaces, apostrophes, or hyphens.',
        { variant: 'warning' }
      )
      setIsSubmitting(false)
      return
    }
    if (!validateName(formData.contactName)) {
      enqueueSnackbar(
        'Contact Person Name can only contain letters, spaces, apostrophes, or hyphens.',
        { variant: 'warning' }
      )
      setIsSubmitting(false)
      return
    }
    if (!validateEmail(formData.contactEmail)) {
      enqueueSnackbar('Please enter a valid email address.', {
        variant: 'warning',
      })
      setIsSubmitting(false)
      return
    }
    if (!validatePhoneNumber(formData.contactPhone)) {
      enqueueSnackbar('Please enter a valid phone number.', {
        variant: 'warning',
      })
      setIsSubmitting(false)
      return
    }
    if (!validPostalCode(formData.address.postalCode)) {
      enqueueSnackbar('Please enter a valid postal code.', {
        variant: 'warning',
      })
      setIsSubmitting(false)
      return
    }
    if (!validateCity(formData.address.city)) {
      enqueueSnackbar(
        'Please enter a valid city,can only contain letters, spaces, apostrophes, or hyphens.',
        {
          variant: 'warning',
        }
      )
      setIsSubmitting(false)
      return
    }
    try {
      if (validateForm()) {
        const uploadedMediaUrls = []

        for (const image of formData.media) {
          const s3UploadedUrl = await uploadToS3(image)
          uploadedMediaUrls.push(s3UploadedUrl)
        }

        formData.media = uploadedMediaUrls

        const response = await axios.post(`${API_BASE_URL}/venues`, formData, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        })

        if (response.status === apiConstants.create) {
          enqueueSnackbar(response.data.message, { variant: 'success' })
          setFormData({
            name: '',
            address: {
              street1: '',
              street2: '',
              city: '',
              state: '',
              postalCode: '',
              country: '',
            },
            contactName: '',
            contactPhone: '',
            contactEmail: '',
            capacity: '',
            mapLink: '',
            media: [],
            status: 'Active',
            autoStatusChange: false,
            scheduledStatus: '',
            statusChangeDate: '',
          })
          if (redirectOrigin == 'addEvent') {
            router.push('/admin/events?redirectOrigin=addVenue')
          }
        }
      } else {
        console.log('Form has errors')
      }
    } catch (error) {}
  }

  const handleCancel = () => {
    if (redirectOrigin == 'addEvent') {
      router.push('/admin/events?redirectOrigin=addVenue')
    } else {
      setShowAddVenueForm(false)
    }
    setFormData({
      name: '',
      address: {
        street1: '',
        street2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States',
      },
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      capacity: '',
      mapLink: '',
      media: [],
      status: 'Active',
      autoStatusChange: false,
      scheduledStatus: '',
      statusChangeDate: '',
    })
  }

  const removeMedia = (index) => {
    const updatedMedia = [...formData.media]
    updatedMedia.splice(index, 1)
    setFormData((prev) => ({ ...prev, media: updatedMedia }))
  }

  return (
    <div className='min-h-screen text-white w-full'>
      <div className='w-full'>
        {/* Header with back button */}
        <div className='flex items-center gap-4 mb-6'>
          {showBackButton && (
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
                name='name'
                value={formData.name}
                onChange={handleChange}
                placeholder='Enter venue name'
                maxLength={100}
                className='w-full bg-transparent outline-none'
                required
              />
              {errors.name && (
                <p className='text-red-500 text-xs mt-1'>{errors.name}</p>
              )}
            </div>
          </div>

          {/* Address Info Section */}
          <div className='mb-6'>
            <h2 className='text-lg font-semibold mb-3'>Address Info</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Street 1 */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  Street 1<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='address.street1'
                  value={formData.address.street1}
                  onChange={handleChange}
                  placeholder='123 Arena Road'
                  className='w-full bg-transparent outline-none'
                  required
                />
                {errors['address.street1'] && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors['address.street1']}
                  </p>
                )}
              </div>

              {/* Street 2 */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  Street 2 (Optional)
                </label>
                <input
                  type='text'
                  name='address.street2'
                  value={formData.address.street2}
                  onChange={handleChange}
                  placeholder='Suite 402'
                  className='w-full bg-transparent outline-none'
                />
              </div>

              {/* Country */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  Country<span className='text-red-500'>*</span>
                </label>
                <select
                  name='address.country'
                  value={formData.address.country}
                  onChange={handleChange}
                  className='w-full bg-transparent outline-none'
                  required
                >
                  {countries.map((country) => (
                    <option
                      key={country.isoCode}
                      value={country.isoCode}
                      className='text-black'
                    >
                      {country.name}
                    </option>
                  ))}

                  {/* Add more countries as needed */}
                </select>
                {errors['address.country'] && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors['address.country']}
                  </p>
                )}
              </div>
              {/* State/Province */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  State / Province<span className='text-red-500'>*</span>
                </label>
                <select
                  name='address.state'
                  value={formData.address.state}
                  onChange={handleChange}
                  className='w-full bg-transparent outline-none'
                  required
                >
                  <option value='' className='text-black'>
                    Select State
                  </option>
                  {states.map((state) => (
                    <option
                      key={state.isoCode}
                      value={state.name}
                      className='text-black'
                    >
                      {state.name}
                    </option>
                  ))}
                </select>
                {errors['address.state'] && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors['address.state']}
                  </p>
                )}
              </div>

              {/* City */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  City<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='address.city'
                  value={formData.address.city}
                  onChange={handleChange}
                  placeholder='Los Angeles'
                  className='w-full bg-transparent outline-none'
                  required
                />
                {errors['address.city'] && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors['address.city']}
                  </p>
                )}
              </div>
              {/* ZIP/Postal Code */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  ZIP / Postal Code<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='address.postalCode'
                  value={formData.address.postalCode}
                  onChange={handleChange}
                  placeholder='90210'
                  className='w-full bg-transparent outline-none'
                  required
                />
                {errors['address.postalCode'] && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors['address.postalCode']}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className='mb-6'>
            <h2 className='text-lg font-semibold mb-3'>Contact Info</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Contact Person Name */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  Contact Person Name<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='contactName'
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder='John Doe'
                  maxLength={50}
                  className='w-full bg-transparent outline-none'
                  required
                />
                {errors.contactName && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors.contactName}
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
                  name='contactPhone'
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder='+1-555-123456'
                  className='w-full bg-transparent outline-none'
                  required
                />
                {errors.contactPhone && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors.contactPhone}
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
                name='media'
                onChange={handleChange}
                accept='.jpg,.jpeg,.png'
                multiple
                className='w-full outline-none bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700'
              />
              <p className='text-xs text-gray-400 mt-1'>
                Max 5 MB image formats
              </p>
              {errors.media && (
                <p className='text-red-500 text-xs mt-1'>{errors.media}</p>
              )}

              {/* Preview uploaded images */}
              {formData.media.length > 0 && (
                <div className='mt-3 flex items-center flex-wrap gap-4'>
                  {formData.media.map((file, index) => (
                    <div
                      key={index}
                      className='relative w-44 h-44 rounded overflow-hidden'
                    >
                      <img
                        src={
                          typeof file !== 'string'
                            ? URL.createObjectURL(file)
                            : file
                        }
                        alt={`Media ${index + 1}`}
                        className='w-full h-full object-cover rounded'
                      />
                      <button
                        type='button'
                        onClick={() => removeMedia(index)}
                        className='absolute top-1 right-1 bg-opacity-50 text-red rounded-full w-6 h-6 flex items-center justify-center text-sm'
                      >
                        <Trash size={16} color='red' />
                      </button>
                    </div>
                  ))}
                </div>
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
                name='mapLink'
                value={formData.mapLink}
                onChange={handleChange}
                placeholder='Paste Google Maps URL'
                className='w-full bg-transparent outline-none'
              />
              {errors.mapLink && (
                <p className='text-red-500 text-xs mt-1'>{errors.mapLink}</p>
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
                      <option value='Active' className='text-black'>
                        Active
                      </option>
                      <option value='Inactive' className='text-black'>
                        Inactive
                      </option>
                      <option value='Cancelled' className='text-black'>
                        Cancelled
                      </option>
                      <option value='Upcoming' className='text-black'>
                        Upcoming
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
              {isSubmitting ? <Loader /> : 'Save'}
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
