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

const ForgotPasswordPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    redirectUrl: `${APP_BASE_URL}/admin/reset-password`,
  })

  const [isLoading, setIsLoading] = useState(false)

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
      console.log('Forgot Password data ready to be sent:', formData)
      const res = await axios.post(
        `${API_BASE_URL}/auth/forgot-password`,
        formData
      )
      console.log('Forgot Password response:', res.data)
      if (res.status === apiConstants.success) {
        enqueueSnackbar(res.data.message, { variant: 'success' })
      }
    } catch (err) {
      console.log('Reset Password error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex h-screen w-full bg-transparent px-28 py-6'>
      <div className='flex w-full'>
        <div className='w-full flex md:items-center justify-center p-8'>
          <div className='w-full max-w-md'>
            <h1 className='text-3xl font-bold text-white mb-8'>
              Forgot Password
            </h1>

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
                />
              </div>
              <button
                type='submit'
                className='w-full bg-red-500 text-white py-3 rounded font-medium hover:bg-red-600 transition duration-300 flex items-center justify-center'
                disabled={isLoading}
              >
                Submit
              </button>
              <div className='text-white mt-4 text-right'>
                Remembered password?{' '}
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
  )
}

export default ForgotPasswordPage
