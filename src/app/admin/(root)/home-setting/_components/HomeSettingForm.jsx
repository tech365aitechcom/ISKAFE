'use client'
import axios from 'axios'
import { API_BASE_URL, apiConstants } from '../../../../../constants/index'
import { Send, X, Pencil, Trash2, EyeOff, Eye } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import useUserStore from '../../../../../stores/userStore'
import { enqueueSnackbar } from 'notistack'
import Loader from '../../../../_components/Loader'

export const HomeSettingsForm = () => {
  const user = useUserStore((state) => state.user)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    logo: null,
    menuItems: [],
    platformName: '',
    platformTagline: '',
    heroBanner: {
      image: null,
      ctaText: '',
      ctaLink: '',
    },
    topFighters: [],
    upcomingEvents: [],
    latestMedia: [],
  })

  // State for managing form interactions
  const [newMenuItem, setNewMenuItem] = useState({
    label: '',
    linkType: 'internal',
    destinationLink: '',
    openInNewTab: false,
    visibilityRole: 'everyone',
    sortOrder: 0,
    status: true,
  })
  const [editingMenuItem, setEditingMenuItem] = useState(null)
  const [newFighter, setNewFighter] = useState({
    name: '',
    rank: '',
    image: '',
  })

  // Fetch home page settings
  const fetchHomeSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/home-settings`)
      if (response.data.data) {
        setFormData(response.data.data)
      }
    } catch (error) {
      console.log('Error fetching home settings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHomeSettings()
  }, [])

  // Generic change handler for form inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Handle file uploads
  const handleFileUpload = (e, section) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          [section]: {
            ...prev[section],
            image: reader.result,
          },
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Menu Item Management
  const handleAddMenuItem = () => {
    // Validate menu item
    if (!newMenuItem.label.trim()) {
      enqueueSnackbar('Menu label is required', { variant: 'error' })
      return
    }

    if (!newMenuItem.destinationLink.trim()) {
      enqueueSnackbar('Destination link is required', { variant: 'error' })
      return
    }

    // Check for duplicate menu items
    const exists = formData.menuItems.some(
      (item) =>
        item.label.toLowerCase() === newMenuItem.label.trim().toLowerCase()
    )

    if (exists) {
      enqueueSnackbar('This menu item already exists', { variant: 'error' })
      return
    }

    // Add new menu item
    setFormData((prev) => ({
      ...prev,
      menuItems: [...prev.menuItems, { ...newMenuItem }],
    }))

    // Reset new menu item state
    setNewMenuItem({
      label: '',
      linkType: 'internal',
      destinationLink: '',
      openInNewTab: false,
      visibilityRole: 'everyone',
      sortOrder: 0,
      status: true,
    })
  }

  // Edit menu item
  const handleEditMenuItem = (index) => {
    setEditingMenuItem(formData.menuItems[index])
    setNewMenuItem(formData.menuItems[index])
  }

  // Update menu item
  const handleUpdateMenuItem = () => {
    if (!newMenuItem.label.trim() || !newMenuItem.destinationLink.trim()) {
      enqueueSnackbar('Label and destination link are required', {
        variant: 'error',
      })
      return
    }

    setFormData((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((item, index) =>
        index === formData.menuItems.findIndex((i) => i === editingMenuItem)
          ? newMenuItem
          : item
      ),
    }))

    // Reset editing states
    setNewMenuItem({
      label: '',
      linkType: 'internal',
      destinationLink: '',
      openInNewTab: false,
      visibilityRole: 'everyone',
      sortOrder: 0,
      status: true,
    })
    setEditingMenuItem(null)
  }

  // Remove menu item
  const handleRemoveMenuItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      menuItems: prev.menuItems.filter((_, i) => i !== index),
    }))
  }

  // Handle Hero Banner CTA changes
  const handleHeroBannerCtaChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      heroBanner: {
        ...prev.heroBanner,
        [name]: value,
      },
    }))
  }

  const handleLatestMediaUpload = (e) => {
    const files = Array.from(e.target.files)
    const newMedia = files.map((file) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      return new Promise((resolve) => {
        reader.onloadend = () => {
          resolve({
            type: file.type.startsWith('image/') ? 'image' : 'video',
            url: reader.result,
            name: file.name,
          })
        }
      })
    })

    Promise.all(newMedia).then((media) => {
      setFormData((prev) => ({
        ...prev,
        latestMedia: [...prev.latestMedia, ...media].slice(0, 5), // Limit to 5 media items
      }))
    })
  }

  // Remove Media Item
  const handleRemoveMediaItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      latestMedia: prev.latestMedia.filter((_, i) => i !== index),
    }))
  }

  const handleFighterChange = (index, e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const updated = [...prev.topFighters]
      updated[index][name] = value
      return { ...prev, topFighters: updated }
    })
  }

  const handleAddTopFighter = () => {
    if (!newFighter.name.trim()) {
      enqueueSnackbar('Fighter name is required', { variant: 'error' })
      return
    }
    setFormData((prev) => ({
      ...prev,
      topFighters: [...prev.topFighters, newFighter],
    }))
    setNewFighter({ name: '', rank: '', image: '' })
  }

  const handleRemoveTopFighter = (index) => {
    setFormData((prev) => ({
      ...prev,
      topFighters: prev.topFighters.filter((_, i) => i !== index),
    }))
  }

  // Form submission
  const handleSubmit = async (e) => {
    try {
      e.preventDefault()

      // Comprehensive validation
      const validations = [
        {
          condition: !formData.platformName.trim(),
          message: 'Platform Name is required',
        },
        {
          condition: !formData.platformTagline.trim(),
          message: 'Platform Tagline is required',
        },
        {
          condition: formData.menuItems.length === 0,
          message: 'At least one menu item is required',
        },
        {
          condition: !formData.heroBanner.image,
          message: 'Hero Banner Image is required',
        },
        {
          condition: !formData.heroBanner.ctaText.trim(),
          message: 'Hero Banner CTA Text is required',
        },
        {
          condition: !formData.heroBanner.ctaLink.trim(),
          message: 'Hero Banner CTA Link is required',
        },
      ]

      // Check validations
      for (const validation of validations) {
        if (validation.condition) {
          enqueueSnackbar(validation.message, { variant: 'error' })
          return
        }
      }

      const payload = {
        ...formData,
        updatedBy: user?.id,
      }

      const response = await axios.put(`${API_BASE_URL}/home-settings`, payload)

      if (response.status === apiConstants.success) {
        enqueueSnackbar(
          response.data.message || 'Home settings updated successfully',
          { variant: 'success' }
        )
      }
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || 'Something went wrong',
        { variant: 'error' }
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
          <h1 className='text-2xl font-bold'>Manage Home Page Settings</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Header Section */}
          <h2 className='font-bold mb-4 uppercase text-sm'>Header</h2>{' '}
          {/* Logo Upload */}
          <div className='mb-6'>
            <label className='block text-sm font-medium mb-2'>
              Logo<span className='text-red-500'>*</span>
            </label>
            <div className='flex items-center gap-4'>
              <div className='w-32 h-32 bg-[#00000061] rounded flex items-center justify-center'>
                {formData.logo ? (
                  <img
                    src={formData.logo}
                    alt='Uploaded Logo'
                    className='max-w-full max-h-full object-contain'
                  />
                ) : (
                  <span className='text-gray-500'>No logo</span>
                )}
              </div>
              <input
                type='file'
                accept='image/jpeg,image/png,image/svg+xml,image/gif'
                onChange={(e) => handleFileUpload(e, 'logo')}
                className='hidden'
                id='logoUpload'
              />
              <label
                htmlFor='logoUpload'
                className='bg-[#7F25FB] px-4 py-2 rounded cursor-pointer'
              >
                Upload Logo
              </label>
            </div>
          </div>
          {/* Menu Items */}
          <div className='mb-6'>
            <label className='block text-sm font-medium mb-2'>
              Menu Items<span className='text-red-500'>*</span>
            </label>

            {/* Menu Item Input */}
            <div className='flex flex-col gap-4 mb-4'>
              <div className='grid grid-cols-2 gap-2'>
                <input
                  type='text'
                  placeholder='Menu Label'
                  value={newMenuItem.label}
                  onChange={(e) =>
                    setNewMenuItem((prev) => ({
                      ...prev,
                      label: e.target.value,
                    }))
                  }
                  className='bg-[#00000061] p-2 rounded outline-none'
                />
                <select
                  value={newMenuItem.linkType}
                  onChange={(e) =>
                    setNewMenuItem((prev) => ({
                      ...prev,
                      linkType: e.target.value,
                    }))
                  }
                  className='bg-[#00000061] p-2 rounded'
                >
                  <option value='internal'>Internal</option>
                  <option value='external'>External</option>
                  <option value='modal'>Modal</option>
                </select>
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <input
                  type='text'
                  placeholder='Destination Link'
                  value={newMenuItem.destinationLink}
                  onChange={(e) =>
                    setNewMenuItem((prev) => ({
                      ...prev,
                      destinationLink: e.target.value,
                    }))
                  }
                  className='bg-[#00000061] p-2 rounded outline-none'
                />
                <select
                  value={newMenuItem.visibilityRole}
                  onChange={(e) =>
                    setNewMenuItem((prev) => ({
                      ...prev,
                      visibilityRole: e.target.value,
                    }))
                  }
                  className='bg-[#00000061] p-2 rounded'
                >
                  <option value='everyone'>Everyone</option>
                  <option value='admins'>Admins Only</option>
                  <option value='logged-in'>Logged In</option>
                </select>
              </div>
              <div className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  id='openInNewTab'
                  checked={newMenuItem.openInNewTab}
                  onChange={(e) =>
                    setNewMenuItem((prev) => ({
                      ...prev,
                      openInNewTab: e.target.checked,
                    }))
                  }
                  className='mr-2 h-5 w-5 accent-[#7F25FB]'
                />
                <label htmlFor='openInNewTab' className='text-sm'>
                  Open in New Tab
                </label>
                <input
                  type='number'
                  placeholder='Sort Order'
                  value={newMenuItem.sortOrder}
                  onChange={(e) =>
                    setNewMenuItem((prev) => ({
                      ...prev,
                      sortOrder: Number(e.target.value),
                    }))
                  }
                  className='ml-auto bg-[#00000061] p-2 rounded w-20 outline-none'
                />
              </div>
            </div>

            {/* Add/Update Button */}
            <div className='flex'>
              <button
                type='button'
                onClick={
                  editingMenuItem ? handleUpdateMenuItem : handleAddMenuItem
                }
                className='bg-[#7F25FB] px-4 py-2 rounded flex items-center justify-center w-full'
              >
                {editingMenuItem ? 'Update Menu Item' : 'Add Menu Item'}
              </button>
            </div>

            {/* Existing Menu Items */}
            <div className='mt-4 space-y-2'>
              {formData.menuItems.map((item, index) => (
                <div
                  key={index}
                  className='bg-[#14255D] px-3 py-2 rounded-lg flex items-center justify-between'
                >
                  <div className='flex-grow'>
                    <div className='font-medium'>{item.label}</div>
                    <div className='text-xs text-gray-400'>
                      {item.destinationLink} | {item.linkType}
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      type='button'
                      onClick={() => handleEditMenuItem(index)}
                      className='text-[#AEB9E1] hover:text-white'
                    >
                      <Pencil className='w-4 h-4' />
                    </button>
                    <button
                      type='button'
                      onClick={() => handleRemoveMenuItem(index)}
                      className='text-[#AEB9E1] hover:text-white'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Platform Name and Tagline */}
          <div className='mb-6'>
            <div className='mb-4 bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Platform Name<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='platformName'
                value={formData.platformName}
                onChange={handleChange}
                className='w-full outline-none'
                placeholder='Platform Name (Max 50 characters)'
                maxLength={50}
              />
            </div>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Platform Tagline<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='platformTagline'
                value={formData.platformTagline}
                onChange={handleChange}
                className='w-full outline-none'
                placeholder='Platform Tagline (Max 100 characters)'
                maxLength={100}
              />
            </div>
          </div>
          <div className='mb-6'>
            {/* Hero Banner Image */}
            <div className='mb-4'>
              <label className='block text-sm font-medium mb-2'>
                Hero Banner Image<span className='text-red-500'>*</span>
              </label>
              <div className='flex items-center gap-4'>
                <div className='w-64 h-36 bg-[#00000061] rounded flex items-center justify-center'>
                  {formData.heroBanner.image ? (
                    <img
                      src={formData.heroBanner.image}
                      alt='Hero Banner'
                      className='max-w-full max-h-full object-cover'
                    />
                  ) : (
                    <span className='text-gray-500'>No image</span>
                  )}
                </div>
                <input
                  type='file'
                  accept='image/jpeg,image/png,image/svg+xml,image/gif'
                  onChange={(e) => handleFileUpload(e, 'heroBanner')}
                  className='hidden'
                  id='heroBannerUpload'
                />
                <label
                  htmlFor='heroBannerUpload'
                  className='bg-[#7F25FB] px-4 py-2 rounded cursor-pointer'
                >
                  Upload Image
                </label>
              </div>
            </div>

            {/* Hero Banner CTA */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  CTA Text<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='ctaText'
                  value={formData.heroBanner.ctaText}
                  onChange={handleHeroBannerCtaChange}
                  className='w-full outline-none'
                  placeholder='Register Now'
                  maxLength={30}
                />
              </div>
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  CTA Link<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='ctaLink'
                  value={formData.heroBanner.ctaLink}
                  onChange={handleHeroBannerCtaChange}
                  className='w-full outline-none'
                  placeholder='/register'
                />
              </div>
            </div>
          </div>
          {/* Top Fighters Section */}
          <h2 className='font-bold mb-4 uppercase text-sm'>Top Fighters</h2>
          <div className='mb-6'>
            <div className='flex gap-4'>
              <div className='flex-grow bg-[#00000061] p-2 rounded-l'>
                <input
                  type='text'
                  value={newFighter.name}
                  onChange={(e) =>
                    setNewFighter({ ...newFighter, name: e.target.value })
                  }
                  placeholder='New Fighter Name'
                />
              </div>
              <div className='flex-grow bg-[#00000061] p-2 rounded-l'>
                <input
                  type='text'
                  value={newFighter.rank}
                  onChange={(e) =>
                    setNewFighter({ ...newFighter, rank: e.target.value })
                  }
                  placeholder='Rank'
                />
              </div>
              <button
                type='button'
                className='bg-[#7F25FB] px-4 rounded-r flex items-center justify-center'
                onClick={handleAddTopFighter}
              >
                <Send className='w-5 h-5' />
              </button>
            </div>
            {/* Display added fighters */}
            <div className='mt-4 space-y-2'>
              {formData.topFighters.map((fighter, index) => (
                <div key={index}>
                  <input
                    type='text'
                    name='name'
                    value={fighter.name}
                    onChange={(e) => handleFighterChange(index, e)}
                    placeholder='Name'
                  />
                  <input
                    type='text'
                    name='rank'
                    value={fighter.rank}
                    onChange={(e) => handleFighterChange(index, e)}
                    placeholder='Rank'
                  />
                  <button onClick={() => handleRemoveTopFighter(index)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          {/* Upcoming Events Section */}
          <h2 className='font-bold mb-4 uppercase text-sm'>Upcoming Events</h2>
          <div className='mb-6'>
            <div className='flex'>
              <div className='flex-grow bg-[#00000061] p-2 rounded-l'>
                <input
                  type='text'
                  placeholder='Add event title'
                  className='w-full outline-none'
                />
              </div>
              <button
                type='button'
                className='bg-[#7F25FB] px-4 rounded-r flex items-center justify-center'
              >
                <Send className='w-5 h-5' />
              </button>
            </div>
            {/* Display added events */}
            <div className='mt-4 space-y-2'>
              {formData.upcomingEvents.map((event, index) => (
                <div
                  key={index}
                  className='bg-[#14255D] px-3 py-2 rounded-lg flex items-center justify-between'
                >
                  <div className='flex-grow'>
                    <div className='font-medium'>{event.title}</div>
                    <div className='text-xs text-gray-400'>{event.date}</div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      type='button'
                      className='text-[#AEB9E1] hover:text-white'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Latest Media Section */}
          <h2 className='font-bold mb-4 uppercase text-sm'>Latest Media</h2>
          <div className='mb-6'>
            <div className='flex'>
              <div className='flex-grow bg-[#00000061] p-2 rounded-l'>
                <input
                  type='file'
                  accept='image/jpeg,image/png,image/gif,video/mp4'
                  multiple
                  onChange={handleLatestMediaUpload}
                  className='w-full outline-none'
                />
              </div>
            </div>
            {/* Display added media */}
            <div className='mt-4 grid grid-cols-3 gap-4'>
              {formData.latestMedia.map((media, index) => (
                <div
                  key={index}
                  className='bg-[#14255D] rounded-lg overflow-hidden relative'
                >
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={`Media ${index + 1}`}
                      className='w-full h-32 object-cover'
                    />
                  ) : (
                    <video
                      src={media.url}
                      className='w-full h-32 object-cover'
                    />
                  )}
                  <button
                    type='button'
                    onClick={() => handleRemoveMediaItem(index)}
                    className='absolute top-2 right-2 bg-red-500 rounded-full p-1'
                  >
                    <X className='w-4 h-4 text-white' />
                  </button>
                </div>
              ))}
            </div>
            <p className='text-xs text-gray-400 mt-2'>
              Max 5 media items. Supports images and videos.
            </p>
          </div>
          {/* Submission Section */}
          <div className='flex justify-center mt-8 mb-6'>
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
