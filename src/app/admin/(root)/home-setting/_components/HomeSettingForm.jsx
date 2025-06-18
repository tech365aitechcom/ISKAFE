'use client'
import axios from 'axios'
import { API_BASE_URL, apiConstants } from '../../../../../constants/index'
import { Trash2, Edit2, Save, X } from 'lucide-react'
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
    latestMedia: [],
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

  const [isNewMediaLoading, setNewMediaLoading] = useState(false)
  const [newMedia, setNewMedia] = useState({
    title: '',
    image: null,
    sortOrder: 0,
  })

  // Edit states
  const [editingMenuItem, setEditingMenuItem] = useState(null)
  const [editingMedia, setEditingMedia] = useState(null)
  const [editMenuItemData, setEditMenuItemData] = useState({})
  const [editMediaData, setEditMediaData] = useState({})
  const [isEditMediaLoading, setEditMediaLoading] = useState(false)

  const [existingId, setExistingId] = useState('')

  const fetchHomeSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/home-config`)
      if (response.data.data) {
        const data = response.data.data
        setFormData({
          ...data,
          latestMedia: data.latestMedia || [],
          menuItems: data.menuItems || [],
          cta: data.cta || { text: '', link: '' },
        })
        setExistingId(data._id)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
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

  const handleMediaFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewMedia((prev) => ({
        ...prev,
        image: file,
      }))
    }
  }

  const handleEditMediaFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setEditMediaData((prev) => ({
        ...prev,
        image: file,
      }))
    }
  }

  const handleHeroCtaChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, cta: { ...prev.cta, [name]: value } }))
  }

  // Menu Item Functions
  const handleAddMenuItem = () => {
    const { label, destination, sortOrder } = newMenuItem

    if (!label.trim() || !destination.trim()) {
      enqueueSnackbar('Label and destination are required', {
        variant: 'error',
      })
      return
    }

    const parsedSortOrder = parseInt(sortOrder) || 0

    // Check for duplicate sortOrder
    const isDuplicateSortOrder = (formData.menuItems || []).some(
      (item) => item.sortOrder === parsedSortOrder
    )

    if (isDuplicateSortOrder) {
      enqueueSnackbar(
        `Sort Order "${parsedSortOrder}" already exists. Please use a unique value.`,
        {
          variant: 'error',
        }
      )
      return
    }

    setFormData((prev) => ({
      ...prev,
      menuItems: [
        ...(prev.menuItems || []),
        { ...newMenuItem, sortOrder: parsedSortOrder },
      ],
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

  const handleEditMenuItem = (index) => {
    setEditingMenuItem(index)
    setEditMenuItemData({ ...formData.menuItems[index] })
  }

  const handleCancelEditMenuItem = () => {
    setEditingMenuItem(null)
    setEditMenuItemData({})
  }

  const handleSaveMenuItem = () => {
    const { label, destination, sortOrder } = editMenuItemData

    if (!label?.trim() || !destination?.trim()) {
      enqueueSnackbar('Label and destination are required', {
        variant: 'error',
      })
      return
    }

    const parsedSortOrder = parseInt(sortOrder) || 0

    // Check for duplicate sortOrder (excluding current item)
    const isDuplicateSortOrder = (formData.menuItems || []).some(
      (item, idx) =>
        idx !== editingMenuItem && item.sortOrder === parsedSortOrder
    )

    if (isDuplicateSortOrder) {
      enqueueSnackbar(
        `Sort Order "${parsedSortOrder}" already exists. Please use a unique value.`,
        {
          variant: 'error',
        }
      )
      return
    }

    setFormData((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((item, idx) =>
        idx === editingMenuItem
          ? { ...editMenuItemData, sortOrder: parsedSortOrder }
          : item
      ),
    }))

    setEditingMenuItem(null)
    setEditMenuItemData({})
  }

  const handleDeleteMenuItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      menuItems: prev.menuItems.filter((_, i) => i !== index),
    }))
  }

  // Media Functions
  const handleAddNewLatestMedia = async () => {
    setNewMediaLoading(true)
    const { title, image, sortOrder } = newMedia
    if (!title.trim() || !image) {
      enqueueSnackbar('Title and image are required', {
        variant: 'error',
      })
      setNewMediaLoading(false)
      return
    }

    const parsedSortOrder = parseInt(sortOrder) || 0

    // Check for duplicate sortOrder
    const isDuplicateSortOrder = (formData.latestMedia || []).some(
      (media) => media.sortOrder === parsedSortOrder
    )

    if (isDuplicateSortOrder) {
      enqueueSnackbar(
        `Sort Order "${parsedSortOrder}" already exists. Please use a unique value.`,
        {
          variant: 'error',
        }
      )
      setNewMediaLoading(false)
      return
    }

    try {
      let imageUrl = image
      if (image && typeof image !== 'string') {
        imageUrl = await uploadToS3(image)
      }

      const mediaItem = {
        title: title.trim(),
        image: imageUrl,
        sortOrder: parsedSortOrder,
      }

      setFormData((prev) => ({
        ...prev,
        latestMedia: [...(prev.latestMedia || []), mediaItem],
      }))

      setNewMedia({
        title: '',
        image: null,
        sortOrder: 0,
      })

      // Reset file input
      const fileInput = document.querySelector('input[name="mediaImage"]')
      if (fileInput) fileInput.value = ''
    } catch (error) {
      console.log('Error uploading media image:', error)
    } finally {
      setNewMediaLoading(false)
    }
  }

  const handleEditMedia = (index) => {
    setEditingMedia(index)
    setEditMediaData({ ...formData.latestMedia[index] })
  }

  const handleCancelEditMedia = () => {
    setEditingMedia(null)
    setEditMediaData({})
  }

  const handleSaveMedia = async () => {
    setEditMediaLoading(true)
    const { title, image, sortOrder } = editMediaData

    if (!title?.trim()) {
      enqueueSnackbar('Title is required', { variant: 'error' })
      setEditMediaLoading(false)
      return
    }

    const parsedSortOrder = parseInt(sortOrder) || 0

    // Check for duplicate sortOrder (excluding current item)
    const isDuplicateSortOrder = (formData.latestMedia || []).some(
      (media, idx) =>
        idx !== editingMedia && media.sortOrder === parsedSortOrder
    )

    if (isDuplicateSortOrder) {
      enqueueSnackbar(
        `Sort Order "${parsedSortOrder}" already exists. Please use a unique value.`,
        {
          variant: 'error',
        }
      )
      setEditMediaLoading(false)
      return
    }

    try {
      let imageUrl = image
      if (image && typeof image !== 'string') {
        imageUrl = await uploadToS3(image)
      }

      const updatedMediaItem = {
        title: title.trim(),
        image: imageUrl,
        sortOrder: parsedSortOrder,
      }

      setFormData((prev) => ({
        ...prev,
        latestMedia: prev.latestMedia.map((item, idx) =>
          idx === editingMedia ? updatedMediaItem : item
        ),
      }))

      setEditingMedia(null)
      setEditMediaData({})
    } catch (error) {
      console.log('Error uploading media image:', error)
    } finally {
      setEditMediaLoading(false)
    }
  }

  const handleDeleteMedia = (index) => {
    setFormData((prev) => ({
      ...prev,
      latestMedia: (prev.latestMedia || []).filter((_, i) => i !== index),
    }))
    enqueueSnackbar('Media item deleted successfully', { variant: 'success' })
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
      console.log(formData, 'formData')
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
        fetchHomeSettings()
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

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/home-config/${existingId}`
      )
      if (response.status == apiConstants.success) {
        enqueueSnackbar(response.data.message, { variant: 'success' })
        fetchHomeSettings()
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message, { variant: 'error' })
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
      <div className='w-full'>
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
            </div>
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

          {/* Latest Media Section */}
          <div>
            <label className='block font-medium mb-2'>Latest Media</label>

            {/* Display existing media items */}
            {formData.latestMedia &&
              Array.isArray(formData.latestMedia) &&
              formData.latestMedia.length > 0 && (
                <div className='mb-4'>
                  <h3 className='text-lg font-medium mb-2'>
                    Current Media Items
                  </h3>
                  <div className='flex flex-wrap gap-4'>
                    {formData.latestMedia.map((item, idx) => (
                      <div
                        key={idx}
                        className='bg-[#14255D] p-4 rounded-lg min-w-[300px]'
                      >
                        {editingMedia === idx ? (
                          // Edit mode
                          <div className='space-y-3'>
                            <div>
                              <label className='block text-sm font-medium mb-1'>
                                Title
                              </label>
                              <input
                                type='text'
                                value={editMediaData.title || ''}
                                onChange={(e) =>
                                  setEditMediaData((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                  }))
                                }
                                className='w-full p-2 bg-[#00000061] rounded outline-none'
                              />
                            </div>

                            <div>
                              <label className='block text-sm font-medium mb-1'>
                                Image
                              </label>
                              {editMediaData.image &&
                                typeof editMediaData.image === 'string' && (
                                  <img
                                    src={editMediaData.image}
                                    alt={editMediaData.title}
                                    className='w-32 h-32 object-cover rounded mb-2'
                                  />
                                )}
                              <input
                                type='file'
                                accept='image/*'
                                onChange={handleEditMediaFileUpload}
                                className='w-full bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700'
                              />
                            </div>

                            <div>
                              <label className='block text-sm font-medium mb-1'>
                                Position
                              </label>
                              <input
                                type='number'
                                value={editMediaData.sortOrder || 0}
                                onChange={(e) =>
                                  setEditMediaData((prev) => ({
                                    ...prev,
                                    sortOrder: e.target.value,
                                  }))
                                }
                                className='w-full p-2 bg-[#00000061] rounded outline-none'
                              />
                            </div>

                            <div className='flex gap-2'>
                              <button
                                type='button'
                                onClick={handleSaveMedia}
                                disabled={isEditMediaLoading}
                                className='flex items-center bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors'
                              >
                                {isEditMediaLoading ? (
                                  <Loader />
                                ) : (
                                  <>
                                    <Save className='w-4 h-4 mr-1' /> Save
                                  </>
                                )}
                              </button>
                              <button
                                type='button'
                                onClick={handleCancelEditMedia}
                                className='flex items-center bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm transition-colors'
                              >
                                <X className='w-4 h-4 mr-1' />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <>
                            {item.image && typeof item.image === 'string' && (
                              <img
                                src={item.image}
                                alt={item.title}
                                className='w-32 h-32 object-cover rounded mb-2'
                              />
                            )}
                            <p className='font-medium mb-1'>
                              Title: {item.title}
                            </p>
                            <p className='text-sm text-gray-300 mb-2'>
                              Position: {item.sortOrder}
                            </p>
                            <div className='flex gap-2'>
                              <button
                                type='button'
                                onClick={() => handleEditMedia(idx)}
                                className='flex items-center text-blue-400 hover:text-blue-300'
                              >
                                <Edit2 className='w-4 h-4 mr-1' />
                                Edit
                              </button>
                              <button
                                type='button'
                                onClick={() => handleDeleteMedia(idx)}
                                className='flex items-center text-red-400 hover:text-red-300'
                              >
                                <Trash2 className='w-4 h-4 mr-1' />
                                Remove
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Add new media item form */}
            <div className='space-y-3'>
              <h4 className='text-md font-medium'>Add New Media Item</h4>
              <div>
                <label className='block text-sm font-medium mb-1'>Title</label>
                <input
                  type='text'
                  placeholder='Media title'
                  value={newMedia.title}
                  onChange={(e) =>
                    setNewMedia((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className='w-full p-2 bg-[#00000061] rounded outline-none'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>Image</label>
                <input
                  type='file'
                  name='mediaImage'
                  accept='image/*'
                  onChange={handleMediaFileUpload}
                  className='w-full bg-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
                  Position
                </label>
                <input
                  type='number'
                  placeholder='Display order'
                  value={newMedia.sortOrder}
                  onChange={(e) =>
                    setNewMedia((prev) => ({
                      ...prev,
                      sortOrder: e.target.value,
                    }))
                  }
                  className='w-full p-2 bg-[#00000061] rounded outline-none'
                />
              </div>

              <button
                type='button'
                onClick={handleAddNewLatestMedia}
                className='bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors'
                disabled={isNewMediaLoading}
              >
                {isNewMediaLoading ? <Loader /> : 'Add Media Item'}
              </button>
            </div>
          </div>

          {/* Menu Items Section */}
          <div>
            <label className='block font-medium mb-2'>Menu Items</label>

            {/* Display current menu items */}
            {formData.menuItems && formData.menuItems.length > 0 && (
              <div className='mb-4'>
                <h3 className='text-lg font-medium mb-2'>Current Menu Items</h3>
                <div className='space-y-2'>
                  {formData.menuItems.map((item, idx) => (
                    <div key={idx} className='bg-[#14255D] p-4 rounded-lg'>
                      {editingMenuItem === idx ? (
                        // Edit mode
                        <div className='grid grid-cols-2 gap-3'>
                          <div>
                            <label className='block text-sm font-medium mb-1'>
                              Label
                            </label>
                            <input
                              type='text'
                              value={editMenuItemData.label || ''}
                              onChange={(e) =>
                                setEditMenuItemData((prev) => ({
                                  ...prev,
                                  label: e.target.value,
                                }))
                              }
                              className='w-full p-2 bg-[#00000061] rounded outline-none'
                            />
                          </div>
                          <div>
                            <label className='block text-sm font-medium mb-1'>
                              Destination
                            </label>
                            <input
                              type='text'
                              value={editMenuItemData.destination || ''}
                              onChange={(e) =>
                                setEditMenuItemData((prev) => ({
                                  ...prev,
                                  destination: e.target.value,
                                }))
                              }
                              className='w-full p-2 bg-[#00000061] rounded outline-none'
                            />
                          </div>
                          <div>
                            <label className='block text-sm font-medium mb-1'>
                              Link Type
                            </label>
                            <select
                              value={editMenuItemData.linkType || 'route'}
                              onChange={(e) =>
                                setEditMenuItemData((prev) => ({
                                  ...prev,
                                  linkType: e.target.value,
                                }))
                              }
                              className='w-full p-2 bg-[#00000061] rounded outline-none'
                            >
                              <option value='route'>Route</option>
                              <option value='url'>URL</option>
                              <option value='modal'>Modal</option>
                            </select>
                          </div>
                          <div>
                            <label className='block text-sm font-medium mb-1'>
                              Visibility
                            </label>
                            <select
                              value={
                                editMenuItemData.visibilityRole || 'everyone'
                              }
                              onChange={(e) =>
                                setEditMenuItemData((prev) => ({
                                  ...prev,
                                  visibilityRole: e.target.value,
                                }))
                              }
                              className='w-full p-2 bg-[#00000061] rounded outline-none'
                            >
                              <option value='everyone'>Everyone</option>
                              <option value='loggedIn'>Logged In</option>
                              <option value='admin'>Admin</option>
                            </select>
                          </div>
                          <div>
                            <label className='block text-sm font-medium mb-1'>
                              Position
                            </label>
                            <input
                              type='number'
                              value={editMenuItemData.sortOrder || 0}
                              onChange={(e) =>
                                setEditMenuItemData((prev) => ({
                                  ...prev,
                                  sortOrder: e.target.value,
                                }))
                              }
                              className='w-full p-2 bg-[#00000061] rounded outline-none'
                            />
                          </div>
                          <div className='col-span-2'>
                            <div className='flex gap-2'>
                              <button
                                type='button'
                                onClick={handleSaveMenuItem}
                                className='flex items-center bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors'
                              >
                                <Save className='w-4 h-4 mr-1' />
                                Save
                              </button>
                              <button
                                type='button'
                                onClick={handleCancelEditMenuItem}
                                className='flex items-center bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm transition-colors'
                              >
                                <X className='w-4 h-4 mr-1' />
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <div className='flex justify-between items-center'>
                          <div>
                            <p className='font-medium'>
                              <span className='text-purple-300'>Label:</span>{' '}
                              {item.label}
                            </p>
                            <p className='text-sm text-gray-300'>
                              <span className='text-purple-300'>
                                Destination:
                              </span>{' '}
                              {item.destination}
                            </p>
                            <p className='text-sm text-gray-300'>
                              <span className='text-purple-300'>Type:</span>{' '}
                              {item.linkType} |
                              <span className='text-purple-300'>
                                Visibility:
                              </span>{' '}
                              {item.visibilityRole} |
                              <span className='text-purple-300'>Position:</span>{' '}
                              {item.sortOrder}
                            </p>
                          </div>
                          <div className='flex gap-2'>
                            <button
                              type='button'
                              onClick={() => handleEditMenuItem(idx)}
                              className='flex items-center text-blue-400 hover:text-blue-300'
                            >
                              <Edit2 className='w-4 h-4 mr-1' />
                              Edit
                            </button>
                            <button
                              type='button'
                              onClick={() => handleDeleteMenuItem(idx)}
                              className='flex items-center text-red-400 hover:text-red-300'
                            >
                              <Trash2 className='w-4 h-4 mr-1' />
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add new menu item form */}
            <div className='space-y-3'>
              <h4 className='text-md font-medium'>Add New Menu Item</h4>
              <div className='grid grid-cols-2 gap-2'>
                <input
                  placeholder='Label'
                  value={newMenuItem.label}
                  onChange={(e) =>
                    setNewMenuItem((prev) => ({
                      ...prev,
                      label: e.target.value,
                    }))
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
                <input
                  type='number'
                  placeholder='Position'
                  value={newMenuItem.sortOrder}
                  onChange={(e) =>
                    setNewMenuItem((prev) => ({
                      ...prev,
                      sortOrder: e.target.value,
                    }))
                  }
                  className='p-2 bg-[#00000061] rounded outline-none'
                />
              </div>
              <button
                type='button'
                onClick={handleAddMenuItem}
                className='bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors'
              >
                Add Menu Item
              </button>
            </div>
          </div>

          <div className='text-center flex space-x-3 justify-center'>
            {/* {existingId && (
              <button
                type='button'
                className='border border-gray-400 text-gray-200 px-4 py-2 rounded font-semibold hover:bg-gray-700 hover:border-gray-500 transition-colors'
                onClick={handleDelete}
              >
                Delete
              </button>
            )} */}
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

export default HomeSettingsForm
