'use client'
import { ChevronDown, Trash } from 'lucide-react'
import React, { useState } from 'react'

export const ProfileForm = ({ isEditable }) => {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    mobile: '9876543210',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    role: 'Fighter',
    profilePic: '/fighter.png',
    country: 'USA',
    city: 'New York',
    governmentID: 'https://example.com/gov-id.jpg',
    weightClass: 'Middleweight',
    fightRecord: '10 Wins, 2 Losses, 1 Draw',
    trainedFighters: 'Fighter A, Fighter B, Fighter C',
    makeProfilePublic: true,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const previewURL = URL.createObjectURL(file)
      setFormData((prevState) => ({
        ...prevState,
        profilePic: previewURL,
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log('Form submitted:', { ...formData, enabled })
  }

  return (
    <div className='min-h-screen text-white bg-dark-blue-900 mt-4'>
      <h3 className='text-2xl font-semibold py-4'>
        {isEditable ? 'Edit Profile' : 'My Profile'}
      </h3>
      <div className='w-full'>
        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Profile Picture */}
          {isEditable ? (
            <div className='mb-8'>
              {formData.profilePic ? (
                <div className='relative w-72 h-64 rounded-lg overflow-hidden border border-[#D9E2F930]'>
                  <img
                    src={formData.profilePic}
                    alt='Selected image'
                    className='w-full h-full object-cover'
                  />
                  <button
                    type='button'
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, profilePic: null }))
                    }
                    className='absolute top-2 right-2 bg-[#14255D] p-1 rounded text-[#AEB9E1] shadow-md z-20'
                  >
                    <Trash className='w-4 h-4' />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor='profile-pic-upload'
                  className='cursor-pointer border-2 border-dashed border-gray-500 rounded-lg flex flex-col items-center justify-center w-72 h-52 relative overflow-hidden'
                >
                  <input
                    id='profile-pic-upload'
                    type='file'
                    accept='image/*'
                    onChange={handleFileChange}
                    className='absolute inset-0 opacity-0 cursor-pointer z-50'
                  />

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
                    <span className='text-[#FEF200] mr-1'>Click to upload</span>
                    or drag and drop profile pic
                    <br />
                    SVG, PNG, JPG or GIF (max. 800 x 400px)
                  </p>
                </label>
              )}
            </div>
          ) : (
            <div className='mb-8'>
              <div className='relative w-72 h-64 rounded-lg overflow-hidden border border-[#D9E2F930]'>
                <img
                  src={formData.profilePic}
                  alt='Profile photo'
                  className='w-full h-full object-cover'
                />
              </div>
            </div>
          )}

          {/* PERSONAL DETAILS */}
          <h2 className='font-bold mb-4 uppercase text-sm'>Personal Details</h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            {/* First Name Field */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Full Name<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleChange}
                className='w-full outline-none'
                required
                disabled={!isEditable}
              />
            </div>

            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Email Address<span className='text-red-500'>*</span>
              </label>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                className='w-full outline-none'
                required
                disabled={!isEditable}
              />
            </div>

            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Mobile Number<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='mobile'
                value={formData.mobile}
                onChange={handleChange}
                className='w-full outline-none'
                required
                disabled={!isEditable}
              />
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Date of Birth
              </label>
              <input
                type='date'
                name='dateOfBirth'
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={!isEditable}
                className='w-full outline-none bg-transparent text-white'
              />
            </div>

            <div className='bg-[#00000061] p-2 h-auto rounded'>
              <label className='block text-sm font-medium mb-1 text-white'>
                Gender
              </label>
              <div className='flex gap-4 text-white'>
                <label className='flex items-center gap-1'>
                  <input
                    type='radio'
                    name='gender'
                    value='male'
                    checked={formData.gender === 'male'}
                    onChange={handleChange}
                    readOnly
                    disabled={!isEditable}
                  />
                  Male
                </label>
                <label className='flex items-center gap-1'>
                  <input
                    type='radio'
                    name='gender'
                    value='female'
                    checked={formData.gender === 'female'}
                    onChange={handleChange}
                    readOnly
                    disabled={!isEditable}
                  />
                  Female
                </label>
                <label className='flex items-center gap-1'>
                  <input
                    type='radio'
                    name='gender'
                    value='other'
                    checked={formData.gender === 'other'}
                    onChange={handleChange}
                    readOnly
                    disabled={!isEditable}
                  />
                  Other
                </label>
              </div>
            </div>
          </div>

          <h2 className='font-bold mb-4 uppercase text-sm'>Profile Type</h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <div className='relative flex items-center justify-between w-full px-4 py-2 rounded-lg bg-[#081028]'>
              <select
                id='role'
                name='role'
                value={formData.role}
                className='w-full bg-transparent text-white appearance-none outline-none cursor-pointer'
                disabled={!isEditable}
              >
                <option value='Fighter' className='text-black'>
                  Fighter
                </option>
                <option value='Trainer' className='text-black'>
                  Trainer
                </option>
                <option value='Official' className='text-black'>
                  Official
                </option>
                <option value='Admin' className='text-black'>
                  Admin
                </option>
              </select>
              <ChevronDown
                size={16}
                className='absolute right-4 pointer-events-none'
              />
            </div>
          </div>

          {/* Address Details */}
          <h2 className='font-bold mb-4 uppercase text-sm'>Address</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            {/* Country */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>Country</label>
              <select
                name='country'
                value={formData.country}
                onChange={handleChange}
                className='w-full bg-transparent text-white outline-none'
                disabled={!isEditable}
              >
                <option value='' className='text-black'>
                  Select Country
                </option>
                <option value='USA' className='text-black'>
                  USA
                </option>
                <option value='India' className='text-black'>
                  India
                </option>
                <option value='UK' className='text-black'>
                  UK
                </option>
              </select>
            </div>

            {/* City */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>City</label>
              <input
                type='text'
                name='city'
                value={formData.city}
                onChange={handleChange}
                className='w-full outline-none bg-transparent text-white'
                disabled={!isEditable}
              />
            </div>
          </div>

          {/* ID Verification */}
          <h2 className='font-bold mb-4 uppercase text-sm'>ID Verification</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <div className='bg-[#00000061] p-2 h-20 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Government ID Upload
              </label>
              <input
                type='file'
                name='governmentId'
                accept='.pdf, .jpg, .jpeg, .png'
                className='w-full text-white'
                disabled={!isEditable}
              />
            </div>
          </div>

          {formData.role === 'Fighter' && (
            <>
              <h2 className='font-bold mb-4 uppercase text-sm'>Fighter Info</h2>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                {/* Weight Class */}
                <div className='bg-[#00000061] p-2 h-16 rounded'>
                  <label className='block text-sm font-medium mb-1'>
                    Weight Class
                  </label>
                  <select
                    name='weightClass'
                    value={formData.weightClass}
                    onChange={handleChange}
                    className='w-full bg-transparent text-white outline-none'
                    disabled={!isEditable}
                  >
                    <option value='' className='text-black'>
                      Select Weight Class
                    </option>
                    <option value='Lightweight' className='text-black'>
                      Lightweight
                    </option>
                    <option value='Middleweight' className='text-black'>
                      Middleweight
                    </option>
                    <option value='Heavyweight' className='text-black'>
                      Heavyweight
                    </option>
                  </select>
                </div>
              </div>

              {/* Fight Record */}
              <div className='bg-[#00000061] p-2 rounded mb-6'>
                <label className='block text-sm font-medium mb-2'>
                  Fight Record
                </label>
                <textarea
                  name='fightRecord'
                  value={formData.fightRecord}
                  onChange={handleChange}
                  rows='1'
                  className='w-full bg-transparent text-white outline-none'
                  placeholder='Enter fight history or stats...'
                  disabled={!isEditable}
                />
              </div>
            </>
          )}
          {formData.role === 'Trainer' && (
            <>
              <h2 className='font-bold mb-4 uppercase text-sm'>Trainer Info</h2>
              <div className='bg-[#00000061] p-2 rounded mb-6'>
                <label className='block text-sm font-medium mb-2'>
                  Trained Fighters
                </label>
                <textarea
                  name='trainedFighters'
                  value={formData.trainedFighters}
                  onChange={handleChange}
                  rows='4'
                  className='w-full bg-transparent text-white outline-none'
                  placeholder='List names or IDs of fighters you’ve trained...'
                  disabled={!isEditable}
                />
              </div>
            </>
          )}
          {/* Privacy Settings */}
          <h2 className='font-bold uppercase text-sm'>Privacy Settings</h2>
          <div className='h-16 rounded mb-6 flex items-center gap-2'>
            <input
              type='checkbox'
              name='makeProfilePublic'
              checked={formData.makeProfilePublic}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  makeProfilePublic: e.target.checked,
                })
              }
              disabled={!isEditable}
            />
            <label className='text-sm font-medium'>Make Profile Public</label>
          </div>

          {/* Action Buttons */}
          {isEditable && (
            <div className='flex justify-center gap-4 mt-12'>
              <button
                type='submit'
                className='text-white font-medium py-2 px-6 rounded transition duration-200'
                style={{
                  background:
                    'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
                }}
              >
                Save
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
