'use client'
import React, { useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { API_BASE_URL } from '../../../constants/index'
import { enqueueSnackbar } from 'notistack'
import { useRouter } from 'next/navigation'

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    termsAgreed: false,
    role: 'ADMIN',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
      if (formData.password !== formData.confirmPassword) {
        enqueueSnackbar('Passwords do not match. Please try again.', {
          variant: 'warning',
        })
        return
      }

      console.log('Registration data ready to be sent:', formData)
      const res = await axios.post(`${API_BASE_URL}/auth/signup`, formData)
      console.log('Registration response:', res)
      if (res.status === 201) {
        enqueueSnackbar(res.data.message, { variant: 'success' })
        router.push('/login')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError(
        err?.response?.data?.message || 'An error occurred during registration'
      )
      enqueueSnackbar(
        err?.response?.data?.message || 'An error occurred during registration',
        { variant: 'error' }
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
              <h1 className='text-3xl font-bold text-white'>Sign Up</h1>
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
              <div>
                <input
                  type='text'
                  name='fullName'
                  placeholder='Name*'
                  value={formData.fullName}
                  onChange={handleChange}
                  className='w-full px-4 py-3 rounded border border-gray-700 bg-transparent text-white'
                  required
                />
              </div>
              <div>
                <input
                  type='email'
                  name='email'
                  placeholder='Email*'
                  value={formData.email}
                  onChange={handleChange}
                  className='w-full px-4 py-3 rounded border border-gray-700 bg-transparent text-white'
                  required
                />
              </div>
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
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-white'
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
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-white'
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </span>
              </div>
              <div>
                <input
                  type='text'
                  name='country'
                  placeholder='Country*'
                  value={formData.country}
                  onChange={handleChange}
                  className='w-full px-4 py-3 rounded border border-gray-700 bg-transparent text-white'
                  required
                />
              </div>
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  id='termsAgreed'
                  name='termsAgreed'
                  checked={formData.termsAgreed}
                  onChange={handleChange}
                  className='w-4 h-4 mr-2 accent-yellow-500'
                />
                <label htmlFor='termsAgreed' className='text-white'>
                  Terms Agreement
                </label>
              </div>
              <button
                type='submit'
                className='w-full bg-red-500 text-white py-3 rounded font-medium hover:bg-red-600 transition duration-300 flex items-center justify-center mt-4 disabled:cursor-not-allowed disabled:bg-red-400'
                disabled={isLoading || !formData.termsAgreed}
              >
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </button>
              <div className='text-center text-white mt-4'>
                Already have an account?{' '}
                <Link href='/login' className='text-yellow-500 hover:underline'>
                  Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
