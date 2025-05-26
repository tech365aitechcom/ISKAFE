'use client'
import React, { useEffect, useState } from 'react'
import {
  Instagram,
  Youtube,
  Facebook,
  Upload,
  User,
  Phone,
  Award,
  Dumbbell,
  Save,
  Send,
  AlertTriangle,
  Calendar,
} from 'lucide-react'
import FormField from '../../../_components/FormField'
import FormSection from '../../../_components/FormSection'

const TrainerProfileForm = () => {
  const [formData, setFormData] = useState({
    // Basic Info
    profilePhoto: null,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    countryNationality: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    height: '',
    weight: '',

    // Gym Info
    gymName: '',
    gymLocation: '',
    yearsOfExperience: '',
    trainerType: '',
    preferredStyles: '',

    // Credentials
    certifications: null,
    bioAchievements: '',

    // Public Profile
    instagramUrl: '',
    facebookUrl: '',
    youtubeUrl: '',
    affiliatedFighters: '',

    // Emergency Info
    emergencyContactName: '',
    emergencyContactNumber: '',

    // Event Info
    associatedEvents: '',
    accreditationType: '',

    // Suspension Info
    isSuspended: false,
    suspensionType: '',
    suspensionNotes: '',
    suspensionStartDate: '',
    suspensionEndDate: '',
    medicalClearance: false,
    medicalDocs: null,
  })

  const [previewImages, setPreviewImages] = useState({
    profilePhoto: '',
    certifications: '',
    medicalDocs: '',
  })

  useEffect(() => {
    const dummyData = {
      // Basic Info
      profilePhoto: null,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+1 123-456-7890',
      countryNationality: 'United States',
      dateOfBirth: '1990-05-15',
      age: '34',
      gender: 'Male',
      height: '6\'0"',
      weight: '185',

      // Gym Info
      gymName: 'Iron Fist MMA',
      gymLocation: 'Los Angeles, CA',
      yearsOfExperience: '8',
      trainerType: 'Strength & Conditioning',
      preferredStyles: 'Muay Thai, Brazilian Jiu-Jitsu',

      // Credentials
      certifications: null,
      bioAchievements: 'Multiple-time amateur champion, BJJ purple belt',

      // Public Profile
      instagramUrl: 'https://instagram.com/johndoe',
      facebookUrl: 'https://facebook.com/johndoe',
      youtubeUrl: 'https://youtube.com/@johndoe',
      affiliatedFighters: 'Jane Doe, Mike Smith',

      // Emergency Info
      emergencyContactName: 'Mary Doe',
      emergencyContactNumber: '+1 987-654-3210',

      // Event Info
      associatedEvents: 'Fight Night LA, West Coast Open',
      accreditationType: 'Fighter',

      // Suspension Info
      isSuspended: true,
      suspensionType: 'Medical',
      suspensionNotes: 'Concussion protocol',
      suspensionStartDate: '2024-12-01',
      suspensionEndDate: '2025-01-15',
      medicalClearance: false,
      medicalDocs: null,
    }

    setFormData(dummyData)
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files && files[0]) {
      const file = files[0]
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }))

      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImages((prev) => ({
          ...prev,
          [name]: reader.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    // Create FormData object for submission
    const submitFormData = new FormData()

    // Append all form fields to FormData
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        if (Array.isArray(formData[key])) {
          formData[key].forEach((value) => {
            submitFormData.append(`${key}[]`, value)
          })
        } else {
          submitFormData.append(key, formData[key])
        }
      }
    })

    // In a real application, you would send this FormData to your API
    console.log('Submitting form data...')
  }

  return (
    <div className='min-h-screen py-6 bg-black text-white flex flex-col items-center p-4'>
      <div className='w-full container mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl md:text-5xl font-bold text-white'>
            My Trainer Profile
          </h1>
        </div>
        <div className='space-y-6'>
          {/* Personal Info Section */}
          <FormSection
            title='Personal Info'
            color='bg-blue-900'
            icon={<User size={20} />}
          >
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <FormField
                label='Profile Photo'
                name='profilePhoto'
                type='file'
                value={formData.profilePhoto}
                placeholder='Upload profile image'
                handleFileChange={handleFileChange}
                required={true}
                validation='JPG/PNG, Max 2MB'
              />
              {previewImages.profilePhoto && (
                <img
                  src={previewImages.profilePhoto}
                  alt='Preview'
                  className='mt-2 w-32 h-32 object-cover rounded'
                />
              )}
              <FormField
                label='First Name'
                name='firstName'
                type='text'
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder='Enter first name'
                required={true}
                validation='Alphabetic only'
              />

              <FormField
                label='Last Name'
                name='lastName'
                type='text'
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder='Enter last name'
                required={true}
                validation='Alphabetic only'
              />

              <FormField
                label='Email Address'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleInputChange}
                placeholder='name@example.com'
                required={true}
                validation='Valid email format'
              />

              <FormField
                label='Phone Number'
                name='phoneNumber'
                type='tel'
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder='+1 555-123-4567'
                required={true}
                validation='10-15 digits'
              />

              <FormField
                label='Country / Nationality'
                name='countryNationality'
                type='select'
                value={formData.countryNationality}
                onChange={handleInputChange}
                required={true}
                options={[
                  { value: '', label: 'Select Country' },
                  { value: 'usa', label: 'United States' },
                  { value: 'canada', label: 'Canada' },
                  { value: 'uk', label: 'United Kingdom' },
                  { value: 'australia', label: 'Australia' },
                  { value: 'brazil', label: 'Brazil' },
                  { value: 'thailand', label: 'Thailand' },
                  { value: 'japan', label: 'Japan' },
                  { value: 'russia', label: 'Russia' },
                ]}
              />

              <FormField
                label='Date of Birth'
                name='dateOfBirth'
                type='date'
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required={true}
                validation='Age ≥ 18'
              />

              <FormField
                label='Age'
                name='age'
                type='text'
                value={formData.age}
                onChange={handleInputChange}
                placeholder='Auto-calculated'
                disabled={true}
              />

              <FormField
                label='Gender'
                name='gender'
                type='select'
                value={formData.gender}
                onChange={handleInputChange}
                required={false}
                options={[
                  { value: '', label: 'Select Gender' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
              />

              <FormField
                label='Height'
                name='height'
                type='text'
                value={formData.height}
                onChange={handleInputChange}
                placeholder="e.g., 5'10"
                required={true}
                validation='2-3 digit number'
              />

              <FormField
                label='Weight'
                name='weight'
                type='text'
                value={formData.weight}
                onChange={handleInputChange}
                placeholder='e.g., 175 lbs'
                required={true}
                validation='2-3 digit number'
              />
            </div>
          </FormSection>

          {/* Gym Info Section */}
          <FormSection
            title='Gym Information'
            color='bg-purple-900'
            icon={<Dumbbell size={20} />}
          >
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <FormField
                label='Gym Name'
                name='gymName'
                type='text'
                value={formData.gymName}
                onChange={handleInputChange}
                placeholder='e.g., Elite Training Center'
                required={false}
              />

              <FormField
                label='Gym Location'
                name='gymLocation'
                type='select'
                value={formData.gymLocation}
                onChange={handleInputChange}
                placeholder='Select location'
                required={false}
                options={[
                  { value: '', label: 'Select Location' },
                  { value: 'new-york', label: 'New York, USA' },
                  { value: 'los-angeles', label: 'Los Angeles, USA' },
                  { value: 'london', label: 'London, UK' },
                  { value: 'tokyo', label: 'Tokyo, Japan' },
                  { value: 'sao-paulo', label: 'São Paulo, Brazil' },
                  { value: 'other', label: 'Other' },
                ]}
              />

              <FormField
                label='Years of Experience'
                name='yearsOfExperience'
                type='select'
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                required={true}
                options={[
                  { value: '', label: 'Select Experience' },
                  { value: '1', label: '1 year' },
                  { value: '2', label: '2 years' },
                  { value: '3', label: '3 years' },
                  { value: '5', label: '5 years' },
                  { value: '10+', label: '10+ years' },
                ]}
              />

              <FormField
                label='Trainer Type'
                name='trainerType'
                type='select'
                value={formData.trainerType}
                onChange={handleInputChange}
                required={true}
                options={[
                  { value: '', label: 'Select Trainer Type' },
                  { value: 'coach', label: 'Coach' },
                  { value: 'cutman', label: 'Cutman' },
                  { value: 'assistant', label: 'Assistant' },
                ]}
              />

              <div className='md:col-span-2'>
                <FormField
                  label='Preferred Fighting Styles'
                  name='preferredStyles'
                  type='select'
                  value={formData.preferredStyles}
                  onChange={handleInputChange}
                  required={true}
                  options={[
                    { value: 'boxing', label: 'Boxing' },
                    { value: 'muay-thai', label: 'Muay Thai' },
                    { value: 'bjj', label: 'Brazilian Jiu-Jitsu' },
                    { value: 'wrestling', label: 'Wrestling' },
                    { value: 'karate', label: 'Karate' },
                    { value: 'judo', label: 'Judo' },
                    { value: 'taekwondo', label: 'Taekwondo' },
                    { value: 'kickboxing', label: 'Kickboxing' },
                  ]}
                />
              </div>
            </div>
          </FormSection>

          {/* Credentials Section */}
          <FormSection
            title='Credentials'
            color='bg-green-900'
            icon={<Award size={20} />}
          >
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                label='Certifications'
                name='certifications'
                type='file'
                value={formData.certifications}
                handleFileChange={handleFileChange}
                required={false}
                validation='PDF/JPG, Max 5MB'
              />

              <FormField
                label='Bio / Achievements'
                name='bioAchievements'
                type='textarea'
                value={formData.bioAchievements}
                onChange={handleInputChange}
                placeholder='Describe your career achievements'
                required={false}
                validation='Max 1000 characters'
              />
            </div>
          </FormSection>

          {/* Public Profile Section */}
          <FormSection
            title='Public Profile'
            color='bg-yellow-900'
            icon={<Upload size={20} />}
          >
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Social Media URLs
                </label>
                <div className='space-y-2'>
                  <div className='flex'>
                    <div className='bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500 p-2 rounded-l-md'>
                      <Instagram size={24} />
                    </div>
                    <input
                      type='url'
                      name='instagramUrl'
                      value={formData.instagramUrl}
                      onChange={handleInputChange}
                      placeholder='Instagram URL'
                      className='flex-1 bg-gray-700 border border-gray-600 rounded-r-md p-2 text-white'
                    />
                  </div>
                  <div className='flex'>
                    <div className='bg-blue-600 p-2 rounded-l-md'>
                      <Facebook size={24} />
                    </div>
                    <input
                      type='url'
                      name='facebookUrl'
                      value={formData.facebookUrl}
                      onChange={handleInputChange}
                      placeholder='Facebook URL'
                      className='flex-1 bg-gray-700 border border-gray-600 rounded-r-md p-2 text-white'
                    />
                  </div>
                  <div className='flex'>
                    <div className='bg-red-600 p-2 rounded-l-md'>
                      <Youtube size={24} />
                    </div>
                    <input
                      type='url'
                      name='youtubeUrl'
                      value={formData.youtubeUrl}
                      onChange={handleInputChange}
                      placeholder='YouTube URL'
                      className='flex-1 bg-gray-700 border border-gray-600 rounded-r-md p-2 text-white'
                    />
                  </div>
                </div>
              </div>

              <FormField
                label='Affiliated Fighters'
                name='affiliatedFighters'
                type='select'
                value={formData.affiliatedFighters}
                onChange={handleInputChange}
                required={false}
                options={[
                  { value: 'fighter1', label: 'Alex Johnson' },
                  { value: 'fighter2', label: 'Maria Rodriguez' },
                  { value: 'fighter3', label: 'John Smith' },
                  { value: 'fighter4', label: 'Sarah Williams' },
                  { value: 'fighter5', label: 'David Lee' },
                ]}
              />
            </div>
          </FormSection>

          {/* Emergency Contact Section */}
          <FormSection
            title='Emergency Information'
            color='bg-red-900'
            icon={<Phone size={20} />}
          >
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                label='Emergency Contact Name'
                name='emergencyContactName'
                type='text'
                value={formData.emergencyContactName}
                onChange={handleInputChange}
                placeholder='Full Name'
                required={true}
              />

              <FormField
                label='Emergency Contact Number'
                name='emergencyContactNumber'
                type='tel'
                value={formData.emergencyContactNumber}
                onChange={handleInputChange}
                placeholder='+1 555-123-4567'
                required={true}
                validation='Valid phone format'
              />
            </div>
          </FormSection>

          {/* Event Information Section */}
          <FormSection
            title='Event Information'
            color='bg-indigo-900'
            icon={<Calendar size={20} />}
          >
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                label='Associated Events'
                name='associatedEvents'
                type='select'
                value={formData.associatedEvents}
                onChange={handleInputChange}
                required={false}
                options={[
                  { value: 'event1', label: 'Championship Finals 2025' },
                  { value: 'event2', label: 'Regional Tournament June' },
                  { value: 'event3', label: 'International Showcase' },
                  { value: 'event4', label: 'Qualifying Rounds 2025' },
                ]}
              />

              <FormField
                label='Accreditation Type'
                name='accreditationType'
                type='select'
                value={formData.accreditationType}
                onChange={handleInputChange}
                required={false}
                options={[
                  { value: '', label: 'Select Role' },
                  { value: 'coach', label: 'Coach' },
                  { value: 'cutman', label: 'Cutman' },
                  { value: 'assistant', label: 'Assistant' },
                ]}
              />
            </div>
          </FormSection>

          {/* Suspension Information Section */}
          <FormSection
            title='Suspension Information'
            color='bg-orange-900'
            icon={<AlertTriangle size={20} />}
          >
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='md:col-span-3'>
                <label className='flex items-center space-x-2 cursor-pointer'>
                  <input
                    type='checkbox'
                    name='isSuspended'
                    checked={formData.isSuspended}
                    onChange={handleInputChange}
                    className='w-4 h-4'
                  />
                  <span>Is Suspended?</span>
                </label>
              </div>

              {formData.isSuspended && (
                <>
                  <FormField
                    label='Suspension Type'
                    name='suspensionType'
                    type='select'
                    value={formData.suspensionType}
                    onChange={handleInputChange}
                    required={false}
                    options={[
                      { value: '', label: 'Select Reason' },
                      { value: 'disciplinary', label: 'Disciplinary' },
                      { value: 'medical', label: 'Medical' },
                      { value: 'administrative', label: 'Administrative' },
                    ]}
                  />

                  <FormField
                    label='Suspension Start Date'
                    name='suspensionStartDate'
                    type='date'
                    value={formData.suspensionStartDate}
                    onChange={handleInputChange}
                    required={false}
                  />

                  <FormField
                    label='Suspension End Date'
                    name='suspensionEndDate'
                    type='date'
                    value={formData.suspensionEndDate}
                    onChange={handleInputChange}
                    required={false}
                  />
                  <div className='md:col-span-3'>
                    <FormField
                      label='Suspension Notes'
                      name='suspensionNotes'
                      type='textarea'
                      value={formData.suspensionNotes}
                      onChange={handleInputChange}
                      placeholder='Max 200 characters'
                      required={false}
                      validation='Max 200 characters'
                    />
                  </div>
                  <div className='md:col-span-3'>
                    <label className='flex items-center space-x-2 cursor-pointer'>
                      <input
                        type='checkbox'
                        name='medicalClearance'
                        checked={formData.medicalClearance}
                        onChange={handleInputChange}
                        className='w-4 h-4'
                      />
                      <span>Medical Clearance Required</span>
                    </label>
                  </div>

                  {formData.medicalClearance && (
                    <FormField
                      label='Medical Documentation'
                      name='medicalDocs'
                      type='file'
                      value={formData.medicalDocs}
                      handleFileChange={handleFileChange}
                      required={false}
                      validation='PDF/JPG, Max 5MB'
                    />
                  )}
                </>
              )}
            </div>
          </FormSection>

          {/* Form Actions */}
          <div className='bg-gray-800 p-4 rounded-lg'>
            <div className='flex flex-wrap gap-4 justify-end'>
              <button
                type='button'
                onClick={() => console.log('Saving draft...')}
                className='flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded'
              >
                <Save size={18} />
                Save Draft
              </button>
              <button
                type='button'
                onClick={handleSubmit}
                className='flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded'
              >
                <Send size={18} />
                Submit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrainerProfileForm
