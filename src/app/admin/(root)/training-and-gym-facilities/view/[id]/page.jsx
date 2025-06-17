'use client'
import React, { use, useEffect, useState } from 'react'
import axios from 'axios'
import Loader from '../../../../../_components/Loader'
import { API_BASE_URL } from '../../../../../../constants'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { City, Country, State } from 'country-state-city'

const steps = [
  { id: 1, label: 'Basic Info & Address' },
  { id: 2, label: 'Description & Media' },
  { id: 3, label: 'Team Members' },
]

export default function ViewTrainingFacilityPage({ params }) {
  const { id } = use(params)

  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    logo: null,
    martialArtsStyles: [],
    email: '',
    phoneNumber: '',
    // Address Info
    address: '',
    country: '',
    state: '',
    city: '',

    // Description & Branding
    description: '',
    externalWebsite: '',
    imageGallery: [],
    videoIntroduction: '',

    // Trainers & Fighters
    trainers: [],
    fighters: [],
    sendInvites: false,

    // Terms
    termsAgreed: false,
  })

  const martialArtsOptions = [
    'Kickboxing',
    'MMA',
    'Muay Thai',
    'BJJ',
    'Boxing',
    'Karate',
    'Taekwondo',
    'Judo',
    'Wrestling',
    'Kung Fu',
  ]

  const countries = Country.getAllCountries()
  const states = formData.country
    ? State.getStatesOfCountry(formData.country)
    : []
  const cities =
    formData.country && formData.state
      ? City.getCitiesOfState(formData.country, formData.state)
      : []

  const fetchTrainingFacilityDetails = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/training-facilities/${id}`
      )
      const data = response.data.data
      setFormData({
        ...data,
      })
    } catch (err) {
      console.log('Error fetching training facilities:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrainingFacilityDetails()
  }, [id])

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
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
          <Link href='/admin/training-and-gym-facilities'>
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
          <h1 className='text-2xl font-bold'>Training Facility Details</h1>
        </div>
        <>
          <div className='mb-8'>
            {/* Dots + connectors */}
            <ol className='relative flex justify-between items-center'>
              {steps.map(({ id }) => (
                <li key={id} className='flex-1 flex items-center'>
                  {/* Connector */}
                  {id !== 1 && (
                    <span
                      className={`flex-1 h-1 transition-colors duration-300 ${
                        currentStep >= id ? 'bg-yellow-500' : 'bg-gray-700'
                      }`}
                    />
                  )}

                  {/* Dot */}
                  <span
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      currentStep >= id
                        ? 'border-yellow-500 bg-yellow-500 text-black shadow-lg'
                        : 'border-gray-600 bg-gray-800 text-gray-400'
                    }`}
                  >
                    {id}
                  </span>

                  {/* Connector (after) */}
                  {id !== steps.length && (
                    <span
                      className={`flex-1 h-1 transition-colors duration-300 ${
                        currentStep > id ? 'bg-yellow-500' : 'bg-gray-700'
                      }`}
                    />
                  )}
                </li>
              ))}
            </ol>
          </div>
          <form className='space-y-6'>
            {/* Step 1: Basic Info & Address */}
            {currentStep === 1 && (
              <div className='space-y-6'>
                {/* Basic Info Section */}
                <h3 className='text-xl font-semibold text-white mb-4'>
                  Basic Information
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='bg-[#00000061] p-2 rounded'>
                    <label className='block font-medium mb-1'>
                      Facility Name <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      name='name'
                      value={formData.name}
                      placeholder='e.g., Arnett Sport Kung Fu'
                      className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                      required
                      minLength={3}
                      maxLength={50}
                      readOnly
                    />
                    <span className='text-xs text-gray-400'>
                      3-50 characters, must be unique
                    </span>
                  </div>

                  <div>
                    <label className='block font-medium mb-2'>
                      Facility Logo <span className='text-red-400'>*</span>
                    </label>
                    {formData.logo && (
                      <div className='mb-2'>
                        <img
                          src={
                            typeof formData.logo === 'string'
                              ? formData.logo
                              : URL.createObjectURL(formData.logo)
                          }
                          alt='Logo Preview'
                          className='w-32 h-32 object-cover rounded-full'
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className='mt-4'>
                  <label className='block font-medium mb-1'>
                    Martial Arts / Styles Taught *
                  </label>
                  <div className='mt-2 grid grid-cols-2 md:grid-cols-5 gap-2'>
                    {martialArtsOptions.map((art) => (
                      <label
                        key={art}
                        className='flex items-center space-x-2 text-white cursor-pointer'
                      >
                        <input
                          type='checkbox'
                          checked={formData.martialArtsStyles.includes(art)}
                          onChange={() => handleMartialArtsChange(art)}
                          className='accent-yellow-500'
                          readOnly
                        />
                        <span className='text-sm'>{art}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='bg-[#00000061] p-2 rounded'>
                    <label className='block font-medium mb-1'>
                      Email <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='email'
                      name='email'
                      value={formData.email}
                      placeholder='Enter your email address'
                      className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                      required
                      readOnly
                    />
                  </div>
                  <div className='bg-[#00000061] p-2 rounded'>
                    <label className='block font-medium mb-1'>
                      Phone Number <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='tel'
                      name='phoneNumber'
                      value={formData.phoneNumber}
                      placeholder='Enter your phone number'
                      className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                      required
                      readOnly
                    />
                  </div>
                </div>

                {/* Address Section */}
                <div className=''>
                  <h3 className='text-lg font-semibold text-white mb-4'>
                    Address Information
                  </h3>

                  <div className='grid grid-cols-1 gap-4'>
                    <div className='bg-[#00000061] p-2 rounded'>
                      <label className='block font-medium mb-1'>
                        Address <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='text'
                        name='address'
                        value={formData.address}
                        placeholder='580 Ellis Rd S, Suite 122A'
                        className='w-full outline-none bg-transparent text-white'
                        required
                        readOnly
                      />
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                      <div className='bg-[#00000061] p-2 rounded'>
                        <label className='block font-medium mb-1'>
                          Country <span className='text-red-500'>*</span>
                        </label>
                        <select
                          name='country'
                          value={formData.country}
                          className='w-full outline-none bg-transparent text-white'
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
                      </div>

                      <div className='bg-[#00000061] p-2 rounded'>
                        <label className='block font-medium mb-1'>
                          State <span className='text-red-500'>*</span>
                        </label>
                        <select
                          name='state'
                          value={formData.state}
                          className='w-full outline-none bg-transparent text-white'
                          required
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
                      </div>

                      <div className='bg-[#00000061] p-2 rounded'>
                        <label className='block font-medium mb-1'>
                          City<span className='text-red-500'>*</span>
                        </label>
                        <select
                          name='city'
                          value={formData.city}
                          className='w-full outline-none bg-transparent text-white'
                          required
                          disabled
                        >
                          <option value='' className='text-black'>
                            Select City
                          </option>
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
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Description & Media */}
            {currentStep === 2 && (
              <div className='space-y-6'>
                <div className=''>
                  <h3 className='text-lg font-semibold text-white mb-4'>
                    Description & Branding
                  </h3>

                  <div className='space-y-4'>
                    <div className='bg-[#00000061] p-2 rounded'>
                      <label className='block font-medium mb-1'>
                        About the Facility{' '}
                        <span className='text-red-500'>*</span>
                      </label>
                      <textarea
                        name='description'
                        value={formData.description}
                        placeholder="Share your gym's journey, mission, and values..."
                        className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                        rows={4}
                        required
                        maxLength={1000}
                        readOnly
                      />
                      <span className='text-xs text-gray-400'>
                        {formData.description.length}/1000 characters
                      </span>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='bg-[#00000061] p-2 rounded'>
                        <label className='block font-medium mb-1'>
                          External Website
                        </label>
                        <input
                          type='url'
                          name='externalWebsite'
                          value={formData.externalWebsite}
                          placeholder='https://yourgym.com'
                          className='w-full outline-none bg-transparent'
                          readOnly
                        />
                      </div>

                      <div className='bg-[#00000061] p-2 rounded'>
                        <label className='block font-medium mb-1'>
                          Video Introduction
                        </label>
                        <input
                          type='url'
                          name='videoIntroduction'
                          value={formData.videoIntroduction}
                          placeholder='https://youtube.com/...'
                          className='w-full outline-none bg-transparent'
                          readOnly
                        />
                        <span className='text-xs text-gray-400'>
                          Must be an embeddable video URL
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className='block font-medium mb-1'>
                        Image Gallery
                      </label>

                      <div className='flex flex-wrap gap-2 mt-2'>
                        {formData.imageGallery.map((file, index) => (
                          <div key={index} className='relative'>
                            <img
                              src={file}
                              alt={file.name}
                              className='w-full h-32 object-cover rounded'
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Team Members */}
            {currentStep === 3 && (
              <div className='space-y-6'>
                {/* Trainers Section */}
                <div className=''>
                  <h3 className='text-lg font-semibold text-white mb-4 flex items-center'>
                    <Users className='mr-2' size={20} />
                    Trainers
                  </h3>

                  <div className='space-y-4'>
                    {formData.trainers.length > 0 && (
                      <div>
                        <h4 className='text-white font-semibold mb-2'>
                          Added Trainers:
                        </h4>
                        <div className='space-y-2'>
                          {formData.trainers.map((trainer, index) => (
                            <div
                              key={trainer._id ?? index}
                              className='bg-[#00000061] p-3 rounded flex justify-between items-center'
                            >
                              <div className='text-white'>
                                <div className='font-medium'>
                                  {trainer.name ||
                                    trainer.label ||
                                    trainer.existingTrainerId?.userId
                                      ?.firstName +
                                      ' ' +
                                      trainer.existingTrainerId?.userId
                                        ?.lastName}
                                </div>
                                {trainer.role && (
                                  <div className='text-sm text-gray-400'>
                                    {trainer.role}
                                  </div>
                                )}
                                {trainer.email && (
                                  <div className='text-sm text-gray-400'>
                                    {trainer.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fighters Section */}
                <div className=''>
                  <h3 className='text-lg font-semibold text-white mb-4 flex items-center'>
                    <Users className='mr-2' size={20} />
                    Fighters
                  </h3>

                  <div className='space-y-4'>
                    {formData.fighters.length > 0 && (
                      <div>
                        <h4 className='text-white font-semibold mb-2'>
                          Added Fighters:
                        </h4>
                        <div className='space-y-2'>
                          {formData.fighters.map((fighter, index) => (
                            <div
                              key={fighter._id ?? index}
                              className='bg-[#00000061] p-3 rounded flex justify-between items-center'
                            >
                              <div className='text-white'>
                                <div className='font-medium'>
                                  {fighter.name ||
                                    fighter.label ||
                                    fighter.existingFighterId?.userId
                                      ?.firstName +
                                      ' ' +
                                      fighter.existingFighterId?.userId
                                        ?.lastName}
                                </div>
                                {fighter.record && (
                                  <div className='text-sm text-gray-400'>
                                    Record: {fighter.record}
                                  </div>
                                )}
                                {fighter.gender && fighter.age && (
                                  <div className='text-sm text-gray-400'>
                                    {fighter.gender}, {fighter.age} years old
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Invite System */}
                <div className='bg-[#00000061] p-4 rounded-lg'>
                  <h3 className='text-lg font-semibold text-white mb-4'>
                    Invite System
                  </h3>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='sendInvites'
                      name='sendInvites'
                      checked={formData.sendInvites}
                      className='accent-yellow-500'
                      readOnly
                    />
                    <label htmlFor='sendInvites' className='text-white'>
                      Send invitation emails to new trainers and fighters
                    </label>
                  </div>
                  <p className='text-sm text-gray-400 mt-2'>
                    When enabled, invitation emails will be sent to new team
                    members with a link to complete their profiles.
                  </p>
                </div>

                <div className='mt-6 flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    id='terms'
                    name='termsAgreed'
                    checked={formData.termsAgreed}
                    className='accent-yellow-500'
                    readOnly
                  />
                  <label htmlFor='terms' className='text-white'>
                    I agree to the terms and conditions and confirm that all
                    information provided is accurate
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className='flex justify-between mt-8'>
              <div className='flex space-x-2'>
                {currentStep > 1 && (
                  <button
                    type='button'
                    onClick={prevStep}
                    className='text-yellow-400 underline hover:text-yellow-300 transition-colors'
                  >
                    Previous
                  </button>
                )}
              </div>

              <div className='flex space-x-2'>
                {currentStep < 3 ? (
                  <>
                    <Link href='/admin/training-and-gym-facilities'>
                      <button
                        type='button'
                        className='border border-gray-400 text-gray-200 px-4 py-2 rounded font-semibold hover:bg-gray-700 hover:border-gray-500 transition-colors'
                      >
                        Cancel
                      </button>{' '}
                    </Link>
                    <button
                      type='button'
                      onClick={nextStep}
                      className='bg-yellow-500 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      Next
                    </button>
                  </>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </form>
        </>
      </div>
    </div>
  )
}
