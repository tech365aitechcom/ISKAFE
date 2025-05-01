'use client'
import axios from 'axios'
import { API_BASE_URL, apiConstants } from '../../../../../constants/index'
import { Trash } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import useUserStore from '../../../../../stores/userStore'
import { enqueueSnackbar } from 'notistack'

export const AddNewsForm = () => {
  const user = useUserStore((state) => state.user)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    image: null,
    videoLink: '',
    publishDate: '',
  })
  const [imagePreview, setImagePreview] = useState(null)

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  console.log('Form Data:', formData)

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/news-category`)
      console.log('Response:', response.data)
      setCategories(response.data.data)
    } catch (error) {
      console.log('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImagePreview(URL.createObjectURL(file))
      setFormData((prev) => ({ ...prev, image: file }))
    }
  }

  const handleSubmit = async (e, isPublished) => {
    try {
      e.preventDefault()
      console.log(isPublished, 'isPublished')

      const formPayload = new FormData()
      formPayload.append('title', formData.title)
      formPayload.append('category', formData.category)
      formPayload.append('content', formData.content)
      formPayload.append('videoUrl', formData.videoLink)
      formPayload.append('publishDate', formData.publishDate)
      formPayload.append('createdBy', user?.id)
      formPayload.append('isPublished', JSON.stringify(isPublished))

      if (formData.image) {
        formPayload.append('image', formData.image) // must be a File or Blob object
      }

      console.log('Form submitted:', Object.fromEntries(formPayload.entries()))

      const response = await axios.post(`${API_BASE_URL}/news`, formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('Response:', response)
      if (response.status === apiConstants.create) {
        enqueueSnackbar(response.data.message, {
          variant: 'success',
        })
        setFormData({
          title: '',
          category: '',
          content: '',
          image: null,
          videoLink: '',
          publishDate: '',
        })
        setImagePreview(null)
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
    <div className='min-h-screen text-white bg-dark-blue-900'>
      <div className='w-full'>
        <div className='flex items-center gap-4 mb-6'>
          <button className='mr-2 text-white cursor-pointer'>
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

        <form>
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
                    setFormData((prev) => ({ ...prev, image: null }))
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
                  <span className='text-[#FEF200] mr-1'>Click to upload</span>
                  or drag and drop
                  <br />
                  SVG, PNG, JPG or GIF (max. 800x400)
                </p>
              </label>
            )}
          </div>

          <h2 className='font-bold mb-4 uppercase text-sm'>Details</h2>
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
            >
              <option value='' className='text-black'>
                Select category
              </option>
              {categories.map((category) => (
                <option
                  key={category._id}
                  value={category._id}
                  className='text-black'
                >
                  {category.name}
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
            />
          </div>

          {/* Video Embed Link */}
          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Video Embed Link
            </label>
            <input
              type='text'
              name='videoLink'
              value={formData.videoLink}
              onChange={handleChange}
              className='w-full outline-none'
              placeholder='https://youtube.com/embed/...'
            />
          </div>

          {/* Action Buttons */}
          <div className='flex justify-center gap-4'>
            <button
              type='submit'
              onClick={(e) => handleSubmit(e, true)}
              className='text-white font-medium py-2 px-6 rounded cursor-pointer'
              style={{
                background:
                  'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
            >
              Publish
            </button>
            <button
              type='button'
              onClick={(e) => handleSubmit(e, false)}
              className='text-white font-medium py-2 px-6 border border-[#7F25FB] rounded cursor-pointer'
            >
              Save Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
