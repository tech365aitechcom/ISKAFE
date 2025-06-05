'use client'
import axios from 'axios'
import { API_BASE_URL, apiConstants } from '../../../../../constants/index'
import { Send, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import useStore from '../../../../../stores/useStore'
import { enqueueSnackbar } from 'notistack'
import Loader from '../../../../_components/Loader'

export const ContactSettingsForm = () => {
  const user = useStore((state) => state.user)
  const [formData, setFormData] = useState({
    emailRecipients: [],
    enableCaptcha: false,
    address: '',
    phone: '',
    email: '',
    googleMapEmbedUrl: '',
  })

  const [loading, setLoading] = useState(true)
  const [newEmailRecipient, setNewEmailRecipient] = useState('')
  const [newTopic, setNewTopic] = useState('')
  const [emailError, setEmailError] = useState('')

  const [existingId, setExistingId] = useState('')

  const fetchContactSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/contactUs-settings`)
      console.log('Response:', response.data)
      if (response.data.data) {
        setExistingId(response.data.data._id)
        setFormData(response.data.data)
      }
    } catch (error) {
      console.log('Error fetching contact settings:', error)
      enqueueSnackbar(
        error?.response?.data?.message || 'Error loading contact settings',
        {
          variant: 'error',
        }
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContactSettings()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleAddEmailRecipient = () => {
    if (!newEmailRecipient) {
      setEmailError('Email cannot be empty')
      return
    }

    if (!validateEmail(newEmailRecipient)) {
      setEmailError('Please enter a valid email address')
      return
    }

    if (formData.emailRecipients.includes(newEmailRecipient)) {
      setEmailError('This email is already added')
      return
    }

    setFormData((prev) => ({
      ...prev,
      emailRecipients: [...prev.emailRecipients, newEmailRecipient],
    }))
    setNewEmailRecipient('')
    setEmailError('')
  }

  const handleRemoveEmailRecipient = (index) => {
    setFormData((prev) => ({
      ...prev,
      emailRecipients: prev.emailRecipients.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    try {
      e.preventDefault()

      // Validate mandatory fields
      if (formData.emailRecipients.length === 0) {
        enqueueSnackbar('At least one email recipient is required', {
          variant: 'error',
        })
        return
      }

      // Optional: Validate contact email if present
      if (formData.email && !validateEmail(formData.email)) {
        enqueueSnackbar('Please enter a valid contact email', {
          variant: 'error',
        })
        return
      }

      console.log('Form submitted:', formData)

      let response = null
      if (existingId) {
        response = await axios.put(
          `${API_BASE_URL}/contactUs-settings/${existingId}`,
          formData
        )
      } else {
        response = await axios.post(
          `${API_BASE_URL}/contactUs-settings`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        )
      }

      console.log('Response:', response)
      if (
        response.status === apiConstants.success ||
        response.status === apiConstants.create
      ) {
        enqueueSnackbar(response.data.message, {
          variant: 'success',
        })
      }
      fetchContactSettings()
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || 'Something went wrong',
        {
          variant: 'error',
        }
      )
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen text-white bg-dark-blue-900 flex justify-center items-center'>
        <Loader />
      </div>
    )
  }

  return (
    <div className='min-h-screen text-white bg-dark-blue-900'>
      <div className='w-full'>
        <div className='flex items-center gap-4 mb-6'>
          <h1 className='text-2xl font-bold'>Manage Contact Settings</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* General Section */}
          <h2 className='font-bold mb-4 uppercase text-sm'>General</h2>

          {/* Email Recipients */}
          <div className='mb-6'>
            <label className='block text-sm font-medium mb-2'>
              Email Recipients<span className='text-red-500'>*</span>
            </label>
            <div className='mb-2 flex flex-wrap gap-2'>
              {formData.emailRecipients.map((email, index) => (
                <div
                  key={index}
                  className='bg-[#14255D] px-3 py-1 rounded-full flex items-center gap-2'
                >
                  <span className='text-sm'>{email}</span>
                  <button
                    type='button'
                    onClick={() => handleRemoveEmailRecipient(index)}
                    className='text-[#AEB9E1] hover:text-white'
                  >
                    <X className='w-4 h-4' />
                  </button>
                </div>
              ))}
            </div>
            <div className='flex'>
              <div className='flex-grow bg-[#00000061] p-2 rounded-l'>
                <input
                  type='email'
                  value={newEmailRecipient}
                  onChange={(e) => {
                    setNewEmailRecipient(e.target.value)
                    setEmailError('')
                  }}
                  className='w-full outline-none'
                  placeholder='Enter recipient email'
                />
              </div>
              <button
                type='button'
                onClick={handleAddEmailRecipient}
                className='bg-[#7F25FB] px-4 rounded-r flex items-center justify-center'
              >
                <Send className='w-5 h-5' />
              </button>
            </div>
            {emailError && (
              <p className='mt-1 text-sm text-red-500'>{emailError}</p>
            )}
          </div>

          {/* Enable CAPTCHA */}
          <div className='mb-6 flex items-center'>
            <input
              type='checkbox'
              id='enableCaptcha'
              name='enableCaptcha'
              checked={formData.enableCaptcha}
              onChange={handleChange}
              className='mr-2 h-5 w-5 accent-[#7F25FB]'
            />
            <label htmlFor='enableCaptcha' className='text-sm font-medium'>
              Enable CAPTCHA
            </label>
          </div>

          {/* Static Info Section */}
          <h2 className='font-bold mb-4 uppercase text-sm'>
            Contact Information
          </h2>

          {/* Address */}
          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>Address</label>
            <textarea
              name='address'
              value={formData.address}
              onChange={handleChange}
              rows='3'
              className='w-full outline-none resize-none'
              placeholder='Organization address'
            />
          </div>

          {/* Phone */}
          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>Phone</label>
            <input
              type='text'
              name='phone'
              value={formData.phone}
              onChange={handleChange}
              className='w-full outline-none'
              placeholder='Contact phone number'
            />
          </div>

          {/* Email */}
          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>Email</label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              className='w-full outline-none'
              placeholder='Public contact email'
            />
          </div>

          {/* Google Map */}
          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Google Map Embed URL
            </label>
            <input
              type='text'
              name='googleMapEmbedUrl'
              value={formData.googleMapEmbedUrl}
              onChange={handleChange}
              className='w-full outline-none'
              placeholder='Google Maps embed URL'
            />
          </div>

          {/* Preview Map */}
          {formData.googleMapEmbedUrl && (
            <div className='mb-6'>
              <label className='block text-sm font-medium mb-2'>
                Map Preview
              </label>
              <div className='w-full h-64 rounded overflow-hidden'>
                <iframe
                  src={formData.googleMapEmbedUrl}
                  width='100%'
                  height='100%'
                  style={{ border: 0 }}
                  allowFullScreen=''
                  loading='lazy'
                  referrerPolicy='no-referrer-when-downgrade'
                  title='Google Map'
                ></iframe>
              </div>
            </div>
          )}

          {/* Submission Button */}
          <div className='flex justify-center mt-8 mb-6'>
            <button
              type='submit'
              className='text-white font-medium py-2 px-6 rounded'
              style={{
                background:
                  'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
