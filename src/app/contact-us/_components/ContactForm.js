'use client'
import React, { useState } from 'react'

const ContactForm = () => {
  const [focusedField, setFocusedField] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
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

  const handleSubmit = (e) => {
    e.preventDefault()
    // Add validation or API submission logic here
    console.log('Form submitted:', formData)
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
            name='name'
            placeholder='Enter your full name*'
            value={formData.name}
            onChange={handleChange}
            onFocus={() => handleFocus('name')}
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
              Phone Number*
            </label>
          )}
          <input
            type='tel'
            name='phone'
            placeholder='Phone Number*'
            value={formData.phone}
            onChange={handleChange}
            onFocus={() => handleFocus('phone')}
            onBlur={handleBlur}
            required
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
            <option value='General Inquiry' className='text-purple-950'>
              General Inquiry
            </option>
            <option value='Support' className='text-purple-950'>
              Support
            </option>
            <option value='Feedback' className='text-purple-950'>
              Feedback
            </option>
            <option value='Business Inquiry' className='text-purple-950'>
              Business Inquiry
            </option>
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
            className='bg-yellow-500 text-white text-xl font-medium px-6 py-3 rounded cursor-pointer'
          >
            Send Message
          </button>
        </div>
      </form>
    </div>
  )
}

export default ContactForm
