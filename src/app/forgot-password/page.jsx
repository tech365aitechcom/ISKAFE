'use client'
import React, { useState } from 'react'
import axios from 'axios'
import Link from 'next/link'

const ForgotPasswordPage = () => {
  const [formData, setFormData] = useState({
    email: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log('Login data ready to be sent:', formData)
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during login')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex h-screen w-full bg-transparent px-28 py-6'>
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

            {error && (
              <div className='bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-2 rounded mb-4'>
                {error}
              </div>
            )}
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
