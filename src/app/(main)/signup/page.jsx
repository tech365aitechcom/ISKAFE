'use client'
import React, { useState } from 'react'
import Link from 'next/link'

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '01/01/2000',
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
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log('Registration data ready to be sent:', formData)

      // The actual API call would go here
      // const response = await axios.post('/api/signup', formData);
    } catch (err) {
      setError(err.message || 'An error occurred during registration')
      console.error('Registration error:', err)
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
        <div className='w-full md:w-1/2 flex items-center justify-center p-8'>
          <div className='w-full max-w-md'>
            <div className='flex justify-between items-center mb-6'>
              <h1 className='text-3xl font-bold text-white'>Sign Up</h1>
              <span className='text-xs text-red-500'>
                *Indicates Mandatory Fields
              </span>
            </div>
            {error && (
              <div className='bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-2 rounded mb-4'>
                {error}
              </div>
            )}
            <form className='space-y-4' onSubmit={handleSubmit}>
              <div className='flex gap-4'>
                <div className='w-1/2'>
                  <input
                    type='text'
                    name='firstName'
                    placeholder='First Name*'
                    value={formData.firstName}
                    onChange={handleChange}
                    className='w-full px-4 py-3 rounded border border-gray-700 bg-transparent text-white'
                    required
                  />
                </div>
                <div className='w-1/2'>
                  <input
                    type='text'
                    name='lastName'
                    placeholder='Last Name*'
                    value={formData.lastName}
                    onChange={handleChange}
                    className='w-full px-4 py-3 rounded border border-gray-700 bg-transparent text-white'
                    required
                  />
                </div>
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
              <div>
                <input
                  type='password'
                  name='password'
                  placeholder='Password*'
                  value={formData.password}
                  onChange={handleChange}
                  className='w-full px-4 py-3 rounded border border-gray-700 bg-transparent text-white'
                  required
                />
              </div>
              <div>
                <input
                  type='password'
                  name='confirmPassword'
                  placeholder='Confirm Password*'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className='w-full px-4 py-3 rounded border border-gray-700 bg-transparent text-white'
                  required
                />
              </div>
              <div>
                <label className='block text-gray-400 text-sm mb-1'>
                  Date of Birth*
                </label>
                <input
                  type='text'
                  name='dateOfBirth'
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className='w-full px-4 py-3 rounded border border-yellow-500 bg-transparent text-white'
                  required
                />
              </div>
              <button
                type='submit'
                className='w-full bg-red-500 text-white py-3 rounded font-medium hover:bg-red-600 transition duration-300 flex items-center justify-center mt-4'
                disabled={isLoading}
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
