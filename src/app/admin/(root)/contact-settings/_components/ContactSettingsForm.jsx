'use client'
import axios from 'axios'
import { API_BASE_URL, apiConstants } from '../../../../../constants/index'
import { Plus } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import useStore from '../../../../../stores/useStore'
import { enqueueSnackbar } from 'notistack'
import Loader from '../../../../_components/Loader'

export const ContactSettingsForm = () => {
  const user = useStore((state) => state.user)

  const [formData, setFormData] = useState({
    enableCaptcha: false,
    address: '',
    phone: '',
    email: '',
    googleMapEmbedUrl: '',
  })

  const [loading, setLoading] = useState(true)
  const [existingId, setExistingId] = useState('')

  const [topics, setTopics] = useState([])
  const [newTopic, setNewTopic] = useState('')
  const [editIndex, setEditIndex] = useState(null)

  const fetchContactSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/contactUs-settings`)
      if (response.data.data) {
        setExistingId(response.data.data._id)
        setFormData({
          enableCaptcha: response.data.data.enableCaptcha || false,
          address: response.data.data.address || '',
          phone: response.data.data.phone || '',
          email: response.data.data.email || '',
          googleMapEmbedUrl: response.data.data.googleMapEmbedUrl || '',
        })
        setTopics(response.data.data.topics || [])
      }
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || 'Error loading contact settings',
        { variant: 'error' }
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.email && !validateEmail(formData.email)) {
      enqueueSnackbar('Please enter a valid contact email', {
        variant: 'error',
      })
      return
    }

    const payload = {
      ...formData,
      topics,
    }

    try {
      let response = null

      if (existingId) {
        response = await axios.put(
          `${API_BASE_URL}/contactUs-settings/${existingId}`,
          payload
        )
      } else {
        response = await axios.post(
          `${API_BASE_URL}/contactUs-settings`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        )
      }

      if (
        response.status === apiConstants.success ||
        response.status === apiConstants.create
      ) {
        enqueueSnackbar(response.data.message, {
          variant: 'success',
        })
        fetchContactSettings()
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

  const handleAddTopic = () => {
    const trimmed = newTopic.trim()
    if (!trimmed) return

    if (topics.includes(trimmed)) {
      enqueueSnackbar('Topic already exists', { variant: 'warning' })
      return
    }

    setTopics((prev) => [...prev, trimmed])
    setNewTopic('')
  }

  const handleEditTopic = (index) => {
    setEditIndex(index)
    setNewTopic(topics[index])
  }

  const handleUpdateTopic = () => {
    const trimmed = newTopic.trim()
    if (!trimmed) return

    if (topics.includes(trimmed) && topics[editIndex] !== trimmed) {
      enqueueSnackbar('Topic already exists', { variant: 'warning' })
      return
    }

    const updated = [...topics]
    updated[editIndex] = trimmed
    setTopics(updated)
    setNewTopic('')
    setEditIndex(null)
  }

  const handleDeleteTopic = (index) => {
    setTopics((prev) => prev.filter((_, i) => i !== index))
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

          {/* Google Map Embed */}
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

          {/* Map Preview */}
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

          {/* General Settings */}
          <h2 className='font-bold mb-4 uppercase text-sm'>General</h2>

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

          {/* Topics Management */}
          <h2 className='font-bold mb-4 uppercase text-sm'>Topics</h2>

          <div className='mb-4 flex gap-2'>
            <input
              type='text'
              className='w-full p-2 bg-[#00000061] rounded outline-none'
              placeholder='Enter a topic'
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
            />
            <button
              type='button'
              onClick={editIndex !== null ? handleUpdateTopic : handleAddTopic}
              className='bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded text-white'
            >
              {editIndex !== null ? 'Update' : <Plus size={16} />}
            </button>
          </div>

          <div className='space-y-2'>
            {topics.map((topic, index) => (
              <div
                key={index}
                className='flex justify-between items-center bg-[#00000061] px-3 py-2 rounded'
              >
                <span>{topic}</span>
                <div className='flex gap-2'>
                  <button
                    type='button'
                    onClick={() => handleEditTopic(index)}
                    className='text-blue-400 hover:text-blue-600 text-sm'
                  >
                    Edit
                  </button>
                  <button
                    type='button'
                    onClick={() => handleDeleteTopic(index)}
                    className='text-red-400 hover:text-red-600 text-sm'
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
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
