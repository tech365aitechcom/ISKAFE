'use client'
import axios from 'axios'
import { API_BASE_URL, apiConstants } from '../../../../../constants'
import { Trash } from 'lucide-react'
import React, { useState } from 'react'
import useStore from '../../../../../stores/useStore'
import { enqueueSnackbar } from 'notistack'
import { uploadToS3 } from '../../../../../utils/uploadToS3'
import Loader from '../../../../_components/Loader'

export const AddNewsForm = ({ setShowAddNewsForm }) => {
  const user = useStore((state) => state.user)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    videoEmbedLink: '',
    publishDate: '',
    status: 'Draft',
    isDeleted: false,
  })
  const [image, setImage] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  const { newsCategories } = useStore()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImagePreview(URL.createObjectURL(file))
      setImage(file)
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.title.trim()) {
      errors.title = 'Title is required.'
    } else if (!/^[a-zA-Z0-9\s\-'"&]+$/.test(formData.title)) {
      errors.title = 'Title contains invalid characters.'
    }

    if (!formData.category) {
      errors.category = 'Category is required.'
    }

    if (!formData.content.trim()) {
      errors.content = 'Content is required.'
    } else if (formData.content.trim().length < 10) {
      errors.content = 'Content must be at least 10 characters.'
    }

    if (
      formData.videoEmbedLink &&
      !/^https:\/\/(www\.)?youtube\.com\/embed\/.+/.test(
        formData.videoEmbedLink
      )
    ) {
      errors.videoEmbedLink = 'Invalid YouTube embed link.'
    }

    if (!formData.publishDate) {
      errors.publishDate = 'Publish date is required.'
    }

    return errors
  }

  const handleSubmit = async (e) => {
    setSubmitting(true)
    e.preventDefault()

    const errors = validateForm()

    if (Object.keys(errors).length > 0) {
      // Show each error in Snackbar
      Object.values(errors).forEach((msg) => {
        enqueueSnackbar(msg, { variant: 'warning' })
      })
      setSubmitting(false)
      return
    }

    try {
      let s3UploadedUrl = null
      if (image !== null) {
        s3UploadedUrl = await uploadToS3(image)
      }

      const response = await axios.post(
        `${API_BASE_URL}/news`,
        { ...formData, coverImage: s3UploadedUrl },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      )

      if (response.status === apiConstants.create) {
        enqueueSnackbar(response.data.message, { variant: 'success' })
        handleCancel()
      }
    } catch (error) {
      console.log(error)
      enqueueSnackbar(
        error?.response?.data?.message || 'News cannot be created',
        {
          variant: 'error',
        }
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      title: '',
      category: '',
      content: '',
      videoEmbedLink: '',
      publishDate: '',
      status: 'Draft',
      isDeleted: false,
    })
    setImage(null)
    setShowAddNewsForm(false)
  }

  return (
    <div className='min-h-screen text-white bg-dark-blue-900'>
      <div className='w-full'>
        <div className='flex items-center gap-4 mb-6'>
          <button
            className='mr-2 text-white'
            onClick={() => setShowAddNewsForm(false)}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M10 19l-7-7m0 0l7-7m-7 7h18'
              />
            </svg>
          </button>
          <h1 className='text-2xl font-bold'>News Post Editor</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Image Upload */}
          <div className='mb-8'>
            {imagePreview ? (
              <div className='relative w-72 h-52 rounded-lg overflow-hidden border border-[#D9E2F930]'>
                <img
                  src={imagePreview}
                  alt='Selected'
                  className='w-full h-full object-cover'
                />
                <button
                  type='button'
                  onClick={() => {
                    setImagePreview(null)
                    setImage(null)
                  }}
                  className='absolute top-2 right-2 bg-[#14255D] p-1 rounded text-[#AEB9E1]'
                >
                  <Trash className='w-4 h-4' />
                </button>
              </div>
            ) : (
              <label
                htmlFor='image-upload'
                className='cursor-pointer border-2 border-dashed border-gray-500 rounded-lg flex flex-col items-center justify-center w-72 h-52 relative'
              >
                <input
                  id='image-upload'
                  type='file'
                  accept='image/*'
                  onChange={handleFileChange}
                  className='absolute inset-0 opacity-0 cursor-pointer z-50'
                  required
                  disabled={submitting}
                />
                <div className='bg-yellow-500 opacity-50 rounded-full p-2 mb-2 z-10'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                </div>
                <p className='text-sm text-[#AEB9E1] z-10 text-center'>
                  <span className='text-[#FEF200] mr-1'>
                    Click to upload <span className='text-red-500'>*</span>
                  </span>
                  or drag and drop
                  <br />
                  SVG, PNG, JPG or GIF (max. 800x400)
                </p>
              </label>
            )}
          </div>

          <h2 className='font-bold mb-4 uppercase text-sm'>Post Details</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            {/* Title */}
            <div className='col-span-2 bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Title<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='title'
                value={formData.title}
                onChange={handleChange}
                className='w-full outline-none'
                placeholder='News title here'
                required
                disabled={submitting}
              />
            </div>

            {/* Date */}
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Publish Date<span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                name='publishDate'
                value={formData.publishDate}
                onChange={handleChange}
                className='w-full outline-none'
                required
                disabled={submitting}
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Category<span className='text-red-500'>*</span>
            </label>
            <select
              name='category'
              value={formData.category}
              onChange={handleChange}
              className='w-full outline-none'
              required
              disabled={submitting}
            >
              <option value='' className='text-black'>
                Select category
              </option>
              {newsCategories.map((category) => (
                <option
                  key={category._id}
                  value={category.label}
                  className='text-black'
                >
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Main Content */}
          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Content<span className='text-red-500'>*</span>
            </label>
            <textarea
              name='content'
              value={formData.content}
              onChange={handleChange}
              rows='6'
              className='w-full outline-none resize-none'
              placeholder='Type your news content here...'
              required
              disabled={submitting}
            />
          </div>

          {/* Video Embed Link */}
          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Video Embed Link
            </label>
            <input
              type='text'
              name='videoEmbedLink'
              value={formData.videoEmbedLink}
              onChange={handleChange}
              className='w-full outline-none'
              placeholder='https://youtube.com/embed/...'
              disabled={submitting}
            />
          </div>

          <div className='bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Status<span className='text-red-500'>*</span>
            </label>
            <select
              name='status'
              value={formData.status}
              onChange={handleChange}
              className='w-full bg-transparent outline-none'
              required
              disabled={submitting}
            >
              <option value='Draft' className='text-black'>
                Draft
              </option>
              <option value='Published' className='text-black'>
                Published
              </option>
            </select>
          </div>
          {/* Action Buttons */}
          <div className='flex justify-center gap-4 mt-6'>
            <button
              type='submit'
              className='bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded transition duration-200'
              disabled={submitting}
            >
              {submitting ? <Loader /> : 'Save'}
            </button>
            <button
              type='button'
              onClick={handleCancel}
              className='bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded transition duration-200'
              disabled={submitting}
            >
              Cancel
            </button>{' '}
          </div>
        </form>
      </div>
    </div>
  )
}
