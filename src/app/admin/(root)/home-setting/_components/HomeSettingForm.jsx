'use client'
import axios from 'axios'
import { API_BASE_URL, apiConstants } from '../../../../../constants/index'
import { Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import useStore from '../../../../../stores/useStore'
import { enqueueSnackbar } from 'notistack'
import Loader from '../../../../_components/Loader'
import { uploadToS3 } from '../../../../../utils/uploadToS3'

export const HomeSettingsForm = () => {
  const user = useStore((state) => state.user)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    logo: null,
    menuItems: [],
    platformName: '',
    tagline: '',
    heroImage: null,
    cta: {
      text: '',
      link: '',
    },
  })

  const [newMenuItem, setNewMenuItem] = useState({
    label: '',
    linkType: 'route',
    destination: '',
    openInNewTab: false,
    visibilityRole: 'everyone',
    sortOrder: 0,
    status: true,
  })
  const [existingId, setExistingId] = useState('')

  useEffect(() => {
    const fetchHomeSettings = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/home-config`)
        if (response.data.data) {
          setFormData(response.data.data)
          setExistingId(response.data.data._id)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchHomeSettings()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleFileUpload = (e) => {
    const { name, files } = e.target
    const file = files[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }))
    }
  }

  const handleHeroCtaChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, cta: { ...prev.cta, [name]: value } }))
  }

  const handleAddMenuItem = () => {
    const { label, destination } = newMenuItem
    if (!label.trim() || !destination.trim()) {
      enqueueSnackbar('Label and destination are required', {
        variant: 'error',
      })
      return
    }
    setFormData((prev) => ({
      ...prev,
      menuItems: [...prev.menuItems, newMenuItem],
    }))
    setNewMenuItem({
      label: '',
      linkType: 'route',
      destination: '',
      openInNewTab: false,
      visibilityRole: 'everyone',
      sortOrder: 0,
      status: true,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validations = [
      {
        condition: !formData.platformName.trim(),
        message: 'Platform Name is required',
      },
      { condition: !formData.tagline.trim(), message: 'Tagline is required' },
      {
        condition: formData.menuItems.length === 0,
        message: 'At least one menu item required',
      },
      { condition: !formData.heroImage, message: 'Hero image is required' },
      { condition: !formData.cta.text.trim(), message: 'CTA text is required' },
      { condition: !formData.cta.link.trim(), message: 'CTA link is required' },
    ]
    for (const { condition, message } of validations) {
      if (condition) {
        enqueueSnackbar(message, { variant: 'error' })
        return
      }
    }
    try {
      if (formData.logo && typeof formData.logo !== 'string') {
        try {
          const s3UploadedUrl = await uploadToS3(formData.logo)
          formData.logo = s3UploadedUrl
        } catch (error) {
          console.error('Image upload failed:', error)
          return
        }
      }
      if (formData.heroImage && typeof formData.heroImage !== 'string') {
        try {
          const s3UploadedUrl = await uploadToS3(formData.heroImage)
          formData.heroImage = s3UploadedUrl
        } catch (error) {
          console.error('Image upload failed:', error)
          return
        }
      }
      console.log('Form submitted:', formData)

      let response = null
      if (existingId) {
        response = await axios.put(
          `${API_BASE_URL}/home-config/${existingId}`,
          formData
        )
      } else {
        response = await axios.post(`${API_BASE_URL}/home-config`, formData, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        })
      }

      if (
        response.status === apiConstants.success ||
        response.status === apiConstants.create
      ) {
        enqueueSnackbar(
          response.data.message || 'Settings updated successfully',
          { variant: 'success' }
        )
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

  if (loading)
    return (
      <div className='min-h-screen text-white bg-dark-blue-900 flex justify-center items-center'>
        <Loader />
      </div>
    )

  return (
    <div className='min-h-screen text-white bg-dark-blue-900'>
      <div className='w-full p-6'>
        <h1 className='text-2xl font-bold mb-6'>Manage Home Page Settings</h1>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label className='block font-medium mb-2'>Logo</label>
            <div className='py-4'>
              {formData.logo && typeof formData.logo === 'string' && (
                <img
                  src={formData.logo}
                  alt='Logo'
                  className='w-32 h-32 object-cover rounded-full'
                />
              )}
            </div>
            <input
              type='file'
              name='logo'
              accept='image/*'
              onChange={handleFileUpload}
              className='w-full bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700'
            />
          </div>
          <div>
            <label className='block font-medium mb-2'>Platform Name</label>
            <input
              name='platformName'
              type='text'
              value={formData.platformName}
              onChange={handleChange}
              className='w-full p-2 bg-[#00000061] rounded outline-none'
            />
          </div>
          <div>
            <label className='block font-medium mb-2'>Tagline</label>
            <input
              name='tagline'
              type='text'
              value={formData.tagline}
              onChange={handleChange}
              className='w-full p-2 bg-[#00000061] rounded outline-none'
            />
          </div>
          <div>
            <label className='block font-medium mb-2'>Hero Image</label>
            <div className='py-4'>
              {formData.heroImage && typeof formData.heroImage === 'string' && (
                <img
                  src={formData.heroImage}
                  alt='Hero Image'
                  className='w-52 h-52 object-cover'
                />
              )}
            </div>{' '}
            <input
              type='file'
              name='heroImage'
              accept='image/*'
              onChange={handleFileUpload}
              className='w-full bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700'
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block font-medium mb-2'>CTA Text</label>
              <input
                name='text'
                type='text'
                value={formData.cta.text}
                onChange={handleHeroCtaChange}
                className='w-full p-2 bg-[#00000061] rounded outline-none'
              />
            </div>
            <div>
              <label className='block font-medium mb-2'>CTA Link</label>
              <input
                name='link'
                type='text'
                value={formData.cta.link}
                onChange={handleHeroCtaChange}
                className='w-full p-2 bg-[#00000061] rounded outline-none'
              />
            </div>
          </div>
          <div>
            <label className='block font-medium mb-2'>Menu Items</label>
            {formData.menuItems.map((item, idx) => (
              <div
                key={idx}
                className='flex justify-between items-center bg-[#14255D] p-2 rounded mb-2'
              >
                <span>
                  {item.label} - {item.destination}
                </span>
                <button
                  type='button'
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      menuItems: prev.menuItems.filter((_, i) => i !== idx),
                    }))
                  }
                >
                  <Trash2 className='w-4 h-4 text-red-400' />
                </button>
              </div>
            ))}
            <div className='grid grid-cols-2 gap-2'>
              <input
                placeholder='Label'
                value={newMenuItem.label}
                onChange={(e) =>
                  setNewMenuItem((prev) => ({ ...prev, label: e.target.value }))
                }
                className='p-2 bg-[#00000061] rounded outline-none'
              />
              <input
                placeholder='Destination'
                value={newMenuItem.destination}
                onChange={(e) =>
                  setNewMenuItem((prev) => ({
                    ...prev,
                    destination: e.target.value,
                  }))
                }
                className='p-2 bg-[#00000061] rounded outline-none'
              />
              <select
                value={newMenuItem.linkType}
                onChange={(e) =>
                  setNewMenuItem((prev) => ({
                    ...prev,
                    linkType: e.target.value,
                  }))
                }
                className='p-2 bg-[#00000061] rounded'
              >
                <option value='route'>Route</option>
                <option value='url'>URL</option>
                <option value='modal'>Modal</option>
              </select>
              <select
                value={newMenuItem.visibilityRole}
                onChange={(e) =>
                  setNewMenuItem((prev) => ({
                    ...prev,
                    visibilityRole: e.target.value,
                  }))
                }
                className='p-2 bg-[#00000061] rounded'
              >
                <option value='everyone'>Everyone</option>
                <option value='loggedIn'>Logged In</option>
                <option value='admin'>Admin</option>
              </select>
            </div>
            <button
              type='button'
              onClick={handleAddMenuItem}
              className='mt-2 bg-purple-600 px-4 py-2 rounded'
            >
              Add Menu Item
            </button>
          </div>
          <div className='text-center'>
            <button
              type='submit'
              className='text-white font-medium py-2 px-6 rounded'
              style={{
                background:
                  'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
            >
              Save Home Page Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default HomeSettingsForm
