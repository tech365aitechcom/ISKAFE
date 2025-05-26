'use client'
import React, { useEffect, useState } from 'react'
import {
  Instagram,
  Youtube,
  Facebook,
  Upload,
  User,
  Phone,
  Mail,
  Award,
  Dumbbell,
  FileText,
  Save,
  Send,
} from 'lucide-react'
import FormField from '../../../_components/FormField'
import FormSection from '../../../_components/FormSection'

const FighterProfileForm = () => {
  const [formData, setFormData] = useState({
    // Basic Info
    fullName: '',
    nickname: '',
    username: '',
    profilePhoto: null,
    gender: '',
    dateOfBirth: '',
    height: '',
    weight: '',
    weightClass: '',
    location: '',

    // Contact & Social Info
    phoneNumber: '',
    email: '',
    instagram: '',
    youtube: '',
    facebook: '',

    // Fight Profile & Background
    bio: '',
    gymInfo: '',
    coachName: '',
    affiliations: '',
    trainingExperience: '',
    credentials: '',

    // Achievements
    nationalRank: '',
    globalRank: '',
    achievements: '',
    recordString: '',

    // Media
    mediaGallery: null,
    videoHighlight: '',

    // Compliance
    medicalCertificate: null,
    licenseDocument: null,
  })
  const [previewImages, setPreviewImages] = useState({
    profilePhoto: '',
    mediaGallery: '',
    medicalCertificate: '',
    licenseDocument: '',
  })

  // Dummy Data on mount
  useEffect(() => {
    const dummyData = {
      fullName: 'John Doe',
      nickname: 'The Crusher',
      username: 'crusher99',
      gender: 'male',
      dateOfBirth: '1990-01-01',
      height: `5'10"`,
      weight: '170',
      weightClass: 'welterweight',
      location: 'New York, NY, USA',
      phoneNumber: '+1 123-456-7890',
      email: 'johndoe@example.com',
      instagram: 'https://instagram.com/johndoe',
      youtube: 'https://youtube.com/@johndoe',
      facebook: 'https://facebook.com/johndoe',
      bio: 'Former amateur boxing champion turned MMA fighter.',
      gymInfo: 'XYZ MMA Gym',
      coachName: 'Coach Mike',
      affiliations: 'XYZ Fight Club',
      trainingExperience: '10 years',
      credentials: 'Black belt in BJJ, Golden Gloves Winner',
      nationalRank: '3',
      globalRank: '25',
      achievements: 'Golden Gloves Champion, UFC Top 30',
      recordString: '10-2-0',
      videoHighlight: 'https://youtube.com/watch?v=example',
    }

    setFormData((prev) => ({ ...prev, ...dummyData }))
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
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
        submitFormData.append(key, formData[key])
      }
    })

    // In a real application, you would send this FormData to your API
    console.log('Submitting form data...')

    // Example of form submission (commented out)
    // fetch('/api/fighter-profile', {
    //   method: 'POST',
    //   body: submitFormData,
    // })
    // .then(response => response.json())
    // .then(data => console.log("Success:", data))
    // .catch(error => console.error("Error:", error));
  }

  return (
    <div className='min-h-screen py-6 text-white flex flex-col items-center p-4'>
      <div className='w-full container mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl md:text-5xl font-bold text-white'>
            My Fighter Profile
          </h1>
        </div>
        <div className='space-y-6'>
          {/* Basic Info Section */}
          <FormSection
            title='Basic Info'
            color='bg-blue-900'
            icon={<User size={20} />}
          >
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <FormField
                label='Full Name'
                name='fullName'
                type='text'
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder='Enter full name'
                required={true}
                validation='No special characters'
              />

              <FormField
                label='Nickname'
                name='nickname'
                type='text'
                value={formData.nickname}
                onChange={handleInputChange}
                placeholder='e.g., Destroyer'
                validation='Alphanumeric or quote text'
              />

              <FormField
                label='Username'
                name='username'
                type='text'
                value={formData.username}
                onChange={handleInputChange}
                placeholder='e.g., fighter123'
                validation='Alphanumeric'
              />
              <div>
                <FormField
                  label='Profile Photo'
                  name='profilePhoto'
                  type='file'
                  value={formData.profilePhoto}
                  placeholder='Upload profile image'
                  required={true}
                  validation='JPG, PNG, Max 2MB'
                  handleFileChange={handleFileChange}
                />
                {previewImages.profilePhoto && (
                  <img
                    src={previewImages.profilePhoto}
                    alt='Preview'
                    className='mt-2 w-32 h-32 object-cover rounded'
                  />
                )}
              </div>
              <FormField
                label='Gender'
                name='gender'
                type='radio'
                value={formData.gender}
                onChange={handleInputChange}
                required={true}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
              />

              <FormField
                label='Date of Birth'
                name='dateOfBirth'
                type='date'
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required={true}
                validation='Must be 18+'
              />

              <FormField
                label='Height'
                name='height'
                type='text'
                value={formData.height}
                onChange={handleInputChange}
                placeholder="e.g., 5'9"
                required={true}
                validation='Feet & Inches or CM'
              />

              <FormField
                label='Weight'
                name='weight'
                type='number'
                value={formData.weight}
                onChange={handleInputChange}
                placeholder='e.g., 145'
                required={true}
                validation='LBS or KG'
              />

              <FormField
                label='Weight Class'
                name='weightClass'
                type='select'
                value={formData.weightClass}
                onChange={handleInputChange}
                required={true}
                options={[
                  { value: 'flyweight', label: 'Flyweight' },
                  { value: 'bantamweight', label: 'Bantamweight' },
                  { value: 'featherweight', label: 'Featherweight' },
                  { value: 'lightweight', label: 'Lightweight' },
                  { value: 'welterweight', label: 'Welterweight' },
                  { value: 'middleweight', label: 'Middleweight' },
                  { value: 'lightheavyweight', label: 'Light Heavyweight' },
                  { value: 'heavyweight', label: 'Heavyweight' },
                ]}
              />

              <FormField
                label='Location'
                name='location'
                type='text'
                value={formData.location}
                onChange={handleInputChange}
                placeholder='e.g., Gilroy, CA, USA'
                required={true}
                validation='City, state, country'
              />
            </div>
          </FormSection>

          {/* Contact & Social Info */}
          <FormSection
            title='Contact & Social Info'
            color='bg-purple-900'
            icon={<Phone size={20} />}
          >
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <FormField
                label='Phone Number'
                name='phoneNumber'
                type='tel'
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder='+1 555-123-4567'
                validation='Must be valid mobile number'
              />

              <FormField
                label='Email Address'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleInputChange}
                placeholder='name@example.com'
                validation='Must be valid email'
              />

              <FormField
                label='Instagram'
                name='instagram'
                type='url'
                value={formData.instagram}
                onChange={handleInputChange}
                placeholder='https://instagram.com/username'
                validation='Valid URL'
              >
                <div className='flex'>
                  <div className='bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500 p-2 rounded-l-md'>
                    <Instagram size={24} />
                  </div>
                  <input
                    type='url'
                    name='instagram'
                    value={formData.instagram}
                    onChange={handleInputChange}
                    placeholder='https://instagram.com/username'
                    className='flex-1 bg-gray-700 border border-gray-600 rounded-r-md p-2 text-white'
                  />
                </div>
              </FormField>

              <FormField
                label='YouTube Channel'
                name='youtube'
                type='url'
                value={formData.youtube}
                onChange={handleInputChange}
                placeholder='https://youtube.com/channel'
                validation='Valid URL'
              >
                <div className='flex'>
                  <div className='bg-red-600 p-2 rounded-l-md'>
                    <Youtube size={24} />
                  </div>
                  <input
                    type='url'
                    name='youtube'
                    value={formData.youtube}
                    onChange={handleInputChange}
                    placeholder='https://youtube.com/channel'
                    className='flex-1 bg-gray-700 border border-gray-600 rounded-r-md p-2 text-white'
                  />
                </div>
              </FormField>

              <FormField
                label='Facebook Profile'
                name='facebook'
                type='url'
                value={formData.facebook}
                onChange={handleInputChange}
                placeholder='https://facebook.com/profile'
                validation='Valid URL'
              >
                <div className='flex'>
                  <div className='bg-blue-600 p-2 rounded-l-md'>
                    <Facebook size={24} />
                  </div>
                  <input
                    type='url'
                    name='facebook'
                    value={formData.facebook}
                    onChange={handleInputChange}
                    placeholder='https://facebook.com/profile'
                    className='flex-1 bg-gray-700 border border-gray-600 rounded-r-md p-2 text-white'
                  />
                </div>
              </FormField>
            </div>
          </FormSection>

          {/* Fight Profile & Background */}
          <FormSection
            title='Fight Profile & Background'
            color='bg-green-900'
            icon={<Dumbbell size={20} />}
          >
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='md:col-span-3'>
                <FormField
                  label='Bio / Fighter History'
                  name='bio'
                  type='textarea'
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder='Write about your journey'
                  validation='Max 1000 characters'
                />
              </div>

              <FormField
                label='Primary Gym / Club'
                name='gymInfo'
                type='text'
                value={formData.gymInfo}
                onChange={handleInputChange}
                placeholder='e.g., Top Strike MMA Club'
                required={true}
              />

              <FormField
                label='Coach Name'
                name='coachName'
                type='text'
                value={formData.coachName}
                onChange={handleInputChange}
                placeholder='e.g., Mike Sanderson'
              />

              <FormField
                label='Affiliations'
                name='affiliations'
                type='text'
                value={formData.affiliations}
                onChange={handleInputChange}
                placeholder='e.g., WeCanKickULLC'
              />

              <FormField
                label='Training Experience'
                name='trainingExperience'
                type='text'
                value={formData.trainingExperience}
                onChange={handleInputChange}
                placeholder='e.g., 12 years in boxing'
              />

              <FormField
                label='Credentials'
                name='credentials'
                type='text'
                value={formData.credentials}
                onChange={handleInputChange}
                placeholder='e.g., Red belt in Muay Thai'
              />
            </div>
          </FormSection>

          {/* Achievements & Career Milestones */}
          <FormSection
            title='Achievements & Career Milestones'
            color='bg-yellow-900'
            icon={<Award size={20} />}
          >
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <FormField
                label='National Ranking'
                name='nationalRank'
                type='number'
                value={formData.nationalRank}
                onChange={handleInputChange}
                placeholder='e.g., 4'
                validation='Numeric or blank'
              />

              <FormField
                label='Global Rank'
                name='globalRank'
                type='number'
                value={formData.globalRank}
                onChange={handleInputChange}
                placeholder='e.g., 18'
                validation='Numeric or blank'
              />

              <FormField
                label='Achievements'
                name='achievements'
                type='text'
                value={formData.achievements}
                onChange={handleInputChange}
                placeholder='e.g., Lightweight 2023'
              />

              <FormField
                label='Record String Highlights'
                name='recordString'
                type='text'
                value={formData.recordString}
                onChange={handleInputChange}
                placeholder='e.g., Fastest KO - 0:23'
              />
            </div>
          </FormSection>

          {/* Media Uploads */}
          <FormSection
            title='Media Uploads'
            color='bg-red-900'
            icon={<Upload size={20} />}
          >
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <FormField
                label='Media Gallery'
                name='mediaGallery'
                type='file'
                value={formData.mediaGallery}
                validation='JPG, PNG, Max 5MB per file'
              />

              <FormField
                label='Video Highlight (YouTube URL)'
                name='videoHighlight'
                type='url'
                value={formData.videoHighlight}
                onChange={handleInputChange}
                placeholder='https://youtube.com/watch?v='
                validation='Must be valid YouTube URL'
              />
            </div>
          </FormSection>

          {/* Compliance Uploads */}
          <FormSection
            title='Compliance Uploads'
            color='bg-orange-900'
            icon={<FileText size={20} />}
          >
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <FormField
                label='Medical Certificate'
                name='medicalCertificate'
                type='file'
                value={formData.medicalCertificate}
                required={true}
                validation='PDF, JPG, PNG'
              />

              <FormField
                label='License Document'
                name='licenseDocument'
                type='file'
                value={formData.licenseDocument}
                required={true}
                validation='PDF or Image'
              />
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

export default FighterProfileForm
