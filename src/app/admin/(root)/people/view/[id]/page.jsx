'use client'
import React, { use, useEffect, useState } from 'react'
import axios from 'axios'
import Loader from '../../../../../_components/Loader'
import { API_BASE_URL } from '../../../../../../constants'
import Link from 'next/link'
import { enqueueSnackbar } from 'notistack'
import useStore from '../../../../../../stores/useStore'
import { City, Country, State } from 'country-state-city'
import moment from 'moment'

export default function ViewPeoplePage({ params }) {
  const { id } = use(params)
  const { roles } = useStore()

  const [loading, setLoading] = useState(true)
  const [people, setPeople] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    nickname: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    role: '',
    about: '',
    isPremium: false,
    adminNotes: '',
    phoneNumber: '',
    country: '',
    state: '',
    postalCode: '',
    city: '',
    street1: '',
    street2: '',
    profilePhoto: null,
    createdAt: '',
    updatedAt: '',
    lastLogin: '',
  })

  const countries = Country.getAllCountries()
  const states = people.country ? State.getStatesOfCountry(people.country) : []
  const cities =
    people.country && people.state
      ? City.getCitiesOfState(people.country, people.state)
      : []

  const fetchPeopleDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/people/${id}`)
      const data = response.data.data
      const formattedDOB =
        data.dateOfBirth &&
        new Date(data.dateOfBirth).toISOString().split('T')[0]

      setPeople({
        firstName: data.firstName || '',
        middleName: data.middleName || '',
        lastName: data.lastName || '',
        suffix: data.suffix || '',
        nickname: data.nickname || '',
        email: data.email || '',
        gender: data.gender || '',
        dateOfBirth: formattedDOB || '',
        role: data.role || '',
        about: data.about || '',
        isPremium: data.isPremium || false,
        adminNotes: data.adminNotes || '',
        phoneNumber: data.phoneNumber || '',
        country: data.country || '',
        state: data.state || '',
        postalCode: data.postalCode || '',
        city: data.city || '',
        street1: data.street1 || '',
        street2: data.street2 || '',
        profilePhoto: data.profilePhoto || null,
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || '',
        lastLogin: data.lastLogin || '',
      })
    } catch (err) {
      console.log(err)
      enqueueSnackbar(err?.response?.data?.message, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPeopleDetails()
  }, [id])

  console.log('People:', people)

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
          <Link href='/admin/people'>
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
          <h1 className='text-2xl font-bold'>People Details</h1>
        </div>
        <form>
          {/* Image Upload */}
          <div className='mb-8'>
            {people.profilePhoto !== null ? (
              <div className='relative w-72 h-52 rounded-lg overflow-hidden border border-[#D9E2F930]'>
                <img
                  src={
                    typeof people.profilePhoto == 'string'
                      ? people.profilePhoto
                      : URL.createObjectURL(people.profilePhoto)
                  }
                  alt='Selected Profile'
                  className='w-full h-full object-cover'
                />
              </div>
            ) : (
              <div className='border-2 border-dashed border-gray-500 rounded-lg flex flex-col items-center justify-center w-72 h-52 relative overflow-hidden'>
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
                  No profile photo uploaded
                </p>
              </div>
            )}
          </div>

          {/* PERSONAL DETAILS */}
          <h2 className='font-bold mb-4 uppercase text-sm'>Personal Details</h2>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
            {/* First Name Field */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                First Name<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='firstName'
                value={people.firstName}
                className='w-full outline-none'
                required
                placeholder='Eric'
                readOnly
              />
            </div>

            {/* Middle Name Field */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>Middle</label>
              <input
                type='text'
                name='middleName'
                value={people.middleName}
                className='w-full outline-none'
                placeholder='M'
                readOnly
              />
            </div>

            {/* Last Name Field */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Last Name<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='lastName'
                value={people.lastName}
                className='w-full outline-none'
                required
                placeholder='Franks'
                readOnly
              />
            </div>

            {/* Suffix Field */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>Suffix</label>
              <input
                type='text'
                name='suffix'
                value={people.suffix}
                className='w-full outline-none'
                placeholder='Mr'
                readOnly
              />
            </div>

            {/* Nickname Field */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>Nickname</label>
              <input
                type='text'
                name='nickname'
                value={people.nickname}
                className='w-full outline-none'
                placeholder='Eric'
                readOnly
              />
            </div>

            {/* Email Address Field */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Email Address<span className='text-red-500'>*</span>
              </label>
              <input
                type='email'
                name='email'
                value={people.email}
                className='w-full outline-none'
                required
                placeholder='eric@gmail.com'
                readOnly
              />
            </div>

            {/* Phone Number Field */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Phone Number
              </label>
              <input
                type='text'
                name='phoneNumber'
                value={people.phoneNumber}
                className='w-full outline-none'
                readOnly
              />
            </div>

            {/* Gender Field */}
            <div className='mb-6 bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Gender<span className='text-red-500'>*</span>
              </label>
              <select
                name='gender'
                value={people.gender}
                className='w-full outline-none'
                required
                disabled
              >
                <option value='' className='text-black'>
                  Select Gender
                </option>
                <option value='Male' className='text-black'>
                  Male
                </option>
                <option value='Female' className='text-black'>
                  Female
                </option>
                <option value='Other' className='text-black'>
                  Other
                </option>
              </select>
            </div>

            {/* Date of Birth Field */}
            <div className='mb-6 bg-[#00000061] p-2 rounded'>
              <label className='text-white font-medium'>
                Date of Birth <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                name='dateOfBirth'
                value={people.dateOfBirth}
                className='w-full  text-white'
                required
                readOnly
              />
            </div>

            {/* Role Name Field */}
            <div className='mb-6 bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Role Name<span className='text-red-500'>*</span>
              </label>
              <select
                name='role'
                value={people.role}
                className='w-full outline-none'
                required
                disabled
              >
                <option value='' className='text-black'>
                  Select role
                </option>
                {roles.map((role) => (
                  <option
                    key={role?._id}
                    value={role.value}
                    className='text-black'
                  >
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* About Field */}
          <div className='mb-4 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>About</label>
            <textarea
              name='about'
              value={people.about}
              rows='2'
              className='w-full outline-none resize-none'
              placeholder='Message'
              readOnly
            />
          </div>

          {/* Admin Notes Field */}
          <div className='mb-8 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Admin Notes
            </label>
            <textarea
              name='adminNotes'
              value={people.adminNotes}
              rows='2'
              className='w-full outline-none resize-none'
              placeholder='Message'
              readOnly
            />
          </div>

          {/* Premium Profile Checkbox */}
          <div className='mb-4 flex items-center'>
            <input
              type='checkbox'
              id='isPremium'
              name='isPremium'
              checked={people.isPremium}
              className='mr-2'
              disabled
            />
            <label htmlFor='isPremium' className='text-sm'>
              Is Premium Profile?
            </label>
          </div>

          <div className='flex justify-between mb-4'>
            <h3>
              Created On: {moment(people.createdAt).format('DD/MM/YYYY HH:mm')}
            </h3>
            <h3>
              Updated On: {moment(people.updatedAt).format('DD/MM/YYYY HH:mm')}
            </h3>
            <h3>
              Last Login:
              {people.lastLogin
                ? moment(people.lastLogin).format('DD/MM/YYYY HH:mm')
                : 'N/A'}
            </h3>
          </div>

          {/* ADDRESS DETAILS */}
          <h2 className='font-bold mb-4 uppercase text-sm'>Address Details</h2>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
            {/* Country Field */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Country<span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <select
                  name='country'
                  value={people.country}
                  className='w-full outline-none appearance-none'
                  required
                  disabled
                >
                  <option value='' className='text-black'>
                    Select Country
                  </option>
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
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                State<span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <select
                  name='state'
                  value={people.state}
                  className='w-full outline-none appearance-none'
                  disabled
                >
                  <option value='' className='text-black'>
                    Select State
                  </option>
                  {states.map((state) => (
                    <option
                      key={state.isoCode}
                      value={state.isoCode}
                      className='text-black'
                    >
                      {state.name}
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

            {/* City Field */}
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='text-white font-medium'>
                City<span className='text-red-500'>*</span>
              </label>
              <select
                name='city'
                value={people.city}
                className='w-full outline-none bg-transparent text-white'
                required
                disabled
              >
                <option value=''>Select City</option>
                {cities.map((city) => (
                  <option
                    key={city.name}
                    value={city.name}
                    className='text-black'
                  >
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            {/* ZIP Code Field */}
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='text-white font-medium'>ZIP Code *</label>
              <input
                type='text'
                name='postalCode'
                value={people.postalCode}
                placeholder='Enter ZIP Code'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                readOnly
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
            {/* Street 1 Field */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>Street 1</label>
              <input
                type='text'
                name='street1'
                value={people.street1}
                className='w-full outline-none'
                readOnly
              />
            </div>

            {/* Street 2 Field */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>Street 2</label>
              <input
                type='text'
                name='street2'
                value={people.street2}
                className='w-full outline-none'
                readOnly
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
