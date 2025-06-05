import React, { useEffect, useState } from 'react'
import { User, Dumbbell, Phone, Camera, Trophy } from 'lucide-react'

const FightProfileForm = ({ userDetails }) => {
  const [formData, setFormData] = useState({
    // Basic Info
    fullName: '',
    nickName: '',
    userName: '',
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
    profilePhoto: null,
    mediaGallery: null,
  })

  useEffect(() => {
    if (userDetails?.dateOfBirth) {
      const formattedDOB = new Date(userDetails.dateOfBirth)
        .toISOString()
        .split('T')[0]
      setFormData((prev) => ({
        ...prev,
        ...userDetails,
        dateOfBirth: formattedDOB,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        ...userDetails,
      }))
    }
  }, [userDetails])

  const weightClasses = [
    'Strawweight (115 lbs)',
    'Flyweight (125 lbs)',
    'Bantamweight (135 lbs)',
    'Featherweight (145 lbs)',
    'Lightweight (155 lbs)',
    'Welterweight (170 lbs)',
    'Middleweight (185 lbs)',
    'Light Heavyweight (205 lbs)',
    'Heavyweight (265 lbs)',
    'Super Heavyweight (265+ lbs)',
  ]

  const experienceLevels = [
    'Beginner (0-2 years)',
    'Intermediate (3-5 years)',
    'Advanced (6-10 years)',
    'Expert (10+ years)',
    'Professional',
  ]

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    const file = files[0]

    if (file) {
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }))

      // Create preview for images
      if (
        file.type.startsWith('image/') &&
        (name === 'profilePhoto' || name === 'mediaGallery')
      ) {
        const reader = new FileReader()
        reader.onload = (event) => {
          setPreviewImages((prev) => ({
            ...prev,
            [name]: event.target.result,
          }))
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const handleSubmit = () => {
    console.log('Form Data:', formData)
    alert('Profile saved successfully!')
  }

  return (
    <div className='min-h-screen text-white bg-[#0a0a1a] py-6 px-4'>
      <div className='container mx-auto'>
        <div className='flex items-center gap-4 mb-6'>
          <h1 className='text-4xl font-bold'>My Fighter Profile</h1>
        </div>

        {/* Basic Information */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-6'>
            <User className='w-6 h-6 text-blue-400' />
            <h2 className='text-2xl font-bold uppercase tracking-wide'>
              Basic Information
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            {/* Profile Photo */}
            <div className=''>
              <label className='block font-medium mb-2'>
                Profile Photo <span className='text-red-400'>*</span>
              </label>
              {previewImages.profilePhoto && (
                <div className='my-4 flex'>
                  <img
                    src={previewImages.profilePhoto}
                    alt='Profile Preview'
                    className='w-32 h-32 object-cover rounded-full border-4 border-purple-500'
                  />
                </div>
              )}
              <input
                type='file'
                name='profilePhoto'
                onChange={handleFileChange}
                accept='image/jpeg,image/jpg,image/png'
                className='w-full outline-none bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700'
              />
              <p className='text-xs text-gray-400 mt-1'>JPG/PNG, Max 2MB</p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            {/* Basic Info Fields */}
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>
                Full Name <span className='text-red-400'>*</span>
              </label>
              <input
                type='text'
                name='fullName'
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder='Enter full name'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                required
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Nick name</label>
              <input
                type='text'
                name='nickName'
                value={formData.nickName}
                onChange={handleInputChange}
                placeholder='e.g., The Destroyer'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>
                User name <span className='text-red-400'>*</span>
              </label>
              <input
                type='text'
                name='userName'
                value={formData.userName}
                onChange={handleInputChange}
                placeholder='Enter User Name'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
                required
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Gender</label>
              <select
                name='gender'
                value={formData.gender}
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent text-white'
              >
                <option value='' className='text-black'>
                  Select Gender
                </option>
                <option value='male' className='text-black'>
                  Male
                </option>
                <option value='female' className='text-black'>
                  Female
                </option>
                <option value='other' className='text-black'>
                  Other
                </option>
              </select>
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Date of Birth</label>
              <input
                type='date'
                name='dateOfBirth'
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className='w-full p-3 outline-none bg-white/10 rounded-lg text-white border border-white/20 focus:border-purple-400 transition-colors'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Location</label>
              <input
                type='text'
                name='location'
                value={formData.location}
                onChange={handleInputChange}
                placeholder='City, Country'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>
          </div>

          {/* Physical Stats */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-6'>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Height</label>
              <input
                type='text'
                name='height'
                value={formData.height}
                onChange={handleInputChange}
                placeholder="e.g., 5'10 or 178 cm"
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Weight</label>
              <input
                type='text'
                name='weight'
                value={formData.weight}
                onChange={handleInputChange}
                placeholder='e.g., 170 lbs or 77 kg'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Weight Class</label>
              <select
                name='weightClass'
                value={formData.weightClass}
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent text-white'
              >
                <option value='' className='text-black'>
                  Select Weight Class
                </option>
                {weightClasses.map((weightClass) => (
                  <option
                    key={weightClass}
                    value={weightClass}
                    className='text-black'
                  >
                    {weightClass}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Contact & Social Information */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-6'>
            <Phone className='w-6 h-6 text-green-400' />
            <h2 className='text-2xl font-bold uppercase tracking-wide'>
              Contact & Social Media
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Phone Number</label>
              <input
                type='tel'
                name='phoneNumber'
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder='+1 555-123-4567'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Email Address</label>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                placeholder='fighter@example.com'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Instagram URL</label>
              <input
                type='url'
                name='instagram'
                value={formData.instagram}
                onChange={handleInputChange}
                placeholder='https://instagram.com/userName'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>YouTube URL</label>
              <input
                type='url'
                name='youtube'
                value={formData.youtube}
                onChange={handleInputChange}
                placeholder='https://youtube.com/channel'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded md:col-span-2'>
              <label className='block font-medium mb-2'>Facebook URL</label>
              <input
                type='url'
                name='facebook'
                value={formData.facebook}
                onChange={handleInputChange}
                placeholder='https://facebook.com/userName'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>
          </div>
        </div>

        {/* Fight Profile & Background */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-6'>
            <Dumbbell className='w-6 h-6 text-orange-400' />
            <h2 className='text-2xl font-bold uppercase tracking-wide'>
              Fight Profile & Background
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Fighter Bio</label>
              <textarea
                name='bio'
                value={formData.bio}
                onChange={handleInputChange}
                placeholder='Tell your story, fighting style, and what drives you...'
                rows='4'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400 resize-none'
              />
              <p className='text-xs text-gray-400 mt-1'>Max 500 characters</p>
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Gym Information</label>
              <textarea
                name='gymInfo'
                value={formData.gymInfo}
                onChange={handleInputChange}
                placeholder='Gym name, location, facilities...'
                rows='4'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400 resize-none'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Coach Name</label>
              <input
                type='text'
                name='coachName'
                value={formData.coachName}
                onChange={handleInputChange}
                placeholder='Primary coach or trainer'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>
                Training Experience
              </label>
              <select
                name='trainingExperience'
                value={formData.trainingExperience}
                onChange={handleInputChange}
                className='w-full outline-none bg-transparent text-white'
              >
                <option value='' className='text-black'>
                  Select Experience Level
                </option>
                {experienceLevels.map((level) => (
                  <option key={level} value={level} className='text-black'>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div className='bg-[#00000061] p-2 rounded md:col-span-2'>
              <label className='block font-medium mb-2'>Affiliations</label>
              <input
                type='text'
                name='affiliations'
                value={formData.affiliations}
                onChange={handleInputChange}
                placeholder='Teams, organizations, sponsors...'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded md:col-span-2'>
              <label className='block font-medium mb-2'>Credentials</label>
              <textarea
                name='credentials'
                value={formData.credentials}
                onChange={handleInputChange}
                placeholder='Certifications, belts, rankings, special training...'
                rows='3'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400 resize-none'
              />
            </div>
          </div>
        </div>

        {/* Achievements & Rankings */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-6'>
            <Trophy className='w-6 h-6 text-yellow-400' />
            <h2 className='text-2xl font-bold uppercase tracking-wide'>
              Achievements & Rankings
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>National Ranking</label>
              <input
                type='text'
                name='nationalRank'
                value={formData.nationalRank}
                onChange={handleInputChange}
                placeholder='e.g., #5 in Lightweight Division'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Global Ranking</label>
              <input
                type='text'
                name='globalRank'
                value={formData.globalRank}
                onChange={handleInputChange}
                placeholder='e.g., #15 Worldwide'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Fight Record</label>
              <input
                type='text'
                name='recordString'
                value={formData.recordString}
                onChange={handleInputChange}
                placeholder='e.g., 15-3-1 (W-L-D)'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>
                Video Highlight URL
              </label>
              <input
                type='url'
                name='videoHighlight'
                value={formData.videoHighlight}
                onChange={handleInputChange}
                placeholder='https://youtube.com/watch?v=...'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400'
              />
            </div>

            <div className='bg-[#00000061] p-2 rounded md:col-span-2'>
              <label className='block font-medium mb-2'>
                Major Achievements
              </label>
              <textarea
                name='achievements'
                value={formData.achievements}
                onChange={handleInputChange}
                placeholder='Championships, tournaments won, notable victories...'
                rows='3'
                className='w-full outline-none bg-transparent text-white disabled:text-gray-400 resize-none'
              />
            </div>
          </div>
        </div>

        {/* Media & Documentation */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-6'>
            <Camera className='w-6 h-6 text-pink-400' />
            <h2 className='text-2xl font-bold uppercase tracking-wide'>
              Media & Documentation
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>Media Gallery</label>
              <input
                type='file'
                name='mediaGallery'
                onChange={handleFileChange}
                accept='image/*'
                multiple
                className='w-full outline-none bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700'
              />
              <p className='text-xs text-gray-400 mt-1'>
                Images only, Max 5MB each
              </p>
              {previewImages.mediaGallery && (
                <img
                  src={previewImages.mediaGallery}
                  alt='Media Preview'
                  className='mt-2 w-full h-32 object-cover rounded-lg'
                />
              )}
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>
                Medical Certificate
              </label>
              <input
                type='file'
                name='medicalCertificate'
                onChange={handleFileChange}
                accept='.pdf,.jpg,.jpeg,.png'
                className='w-full outline-none bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700'
              />
              <p className='text-xs text-gray-400 mt-1'>PDF/Image, Max 5MB</p>
            </div>

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block font-medium mb-2'>License Document</label>
              <input
                type='file'
                name='licenseDocument'
                onChange={handleFileChange}
                accept='.pdf,.jpg,.jpeg,.png'
                className='w-full outline-none bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700'
              />
              <p className='text-xs text-gray-400 mt-1'>PDF/Image, Max 5MB</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-center gap-4 mt-8'>
          <button
            type='button'
            onClick={() => console.log('Cancel')}
            className='bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-8 rounded-xl transition duration-300 transform hover:scale-105'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleSubmit}
            className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-8 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg'
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  )
}

export default FightProfileForm
