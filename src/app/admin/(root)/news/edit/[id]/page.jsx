'use client'
import React, { use, useEffect, useState } from 'react'
import axios from 'axios'
import Loader from '../../../../../_components/Loader'
import { API_BASE_URL, apiConstants } from '../../../../../../constants'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash } from 'lucide-react'
import { enqueueSnackbar } from 'notistack'

export default function EditNewsPage({ params }) {
  const { id } = use(params)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [newsDetails, setNewsDetails] = useState({
    title: '',
    publishDate: '',
    category: '',
    content: '',
    videoLink: '',
    isPublished: false,
    imageUrl: '',
  })
  const [imagePreview, setImagePreview] = useState(null)

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  const fetchNewsDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/news/${id}`)
      const data = response.data.data
      setNewsDetails({
        title: data.title || '',
        publishDate: data.publishDate?.split('T')[0] || '',
        category: data.category?._id || '',
        content: data.content || '',
        videoLink: data.videoUrl || '',
        isPublished: data.isPublished || false,
        imageUrl: data.imageUrl || '',
      })
      setImagePreview(
        new URL(data.imageUrl, process.env.NEXT_PUBLIC_BASE_URL).toString() ||
          null
      )
    } catch (err) {
      console.error('Error fetching news:', err)
      setError('Failed to load news data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNewsDetails()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setNewsDetails((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImagePreview(URL.createObjectURL(file))
      setNewsDetails((prev) => ({ ...prev, image: file }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const formPayload = new FormData()
      formPayload.append('title', newsDetails.title)
      formPayload.append('category', newsDetails.category)
      formPayload.append('content', newsDetails.content)
      formPayload.append('videoUrl', newsDetails.videoLink)
      formPayload.append('publishDate', newsDetails.publishDate)
      formPayload.append('isPublished', newsDetails.isPublished)

      if (newsDetails.image) {
        formPayload.append('image', newsDetails.image)
      }

      const res = await axios.put(`${API_BASE_URL}/news/${id}`, formPayload)
      if (res.status == apiConstants.success) {
        enqueueSnackbar(res.data.message, { variant: 'success' })
        fetchNewsDetails()
      }
    } catch (err) {
      console.error('Error updating news:', err)
      setError('Failed to update news.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className='text-white p-8 flex justify-center relative overflow-hidden'>
      <div
        className='absolute -left-10 top-1/2 transform -translate-y-1/2 w-60 h-96 rounded-full opacity-70 blur-xl'
        style={{
          background:
            'linear-gradient(317.9deg, #6F113E 13.43%, rgba(111, 17, 62, 0) 93.61%)',
        }}
      ></div>
      <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
        <form onSubmit={handleSubmit}>
          <div className='flex items-center gap-4 mb-6'>
            <Link href='/admin/news'>
              <button type='button' className='mr-2 text-white'>
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
            </Link>
            <h1 className='text-2xl font-bold'>Edit News Post</h1>
          </div>

          {error && <p className='text-red-500 mb-4'>{error}</p>}

          {/* Image Display */}
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
                    setNewsDetails((prev) => ({ ...prev, imageUrl: null }))
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

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <div className='col-span-2 bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>Title</label>
              <input
                type='text'
                name='title'
                value={newsDetails.title}
                onChange={handleChange}
                className='w-full bg-transparent text-white outline-none'
              />
            </div>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Publish Date
              </label>
              <input
                type='date'
                name='publishDate'
                value={newsDetails.publishDate}
                onChange={handleChange}
                className='w-full bg-transparent text-white outline-none'
              />
            </div>
          </div>

          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Category<span className='text-red-500'>*</span>
            </label>
            <select
              name='category'
              value={newsDetails.category}
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

          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>Content</label>
            <textarea
              name='content'
              value={newsDetails.content}
              onChange={handleChange}
              rows='6'
              className='w-full bg-transparent text-white outline-none resize-none'
            />
          </div>

          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Video Embed Link
            </label>
            <input
              type='text'
              name='videoLink'
              value={newsDetails.videoLink}
              onChange={handleChange}
              className='w-full bg-transparent text-white outline-none'
            />
          </div>

          <div className='bg-[#00000061] p-2 rounded mb-6'>
            <label className='block text-sm font-medium mb-1'>Status</label>
            <select
              name='isPublished'
              value={newsDetails.isPublished}
              onChange={(e) =>
                setFormData({ ...newsDetails, isPublished: e.target.value })
              }
              className='w-full bg-transparent text-white outline-none'
            >
              <option value={true}>Published</option>
              <option value={false}>Draft</option>
            </select>
          </div>

          <div className='flex justify-center gap-4 mt-6'>
            <button
              type='submit'
              className='bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded transition duration-200'
              disabled={submitting}
            >
              Save
            </button>
            <Link href='/admin/news'>
              <button
                type='button'
                className='bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded transition duration-200'
              >
                Cancel
              </button>
            </Link>{' '}
          </div>
        </form>
      </div>
    </div>
  )
}
