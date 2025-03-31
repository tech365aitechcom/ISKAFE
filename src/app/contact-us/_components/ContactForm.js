'use client'
import React, { useState } from 'react'

const ContactForm = () => {
  // State to track which field is focused
  const [focusedField, setFocusedField] = useState(null)
  // State to track form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    reason: 'Events',
    message: '',
  })

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle radio button changes
  const handleRadioChange = (value) => {
    setFormData({
      ...formData,
      reason: value,
    })
  }

  // Focus and blur handlers
  const handleFocus = (fieldName) => {
    setFocusedField(fieldName)
  }

  const handleBlur = () => {
    setFocusedField(null)
  }

  return (
    <div className='flex items-center justify-center w-full pb-9'>
      <div className='w-full max-w-3xl p-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          <div>
            <div className='relative'>
              {focusedField === 'firstName' && (
                <label className='absolute -top-2.5 left-2 px-1 text-xs text-yellow-500 bg-purple-950'>
                  First Name*
                </label>
              )}
              <input
                type='text'
                name='firstName'
                placeholder='First Name*'
                value={formData.firstName}
                onChange={handleChange}
                onFocus={() => handleFocus('firstName')}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 rounded border border-gray-700 outline-amber-400 focus:border-yellow-500 bg-transparent text-white`}
              />
            </div>
          </div>
          <div>
            <div className='relative'>
              {focusedField === 'lastName' && (
                <label className='absolute -top-2.5 left-2 px-1 text-xs text-yellow-500 bg-purple-950'>
                  Last Name*
                </label>
              )}
              <input
                type='text'
                name='lastName'
                placeholder='Last Name*'
                value={formData.lastName}
                onChange={handleChange}
                onFocus={() => handleFocus('lastName')}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 rounded border border-gray-700 outline-amber-400 focus:border-yellow-500 bg-transparent text-white`}
              />
            </div>
          </div>
        </div>

        <div className='mb-4'>
          <div className='relative'>
            {focusedField === 'email' && (
              <label className='absolute -top-2.5 left-2 px-1 text-xs text-yellow-500 bg-purple-950'>
                Email*
              </label>
            )}
            <input
              type='email'
              name='email'
              placeholder='Email*'
              value={formData.email}
              onChange={handleChange}
              onFocus={() => handleFocus('email')}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 rounded border border-gray-700 outline-amber-400 focus:border-yellow-500 bg-transparent text-white`}
            />
          </div>
        </div>

        <div className='mb-4'>
          <p className='text-white mb-2'>Reason for Contacting Us</p>
          <div className='flex flex-col md:flex-row space-x-4 space-y-4'>
            <label className='flex  items-center text-white'>
              <span className='relative inline-block h-5 w-5 mr-2'>
                <input
                  type='radio'
                  name='reason'
                  checked={formData.reason === 'Events'}
                  onChange={() => handleRadioChange('Events')}
                  className='absolute opacity-0 h-5 w-5'
                />
                <span className='absolute top-0 left-0 h-5 w-5 rounded-full border border-gray-400'></span>
                {formData.reason === 'Events' && (
                  <span className='absolute top-1 left-1 h-3 w-3 rounded-full bg-yellow-500 opacity-100'></span>
                )}
              </span>
              Events
            </label>

            <label className='flex items-center text-white'>
              <span className='relative inline-block h-5 w-5 mr-2'>
                <input
                  type='radio'
                  name='reason'
                  checked={formData.reason === 'Suspensions'}
                  onChange={() => handleRadioChange('Suspensions')}
                  className='absolute opacity-0 h-5 w-5'
                />
                <span className='absolute top-0 left-0 h-5 w-5 rounded-full border border-gray-400'></span>
                {formData.reason === 'Suspensions' && (
                  <span className='absolute top-1 left-1 h-3 w-3 rounded-full bg-yellow-500 opacity-100'></span>
                )}
              </span>
              Suspensions
            </label>

            <label className='flex items-center text-white'>
              <span className='relative inline-block h-5 w-5 mr-2'>
                <input
                  type='radio'
                  name='reason'
                  checked={formData.reason === 'Accounts'}
                  onChange={() => handleRadioChange('Accounts')}
                  className='absolute opacity-0 h-5 w-5'
                />
                <span className='absolute top-0 left-0 h-5 w-5 rounded-full border border-gray-400'></span>
                {formData.reason === 'Accounts' && (
                  <span className='absolute top-1 left-1 h-3 w-3 rounded-full bg-yellow-500 opacity-100'></span>
                )}
              </span>
              Account's
            </label>

            <label className='flex items-center text-white'>
              <span className='relative inline-block h-5 w-5 mr-2'>
                <input
                  type='radio'
                  name='reason'
                  checked={formData.reason === 'General'}
                  onChange={() => handleRadioChange('General')}
                  className='absolute opacity-0 h-5 w-5'
                />
                <span className='absolute top-0 left-0 h-5 w-5 rounded-full border border-gray-400'></span>
                {formData.reason === 'General' && (
                  <span className='absolute top-1 left-1 h-3 w-3 rounded-full bg-yellow-500 opacity-100'></span>
                )}
              </span>
              General IGF Questions
            </label>
          </div>
        </div>

        <div className='mb-6'>
          <div className='relative'>
            {focusedField === 'message' && (
              <label className='absolute -top-2.5 left-2 px-1 text-xs text-yellow-500 bg-purple-950'>
                Message*
              </label>
            )}
            <input
              type='text'
              name='message'
              placeholder='Message*'
              value={formData.message}
              onChange={handleChange}
              onFocus={() => handleFocus('message')}
              onBlur={handleBlur}
              className='w-full px-4 py-3 rounded border border-gray-700 outline-amber-400 focus:border-yellow-500 bg-transparent text-white'
            />
          </div>
        </div>

        <div className='flex justify-end'>
          <button className='bg-yellow-500 text-white text-xl font-medium px-6 py-3 rounded'>
            Send Message
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContactForm
