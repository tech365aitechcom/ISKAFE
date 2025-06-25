'use client'
import axios from 'axios'
import React, { useState } from 'react'
import useStore from '../../../stores/useStore'
import { API_BASE_URL, apiConstants } from '../../../constants'
import { enqueueSnackbar } from 'notistack'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '../../../../components/ui/button'
import Link from 'next/link'
import Loader from '../../_components/Loader'

const validatePasswordRules = (password) => {
  const errors = []
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    errors.push('Password must contain both letters and numbers')
  }
  return errors
}

const ChangePassword = () => {
  const user = useStore((state) => state.user)

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })
  const [loading, setLoading] = useState(false)
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
    e.preventDefault()
    setLoading(true)

    const validationErrors = validatePasswordRules(formData.newPassword)
    if (validationErrors.length > 0) {
      validationErrors.forEach((err) =>
        enqueueSnackbar(err, { variant: 'error' })
      )
      setLoading(false)
      return
    }

    try {
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen text-white bg-[#0B1739]'>
      <div className='w-full'>
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
                placeholder='Enter current password'
                required
                disabled={loading}
              />
              <button
                type='button'
                onClick={() => toggleVisibility('current')}
                className='absolute right-4 top-1/2 -translate-y-1/2 text-white'
              >
                {passwordVisibility.current ? (
                  <Eye size={18} />
                ) : (
                  <EyeOff size={18} />
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
                placeholder='Enter new password'
                disabled={loading}
              />
              <button
                type='button'
                onClick={() => toggleVisibility('new')}
                className='absolute right-4 top-1/2 -translate-y-1/2 text-white'
              >
                {passwordVisibility.new ? (
                  <Eye size={18} />
                ) : (
                  <EyeOff size={18} />
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
                placeholder='Confirm new password'
                disabled={loading}
              />
              <button
                type='button'
                onClick={() => toggleVisibility('confirm')}
                className='absolute right-4 top-1/2 -translate-y-1/2 text-white'
              >
                {passwordVisibility.confirm ? (
                  <Eye size={18} />
                ) : (
                  <EyeOff size={18} />
                )}
              </button>
            </div>

            {/* Submit Button */}
            <div className='flex justify-center gap-4 mt-4'>
              <Link href={'/'}>
                <button
                  type='button'
                  className='bg-gray-600  text-white font-medium py-2 px-8 rounded'
                >
                  Cancel
                </button>
              </Link>
              <Button
                variant='secondary'
                size='lg'
                className='text-white rounded w-1/5'
                style={{
                  background:
                    'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
                }}
                disabled={loading}
                type='submit'
              >
                {loading ? <Loader /> : 'Update Password'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword
