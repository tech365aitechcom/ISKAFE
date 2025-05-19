'use client'
import React, { useState } from 'react'
import {
  X,
  Upload,
  Plus,
  Trash2,
  Camera,
  MapPin,
  Users,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { City, Country, State } from 'country-state-city'

const steps = [
  { id: 1, label: 'Basic Info & Address' },
  { id: 2, label: 'Description & Media' },
  { id: 3, label: 'Team Members' },
  { id: 4, label: 'Review & Submit' },
]

const RegisterTrainingFacilityPage = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isOpen, setIsOpen] = useState(true)
  const [formData, setFormData] = useState({
    // Basic Info
    facilityName: '',
    facilityLogo: null,
    martialArts: [],

    // Address Info
    addressLine1: '',
    country: '',
    state: '',
    city: '',

    // Description & Branding
    aboutFacility: '',
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

  const [currentTrainer, setCurrentTrainer] = useState({
    type: 'new', // 'existing' or 'new'
    existingId: '',
    name: '',
    role: '',
    email: '',
    phone: '',
    bio: '',
    image: null,
  })

  const [currentFighter, setCurrentFighter] = useState({
    type: 'new', // 'existing' or 'new'
    existingId: '',
    name: '',
    gender: '',
    age: '',
    record: '',
    bio: '',
    image: null,
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

  const router = useRouter()
  const countries = Country.getAllCountries()
  const states = formData.country
    ? State.getStatesOfCountry(formData.country)
    : []
  const cities =
    formData.country && formData.state
      ? City.getCitiesOfState(formData.country, formData.state)
      : []

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleMartialArtsChange = (art) => {
    setFormData((prev) => ({
      ...prev,
      martialArts: prev.martialArts.includes(art)
        ? prev.martialArts.filter((a) => a !== art)
        : [...prev.martialArts, art],
    }))
  }

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: file,
      }))
    }
  }

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files)
    setFormData((prev) => ({
      ...prev,
      imageGallery: [...prev.imageGallery, ...files],
    }))
  }

  const removeGalleryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageGallery: prev.imageGallery.filter((_, i) => i !== index),
    }))
  }

  const addTrainer = () => {
    if (currentTrainer.name || currentTrainer.existingId) {
      setFormData((prev) => ({
        ...prev,
        trainers: [...prev.trainers, { ...currentTrainer, id: Date.now() }],
      }))
      setCurrentTrainer({
        type: 'new',
        existingId: '',
        name: '',
        role: '',
        email: '',
        phone: '',
        bio: '',
        image: null,
      })
    }
  }

  const removeTrainer = (id) => {
    setFormData((prev) => ({
      ...prev,
      trainers: prev.trainers.filter((trainer) => trainer.id !== id),
    }))
  }

  const addFighter = () => {
    if (currentFighter.name || currentFighter.existingId) {
      setFormData((prev) => ({
        ...prev,
        fighters: [...prev.fighters, { ...currentFighter, id: Date.now() }],
      }))
      setCurrentFighter({
        type: 'new',
        existingId: '',
        name: '',
        gender: '',
        age: '',
        record: '',
        bio: '',
        image: null,
      })
    }
  }

  const removeFighter = (id) => {
    setFormData((prev) => ({
      ...prev,
      fighters: prev.fighters.filter((fighter) => fighter.id !== id),
    }))
  }

  const handleSubmit = (e, action) => {
    e.preventDefault()
    console.log('Form submitted with action:', action)
    console.log('Form data:', formData)
    // Handle different submission types (draft, review, etc.)
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleCancel = () => {
    setFormData({
      // Basic Info
      facilityName: '',
      facilityLogo: null,
      martialArts: [],

      // Address Info
      addressLine1: '',
      country: '',
      state: '',
      city: '',

      // Description & Branding
      aboutFacility: '',
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
    router.push('/training-facilities')
  }

  const isStep1Valid = () => {
    return (
      formData.facilityName.length >= 3 &&
      formData.facilityLogo &&
      formData.martialArts.length > 0 &&
      formData.addressLine1 &&
      formData.country &&
      formData.state &&
      formData.city
    )
  }

  const isStep2Valid = () => {
    return formData.aboutFacility.length > 0
  }

  if (!isOpen) return null

  return (
    <div className='flex items-center justify-center'>
      <div className='bg-[#160B25] p-6 rounded-lg container w-full mx-4 my-8 relative'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold mb-6 text-white'>
            Register Training Facility
          </h2>
          <Link href='/training-facilities'>
            <button className='absolute top-4 right-4 text-white text-2xl'>
              <X size={24} />
            </button>
          </Link>
        </div>

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

          {/* Step label */}
          <p className='mt-6 text-center text-lg font-medium text-gray-200'>
            {steps.find((s) => s.id === currentStep)?.label}
          </p>
        </div>
        <form className='space-y-6'>
          {/* Step 1: Basic Info & Address */}
          {currentStep === 1 && (
            <div className='space-y-6'>
              {/* Basic Info Section */}
              <div className='bg-[#2e1b47] p-4 rounded-lg'>
                <h3 className='text-lg font-semibold text-white mb-4 flex items-center'>
                  <FileText className='mr-2' size={20} />
                  Basic Information
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='text-white font-medium'>
                      Facility Name *
                    </label>
                    <input
                      type='text'
                      name='facilityName'
                      value={formData.facilityName}
                      onChange={handleChange}
                      placeholder='e.g., Arnett Sport Kung Fu'
                      className='w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border border-gray-600 focus:border-yellow-500 focus:outline-none'
                      required
                      minLength={3}
                      maxLength={50}
                    />
                    <span className='text-xs text-gray-400'>
                      3-50 characters, must be unique
                    </span>
                  </div>

                  <div>
                    <label className='text-white font-medium'>
                      Facility Logo *
                    </label>
                    <div className='mt-1'>
                      <input
                        type='file'
                        accept='image/jpeg,image/png'
                        onChange={(e) => handleFileUpload(e, 'facilityLogo')}
                        className='hidden'
                        id='logo-upload'
                        required
                      />
                      <label
                        htmlFor='logo-upload'
                        className='flex items-center justify-center w-full h-10 px-4 bg-[#1b0c2e] border border-gray-600 border-dashed rounded cursor-pointer hover:border-yellow-500 transition-colors'
                      >
                        <Upload className='mr-2' size={16} />
                        <span className='text-white'>
                          {formData.facilityLogo
                            ? formData.facilityLogo.name
                            : 'Upload Logo'}
                        </span>
                      </label>
                      <span className='text-xs text-gray-400'>
                        JPG/PNG, square preferred
                      </span>
                    </div>
                  </div>
                </div>

                <div className='mt-4'>
                  <label className='text-white font-medium'>
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
                          checked={formData.martialArts.includes(art)}
                          onChange={() => handleMartialArtsChange(art)}
                          className='accent-yellow-500'
                        />
                        <span className='text-sm'>{art}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className='bg-[#2e1b47] p-4 rounded-lg'>
                <h3 className='text-lg font-semibold text-white mb-4 flex items-center'>
                  <MapPin className='mr-2' size={20} />
                  Address Information
                </h3>

                <div className='grid grid-cols-1 gap-4'>
                  <div>
                    <label className='text-white font-medium'>
                      Address Line 1 *
                    </label>
                    <input
                      type='text'
                      name='addressLine1'
                      value={formData.addressLine1}
                      onChange={handleChange}
                      placeholder='580 Ellis Rd S, Suite 122A'
                      className='w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border border-gray-600 focus:border-yellow-500 focus:outline-none'
                      required
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <label className='text-white font-medium'>
                        Country *
                      </label>
                      <select
                        name='country'
                        value={formData.country}
                        onChange={handleChange}
                        className='w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border border-gray-600 focus:border-yellow-500 focus:outline-none'
                        required
                      >
                        <option value=''>Select Country</option>
                        {countries.map((country) => (
                          <option key={country.isoCode} value={country.isoCode}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className='text-white font-medium'>State *</label>
                      <select
                        name='state'
                        value={formData.state}
                        onChange={handleChange}
                        className='w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border border-gray-600 focus:border-yellow-500 focus:outline-none'
                        required
                        disabled={!formData.country}
                      >
                        <option value=''>Select State</option>
                        {states.map((state) => (
                          <option key={state.isoCode} value={state.isoCode}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className='text-white font-medium'>City *</label>
                      <select
                        name='city'
                        value={formData.city}
                        onChange={handleChange}
                        className='w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border border-gray-600 focus:border-yellow-500 focus:outline-none'
                        required
                        disabled={!formData.state}
                      >
                        <option value=''>Select City</option>
                        {cities.map((city) => (
                          <option key={city.name} value={city.name}>
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
              <div className='bg-[#2e1b47] p-4 rounded-lg'>
                <h3 className='text-lg font-semibold text-white mb-4 flex items-center'>
                  <FileText className='mr-2' size={20} />
                  Description & Branding
                </h3>

                <div className='space-y-4'>
                  <div>
                    <label className='text-white font-medium'>
                      About the Facility *
                    </label>
                    <textarea
                      name='aboutFacility'
                      value={formData.aboutFacility}
                      onChange={handleChange}
                      placeholder="Share your gym's journey, mission, and values..."
                      className='w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border border-gray-600 focus:border-yellow-500 focus:outline-none h-32'
                      required
                      maxLength={1000}
                    />
                    <span className='text-xs text-gray-400'>
                      {formData.aboutFacility.length}/1000 characters
                    </span>
                  </div>

                  <div>
                    <label className='text-white font-medium'>
                      External Website
                    </label>
                    <input
                      type='url'
                      name='externalWebsite'
                      value={formData.externalWebsite}
                      onChange={handleChange}
                      placeholder='https://yourgym.com'
                      className='w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border border-gray-600 focus:border-yellow-500 focus:outline-none'
                    />
                  </div>

                  <div>
                    <label className='text-white font-medium'>
                      Image Gallery
                    </label>
                    <div className='mt-1'>
                      <input
                        type='file'
                        accept='image/jpeg,image/png'
                        multiple
                        onChange={handleGalleryUpload}
                        className='hidden'
                        id='gallery-upload'
                      />
                      <label
                        htmlFor='gallery-upload'
                        className='flex items-center justify-center w-full h-20 px-4 bg-[#1b0c2e] border border-gray-600 border-dashed rounded cursor-pointer hover:border-yellow-500 transition-colors'
                      >
                        <Camera className='mr-2' size={24} />
                        <span className='text-white'>
                          Upload gym photos (Max 5MB each)
                        </span>
                      </label>
                    </div>
                    {formData.imageGallery.length > 0 && (
                      <div className='mt-2 grid grid-cols-3 gap-2'>
                        {formData.imageGallery.map((file, index) => (
                          <div key={index} className='relative'>
                            <div className='bg-[#1b0c2e] p-2 rounded text-white text-sm'>
                              {file.name}
                            </div>
                            <button
                              type='button'
                              onClick={() => removeGalleryImage(index)}
                              className='absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center text-white hover:bg-red-600'
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className='text-white font-medium'>
                      Video Introduction
                    </label>
                    <input
                      type='url'
                      name='videoIntroduction'
                      value={formData.videoIntroduction}
                      onChange={handleChange}
                      placeholder='https://youtube.com/...'
                      className='w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border border-gray-600 focus:border-yellow-500 focus:outline-none'
                    />
                    <span className='text-xs text-gray-400'>
                      Must be an embeddable video URL
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Team Members */}
          {currentStep === 3 && (
            <div className='space-y-6'>
              {/* Trainers Section */}
              <div className='bg-[#2e1b47] p-4 rounded-lg'>
                <h3 className='text-lg font-semibold text-white mb-4 flex items-center'>
                  <Users className='mr-2' size={20} />
                  Trainers
                </h3>

                <div className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='text-white font-medium'>
                        Trainer Type
                      </label>
                      <div className='flex space-x-4 mt-2'>
                        <label className='text-white cursor-pointer'>
                          <input
                            type='radio'
                            value='existing'
                            checked={currentTrainer.type === 'existing'}
                            onChange={(e) =>
                              setCurrentTrainer((prev) => ({
                                ...prev,
                                type: e.target.value,
                              }))
                            }
                            className='accent-yellow-500'
                          />
                          <span className='ml-2'>Existing Trainer</span>
                        </label>
                        <label className='text-white cursor-pointer'>
                          <input
                            type='radio'
                            value='new'
                            checked={currentTrainer.type === 'new'}
                            onChange={(e) =>
                              setCurrentTrainer((prev) => ({
                                ...prev,
                                type: e.target.value,
                              }))
                            }
                            className='accent-yellow-500'
                          />
                          <span className='ml-2'>New Trainer</span>
                        </label>
                      </div>
                    </div>

                    {currentTrainer.type === 'existing' ? (
                      <div>
                        <label className='text-white font-medium'>
                          Search Existing Trainer
                        </label>
                        <select
                          value={currentTrainer.existingId}
                          onChange={(e) =>
                            setCurrentTrainer((prev) => ({
                              ...prev,
                              existingId: e.target.value,
                            }))
                          }
                          className='w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border border-gray-600 focus:border-yellow-500 focus:outline-none'
                        >
                          <option value=''>Search name or email</option>
                          <option value='trainer1'>
                            John Doe (john@example.com)
                          </option>
                          <option value='trainer2'>
                            Jane Smith (jane@example.com)
                          </option>
                        </select>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className='text-white font-medium'>
                            Trainer Name
                          </label>
                          <input
                            type='text'
                            value={currentTrainer.name}
                            onChange={(e) =>
                              setCurrentTrainer((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder='e.g., John Doe'
                            className='w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border border-gray-600 focus:border-yellow-500 focus:outline-none'
                          />
                        </div>

                        <div>
                          <label className='text-white font-medium'>
                            Role / Title
                          </label>
                          <input
                            type='text'
                            value={currentTrainer.role}
                            onChange={(e) =>
                              setCurrentTrainer((prev) => ({
                                ...prev,
                                role: e.target.value,
                              }))
                            }
                            placeholder='e.g., Head Coach'
                            className='w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border border-gray-600 focus:border-yellow-500 focus:outline-none'
                          />
                        </div>

                        <div>
                          <label className='text-white font-medium'>
                            Email
                          </label>
                          <input
                            type='email'
                            value={currentTrainer.email}
                            onChange={(e) =>
                              setCurrentTrainer((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            placeholder='john@example.com'
                            className='w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border border-gray-600 focus:border-yellow-500 focus:outline-none'
                          />
                        </div>

                        <div>
                          <label className='text-white font-medium'>
                            Phone
                          </label>
                          <input
                            type='tel'
                            value={currentTrainer.phone}
                            onChange={(e) =>
                              setCurrentTrainer((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            placeholder='+1 555-123-4567'
                            className='w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border border-gray-600 focus:border-yellow-500 focus:outline-none'
                          />
                        </div>

                        <div className='md:col-span-2'>
                          <label className='text-white font-medium'>
                            Trainer Bio
                          </label>
                          <textarea
                            value={currentTrainer.bio}
                            onChange={(e) =>
                              setCurrentTrainer((prev) => ({
                                ...prev,
                                bio: e.target.value,
                              }))
                            }
                            placeholder='About the trainer...'
                            className='w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border border-gray-600 focus:border-yellow-500 focus:outline-none h-20'
                            maxLength={500}
                          />
                          <span className='text-xs text-gray-400'>
                            {currentTrainer.bio.length}/500 characters
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    type='button'
                    onClick={addTrainer}
                    className='bg-yellow-500 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-600 transition-colors flex items-center'
                  >
                    <Plus className='mr-2' size={16} />
                    Add Trainer
                  </button>

                  {formData.trainers.length > 0 && (
                    <div>
                      <h4 className='text-white font-semibold mb-2'>
                        Added Trainers:
                      </h4>
                      <div className='space-y-2'>
                        {formData.trainers.map((trainer) => (
                          <div
                            key={trainer.id}
                            className='bg-[#1b0c2e] p-3 rounded flex justify-between items-center'
                          >
                            <div className='text-white'>
                              <div className='font-medium'>
                                {trainer.name ||
                                  `Trainer ID: ${trainer.existingId}`}
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
                            <button
                              type='button'
                              onClick={() => removeTrainer(trainer.id)}
                              className='text-red-400 hover:text-red-300'
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Fighters Section */}
              <div className='bg-[#2e1b47] p-4 rounded-lg'>
                <h3 className='text-lg font-semibold text-white mb-4 flex items-center'>
                  <Users className='mr-2' size={20} />
                  Fighters
                </h3>

                <div className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='text-white font-medium'>
                        Fighter Type
                      </label>
                      <div className='flex space-x-4 mt-2'>
                        <label className='text-white cursor-pointer'>
                          <input
                            type='radio'
                            value='existing'
                            checked={currentFighter.type === 'existing'}
                            onChange={(e) =>
                              setCurrentFighter((prev) => ({
                                ...prev,
                                type: e.target.value,
                              }))
                            }
                            className='accent-yellow-500'
                          />
                          <span className='ml-2'>Existing Fighter</span>
                        </label>
                        <label className='text-white cursor-pointer'>
                          <input
                            type='radio'
                            value='new'
                            checked={currentFighter.type === 'new'}
                            onChange={(e) =>
                              setCurrentFighter((prev) => ({
                                ...prev,
                                type: e.target.value,
                              }))
                            }
                            className='accent-yellow-500'
                          />
                          <span className='ml-2'>New Fighter</span>
                        </label>
                      </div>
                    </div>

                    {currentFighter.type === 'existing' ? (
                      <div>
                        <label className='text-white font-medium'>
                          Search Existing Fighter
                        </label>
                        <select
                          value={currentFighter.existingId}
                          onChange={(e) =>
                            setCurrentFighter((prev) => ({
                              ...prev,
                              existingId: e.target.value,
                            }))
                          }
                          className='w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border border-gray-600 focus:border-yellow-500 focus:outline-none'
                        >
                          <option value=''>Search name or email</option>
                          <option value='fighter1'>
                            Mike Johnson (mike@example.com)
                          </option>
                          <option value='fighter2'>
                            Sarah Williams (sarah@example.com)
                          </option>
                        </select>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className='text-white font-medium'>
                            Fighter Name
                          </label>
                          <input
                            type='text'
                            value={currentFighter.name}
                            onChange={(e) =>
                              setCurrentFighter((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder='e.g., Jane Smith'
                            className='w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border border-gray-600 focus:border-yellow-500 focus:outline-none'
                          />
                        </div>

                        <div>
                          <label className='text-white font-medium'>
                            Gender
                          </label>
                          <select
                            value={currentFighter.gender}
                            onChange={(e) =>
                              setCurrentFighter((prev) => ({
                                ...prev,
                                gender: e.target.value,
                              }))
                            }
                            className='w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border border-gray-600 focus:border-yellow-500 focus:outline-none'
                          >
                            <option value=''>Select Gender</option>
                            <option value='Male'>Male</option>
                            <option value='Female'>Female</option>
                            <option value='Other'>Other</option>
                          </select>
                        </div>

                        <div>
                          <label className='text-white font-medium'>Age</label>
                          <input
                            type='number'
                            value={currentFighter.age}
                            onChange={(e) =>
                              setCurrentFighter((prev) => ({
                                ...prev,
                                age: e.target.value,
                              }))
                            }
                            placeholder='e.g., 23'
                            min='18'
                            className='w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border border-gray-600 focus:border-yellow-500 focus:outline-none'
                          />
                        </div>

                        <div>
                          <label className='text-white font-medium'>
                            Record
                          </label>
                          <input
                            type='text'
                            value={currentFighter.record}
                            onChange={(e) =>
                              setCurrentFighter((prev) => ({
                                ...prev,
                                record: e.target.value,
                              }))
                            }
                            placeholder='e.g., 10-2-0'
                            pattern='\d+-\d+-\d+'
                            className='w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border border-gray-600 focus:border-yellow-500 focus:outline-none'
                          />
                          <span className='text-xs text-gray-400'>
                            Format: Wins-Losses-Draws
                          </span>
                        </div>

                        <div className='md:col-span-2'>
                          <label className='text-white font-medium'>
                            Fighter Bio
                          </label>
                          <textarea
                            value={currentFighter.bio}
                            onChange={(e) =>
                              setCurrentFighter((prev) => ({
                                ...prev,
                                bio: e.target.value,
                              }))
                            }
                            placeholder='About the fighter...'
                            className='w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border border-gray-600 focus:border-yellow-500 focus:outline-none h-20'
                            maxLength={500}
                          />
                          <span className='text-xs text-gray-400'>
                            {currentFighter.bio.length}/500 characters
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    type='button'
                    onClick={addFighter}
                    className='bg-yellow-500 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-600 transition-colors flex items-center'
                  >
                    <Plus className='mr-2' size={16} />
                    Add Fighter
                  </button>

                  {formData.fighters.length > 0 && (
                    <div>
                      <h4 className='text-white font-semibold mb-2'>
                        Added Fighters:
                      </h4>
                      <div className='space-y-2'>
                        {formData.fighters.map((fighter) => (
                          <div
                            key={fighter.id}
                            className='bg-[#1b0c2e] p-3 rounded flex justify-between items-center'
                          >
                            <div className='text-white'>
                              <div className='font-medium'>
                                {fighter.name ||
                                  `Fighter ID: ${fighter.existingId}`}
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
                            <button
                              type='button'
                              onClick={() => removeFighter(fighter.id)}
                              className='text-red-400 hover:text-red-300'
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Invite System */}
              <div className='bg-[#2e1b47] p-4 rounded-lg'>
                <h3 className='text-lg font-semibold text-white mb-4'>
                  Invite System
                </h3>
                <div className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    id='sendInvites'
                    name='sendInvites'
                    checked={formData.sendInvites}
                    onChange={handleChange}
                    className='accent-yellow-500'
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
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className='space-y-6'>
              <div className='bg-[#2e1b47] p-4 rounded-lg'>
                <h3 className='text-lg font-semibold text-white mb-4'>
                  Review Your Submission
                </h3>

                <div className='space-y-4 text-white'>
                  <div>
                    <h4 className='font-semibold text-yellow-500'>
                      Basic Information
                    </h4>
                    <p>
                      <strong>Facility Name:</strong> {formData.facilityName}
                    </p>
                    <p>
                      <strong>Martial Arts:</strong>{' '}
                      {formData.martialArts.join(', ')}
                    </p>
                    <p>
                      <strong>Address:</strong> {formData.addressLine1},{' '}
                      {formData.city}, {formData.state}, {formData.country}
                    </p>
                  </div>

                  <div>
                    <h4 className='font-semibold text-yellow-500'>
                      Description
                    </h4>
                    <p className='text-sm'>{formData.aboutFacility}</p>
                    {formData.externalWebsite && (
                      <p>
                        <strong>Website:</strong> {formData.externalWebsite}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className='font-semibold text-yellow-500'>Team</h4>
                    <p>
                      <strong>Trainers:</strong> {formData.trainers.length}
                    </p>
                    <p>
                      <strong>Fighters:</strong> {formData.fighters.length}
                    </p>
                    <p>
                      <strong>Send Invites:</strong>{' '}
                      {formData.sendInvites ? 'Yes' : 'No'}
                    </p>
                  </div>

                  <div>
                    <h4 className='font-semibold text-yellow-500'>Media</h4>
                    <p>
                      <strong>Logo:</strong>{' '}
                      {formData.facilityLogo ? 'Uploaded' : 'Not uploaded'}
                    </p>
                    <p>
                      <strong>Gallery Images:</strong>{' '}
                      {formData.imageGallery.length}
                    </p>
                    <p>
                      <strong>Video:</strong>{' '}
                      {formData.videoIntroduction ? 'Added' : 'Not added'}
                    </p>
                  </div>
                </div>

                <div className='mt-6 flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    id='terms'
                    name='termsAgreed'
                    checked={formData.termsAgreed}
                    onChange={handleChange}
                    className='accent-yellow-500'
                  />
                  <label htmlFor='terms' className='text-white'>
                    I agree to the terms and conditions and confirm that all
                    information provided is accurate
                  </label>
                </div>
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
              {currentStep < 4 ? (
                <>
                  <button
                    type='button'
                    onClick={(e) => handleSubmit(e, 'draft')}
                    className='bg-gray-600 text-white px-4 py-2 rounded font-semibold hover:bg-gray-500 transition-colors'
                  >
                    Save Draft
                  </button>
                  <button
                    type='button'
                    onClick={handleCancel}
                    className='border border-gray-400 text-gray-200 px-4 py-2 rounded font-semibold hover:bg-gray-700 hover:border-gray-500 transition-colors'
                  >
                    Cancel
                  </button>{' '}
                  <button
                    type='button'
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && !isStep1Valid()) ||
                      (currentStep === 2 && !isStep2Valid())
                    }
                    className='bg-yellow-500 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Next
                  </button>
                </>
              ) : (
                <>
                  <button
                    type='button'
                    onClick={(e) => handleSubmit(e, 'draft')}
                    className='bg-gray-600 text-white px-4 py-2 rounded font-semibold hover:bg-gray-500 transition-colors'
                  >
                    Save Draft
                  </button>
                  <button
                    type='button'
                    onClick={(e) => handleSubmit(e, 'review')}
                    disabled={!formData.termsAgreed}
                    className='bg-yellow-500 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Submit for Review
                  </button>
                  {formData.sendInvites &&
                    formData.trainers.some((t) => t.email) && (
                      <button
                        type='button'
                        onClick={(e) => handleSubmit(e, 'invite')}
                        className='bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-600 transition-colors'
                      >
                        Send Invite Links
                      </button>
                    )}
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterTrainingFacilityPage
