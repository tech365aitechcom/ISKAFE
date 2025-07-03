'use client'
import React, { useEffect, useState } from 'react'
import { X, Plus, Trash, Camera, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { City, Country, State } from 'country-state-city'
import Autocomplete from '../../../_components/Autocomplete'
import axios from 'axios'
import { API_BASE_URL, apiConstants, sportTypes } from '../../../../constants'
import { uploadToS3 } from '../../../../utils/uploadToS3'
import useStore from '../../../../stores/useStore'
import { enqueueSnackbar } from 'notistack'

const steps = [
  { id: 1, label: 'Basic Info & Address' },
  { id: 2, label: 'Description & Media' },
  { id: 3, label: 'Team Members' },
  { id: 4, label: 'Review & Submit' },
]

const RegisterTrainingFacilityPage = () => {
  const user = useStore((state) => state.user)
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

  const [existingTrainers, setExistingTrainers] = useState([])
  const [existingFighters, setExistingFighters] = useState([])

  const [currentTrainer, setCurrentTrainer] = useState({
    type: 'existing', // 'existing' or 'new'
    existingId: '',
    name: '',
    role: '',
    email: '',
    phone: '',
    bio: '',
    image: null,
  })

  const [currentFighter, setCurrentFighter] = useState({
    type: 'existing', // 'existing' or 'new'
    existingId: '',
    name: '',
    gender: '',
    age: '',
    record: '',
    bio: '',
    image: null,
  })

  const router = useRouter()
  const countries = Country.getAllCountries()
  const states = formData.country
    ? State.getStatesOfCountry(formData.country)
    : []
  const cities =
    formData.country && formData.state
      ? City.getCitiesOfState(formData.country, formData.state)
      : []

  const handleChange = (eOrName, value) => {
    if (typeof eOrName === 'object' && eOrName?.target) {
      const { name, value, type, checked } = eOrName.target
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }))
    } else {
      const name = eOrName
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleMartialArtsChange = (art) => {
    setFormData((prev) => ({
      ...prev,
      martialArtsStyles: prev.martialArtsStyles.includes(art)
        ? prev.martialArtsStyles.filter((a) => a !== art)
        : [...prev.martialArtsStyles, art],
    }))
  }

  const handleFileUpload = (e) => {
    const { name, files } = e.target
    const file = files[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }))
    }
  }

  const handleTrainerImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCurrentTrainer((prev) => ({
        ...prev,
        image: file,
      }))
    }
  }

  const handleFighterImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCurrentFighter((prev) => ({
        ...prev,
        image: file,
      }))
    }
  }

  const removeTrainerImage = () => {
    setCurrentTrainer((prev) => ({
      ...prev,
      image: null,
    }))
    // Clear the file input
    const fileInput = document.querySelector('input[name="trainerImage"]')
    if (fileInput) fileInput.value = ''
  }

  const removeFighterImage = () => {
    setCurrentFighter((prev) => ({
      ...prev,
      image: null,
    }))
    // Clear the file input
    const fileInput = document.querySelector('input[name="fighterImage"]')
    if (fileInput) fileInput.value = ''
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

  const validateName = (name) => /^[A-Za-z\s'-]+$/.test(name)
  const validateRole = (name) => /^[A-Za-z\s'-]+$/.test(name)
  const validatePhoneNumber = (number) => /^\+?[0-9]{10,15}$/.test(number)
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validateFightRecord = (code) => /^\d+-\d+-\d+$/.test(code)

  const addTrainer = () => {
    if (currentTrainer.type !== 'existing') {
      if (!currentTrainer.name) {
        enqueueSnackbar('Name is required.', { variant: 'warning' })
        return
      }
      if (!validateName(currentTrainer.name)) {
        enqueueSnackbar(
          'Name can only contain letters, spaces, apostrophes, or hyphens.',
          { variant: 'warning' }
        )
        return
      }

      if (!currentTrainer.role) {
        enqueueSnackbar('Role is required.', { variant: 'warning' })
        return
      }
      if (!validateRole(currentTrainer.role)) {
        enqueueSnackbar(
          'Role can only contain letters, spaces, apostrophes, or hyphens.',
          { variant: 'warning' }
        )
        return
      }

      if (!currentTrainer.email) {
        enqueueSnackbar('Email is required.', { variant: 'warning' })
        return
      }
      if (!validateEmail(currentTrainer.email)) {
        enqueueSnackbar('Invalid email address.', { variant: 'warning' })
        return
      }

      if (!currentTrainer.phone) {
        enqueueSnackbar('Phone number is required.', { variant: 'warning' })
        return
      }
      if (!validatePhoneNumber(currentTrainer.phone)) {
        enqueueSnackbar('Invalid phone number.', { variant: 'warning' })
        return
      }

      // Add to list
      setFormData((prev) => ({
        ...prev,
        trainers: [...prev.trainers, { ...currentTrainer, id: Date.now() }],
      }))

      // Reset current trainer
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
    if (currentFighter.type !== 'existing') {
      if (!currentFighter.name) {
        enqueueSnackbar('Name is required.', { variant: 'warning' })
        return
      }
      if (!validateName(currentFighter.name)) {
        enqueueSnackbar(
          'Name can only contain letters, spaces, apostrophes, or hyphens.',
          { variant: 'warning' }
        )
        return
      }
      if (!currentFighter.gender) {
        enqueueSnackbar('Gender is required.', { variant: 'warning' })
        return
      }
      if (!currentFighter.age) {
        enqueueSnackbar('Age is required.', { variant: 'warning' })
        return
      }
      if (!currentFighter.record) {
        enqueueSnackbar('Fight record is required.', { variant: 'warning' })
        return
      }
      if (!validateFightRecord(currentFighter.record)) {
        enqueueSnackbar('Invalid fight record,format should by X-Y-Z', {
          variant: 'warning',
        })
        return
      }

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

  console.log(formData.trainers, 'trainers')

  useEffect(() => {
    const getExistingTrainers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/trainers`)
        const trainers = response.data.data
        console.log('trainers', trainers)

        setExistingTrainers(trainers)
      } catch (error) {
        console.error('Error fetching existing trainers:', error)
      }
    }
    const getExistingFighters = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/fighters`)
        const fighters = response.data.data.items
        console.log('fighters', fighters)

        setExistingFighters(fighters)
      } catch (error) {
        console.error('Error fetching existing fighters:', error)
      }
    }
    getExistingTrainers()
    getExistingFighters()
  }, [])

  const handleSubmit = async (e, action) => {
    e.preventDefault()
    console.log('Form submitted with action:', action)
    console.log('Form data:', formData)
    if (!formData.name && action !== 'draft') {
      enqueueSnackbar('Facility name is required.', { variant: 'warning' })
      return
    }
    if (!validateName(formData.name)) {
      enqueueSnackbar(
        'Facility name can only contain letters, spaces, apostrophes, or hyphens.',
        { variant: 'warning' }
      )
      return
    }
    if (!formData.email && action !== 'draft') {
      enqueueSnackbar('Email is required.', { variant: 'warning' })
      return
    }
    if (!validateEmail(formData.email) && action !== 'draft') {
      enqueueSnackbar('Invalid email address.', { variant: 'warning' })
      return
    }
    if (!formData.phoneNumber && action !== 'draft') {
      enqueueSnackbar('Phone number is required.', { variant: 'warning' })
      return
    }
    if (!validatePhoneNumber(formData.phoneNumber) && action !== 'draft') {
      enqueueSnackbar('Invalid phone number.', { variant: 'warning' })
      return
    }
    if (!formData.address && action !== 'draft') {
      enqueueSnackbar('Address is required.', { variant: 'warning' })
      return
    }
    if (!formData.country && action !== 'draft') {
      enqueueSnackbar('Country is required.', { variant: 'warning' })
      return
    }
    if (!formData.state && action !== 'draft') {
      enqueueSnackbar('State is required.', { variant: 'warning' })
      return
    }
    if (!formData.city && action !== 'draft') {
      enqueueSnackbar('City is required.', { variant: 'warning' })
      return
    }
    if (!formData.description && action !== 'draft') {
      enqueueSnackbar('Description is required.', { variant: 'warning' })
      return
    }
    try {
      if (formData.logo && typeof formData.logo !== 'string') {
        try {
          const s3UploadedUrl = await uploadToS3(formData.logo)
          formData.logo = s3UploadedUrl
        } catch (error) {
          console.error('Image upload failed:', error)
          return
        }
      }
      if (formData.imageGallery && typeof formData.logo !== 'string') {
        const s3Urls = await Promise.all(
          formData.imageGallery.map((file) => uploadToS3(file))
        )
        formData.imageGallery = s3Urls
      }
      if (formData.trainers?.length) {
        await Promise.all(
          formData.trainers.map(async (trainer) => {
            if (trainer.image && typeof trainer.image !== 'string') {
              try {
                const s3UploadedUrl = await uploadToS3(trainer.image)
                trainer.image = s3UploadedUrl
              } catch (error) {
                console.error('Trainer image upload failed:', error)
              }
            }
          })
        )
      }

      if (formData.fighters?.length) {
        await Promise.all(
          formData.fighters.map(async (fighter) => {
            if (fighter.image) {
              try {
                const s3UploadedUrl = await uploadToS3(fighter.image)
                fighter.image = s3UploadedUrl
              } catch (error) {
                console.error('Fighter image upload failed:', error)
              }
            }
          })
        )
      }

      let payload = {
        ...formData,
        trainers: formData.trainers.map((t) =>
          t.value ? { existingTrainerId: t.value } : t
        ),
        fighters: formData.fighters.map((f) =>
          f.value ? { existingFighterId: f.value } : f
        ),
      }

      if (action === 'draft') {
        payload = {
          ...payload,
          isDraft: true,
        }
      } else if (action === 'review') {
        payload = {
          ...payload,
          isAdminApprovalRequired: true,
        }
      }

      console.log('Payload:', payload)

      const response = await axios.post(
        `${API_BASE_URL}/training-facilities`,
        {
          ...payload,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      )
      console.log('Response:', response)

      if (response.status === apiConstants.create) {
        enqueueSnackbar(
          action === 'draft'
            ? 'Facility saved as draft.'
            : 'Facility submitted for review.',
          {
            variant: 'success',
          }
        )
        handleCancel()
        setCurrentStep(1)
      }
    } catch (error) {}
  }

  console.log(existingFighters, 'existingFighters')

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleCancel = () => {
    setFormData({
      // Basic Info
      name: '',
      logo: null,
      martialArtsStyles: [],

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
    router.push('/training-facilities')
  }

  return (
    <div className='min-h-screen text-white bg-[#0B1739] py-6 px-4'>
      <div className='w-full container mx-auto'>
        <div className='mb-6'>
          <h1 className='text-4xl font-bold'>Register Training Facility</h1>
          <p>Fill the form below to register you training and gym facility</p>
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
                    onChange={handleChange}
                    placeholder='e.g., Arnett Sport Kung Fu'
                    className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                    minLength={3}
                    maxLength={50}
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
                    <div className='mb-2 relative w-20 h-20'>
                      <img
                        src={
                          typeof formData.logo === 'string'
                            ? formData.logo
                            : URL.createObjectURL(formData.logo)
                        }
                        alt='Current logo'
                        className='w-full h-full object-cover rounded border'
                      />
                      <Trash
                        onClick={() => setFormData({ ...formData, logo: null })}
                        className='absolute top-1 right-1 w-5 h-5 text-red-500 cursor-pointer'
                        size={16}
                      />
                    </div>
                  )}
                  <div className='mt-5'>
                    <label className='cursor-pointer inline-block file-button'>
                      <span className='py-2 px-4 rounded-full text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700'>
                        Choose File
                      </span>
                      <input
                        type='file'
                        name='logo'
                        onChange={handleFileUpload}
                        accept='image/jpeg,image/jpg,image/png'
                        className='hidden'
                      />
                    </label>
                    <p className='text-xs text-gray-400 mt-2'>JPG/PNG</p>
                  </div>
                </div>
              </div>

              <div className='mt-4'>
                <label className='block font-medium mb-1'>
                  Martial Arts / Styles Taught{' '}
                  <span className='text-red-400'>*</span>
                </label>
                <div className='mt-2 grid grid-cols-2 md:grid-cols-5 gap-2'>
                  {sportTypes.map((art, index) => {
                    const id = `martial-art-${index}`
                    return (
                      <div
                        key={art}
                        className='flex items-center space-x-2 text-white'
                      >
                        <input
                          id={id}
                          type='checkbox'
                          checked={formData.martialArtsStyles.includes(art)}
                          onChange={() => handleMartialArtsChange(art)}
                          className='accent-yellow-500'
                        />
                        <label htmlFor={id} className='text-sm cursor-pointer'>
                          {art}
                        </label>
                      </div>
                    )
                  })}
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
                    onChange={handleChange}
                    placeholder='Enter your email address'
                    className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
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
                    onChange={handleChange}
                    placeholder='Enter your phone number'
                    className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
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
                      onChange={handleChange}
                      placeholder='580 Ellis Rd S, Suite 122A'
                      className='w-full outline-none bg-transparent text-white'
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
                        onChange={handleChange}
                        className='w-full outline-none bg-transparent text-white'
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
                        onChange={handleChange}
                        className='w-full outline-none bg-transparent text-white'
                        disabled={!formData.country}
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
                        onChange={handleChange}
                        className='w-full outline-none bg-transparent text-white'
                        disabled={!formData.state}
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
                  Facility Description and Branding
                </h3>

                <div className='space-y-4'>
                  <div className='bg-[#00000061] p-2 rounded'>
                    <label className='block font-medium mb-1'>
                      About the Facility <span className='text-red-500'>*</span>
                    </label>
                    <textarea
                      name='description'
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Share your gym's journey, mission, and values..."
                      className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                      rows={4}
                      maxLength={1000}
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
                        onChange={handleChange}
                        placeholder='https://yourgym.com'
                        className='w-full outline-none bg-transparent'
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
                        onChange={handleChange}
                        placeholder='https://youtube.com/...'
                        className='w-full outline-none bg-transparent'
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
                        className='flex items-center justify-center w-full h-20 px-4 bg-[#00000061] border border-gray-600 border-dashed rounded cursor-pointer hover:border-yellow-500 transition-colors'
                      >
                        <Camera className='mr-2' size={24} />
                        <span className='text-white'>
                          Upload gym photos (Max 5MB each)
                        </span>
                      </label>
                    </div>
                    <div className='flex flex-wrap gap-2 mt-2'>
                      {formData.imageGallery.map((file, index) => (
                        <div key={index} className='relative'>
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className='w-full h-32 object-cover rounded'
                          />

                          <button
                            type='button'
                            onClick={() => removeGalleryImage(index)}
                            className='absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center text-white hover:bg-red-600'
                          >
                            <Trash size={12} />
                          </button>
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
                  Trainers and Fighters Association
                </h3>

                <div className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='col-span-2'>
                      <label className='block font-medium mb-1'>
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
                      <Autocomplete
                        label='Search Trainer'
                        multiple
                        selected={formData.trainers}
                        onChange={(value) => handleChange('trainers', value)}
                        options={[
                          ...existingTrainers.map((trainer) => ({
                            label:
                              trainer.userId?.firstName +
                              ' ' +
                              trainer.userId?.lastName +
                              ' (' +
                              trainer.userId?.email +
                              ' )',
                            value: trainer._id,
                          })),
                        ]}
                        placeholder='Search trainer name'
                      />
                    ) : (
                      <>
                        <div className='bg-[#00000061] p-2 rounded'>
                          <label className='block font-medium mb-1'>
                            Trainer Name <span className='text-red-500'>*</span>
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
                            className='w-full outline-none bg-transparent'
                          />
                        </div>

                        <div className='bg-[#00000061] p-2 rounded'>
                          <label className='block font-medium mb-1'>
                            Role / Title<span className='text-red-500'>*</span>
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
                            className='w-full outline-none bg-transparent'
                          />
                        </div>

                        <div className='bg-[#00000061] p-2 rounded'>
                          <label className='block font-medium mb-1'>
                            Email<span className='text-red-500'>*</span>
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
                            className='w-full outline-none bg-transparent'
                          />
                        </div>

                        <div className='bg-[#00000061] p-2 rounded'>
                          <label className='block font-medium mb-1'>
                            Phone<span className='text-red-500'>*</span>
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
                            className='w-full outline-none bg-transparent'
                          />
                        </div>

                        <div className='md:col-span-2'>
                          <div className='bg-[#00000061] p-2 rounded'>
                            <label className='block font-medium mb-1'>
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
                              className='w-full outline-none bg-transparent h-20'
                              maxLength={500}
                            />
                            <span className='text-xs text-gray-400'>
                              {currentTrainer.bio.length}/500 characters
                            </span>
                          </div>
                        </div>
                        <div className='md:col-span-2'>
                          <label className='block font-medium mb-2'>
                            Upload Trainer Image
                          </label>
                          {currentTrainer.image ? (
                            <div className='bg-[#00000061] w-fit p-3 rounded flex gap-4 items-center justify-between'>
                              <div className='flex items-center space-x-3'>
                                <img
                                  src={URL.createObjectURL(
                                    currentTrainer.image
                                  )}
                                  alt='Trainer preview'
                                  className='w-12 h-12 object-cover rounded'
                                />
                                <span className='text-white text-sm'>
                                  {currentTrainer.image.name}
                                </span>
                              </div>
                              <button
                                type='button'
                                onClick={removeTrainerImage}
                                className='text-red-400 hover:text-red-300 p-1'
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className='mt-1'>
                              <label className='cursor-pointer inline-block file-button'>
                                <span className='py-2 px-4 rounded-full text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700'>
                                  Choose File
                                </span>
                                <input
                                  type='file'
                                  name='trainerImage'
                                  onChange={handleTrainerImageUpload}
                                  accept='image/jpeg,image/jpg,image/png'
                                  className='hidden'
                                />
                              </label>{' '}
                              <p className='text-xs text-gray-400 mt-3'>
                                JPG/PNG
                              </p>
                            </div>
                          )}
                        </div>
                        <button
                          type='button'
                          onClick={addTrainer}
                          className='bg-yellow-500 text-black w-32 px-4 py-2 rounded font-semibold hover:bg-yellow-600 transition-colors flex items-center'
                        >
                          <Plus className='mr-2' size={16} />
                          Add Trainer
                        </button>
                      </>
                    )}
                  </div>

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
                                {trainer.name ?? trainer.label}
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
                              <Trash size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Fighters Section */}
              <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='col-span-2'>
                    <label className='block font-medium mb-1'>
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
                    <Autocomplete
                      label='Search Fighter'
                      multiple
                      selected={formData.fighters}
                      onChange={(value) => handleChange('fighters', value)}
                      options={[
                        ...existingFighters.map((fighter) => ({
                          label:
                            fighter.user?.firstName +
                            ' ' +
                            fighter.user?.lastName +
                            ' (' +
                            fighter.user?.email +
                            ' )',
                          value: fighter._id,
                        })),
                      ]}
                      placeholder='Search fighter name'
                    />
                  ) : (
                    <>
                      <div className='bg-[#00000061] p-2 rounded'>
                        <label className='block font-medium mb-1'>
                          Fighter Name<span className='text-red-500'>*</span>
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
                          className='w-full outline-none bg-transparent'
                        />
                      </div>

                      <div className='bg-[#00000061] p-2 rounded'>
                        <label className='block font-medium mb-1'>
                          Gender
                          <span className='text-red-500'>*</span>
                        </label>
                        <select
                          value={currentFighter.gender}
                          onChange={(e) =>
                            setCurrentFighter((prev) => ({
                              ...prev,
                              gender: e.target.value,
                            }))
                          }
                          className='w-full outline-none bg-transparent'
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

                      <div className='bg-[#00000061] p-2 rounded'>
                        <label className='block font-medium mb-1'>
                          Age
                          <span className='text-red-500'>*</span>
                        </label>
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
                          className='w-full outline-none bg-transparent'
                        />
                      </div>

                      <div className='bg-[#00000061] p-2 rounded'>
                        <label className='block font-medium mb-1'>
                          Record
                          <span className='text-red-500'>*</span>
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
                          className='w-full outline-none bg-transparent'
                        />
                        <span className='text-xs text-gray-400'>
                          Format: Wins-Losses-Draws
                        </span>
                      </div>

                      <div className='md:col-span-2'>
                        <div className='bg-[#00000061] p-2 rounded'>
                          <label className='block font-medium mb-1'>
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
                            className='w-full outline-none bg-transparent h-20'
                            maxLength={500}
                          />
                          <span className='text-xs text-gray-400'>
                            {currentFighter.bio.length}/500 characters
                          </span>
                        </div>
                      </div>

                      <div className='md:col-span-2'>
                        <label className='block font-medium mb-2'>
                          Upload Fighter image
                        </label>
                        {currentFighter.image ? (
                          <div className='bg-[#00000061] w-fit  p-3 rounded flex items-center gap-4 justify-between'>
                            <div className='flex items-center space-x-3'>
                              <img
                                src={URL.createObjectURL(currentFighter.image)}
                                alt='Fighter preview'
                                className='w-12 h-12 object-cover rounded'
                              />
                              <span className='text-white text-sm'>
                                {currentFighter.image.name}
                              </span>
                            </div>
                            <button
                              type='button'
                              onClick={removeFighterImage}
                              className='text-red-400 hover:text-red-300 p-1'
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className='mt-1'>
                            <label className='cursor-pointer inline-block file-button'>
                              <span className='py-2 px-4 rounded-full text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700'>
                                Choose File
                              </span>
                              <input
                                type='file'
                                name='fighterImage'
                                onChange={handleFighterImageUpload}
                                accept='image/jpeg,image/jpg,image/png'
                                className='hidden'
                              />
                            </label>{' '}
                            <p className='text-xs text-gray-400 mt-3'>
                              JPG/PNG
                            </p>
                          </div>
                        )}
                      </div>

                      <button
                        type='button'
                        onClick={addFighter}
                        className='bg-yellow-500 text-black w-32 px-4 py-2 rounded font-semibold hover:bg-yellow-600 transition-colors flex items-center'
                      >
                        <Plus className='mr-2' size={16} />
                        Add Fighter
                      </button>
                    </>
                  )}
                </div>

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
                              {fighter.name || fighter.label}
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
                            <Trash size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Invite System */}
              {(formData.trainers?.some((trainer) => trainer.type === 'new') ||
                currentTrainer.email) && (
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
              )}
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className='space-y-6'>
              <div className='bg-[#00000061] p-4 rounded-lg'>
                <h3 className='text-lg font-semibold text-white mb-4'>
                  Review Your Submission
                </h3>

                <div className='space-y-4 text-white'>
                  <div>
                    <h4 className='font-semibold text-yellow-500'>
                      Basic Information
                    </h4>
                    <p>
                      <strong>Facility Name:</strong> {formData.name}
                    </p>
                    <p>
                      <strong>Martial Arts:</strong>{' '}
                      {formData.martialArtsStyles.join(', ')}
                    </p>
                    <p>
                      <strong>Address:</strong> {formData.address},{' '}
                      {formData.city}, {formData.state}, {formData.country}
                    </p>
                  </div>

                  <div>
                    <h4 className='font-semibold text-yellow-500'>
                      Description
                    </h4>
                    <p className='text-sm'>{formData.description}</p>
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
                      {formData.logo ? 'Uploaded' : 'Not uploaded'}
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
                    onClick={handleCancel}
                    className='border border-gray-400 text-gray-200 px-4 py-2 rounded font-semibold hover:bg-gray-700 hover:border-gray-500 transition-colors'
                  >
                    Cancel
                  </button>{' '}
                  <button
                    type='button'
                    onClick={(e) => handleSubmit(e, 'review')}
                    disabled={!formData.termsAgreed}
                    className='bg-yellow-500 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Submit for Review
                  </button>
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
