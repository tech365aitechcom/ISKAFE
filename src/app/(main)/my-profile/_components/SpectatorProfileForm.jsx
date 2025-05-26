'use client'
import React, { useEffect, useState } from 'react'
import { User, MapPin, Bell, Save, ArrowLeft } from 'lucide-react'
import FormField from '../../../_components/FormField'
import FormSection from '../../../_components/FormSection'

const SpectatorProfileForm = () => {
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',

    // Address Info
    country: '',
    stateProvince: '',
    city: '',

    // Preferences
    communicationPreference: [],
  })

  // Dummy Data on mount
  useEffect(() => {
    const dummyData = {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phoneNumber: '+1 555-123-4567',
      dateOfBirth: '1985-06-15',
      gender: 'male',
      country: 'United States',
      stateProvince: 'California',
      city: 'San Francisco',
      communicationPreference: ['email'],
    }

    setFormData((prev) => ({ ...prev, ...dummyData }))
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === 'checkbox') {
      if (checked) {
        setFormData({
          ...formData,
          [name]: [...formData[name], value],
        })
      } else {
        setFormData({
          ...formData,
          [name]: formData[name].filter((item) => item !== value),
        })
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = () => {
    // Create FormData object for submission
    const submitFormData = new FormData()

    // Append all form fields to FormData
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        if (Array.isArray(formData[key])) {
          submitFormData.append(key, JSON.stringify(formData[key]))
        } else {
          submitFormData.append(key, formData[key])
        }
      }
    })

    // In a real application, you would send this FormData to your API
    console.log('Submitting form data...', formData)

    // Example of form submission (commented out)
    // fetch('/api/spectator-profile', {
    //   method: 'POST',
    //   body: submitFormData,
    // })
    // .then(response => response.json())
    // .then(data => console.log("Success:", data))
    // .catch(error => console.error("Error:", error));
  }

  return (
    <div className='min-h-screen py-6 bg-black text-white flex flex-col items-center p-4'>
      <div className='w-full container mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl md:text-5xl font-bold text-white'>
            My Profile
          </h1>
        </div>
        <div className='space-y-6'>
          {/* Personal Info Section */}
          <FormSection
            title='Personal Information'
            color='bg-blue-900'
            icon={<User size={20} />}
          >
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
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
                placeholder='user@example.com'
                required={true}
                validation='Valid email format'
              />

              <FormField
                label='Phone Number'
                name='phoneNumber'
                type='tel'
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder='Enter phone number'
                required={true}
                validation='10-15 digits'
              />

              <FormField
                label='Date of Birth'
                name='dateOfBirth'
                type='date'
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required={true}
                validation='Ages 13+'
              />

              <FormField
                label='Gender'
                name='gender'
                type='select'
                value={formData.gender}
                onChange={handleInputChange}
                options={[
                  { value: '', label: 'Select gender' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
                ]}
              />
            </div>
          </FormSection>

          {/* Address Section */}
          <FormSection
            title='Address Information'
            color='bg-green-900'
            icon={<MapPin size={20} />}
          >
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <FormField
                label='Country'
                name='country'
                type='select'
                value={formData.country}
                onChange={handleInputChange}
                required={true}
                options={[
                  { value: '', label: 'Select country' },
                  { value: 'United States', label: 'United States' },
                  { value: 'Canada', label: 'Canada' },
                  { value: 'United Kingdom', label: 'United Kingdom' },
                  { value: 'Australia', label: 'Australia' },
                  { value: 'Germany', label: 'Germany' },
                  { value: 'France', label: 'France' },
                  { value: 'Japan', label: 'Japan' },
                  { value: 'Brazil', label: 'Brazil' },
                  { value: 'India', label: 'India' },
                  { value: 'China', label: 'China' },
                ]}
              />

              <FormField
                label='State / Province'
                name='stateProvince'
                type='text'
                value={formData.stateProvince}
                onChange={handleInputChange}
                placeholder='Enter state/province'
                required={true}
                validation='Alphanumeric'
              />

              <FormField
                label='City'
                name='city'
                type='text'
                value={formData.city}
                onChange={handleInputChange}
                placeholder='Enter city'
                required={true}
                validation='Alphabetic only'
              />
            </div>
          </FormSection>

          {/* Preferences Section */}
          <FormSection
            title='Preferences'
            color='bg-purple-900'
            icon={<Bell size={20} />}
          >
            <div className='grid grid-cols-1 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Communication Preferences
                </label>
                <div className='space-y-2'>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='comm-email'
                      name='communicationPreference'
                      value='email'
                      checked={formData.communicationPreference.includes(
                        'email'
                      )}
                      onChange={handleInputChange}
                      className='rounded text-blue-500 focus:ring-blue-500 bg-gray-700 border-gray-600'
                    />
                    <label htmlFor='comm-email'>Email</label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='comm-sms'
                      name='communicationPreference'
                      value='sms'
                      checked={formData.communicationPreference.includes('sms')}
                      onChange={handleInputChange}
                      className='rounded text-blue-500 focus:ring-blue-500 bg-gray-700 border-gray-600'
                    />
                    <label htmlFor='comm-sms'>SMS</label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='comm-push'
                      name='communicationPreference'
                      value='push'
                      checked={formData.communicationPreference.includes(
                        'push'
                      )}
                      onChange={handleInputChange}
                      className='rounded text-blue-500 focus:ring-blue-500 bg-gray-700 border-gray-600'
                    />
                    <label htmlFor='comm-push'>Push Notifications</label>
                  </div>
                </div>
                <p className='text-xs text-gray-400 mt-1'>
                  Select how you'd like to receive updates, newsletters, etc.
                </p>
              </div>
            </div>
          </FormSection>

          {/* Form Actions */}
          <div className='bg-gray-800 p-4 rounded-lg'>
            <div className='flex flex-wrap gap-4 justify-between'>
              <button
                type='button'
                onClick={() => console.log('Canceling...')}
                className='flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded'
              >
                <ArrowLeft size={18} />
                Cancel / Back
              </button>
              <button
                type='button'
                onClick={handleSubmit}
                className='flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded'
              >
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpectatorProfileForm
