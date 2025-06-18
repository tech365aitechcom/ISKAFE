'use client'
import React, { useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import {
  API_BASE_URL,
  apiConstants,
  APP_BASE_URL,
} from '../../../constants/index'
import { enqueueSnackbar } from 'notistack'
import Loader from '../../_components/Loader'

const ForgotPasswordPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    redirectUrl: `${APP_BASE_URL}/reset-password`,
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateEmail(formData.email)) {
      enqueueSnackbar('Please enter a valid email address.', {
        variant: 'error',
      })
      return
    }

    setIsLoading(true)
    try {
      console.log('Forgot Password data ready to be sent:', formData)
      const res = await axios.post(
        `${API_BASE_URL}/auth/forgot-password`,
        formData
      )
      console.log('Forgot Password response:', res.data)
      if (res.status === apiConstants.success) {
        enqueueSnackbar(res.data.message, { variant: 'success' })
        setFormData({ email: '', redirectUrl: formData.redirectUrl })
      }
    } catch (err) {
      console.log('Reset Password error:', err)
      enqueueSnackbar(
        err?.response?.data?.message ||
          'Something went wrong. Try again later.',
        { variant: 'error' }
      )
    } finally {
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
        <div className='w-full md:w-1/2 flex items-start justify-center p-8'>
          <div className='w-full max-w-md'>
            <h1 className='text-3xl font-bold text-white mb-8'>
              Forgot Password
            </h1>
            <p className='text-sm text-gray-300 mb-6'>
              Please enter your email to reset your password
            </p>
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
              <button
                type='submit'
                className='w-full bg-red-500 text-white py-3 rounded font-medium hover:bg-red-600 transition duration-300 flex items-center justify-center'
                disabled={isLoading}
              >
                {isLoading ? <Loader /> : 'Submit'}
              </button>
              <div className='text-white mt-4 text-right'>
                Remembered password?{' '}
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

export default ForgotPasswordPage
