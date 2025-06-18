'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Eye, EyeOff } from 'lucide-react'
import { enqueueSnackbar } from 'notistack'
import useStore from '../../../stores/useStore'
import { useRouter } from 'next/navigation'
import { API_BASE_URL, apiConstants, roles } from '../../../constants/index'
import Link from 'next/link'

const LoginPage = () => {
  const { user, setUser } = useStore()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

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
        console.log('Login successful:', res.data.user.role)

        if (res.data.user.role === roles.superAdmin) {
          enqueueSnackbar(res.data.message, { variant: 'success' })
          setUser({ ...res.data.user, token: res.data.token })
          router.push('/admin/dashboard')
        } else {
          enqueueSnackbar(
            'You are not an Admin. Please login with admin credentials',
            {
              variant: 'warning',
            }
          )
        }
      }
    } catch (err) {
      const status = err?.response?.status
      const message = err?.response?.data?.message

      if (status === 404) {
        enqueueSnackbar('Email not registered', { variant: 'error' })
      } else if (status === 401) {
        enqueueSnackbar('Incorrect password', { variant: 'error' })
      } else if (status === 403) {
        enqueueSnackbar('Account not verified. Please check your email.', {
          variant: 'warning',
        })
      } else {
        enqueueSnackbar(message || 'An error occurred during login', {
          variant: 'error',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user && user.role == roles.superAdmin) {
      console.log('User is already logged in:', user.role)
      router.push('/admin/dashboard')
    }
  }, [user, router])

  return (
    <div className='flex h-screen w-full bg-transparent md:px-28 py-6'>
      <div className='flex w-full'>
        <div className='w-full flex md:items-center justify-center p-8'>
          <div className='w-full max-w-md'>
            <h1 className='text-3xl font-bold text-white mb-8'>Admin Login</h1>
            <form className='space-y-4' onSubmit={handleSubmit}>
              <div>
                <input
                  type='email'
                  name='email'
                  placeholder='Email'
                  value={formData.userName}
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
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-white'
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                  href={'/admin/forgot-password'}
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
                  href={'/admin/signup'}
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
