'use client'
import axios from 'axios'
import React, { useState } from 'react'
import useUserStore from '../../../../../stores/userStore'
import { API_BASE_URL, apiConstants } from '../../../../../constants'
import { enqueueSnackbar } from 'notistack'

export default function ChangePassword() {
  const user = useUserStore((state) => state.user)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }
  console.log('Form data:', formData)

  const handleSubmit = async (e) => {
    try {
      e.preventDefault()

      console.log('Form submitted:', formData)

      const response = await axios.post(
        `${API_BASE_URL}/auth/change-password`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      )

      console.log('Response:', response)
      if (response.status === apiConstants.success) {
        enqueueSnackbar(response.data.message, {
          variant: 'success',
        })
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        })
      }
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || 'Something went wrong',
        {
          variant: 'error',
        }
      )
      console.log('Error:', error)
    }
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
              name='currentPassword'
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
              name='confirmNewPassword'
              value={formData.confirmNewPassword}
              onChange={handleChange}
              className='w-full outline-none'
              required
            />
          </div>

          {/* Action Buttons */}
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
        </form>
      </div>
    </div>
  )
}
