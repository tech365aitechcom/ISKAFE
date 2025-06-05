'use client'
import axios from 'axios'
import React, { useState } from 'react'
import useStore from '../../../stores/useStore'
import { API_BASE_URL, apiConstants } from '../../../constants'
import { enqueueSnackbar } from 'notistack'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '../../../../components/ui/button'

const ChangePassword = () => {
  const user = useStore((state) => state.user)

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })

  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const toggleVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleSubmit = async (e) => {
    try {
      e.preventDefault()

      const response = await axios.post(
        `${API_BASE_URL}/auth/change-password`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      )

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
    }
  }

  return (
    <div className='min-h-screen text-white bg-transparent'>
      <div className='w-full bg-purple-900'>
        <div className='max-w-3xl mx-auto py-6 px-4'>
          <div className='text-center mb-8'>
            <h1 className='text-4xl md:text-5xl font-bold text-white'>
              CHANGE PASSWORD
            </h1>
          </div>

          <form onSubmit={handleSubmit} className='flex flex-col space-y-4'>
            {/* Current Password */}
            <div className='bg-[#00000061] p-2 h-16 rounded relative'>
              <label className='block text-sm font-medium mb-1'>
                Current Password<span className='text-red-500'>*</span>
              </label>
              <input
                type={passwordVisibility.current ? 'text' : 'password'}
                name='currentPassword'
                value={formData.currentPassword}
                onChange={handleChange}
                className='w-full outline-none bg-transparent'
                required
              />
              <button
                type='button'
                onClick={() => toggleVisibility('current')}
                className='absolute right-4 top-1/2 -translate-y-1/2 text-white'
              >
                {passwordVisibility.current ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {/* New Password */}
            <div className='bg-[#00000061] p-2 h-16 rounded relative'>
              <label className='block text-sm font-medium mb-1'>
                New Password<span className='text-red-500'>*</span>
              </label>
              <input
                type={passwordVisibility.new ? 'text' : 'password'}
                name='newPassword'
                value={formData.newPassword}
                onChange={handleChange}
                className='w-full outline-none bg-transparent'
                required
              />
              <button
                type='button'
                onClick={() => toggleVisibility('new')}
                className='absolute right-4 top-1/2 -translate-y-1/2 text-white'
              >
                {passwordVisibility.new ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {/* Confirm Password */}
            <div className='bg-[#00000061] p-2 h-16 rounded relative'>
              <label className='block text-sm font-medium mb-1'>
                Confirm Password<span className='text-red-500'>*</span>
              </label>
              <input
                type={passwordVisibility.confirm ? 'text' : 'password'}
                name='confirmNewPassword'
                value={formData.confirmNewPassword}
                onChange={handleChange}
                className='w-full outline-none bg-transparent'
                required
              />
              <button
                type='button'
                onClick={() => toggleVisibility('confirm')}
                className='absolute right-4 top-1/2 -translate-y-1/2 text-white'
              >
                {passwordVisibility.confirm ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {/* Submit Button */}
            <div className='flex justify-center gap-4 mt-4'>
              <Button
                variant='secondary'
                size='lg'
                className='text-white'
                style={{
                  background:
                    'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
                }}
              >
                Submit
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword
