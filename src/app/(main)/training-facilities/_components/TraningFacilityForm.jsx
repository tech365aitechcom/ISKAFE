import React, { useState } from 'react'
import {
  X,
  Upload,
  Plus,
  Trash2,
  Camera,
  Video,
  Globe,
  MapPin,
  Users,
  FileText,
} from 'lucide-react'

const TrainingFacilityForm = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isOpen, setIsOpen] = useState(true)
  const [errors, setErrors] = useState({})
  const [fighterErrors, setFighterErrors] = useState({})

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

  const countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Germany',
    'France',
    'Other',
  ]

  // Validation functions
  const validateURL = (url) => {
    if (!url || url.trim().length === 0) {
      return null // Empty URLs are optional
    }

    const trimmedUrl = url.trim()

    // Must start with http:// or https://
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return 'URL must start with http:// or https://'
    }

    // More comprehensive URL validation
    try {
      const urlObj = new URL(trimmedUrl)

      // Check if it has a valid hostname (not just localhost or IP)
      if (!urlObj.hostname || urlObj.hostname.length < 3) {
        return 'Please enter a valid URL with a proper domain'
      }

      // Must have at least one dot in hostname (for domain.tld format)
      if (!urlObj.hostname.includes('.')) {
        return 'Please enter a valid URL with a proper domain (e.g., https://example.com)'
      }

      // Check for valid TLD (at least 2 characters after last dot)
      const parts = urlObj.hostname.split('.')
      const tld = parts[parts.length - 1]
      if (tld.length < 2) {
        return 'Please enter a valid URL with a proper domain extension'
      }

      return null
    } catch (error) {
      return 'Please enter a valid URL starting with http:// or https://'
    }
  }

  const validateAboutFacility = (text) => {
    if (!text || text.trim().length === 0) {
      return 'About the facility is required'
    }

    const trimmedText = text.trim()

    // Minimum length requirement
    if (trimmedText.length < 20) {
      return 'Please provide at least 20 characters describing your facility'
    }

    // Check for meaningful content - must contain at least 3 words
    const words = trimmedText.split(/\s+/).filter(word => word.length > 0)
    if (words.length < 3) {
      return 'Please provide a meaningful description with at least 3 words'
    }

    // Check for nonsensical patterns (repetitive characters)
    const hasRepeatingChars = /(.)\1{4,}/.test(trimmedText) // 5 or more same characters in a row
    if (hasRepeatingChars) {
      return 'Please provide a meaningful description about your facility'
    }

    // Check for random character strings (basic check for mostly consonants without vowels)
    const wordsWith2PlusChars = words.filter(word => word.length >= 2)
    const wordsWithoutVowels = wordsWith2PlusChars.filter(word =>
      !/[aeiouAEIOU]/.test(word) && word.length >= 4
    )

    // If more than half of meaningful words have no vowels, likely nonsensical
    if (wordsWith2PlusChars.length > 0 && (wordsWithoutVowels.length / wordsWith2PlusChars.length) > 0.5) {
      return 'Please provide a meaningful description about your facility'
    }

    return null
  }



  const validateFighterAge = (age) => {
    // Convert to string for consistent handling
    const ageStr = String(age).trim()

    if (!ageStr || ageStr === '') {
      return 'Age is required'
    }

    // Check if it's a valid number (allows for decimal but we'll validate range)
    if (!/^\d+\.?\d*$/.test(ageStr)) {
      return 'Only numeric values are allowed'
    }

    const ageNum = parseInt(ageStr, 10)

    // Check if parsing resulted in a valid number
    if (isNaN(ageNum)) {
      return 'Only numeric values are allowed'
    }

    if (ageNum < 18) {
      return 'Minimum age required is 18 years'
    }

    if (ageNum > 100) {
      return 'Please enter a valid age (maximum 100 years)'
    }

    return null
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value


    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    // Real-time validation
    if (name === 'aboutFacility') {
      const validationError = validateAboutFacility(newValue)
      setErrors(prev => ({ ...prev, aboutFacility: validationError }))
    }

    if (name === 'externalWebsite') {
      const validationError = validateURL(newValue)
      setErrors(prev => ({ ...prev, externalWebsite: validationError }))
    }

    if (name === 'videoIntroduction') {
      const validationError = validateURL(newValue)
      setErrors(prev => ({ ...prev, videoIntroduction: validationError }))
    }


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
    // Validate fighter data
    const newErrors = {}
    
    if (!currentFighter.name && !currentFighter.existingId) {
      newErrors.name = 'Fighter name is required'
    }
    
    if (currentFighter.type === 'new') {
      const ageError = validateFighterAge(currentFighter.age)
      if (ageError) {
        newErrors.age = ageError
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setFighterErrors(newErrors)
      return
    }

    // Clear errors and add fighter
    setFighterErrors({})
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

  const validateStep2 = () => {
    const newErrors = {}

    // Validate about facility field
    const aboutFacilityError = validateAboutFacility(formData.aboutFacility)
    if (aboutFacilityError) {
      newErrors.aboutFacility = aboutFacilityError
    }

    // Validate external website URL
    const externalWebsiteError = validateURL(formData.externalWebsite)
    if (externalWebsiteError) {
      newErrors.externalWebsite = externalWebsiteError
    }

    // Validate video introduction URL
    const videoIntroductionError = validateURL(formData.videoIntroduction)
    if (videoIntroductionError) {
      newErrors.videoIntroduction = videoIntroductionError
    }


    // Update errors state
    setErrors(prevErrors => ({ ...prevErrors, ...newErrors }))

    // Return false if there are any validation errors
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (currentStep === 2) {
      if (!validateStep2()) {
        return // Don't proceed if validation fails
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      // Only clear errors if validation passed - don't clear them blindly
    }
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
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
    // Check about facility validation
    const aboutFacilityError = validateAboutFacility(formData.aboutFacility)
    if (aboutFacilityError) {
      return false
    }

    // Check URL validations directly
    const externalWebsiteError = validateURL(formData.externalWebsite)
    if (externalWebsiteError) {
      return false
    }

    const videoIntroductionError = validateURL(formData.videoIntroduction)
    if (videoIntroductionError) {
      return false
    }

    // Check if there are any current errors in state
    if (errors.aboutFacility || errors.externalWebsite || errors.videoIntroduction) {
      return false
    }

    return true
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-800/30 min-h-screen overflow-y-scroll'>
      <div className='bg-[#1b0c2e] p-6 rounded-lg max-w-4xl w-full mx-4 my-8 relative'>
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className='absolute top-4 right-4 text-gray-400 hover:text-white transition-colors'
          type='button'
          aria-label='Close'
        >
          <X size={24} />
        </button>

        {/* Progress indicator */}
        <div className='mb-6'>
          <div className='flex items-center justify-between mb-4'>
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className='flex items-center'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`h-1 w-16 mx-2 ${
                      currentStep > step ? 'bg-yellow-500' : 'bg-gray-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className='text-white text-center'>
            {currentStep === 1 && 'Basic Information & Address'}
            {currentStep === 2 && 'Description & Media'}
            {currentStep === 3 && 'Team Members'}
            {currentStep === 4 && 'Review & Submit'}
          </div>
        </div>

        <h2 className='text-2xl font-bold mb-6 text-white'>
          Create Training Facility
        </h2>

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
                          <option key={country} value={country}>
                            {country}
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
                        <option value='California'>California</option>
                        <option value='New York'>New York</option>
                        <option value='Texas'>Texas</option>
                        <option value='Florida'>Florida</option>
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
                        <option value='Los Angeles'>Los Angeles</option>
                        <option value='New York City'>New York City</option>
                        <option value='Houston'>Houston</option>
                        <option value='Miami'>Miami</option>
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
                      className={`w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border focus:outline-none h-32 ${
                        errors.aboutFacility
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-600 focus:border-yellow-500'
                      }`}
                      required
                      maxLength={1000}
                    />
                    {errors.aboutFacility ? (
                      <p className='text-red-400 text-sm mt-1'>{errors.aboutFacility}</p>
                    ) : (
                      <span className='text-xs text-gray-400'>
                        {formData.aboutFacility.length}/1000 characters
                      </span>
                    )}
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
                      className={`w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border focus:outline-none ${
                        errors.externalWebsite
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-600 focus:border-yellow-500'
                      }`}
                    />
                    {errors.externalWebsite && (
                      <p className='text-red-400 text-sm mt-1'>{errors.externalWebsite}</p>
                    )}
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
                      className={`w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border focus:outline-none ${
                        errors.videoIntroduction
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-600 focus:border-yellow-500'
                      }`}
                    />
                    {errors.videoIntroduction ? (
                      <p className='text-red-400 text-sm mt-1'>{errors.videoIntroduction}</p>
                    ) : (
                      <span className='text-xs text-gray-400'>
                        Must be an embeddable video URL
                      </span>
                    )}
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
                            type='text'
                            value={currentFighter.age}
                            onChange={(e) => {
                              let value = e.target.value

                              // Filter out non-numeric characters as user types
                              value = value.replace(/[^0-9]/g, '')

                              setCurrentFighter((prev) => ({
                                ...prev,
                                age: value,
                              }))

                              // Real-time validation feedback
                              if (value) {
                                const ageError = validateFighterAge(value)
                                setFighterErrors(prev => ({ ...prev, age: ageError }))
                              } else {
                                // Clear error when field is empty (user is typing)
                                setFighterErrors(prev => ({ ...prev, age: undefined }))
                              }
                            }}
                            placeholder='e.g., 23'
                            pattern='[0-9]*'
                            inputMode='numeric'
                            className={`w-full mt-1 p-2 rounded bg-[#1b0c2e] text-white border focus:outline-none ${
                              fighterErrors.age
                                ? 'border-red-500 focus:border-red-500'
                                : 'border-gray-600 focus:border-yellow-500'
                            }`}
                          />
                          {fighterErrors.age && (
                            <p className='text-red-400 text-sm mt-1'>{fighterErrors.age}</p>
                          )}
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

export default TrainingFacilityForm
