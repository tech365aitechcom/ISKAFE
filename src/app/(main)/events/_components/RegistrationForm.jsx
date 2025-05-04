'use client'
import { API_BASE_URL, apiConstants } from '../../../../constants/index'
import useUserStore from '../../../../stores/userStore'
import axios from 'axios'
import { enqueueSnackbar } from 'notistack'
import React, { useState } from 'react'
import { X } from 'lucide-react' // Import X icon from lucide-react

export default function RegistrationForm({
  setIsRegistrationModelOpen,
  eventId,
}) {
  const user = useUserStore((state) => state.user)
  const [formData, setFormData] = useState({
    registrationType: '',
    fullName: '',
    email: '',
    phone: '',
    country: '',
    category: '',
    clubName: '',
    termsAgreed: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    try {
      e.preventDefault()
      const payload = {
        ...formData,
        createdBy: user?.id,
        event: eventId,
      }

      console.log('Form submitted:', payload)
      const response = await axios.post(
        `${API_BASE_URL}/registrations/add`,
        payload
      )
      console.log('Response:', response)
      if (response.status === apiConstants.create) {
        enqueueSnackbar(response.data.message, {
          variant: 'success',
        })
        setFormData({
          registrationType: '',
          fullName: '',
          email: '',
          phone: '',
          country: '',
          category: '',
          clubName: '',
          termsAgreed: false,
        })
        setIsRegistrationModelOpen(false)
      }
    } catch (error) {
      console.log('Error:', error)

      enqueueSnackbar(
        error?.response?.data?.message || 'Something went wrong',
        {
          variant: 'error',
        }
      )
    }
  }
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-800/30'>
      <div className='bg-[#1b0c2e] p-6 rounded-lg max-w-3xl w-full relative'>
        {/* Close icon in the top right */}
        <button
          onClick={() => setIsRegistrationModelOpen(false)}
          className='absolute top-4 right-4 text-gray-400 hover:text-white transition-colors'
          type='button'
          aria-label='Close'
        >
          <X size={24} />
        </button>

        <h2 className='text-2xl font-bold mb-4 text-white'>
          Fill the Registration Form
        </h2>
        <form className='space-y-4' onSubmit={handleSubmit}>
          <div>
            <label className='text-white font-medium'>Registration Type</label>
            <div className='flex space-x-4 mt-2'>
              <label className='text-white'>
                <input
                  type='radio'
                  name='registrationType'
                  value='Amateur'
                  onChange={handleChange}
                  checked={formData.registrationType === 'Amateur'}
                />
                Amateur
              </label>
              <label className='text-white'>
                <input
                  type='radio'
                  name='registrationType'
                  value='Pro'
                  onChange={handleChange}
                  checked={formData.registrationType === 'Pro'}
                />
                Pro
              </label>
            </div>
          </div>

          <div>
            <label className='text-white font-medium'>Full Name</label>
            <input
              type='text'
              name='fullName'
              value={formData.fullName}
              onChange={handleChange}
              className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
              required
            />
          </div>

          <div>
            <label className='text-white font-medium'>Email</label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
              required
            />
          </div>

          <div>
            <label className='text-white font-medium'>Phone Number</label>
            <input
              type='tel'
              name='phone'
              value={formData.phone}
              onChange={handleChange}
              className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
              required
            />
          </div>

          <div>
            <label className='text-white font-medium'>Country</label>
            <select
              name='country'
              value={formData.country}
              onChange={handleChange}
              className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
              required
            >
              <option value=''>Select Country</option>
              <option>USA</option>
              <option>Canada</option>
              <option>UK</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className='text-white font-medium'>Category</label>
            <select
              name='category'
              value={formData.category}
              onChange={handleChange}
              className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
              required
            >
              <option value=''>Select Category</option>
              <option>Lightweight</option>
              <option>Middleweight</option>
              <option>Heavyweight</option>
            </select>
          </div>

          <div>
            <label className='text-white font-medium'>Club/Trainer Name</label>
            <input
              type='text'
              name='clubName'
              value={formData.clubName}
              onChange={handleChange}
              className='w-full mt-1 p-2 rounded bg-[#2e1b47] text-white'
            />
          </div>

          <div className='flex items-center space-x-2'>
            <input
              type='checkbox'
              id='terms'
              name='termsAgreed'
              checked={formData.termsAgreed}
              onChange={handleChange}
              className='accent-yellow-500'
            />
            <label htmlFor='terms' className='text-white'>
              I agree to the terms and conditions
            </label>
          </div>

          <div className='flex justify-between mt-6'>
            <button
              type='button'
              className='text-yellow-400 underline '
              onClick={() => setIsRegistrationModelOpen(false)}
            >
              Back
            </button>
            <button
              type='submit'
              disabled={!formData.termsAgreed}
              className='bg-yellow-500 text-black px-4 py-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Proceed to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
