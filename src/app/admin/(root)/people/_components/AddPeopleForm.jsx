'use client'
import { Eye, EyeOff, Trash } from 'lucide-react'
import React, { useState } from 'react'

export const AddPeopleForm = ({ setShowAddPeopleForm }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    nickname: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    role: 'user',
    password: '',
    confirmPassword: '',
    about: '',
    isPremiumProfile: false,
    adminNotes: '',
    phoneNumber: '',
    country: '',
    state: '',
    postalCode: '',
    city: '',
    street1: '',
    street2: '',
    profilePic: null,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'parent', label: 'Parent' },
    { value: 'trainer', label: 'Trainer' },
    { value: 'fighter', label: 'Fighter' },
    { value: 'promoter', label: 'Promoter' },
    { value: 'trainer', label: 'Trainer' },
    { value: 'superAdmin', label: 'Super Admin' },
  ]

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
  console.log('Form Data:', formData)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log('Form submitted:', formData)
  }

  return (
    <div className='min-h-screen text-white bg-dark-blue-900'>
      <div className='w-full'>
        {/* Header with back button */}
        <div className='flex items-center gap-4 mb-6'>
          <button
            onClick={() => setShowAddPeopleForm(false)}
            className='mr-2 text-white'
          >
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
          <h1 className='text-2xl font-bold'>Add New People</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Image Upload */}
          <div className='mb-8'>
            {formData.profilePic ? (
              <div className='relative w-72 h-52 rounded-lg overflow-hidden border border-[#D9E2F930]'>
                <img
                  src={formData.profilePic}
                  alt='Selected Profile'
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
                value={formData.firstName}
                onChange={handleChange}
                className='w-full outline-none'
                required
                placeholder='Eric'
              />
            </div>

            {/* Middle Name Field */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>Middle</label>
              <input
                type='text'
                name='middleName'
                value={formData.middleName}
                onChange={handleChange}
                className='w-full outline-none'
                placeholder='M'
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
                value={formData.lastName}
                onChange={handleChange}
                className='w-full outline-none'
                required
                placeholder='Franks'
              />
            </div>

            {/* Suffix Field */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>Suffix</label>
              <input
                type='text'
                name='suffix'
                value={formData.suffix}
                onChange={handleChange}
                className='w-full outline-none'
                placeholder='Mr'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
            {/* Nickname Field */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>Nickname</label>
              <input
                type='text'
                name='nickname'
                value={formData.nickname}
                onChange={handleChange}
                className='w-full outline-none'
                placeholder='Eric'
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
                value={formData.email}
                onChange={handleChange}
                className='w-full outline-none'
                required
                placeholder='eric@gmail.com'
              />
            </div>

            {/* Gender Field */}
            <div className='mb-6 bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Gender<span className='text-red-500'>*</span>
              </label>
              <select
                name='gender'
                value={formData.gender}
                onChange={handleChange}
                className='w-full outline-none'
                required
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
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Date of Birth
              </label>
              <input
                type='text'
                name='dateOfBirth'
                value={formData.dateOfBirth}
                onChange={handleChange}
                className='w-full outline-none'
                placeholder='01/10/1997'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
            {/* Role Name Field */}
            <div className='mb-6 bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Role Name<span className='text-red-500'>*</span>
              </label>
              <select
                name='gender'
                value={formData.gender}
                onChange={handleChange}
                className='w-full outline-none'
                required
              >
                <option value='' className='text-black'>
                  Select role
                </option>
                {roleOptions.map((option, index) => (
                  <option
                    key={index}
                    value={option.value}
                    className='text-black'
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Password Field */}
            <div className='bg-[#00000061] p-2 h-16 rounded relative'>
              <label className='block text-xs font-medium mb-1'>
                Password<span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  placeholder='********'
                  className='w-full bg-transparent outline-none pr-10'
                  minLength={8}
                  required
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-white cursor-pointer'
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-xs font-medium mb-1'>
                Confirm Password<span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <input
                  type='password'
                  name='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder='********'
                  className='w-full bg-transparent outline-none'
                  minLength={8}
                  required
                />
                <span
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-white cursor-pointer'
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* About Field */}
          <div className='mb-4 bg-[#00000061] p-2 h-16 rounded'>
            <label className='block text-sm font-medium mb-1'>About</label>
            <textarea
              name='about'
              value={formData.about}
              onChange={handleChange}
              rows='2'
              className='w-full outline-none resize-none'
              placeholder='Message'
            />
          </div>

          {/* Premium Profile Checkbox */}
          <div className='mb-4 flex items-center'>
            <input
              type='checkbox'
              id='isPremiumProfile'
              name='isPremiumProfile'
              checked={formData.isPremiumProfile}
              onChange={handleChange}
              className='mr-2'
            />
            <label htmlFor='isPremiumProfile' className='text-sm'>
              Is Premium Profile?
            </label>
          </div>

          {/* Admin Notes Field */}
          <div className='mb-8 bg-[#00000061] p-2 h-16 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Admin Notes
            </label>
            <textarea
              name='adminNotes'
              value={formData.adminNotes}
              onChange={handleChange}
              rows='2'
              className='w-full outline-none resize-none'
              placeholder='Message'
            />
          </div>

          {/* ADDRESS DETAILS */}
          <h2 className='font-bold mb-4 uppercase text-sm'>Address Details</h2>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
            {/* Phone Number Field */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Phone Number
              </label>
              <input
                type='text'
                name='phoneNumber'
                value={formData.phoneNumber}
                onChange={handleChange}
                className='w-full outline-none'
              />
            </div>

            {/* Country Field */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Country<span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <select
                  name='country'
                  value={formData.country}
                  onChange={handleChange}
                  className='w-full outline-none appearance-none'
                  required
                >
                  <option value='United States' className='text-black'>
                    United States
                  </option>
                  <option value='Canada' className='text-black'>
                    Canada
                  </option>
                  <option value='UK' className='text-black'>
                    UK
                  </option>
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
                State/Province<span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <select
                  name='state'
                  value={formData.state}
                  onChange={handleChange}
                  className='w-full outline-none appearance-none'
                >
                  <option value='United States' className='text-black'>
                    United States
                  </option>
                  <option value='Other' className='text-black'>
                    Other
                  </option>
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
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>
                City<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='city'
                value={formData.city}
                onChange={handleChange}
                className='w-full outline-none'
                placeholder='Eric'
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
                value={formData.street1}
                onChange={handleChange}
                className='w-full outline-none'
              />
            </div>

            {/* Street 2 Field */}
            <div className='bg-[#00000061] p-2 h-16 rounded'>
              <label className='block text-sm font-medium mb-1'>Street 2</label>
              <input
                type='text'
                name='street2'
                value={formData.street2}
                onChange={handleChange}
                className='w-full outline-none'
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-center gap-4'>
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
        </form>
      </div>
    </div>
  )
}
