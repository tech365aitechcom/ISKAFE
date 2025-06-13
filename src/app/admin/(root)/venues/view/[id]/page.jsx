'use client'
import React, { use, useEffect, useState } from 'react'
import axios from 'axios'
import Loader from '../../../../../_components/Loader'
import { API_BASE_URL } from '../../../../../../constants'
import Link from 'next/link'
import Image from 'next/image'
import { Country, State } from 'country-state-city'

export default function VieVenuePage({ params }) {
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [venue, setVenue] = useState(null)

  const countries = Country.getAllCountries()
  const states = venue?.address?.country
    ? State.getStatesOfCountry(venue?.address?.country)
    : []

  useEffect(() => {
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
    fetchVenue()
  }, [id])

  if (loading || !venue) return <Loader />

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
        <div className='w-full'>
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
            <h1 className='text-2xl font-bold'>Venue Details</h1>
          </div>
          {/* Image Display */}
          <form>
            <fieldset disabled>
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
                    placeholder='Enter venue name'
                    maxLength={100}
                    className='w-full bg-transparent outline-none'
                    required
                    readOnly
                  />
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
                      name='address.street1'
                      value={venue.address?.street1}
                      placeholder='123 Arena Road'
                      className='w-full bg-transparent outline-none'
                      readOnly
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
                      placeholder='Suite 402'
                      className='w-full bg-transparent outline-none'
                      readOnly
                    />
                  </div>

                  {/* City */}
                  <div className='bg-[#00000061] p-2 rounded'>
                    <label className='block text-sm font-medium mb-1'>
                      City<span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      name='address.city'
                      value={venue.address?.city}
                      placeholder='Los Angeles'
                      className='w-full bg-transparent outline-none'
                      required
                      readOnly
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {/* State/Province */}
                    <div className='bg-[#00000061] p-2 rounded'>
                      <label className='block text-sm font-medium mb-1'>
                        State / Province<span className='text-red-500'>*</span>
                      </label>
                      <select
                        name='address.state'
                        value={venue.address?.state}
                        className='w-full bg-transparent outline-none'
                        required
                        readOnly
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
                        ))}{' '}
                      </select>
                    </div>

                    {/* Country */}
                    <div className='bg-[#00000061] p-2 rounded'>
                      <label className='block text-sm font-medium mb-1'>
                        Country<span className='text-red-500'>*</span>
                      </label>
                      <select
                        name='address.country'
                        value={venue.address?.country}
                        className='w-full bg-transparent outline-none'
                        required
                        disabled
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
                      </select>
                    </div>
                  </div>

                  {/* ZIP/Postal Code */}
                  <div className='bg-[#00000061] p-2 rounded md:w-1/2'>
                    <label className='block text-sm font-medium mb-1'>
                      ZIP / Postal Code<span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      name='address.postalCode'
                      value={venue.address?.postalCode}
                      placeholder='90210'
                      className='w-full bg-transparent outline-none'
                      required
                      readOnly
                    />
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
                      name='contactName'
                      value={venue.contactName}
                      placeholder='John Doe'
                      maxLength={50}
                      className='w-full bg-transparent outline-none'
                      required
                      readOnly
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
                      placeholder='contact@venue.com'
                      className='w-full bg-transparent outline-none'
                      required
                      readOnly
                    />
                  </div>

                  {/* Contact Phone Number */}
                  <div className='bg-[#00000061] p-2 rounded'>
                    <label className='block text-sm font-medium mb-1'>
                      Contact Phone Number
                      <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      name='contactPhone'
                      value={venue.contactPhone}
                      placeholder='+1-555-123456'
                      className='w-full bg-transparent outline-none'
                      required
                      readOnly
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
                      placeholder='300'
                      min='1'
                      className='w-full bg-transparent outline-none'
                      required
                      readOnly
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
                      className='w-full bg-transparent outline-none'
                      required
                      readOnly
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
                    accept='.jpg,.jpeg,.png'
                    multiple
                    className='w-full bg-transparent outline-none'
                    readOnly
                  />
                  <p className='text-xs text-gray-400 mt-1'>
                    Max 5 MB image formats
                  </p>

                  {/* Preview uploaded images */}
                  {venue.media.length > 0 && (
                    <div className='mt-3 flex items-center gap-2'>
                      {venue.media.map((file, index) => (
                        <div className='relative' key={index}>
                          <Image
                            src={
                              typeof file === 'string'
                                ? file
                                : URL.createObjectURL(file)
                            }
                            alt={`Venue Media ${index + 1}`}
                            width={400}
                            height={400}
                            className='object-cover'
                          />
                          <button
                            type='button'
                            onClick={() => removeMedia(index)}
                            className='text-red-500 ml-2 absolute top-0 right-4'
                            title='Remove Image'
                          >
                            ×
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
                    placeholder='Paste Google Maps URL'
                    className='w-full bg-transparent outline-none'
                    readOnly
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
                      className='mr-2'
                      readOnly
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
                          className='w-full bg-transparent outline-none'
                          readOnly
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
                          min={new Date().toISOString().split('T')[0]}
                          className='w-full bg-transparent outline-none'
                          readOnly
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Admin Controls */}
              <div className='flex justify-center gap-4 mt-8'>
                <Link href='/admin/venues'>
                  <button
                    type='button'
                    className='bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded transition duration-200'
                  >
                    Cancel
                  </button>
                </Link>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  )
}
