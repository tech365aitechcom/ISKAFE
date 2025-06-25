'use client'
import React, { Suspense, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { API_BASE_URL, apiConstants } from '../../../../constants/index'
import { enqueueSnackbar } from 'notistack'
import { useRouter, useSearchParams } from 'next/navigation'
import Loader from '../../../_components/Loader'

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

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!token) {
        enqueueSnackbar('Token is not valid. Please try again.', {
          variant: 'warning',
        })
        return
      }

      const passwordErrors = validatePasswordRules(formData.password)
      if (passwordErrors.length > 0) {
        passwordErrors.forEach((msg) =>
          enqueueSnackbar(msg, { variant: 'error' })
        )
        return
      }

      if (formData.password !== formData.confirmPassword) {
        enqueueSnackbar('Passwords do not match. Please try again.', {
          variant: 'warning',
        })
        return
      }

      const res = await axios.post(
        `${API_BASE_URL}/auth/reset-password?token=${token}`,
        {
          newPassword: formData.password,
          confirmNewPassword: formData.confirmPassword,
        }
      )

      if (res.status === apiConstants.success) {
        enqueueSnackbar(res.data.message, { variant: 'success' })
        router.push('/admin/login')
      }
    } catch (err) {
      console.log('Reset Password error:', err)
      enqueueSnackbar(err?.response?.data?.message || 'Something went wrong.', {
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className='flex h-screen w-full bg-transparent px-12 md:px-28 py-20 md:py-6'>
        <div className='flex w-full'>
          <div className='w-full flex md:items-center justify-center p-0 md:p-8'>
            <div className='w-full max-w-md'>
              <div className='flex justify-between items-center mb-2'>
                <h1 className='text-3xl font-bold text-white'>
                  Reset Password
                </h1>
                <span className='text-xs text-red-500'>
                  *Indicates Mandatory Fields
                </span>
              </div>

              <p className='text-sm text-gray-300 mb-6'>
                Enter a new password, re-enter it, then click the{' '}
                <strong>'Update Password'</strong> button.
              </p>

              <form className='space-y-4' onSubmit={handleSubmit}>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name='password'
                    placeholder='Password*'
                    value={formData.password}
                    onChange={handleChange}
                    className='w-full px-4 py-3 pr-10 rounded border border-gray-700 bg-transparent text-white'
                    required
                    disabled={isLoading}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-white cursor-pointer'
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </span>
                </div>
                <div className='relative'>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name='confirmPassword'
                    placeholder='Confirm Password*'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className='w-full px-4 py-3 pr-10 rounded border border-gray-700 bg-transparent text-white'
                    required
                    disabled={isLoading}
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-white cursor-pointer'
                  >
                    {showConfirmPassword ? (
                      <Eye size={20} />
                    ) : (
                      <EyeOff size={20} />
                    )}
                  </span>
                </div>

                <button
                  type='submit'
                  className='w-full bg-red-500 text-white py-3 rounded font-medium hover:bg-red-600 transition duration-300 flex items-center justify-center mt-4 disabled:cursor-not-allowed disabled:bg-red-400'
                  disabled={isLoading}
                >
                  {isLoading ? <Loader /> : 'Update Password'}
                </button>
                <div className='text-center text-white mt-4'>
                  Already have an account?{' '}
                  <Link
                    href='/admin/login'
                    className='text-yellow-500 hover:underline'
                  >
                    Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  )
}

export default ResetPassword
