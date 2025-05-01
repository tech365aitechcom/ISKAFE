'use client'
import React, { useState } from 'react'

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission logic here
  }

  return (
    <div className='min-h-screen text-white bg-dark-blue-900 mt-4'>
      <h3 className='text-2xl font-semibold py-4'>Change Password</h3>
      <div className='w-full'>
        {/* Form */}
        <form onSubmit={handleSubmit} className='flex flex-col space-y-4'>
          <div className='bg-[#00000061] p-2 h-16 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Current Password<span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              name='name'
              value={formData.currentPassword}
              onChange={handleChange}
              className='w-full outline-none'
              required
            />
          </div>

          <div className='bg-[#00000061] p-2 h-16 rounded'>
            <label className='block text-sm font-medium mb-1'>
              New Password<span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              name='newPassword'
              value={formData.newPassword}
              onChange={handleChange}
              className='w-full outline-none'
              required
            />
          </div>

          <div className='bg-[#00000061] p-2 h-16 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Confirm Password<span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              name='confirmPassword'
              value={formData.confirmPassword}
              onChange={handleChange}
              className='w-full outline-none'
              required
            />
          </div>

          {/* Action Buttons */}
          <div className='flex justify-center gap-4 mt-12'>
            <button
              type='submit'
              className='text-white font-medium py-2 px-6 rounded transition duration-200 cursor-pointer'
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
