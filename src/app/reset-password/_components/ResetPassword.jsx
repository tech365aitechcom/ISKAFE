'use client'
import React, { Suspense, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { API_BASE_URL } from '../../../constants/index'
import { enqueueSnackbar } from 'notistack'
import { useRouter, useSearchParams } from 'next/navigation'

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
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
    setError('')

    try {
      if (!token) {
        enqueueSnackbar('Token is not valid. Please try again.', {
          variant: 'warning',
        })
        return
      }
      if (formData.password !== formData.confirmPassword) {
        enqueueSnackbar('Passwords do not match. Please try again.', {
          variant: 'warning',
        })
        return
      }
      console.log('Reset Password data ready to be sent:', formData)
      const res = await axios.post(
        `${API_BASE_URL}/auth/reset-password?token=${token}`,
        formData
      )
      console.log('Reset Password response:', res.data)
      if (res.status === 200) {
        enqueueSnackbar(res.data.message, { variant: 'success' })
        router.push('/login')
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || 'An error occurred during registration'
      )
      console.error('Reset Password error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className='flex h-screen w-full bg-transparent px-12 md:px-28 py-20 md:py-6'>
        <div className='flex w-full'>
          <div className='hidden md:flex md:w-1/2 bg-gradient-to-b from-purple-900 to-black items-center justify-center'>
            <div className='p-12'>
              <img
                src='/gloves.png'
                alt='Red boxing glove'
                className='max-w-full h-auto transform -rotate-12'
              />
            </div>
          </div>
          <div className='w-full md:w-1/2 flex md:items-center justify-center p-0 md:p-8'>
            <div className='w-full max-w-md'>
              <div className='flex justify-between items-center mb-6'>
                <h1 className='text-3xl font-bold text-white'>
                  Reset Password
                </h1>
                <span className='text-xs text-red-500'>
                  *Indicates Mandatory Fields
                </span>
              </div>
              {error && (
                <div className='border border-red-500 text-red-500 px-4 py-2 rounded mb-4'>
                  {error}
                </div>
              )}
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
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-white'
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-white'
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </span>
                </div>

                <button
                  type='submit'
                  className='w-full bg-red-500 text-white py-3 rounded font-medium hover:bg-red-600 transition duration-300 flex items-center justify-center mt-4 cursor-pointer disabled:cursor-not-allowed disabled:bg-red-400'
                  disabled={isLoading}
                >
                  {isLoading ? 'Resetting...' : 'Reset'}
                </button>
                <div className='text-center text-white mt-4'>
                  Already have an account?{' '}
                  <Link
                    href='/login'
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
