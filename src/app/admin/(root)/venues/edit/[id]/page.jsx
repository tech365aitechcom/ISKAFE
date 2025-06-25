'use client'
import React, { use, useEffect, useState } from 'react'
import axios from 'axios'
import Loader from '../../../../../_components/Loader'
import { API_BASE_URL, apiConstants } from '../../../../../../constants'
import Link from 'next/link'
import { enqueueSnackbar } from 'notistack'
import useStore from '../../../../../../stores/useStore'
import { uploadToS3 } from '../../../../../../utils/uploadToS3'
import { Country, State } from 'country-state-city'
import { Trash } from 'lucide-react'

export default function EditVenuePage({ params }) {
  const { id } = use(params)
  const { user } = useStore()

  const [loading, setLoading] = useState(true)
  const [venue, setVenue] = useState({
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

  const countries = Country.getAllCountries()
  const states = venue?.address?.country
    ? State.getStatesOfCountry(venue?.address?.country)
    : []

  const fetchVenue = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/venues/${id}`)
      console.log('Fetched venue data:', response.data)

      const data = response.data
      setVenue({
        name: data.name || '',
        address: {
          street1: data.address?.street1 || '',
          street2: data.address?.street2 || '',
          city: data.address?.city || '',
          state: data.address?.state || '',
          postalCode: data.address?.postalCode || '',
          country: data.address?.country || '',
        },
        contactName: data.contactName || '',
        contactPhone: data.contactPhone || '',
        contactEmail: data.contactEmail || '',
        capacity: data.capacity || '',
        mapLink: data.mapLink || '',
        media: data.media || [],
        status: data.status || 'Active',
        autoStatusChange: data.autoStatusChange || false,
        scheduledStatus: data.scheduledStatus || '',
        statusChangeDate: data.statusChangeDate || '',
      })
    } catch (err) {
      console.error('Error fetching venue:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVenue()
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target

    // Handle nested address fields
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setVenue((prevState) => ({
        ...prevState,
        address: {
          ...prevState.address,
          [addressField]: type === 'checkbox' ? checked : value,
        },
      }))

      return
    }

    // Handle file uploads for media
    if (name === 'media' && files && files.length > 0) {
      // Create a copy of the current media array
      const updatedMedia = [...venue.media]
      // Add the new files
      for (let i = 0; i < files.length; i++) {
        updatedMedia.push(files[i])
      }

      setVenue((prevState) => ({
        ...prevState,
        media: updatedMedia,
      }))
      return
    }

    // Handle regular fields
    const newValue = type === 'checkbox' ? checked : value

    setVenue((prevState) => ({
      ...prevState,
      [name]: newValue,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const uploadedMediaUrls = []

    for (const image of venue.media) {
      if (typeof image !== 'string') {
        const s3UploadedUrl = await uploadToS3(image)
        uploadedMediaUrls.push(s3UploadedUrl)
      } else {
        uploadedMediaUrls.push(image)
      }
    }

    venue.media = uploadedMediaUrls

    const response = await axios.put(`${API_BASE_URL}/venues/${id}`, venue, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    })

    if (response.status === apiConstants.success) {
      enqueueSnackbar(response.data.message, { variant: 'success' })
    }
  }

  const removeMedia = (index) => {
    const updatedMedia = [...venue.media]
    updatedMedia.splice(index, 1)
    setVenue((prev) => ({ ...prev, media: updatedMedia }))
  }

  if (loading) return <Loader />

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
        <div className='flex items-center gap-4 mb-6'>
          <Link href='/admin/venues'>
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
          <h1 className='text-2xl font-bold'>Venue Editor</h1>
        </div>{' '}
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
                value={venue.name}
                onChange={handleChange}
                placeholder='Enter venue name'
                maxLength={100}
                className='w-full bg-transparent outline-none'
                required
              />
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
                  value={venue.address?.street1}
                  onChange={handleChange}
                  placeholder='123 Arena Road'
                  className='w-full bg-transparent outline-none'
                  required
                />
              </div>
              {/* Street 2 */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  Street 2 (Optional)
                </label>
                <input
                  type='text'
                  name='address.street2'
                  value={venue.address?.street2}
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
                  value={venue.address?.country}
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
              </div>
              {/* State/Province */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  State / Province<span className='text-red-500'>*</span>
                </label>
                <select
                  name='address.state'
                  value={venue.address?.state}
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
              </div>{' '}
              {/* City */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  City<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='address.city'
                  value={venue.address?.city}
                  onChange={handleChange}
                  placeholder='Los Angeles'
                  className='w-full bg-transparent outline-none'
                  required
                />
              </div>
              {/* ZIP/Postal Code */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  ZIP / Postal Code<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='address.postalCode'
                  value={venue.address?.postalCode}
                  onChange={handleChange}
                  placeholder='90210'
                  className='w-full bg-transparent outline-none'
                  required
                />
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
                  value={venue.contactName}
                  onChange={handleChange}
                  placeholder='John Doe'
                  maxLength={50}
                  className='w-full bg-transparent outline-none'
                  required
                />
              </div>

              {/* Contact Email */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  Contact Email<span className='text-red-500'>*</span>
                </label>
                <input
                  type='email'
                  name='contactEmail'
                  value={venue.contactEmail}
                  onChange={handleChange}
                  placeholder='contact@venue.com'
                  className='w-full bg-transparent outline-none'
                  required
                />
              </div>

              {/* Contact Phone Number */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  Contact Phone Number<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='contactPhone'
                  value={venue.contactPhone}
                  onChange={handleChange}
                  placeholder='+1-555-123456'
                  className='w-full bg-transparent outline-none'
                  required
                />
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
                  value={venue.capacity}
                  onChange={handleChange}
                  placeholder='300'
                  min='1'
                  className='w-full bg-transparent outline-none'
                  required
                />
              </div>

              {/* Status */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  Status<span className='text-red-500'>*</span>
                </label>
                <select
                  name='status'
                  value={venue.status}
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

              {/* Preview uploaded images */}
              {venue.media.length > 0 && (
                <div className='mt-3 flex items-center flex-wrap gap-4'>
                  {venue.media.map((file, index) => (
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
                value={venue.mapLink}
                onChange={handleChange}
                placeholder='Paste Google Maps URL'
                className='w-full bg-transparent outline-none'
              />
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
                  checked={venue.autoStatusChange}
                  onChange={handleChange}
                  className='mr-2'
                />
                <label className='text-sm font-medium'>
                  Enable status scheduling
                </label>
              </div>

              {venue.autoStatusChange && (
                <>
                  {/* Scheduled Status */}
                  <div className='bg-[#00000061] p-2 rounded'>
                    <label className='block text-sm font-medium mb-1'>
                      Scheduled Status
                    </label>
                    <select
                      name='scheduledStatus'
                      value={venue.scheduledStatus}
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
                      value={venue.statusChangeDate}
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
            <Link href='/admin/venues'>
              <button
                type='button'
                className='bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded transition duration-200'
              >
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
