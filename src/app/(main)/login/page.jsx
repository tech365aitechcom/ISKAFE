'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { Eye, EyeOff } from 'lucide-react'
import { API_BASE_URL, apiConstants, roles } from '../../../constants/index'
import { enqueueSnackbar } from 'notistack'
import useStore from '../../../stores/useStore'
import { useRouter } from 'next/navigation'

const LoginPage = () => {
  const { setUser } = useStore()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const [returnUrl, setReturnUrl] = useState('')

  // Check for return URL and pre-fill email from URL params
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const returnUrlParam = urlParams.get('returnUrl')
    if (returnUrlParam) {
      setReturnUrl(returnUrlParam)
      // Extract email from return URL if available
      const returnUrlObj = new URL(returnUrlParam, window.location.origin)
      const emailFromReturn = returnUrlObj.searchParams.get('email')
      if (emailFromReturn) {
        setFormData(prev => ({ ...prev, email: emailFromReturn }))
      }
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('Login data ready to be sent:', formData)
      const res = await axios.post(`${API_BASE_URL}/auth/login`, formData)
      console.log('Login response:', res.data)
      if (res.status === apiConstants.success) {
        setUser({ ...res.data.user, token: res.data.token })
        enqueueSnackbar(res.data.message, { variant: 'success' })
        
        // Redirect to return URL if available, otherwise go to home
        if (returnUrl) {
          router.push(returnUrl)
        } else {
          router.push('/')
        }
      }
    } catch (error) {
  if (error.response?.status === 403) {
    enqueueSnackbar(error.response.data.message || 'Suspended or unverified account.', { variant: 'error' })
  } else if (error.response?.status === 404) {
    enqueueSnackbar(error.response.data.message || 'Email not found.', { variant: 'error' })
  } else if (error.response?.status === 401) {
    enqueueSnackbar(error.response.data.message || 'Invalid credentials.', { variant: 'error' })
  } else {
    enqueueSnackbar('Login failed. Please try again.', { variant: 'error' })
  }
}finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex h-screen w-full bg-transparent md:px-28 py-6'>
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
        <div className='w-full md:w-1/2 flex md:items-center justify-center p-8'>
          <div className='w-full max-w-md'>
            <h1 className='text-3xl font-bold text-white mb-8'>Login</h1>

            <form className='space-y-4' onSubmit={handleSubmit}>
              <div>
                <input
                  type='email'
                  name='email'
                  placeholder='Email'
                  value={formData.email}
                  onChange={handleChange}
                  className='w-full px-4 py-3 rounded border border-gray-700 bg-transparent text-white'
                  required
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-white'
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </span>
              </div>
              <div className='flex justify-end items-center'>
                {/* <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='rememberMe'
                    name='rememberMe'
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className='w-4 h-4 mr-2 accent-yellow-500'
                  />
                  <label htmlFor='rememberMe' className='text-white'>
                    Remember Me
                  </label>
                </div> */}
                <Link
                  href={'/forgot-password'}
                  className='text-blue-400 hover:underline'
                >
                  Forgot Password?
                </Link>
              </div>
              <button
                type='submit'
                className='w-full bg-red-500 text-white py-3 rounded font-medium hover:bg-red-600 transition duration-300 flex items-center justify-center'
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              <div className='text-center text-white mt-4'>
                If you don't have an account?{' '}
                <Link
                  href={'/signup'}
                  className='text-yellow-500 hover:underline'
                >
                  Sign Up
                </Link>
              </div>
              {/* <div className='flex items-center my-6'>
                <div className='flex-grow border-t border-gray-700'></div>
                <span className='px-4 text-gray-400 text-sm'>
                  Or login with
                </span>
                <div className='flex-grow border-t border-gray-700'></div>
              </div>
              <div className='flex justify-center space-x-4'>
                <button
                  type='button'
                  className='flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded gap-1'
                >
                  <span className='mr-2'>FACEBOOK</span>
                </button>
                <button
                  type='button'
                  className='flex items-center justify-center bg-blue-400 text-white px-4 py-2 rounded'
                >
                  <span className='mr-2'>TWITTER</span>
                </button>
                <button
                  type='button'
                  className='flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded'
                >
                  <span className='mr-2'>GOOGLE</span>
                </button>
              </div> */}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
