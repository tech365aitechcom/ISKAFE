'use client'
import React, { useEffect, useState } from 'react'
import { API_BASE_URL, apiConstants } from '../../../../constants'
import axios from 'axios'
import { enqueueSnackbar } from 'notistack'
import useStore from '../../../../stores/useStore'
import Loader from '../../../_components/Loader'
import Link from 'next/link'

const ContactForm = ({ topics }) => {
  const user = useStore((state) => state.user)
  const [focusedField, setFocusedField] = useState(null)
  const [events, setEvents] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    topic: '',
    subIssue: '',
    event: '',
    fullName: '',
    email: '',
    phone: '',
    message: '',
  })

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/events?isPublished=true&limit=500`
        )
        setEvents(response.data.data.items)
      } catch (err) {
        console.error('Failed to fetch events:', err)
      }
    }
    fetchEvents()
  }, [])

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
    e.preventDefault()
    setIsSubmitting(true)
    setFocusedField(null)

    try {
      if (!user) {
        enqueueSnackbar('Please login to submit your message', {
          variant: 'warning',
        })
        return
      }

      const nameRegex = /^[a-zA-Z\s'-]+$/
      if (!nameRegex.test(fullName.trim())) {
        enqueueSnackbar('Please enter a valid full name', {
          variant: 'warning',
        })
        setIsSubmitting(false)
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        enqueueSnackbar('Please enter a valid email address', {
          variant: 'warning',
        })
        setIsSubmitting(false)
        return
      }

      const phoneRegex = /^[0-9]{10,15}$/
      if (phone && !phoneRegex.test(phone.trim())) {
        enqueueSnackbar('Phone number must be between 10 and 15 digits', {
          variant: 'warning',
        })
        setIsSubmitting(false)
        return
      }

      if (message.trim().length < 500) {
        enqueueSnackbar('Message must be at least 500 characters long', {
          variant: 'warning',
        })
        setIsSubmitting(false)
        return
      }

      const { topic, subIssue, event, fullName, email, phone, message } =
        formData
      const payload = {
        topic: topic || '',
        subIssue: subIssue || '',
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
      }

      if (event) {
        payload.event = event
      }

      console.log('payload submitted:', payload)

      const response = await axios.post(`${API_BASE_URL}/contact-us`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: user?.token ? `Bearer ${user.token}` : '',
        },
      })

      console.log('Response:', response)
      if (response.status === apiConstants.create) {
        enqueueSnackbar(response.data.message, {
          variant: 'success',
        })
        setFormData({
          topic: '',
          subIssue: '',
          event: '',
          fullName: '',
          email: '',
          phone: '',
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
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex items-center justify-center w-full pb-10'>
      <form onSubmit={handleSubmit} className='w-full max-w-3xl p-6 space-y-6'>
        <h2 className='text-3xl font-semibold w-full text-white mb-6'>
          Contact Us
        </h2>
        {/* Event */}
        <div className='relative'>
          {focusedField === 'subIssue' && (
            <label className='absolute -top-2.5 left-2 px-1 text-xs text-yellow-500'>
              Event
            </label>
          )}
          <select
            name='event'
            value={formData.event || ''}
            onChange={handleChange}
            onFocus={() => handleFocus('event')}
            onBlur={handleBlur}
            required
            className='w-full px-4 py-3 rounded border border-gray-700 outline-amber-400 focus:border-yellow-500 text-white'
          >
            <option value='' disabled className='text-purple-950'>
              Select a Event*
            </option>
            {events.map((event) => (
              <option
                key={event._id}
                value={event._id}
                className='text-purple-950'
              >
                {event.name}
              </option>
            ))}
          </select>
        </div>
        {/* Topic */}
        <div className='relative'>
          {focusedField === 'topic' && (
            <label className='absolute -top-2.5 left-2 px-1 text-xs text-yellow-500'>
              Topic*
            </label>
          )}
          <select
            name='topic'
            value={formData.topic || ''}
            onChange={(e) => {
              const selected = topics.find((t) => t === e.target.value)
              setFormData({ ...formData, topic: selected, subIssue: '' })
            }}
            onFocus={() => handleFocus('topic')}
            onBlur={handleBlur}
            required
            className='w-full px-4 py-3 rounded border border-gray-700 outline-amber-400 focus:border-yellow-500 text-white'
          >
            <option value='' disabled className='text-purple-950'>
              Select a Topic*
            </option>
            {topics.map((topic, index) => (
              <option key={index} value={topic} className='text-purple-950'>
                {topic}
              </option>
            ))}
          </select>
        </div>
        {/* Sub topic */}
        {formData.topic?.subtopics && (
          <div className='relative'>
            {focusedField === 'subIssue' && (
              <label className='absolute -top-2.5 left-2 px-1 text-xs text-yellow-500'>
                Sub Issue*
              </label>
            )}
            <select
              name='subIssue'
              value={formData.subIssue || ''}
              onChange={handleChange}
              onFocus={() => handleFocus('subIssue')}
              onBlur={handleBlur}
              required
              className='w-full px-4 py-3 rounded border border-gray-700 outline-amber-400 focus:border-yellow-500 text-white'
            >
              <option value='' disabled className='text-purple-950'>
                Select a Sub Issue*
              </option>
              {formData.topic.subtopics.map((sub, index) => (
                <option key={index} value={sub} className='text-purple-950'>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Full Name */}
        <div className='relative'>
          {focusedField === 'fullName' && (
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
              Phone Number*
            </label>
          )}
          <input
            type='tel'
            name='phone'
            pattern='[0-9]{10,15}'
            maxLength='15'
            placeholder='Enter your Phone Number*'
            value={formData.phone}
            onChange={handleChange}
            onFocus={() => handleFocus('phone')}
            onBlur={handleBlur}
            className='w-full px-4 py-3 rounded border border-gray-700 outline-amber-400 focus:border-yellow-500 bg-transparent text-white'
            required
          />
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
            minLength={500}
            required
            className='w-full px-4 py-3 rounded border border-gray-700 outline-amber-400 focus:border-yellow-500 bg-transparent text-white resize-none'
          />
        </div>
        <div className='flex justify-end gap-4'>
          <Link href='/'>
            <button
              type='button'
              className='bg-gray-600 text-white text-xl font-medium px-6 py-3 rounded'
            >
              Back
            </button>
          </Link>

          <button
            type='submit'
            className='bg-yellow-500 text-white text-xl font-medium px-6 py-3 rounded'
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader /> : 'Send Message '}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ContactForm
