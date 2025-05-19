'use client'
import React, { useState } from 'react'
import { API_BASE_URL, apiConstants } from '../../../../constants'
import axios from 'axios'
import { enqueueSnackbar } from 'notistack'

const ContactForm = ({ subjects }) => {
  const [focusedField, setFocusedField] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName)
  }

  const handleBlur = () => {
    setFocusedField(null)
  }

  const handleSubmit = async (e) => {
    try {
      e.preventDefault()

      console.log('Form submitted:', formData)
      const response = await axios.post(`${API_BASE_URL}/contact`, formData)

      console.log('Response:', response)
      if (response.status === apiConstants.create) {
        enqueueSnackbar(response.data.message, {
          variant: 'success',
        })
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        })
      }
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || 'Something went wrong',
        {
          variant: 'error',
        }
      )
    }
  }

  return (
    <div className='flex items-center justify-center w-full pb-9'>
      <form onSubmit={handleSubmit} className='w-full max-w-3xl p-6 space-y-6'>
        {/* Full Name */}
        <div className='relative'>
          {focusedField === 'name' && (
            <label className='absolute -top-2.5 left-2 px-1 text-xs text-yellow-500 bg-purple-950'>
              Full Name*
            </label>
          )}
          <input
            type='text'
            name='fullName'
            placeholder='Enter your full name*'
            value={formData.fullName}
            onChange={handleChange}
            onFocus={() => handleFocus('fullName')}
            onBlur={handleBlur}
            required
            className='w-full px-4 py-3 rounded border border-gray-700 outline-amber-400 focus:border-yellow-500 bg-transparent text-white'
          />
        </div>

        {/* Email */}
        <div className='relative'>
          {focusedField === 'email' && (
            <label className='absolute -top-2.5 left-2 px-1 text-xs text-yellow-500 bg-purple-950'>
              Email*
            </label>
          )}
          <input
            type='email'
            name='email'
            placeholder='Enter your email address*'
            value={formData.email}
            onChange={handleChange}
            onFocus={() => handleFocus('email')}
            onBlur={handleBlur}
            required
            className='w-full px-4 py-3 rounded border border-gray-700 outline-amber-400 focus:border-yellow-500 bg-transparent text-white'
          />
        </div>

        {/* Phone */}
        <div className='relative'>
          {focusedField === 'phone' && (
            <label className='absolute -top-2.5 left-2 px-1 text-xs text-yellow-500 bg-purple-950'>
              Phone Number
            </label>
          )}
          <input
            type='tel'
            name='phone'
            placeholder='Phone Number'
            value={formData.phone}
            onChange={handleChange}
            onFocus={() => handleFocus('phone')}
            onBlur={handleBlur}
            className='w-full px-4 py-3 rounded border border-gray-700 outline-amber-400 focus:border-yellow-500 bg-transparent text-white'
          />
        </div>

        {/* Subject */}
        <div className='relative'>
          {focusedField === 'subject' && (
            <label className='absolute -top-2.5 left-2 px-1 text-xs text-yellow-500'>
              Subject*
            </label>
          )}
          <select
            name='subject'
            value={formData.subject}
            onChange={handleChange}
            onFocus={() => handleFocus('subject')}
            onBlur={handleBlur}
            required
            className='w-full px-4 py-3 rounded border border-gray-700 outline-amber-400 focus:border-yellow-500  text-white'
          >
            <option value='' disabled className='text-purple-950'>
              Select a subject*
            </option>
            {subjects?.map((subject, index) => (
              <option
                key={index}
                value={subject?.name}
                className='text-purple-950'
              >
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div className='relative'>
          {focusedField === 'message' && (
            <label className='absolute -top-2.5 left-2 px-1 text-xs text-yellow-500 bg-purple-950'>
              Message*
            </label>
          )}
          <textarea
            name='message'
            placeholder='Message*'
            rows={4}
            value={formData.message}
            onChange={handleChange}
            onFocus={() => handleFocus('message')}
            onBlur={handleBlur}
            required
            className='w-full px-4 py-3 rounded border border-gray-700 outline-amber-400 focus:border-yellow-500 bg-transparent text-white resize-none'
          />
        </div>

        <div className='flex justify-end'>
          <button
            type='submit'
            className='bg-yellow-500 text-white text-xl font-medium px-6 py-3 rounded'
          >
            Send Message
          </button>
        </div>
      </form>
    </div>
  )
}

export default ContactForm
