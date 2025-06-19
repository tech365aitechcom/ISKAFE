'use client'
import React, { use, useEffect, useState } from 'react'
import axios from 'axios'
import Loader from '../../../../../_components/Loader'
import { API_BASE_URL, apiConstants } from '../../../../../../constants'
import Link from 'next/link'
import { Trash } from 'lucide-react'
import { enqueueSnackbar } from 'notistack'
import useStore from '../../../../../../stores/useStore'
import { uploadToS3 } from '../../../../../../utils/uploadToS3'

export default function EditNewsPage({ params }) {
  const { id } = use(params)
  const { user, newsCategories } = useStore()

  const [loading, setLoading] = useState(true)
  const [newsDetails, setNewsDetails] = useState({
    title: '',
    category: '',
    content: '',
    videoEmbedLink: '',
    publishDate: '',
    status: 'Draft',
    coverImage: '',
  })
  const [imagePreview, setImagePreview] = useState(null)

  const [submitting, setSubmitting] = useState(false)

  const fetchNewsDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/news/${id}`)
      const data = response.data.data
      setNewsDetails({
        title: data.title || '',
        publishDate: data.publishDate?.split('T')[0] || '',
        category: data.category || '',
        content: data.content || '',
        videoEmbedLink: data.videoEmbedLink || '',
        status: data.status || 'Draft',
        coverImage: data.coverImage || '',
      })
      setImagePreview(
        new URL(data.coverImage, process.env.NEXT_PUBLIC_BASE_URL).toString() ||
          null
      )
    } catch (err) {
      console.error('Error fetching news:', err)
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
      setNewsDetails((prev) => ({ ...prev, coverImage: file }))
    }
  }

  console.log('News Details:', newsDetails)
  const validateForm = () => {
    const errors = {}

    if (!newsDetails.title.trim()) {
      errors.title = 'Title is required.'
    } else if (!/^[a-zA-Z0-9\s\-'"&]+$/.test(newsDetails.title)) {
      errors.title = 'Title contains invalid characters.'
    }

    if (!newsDetails.category) {
      errors.category = 'Category is required.'
    }

    if (!newsDetails.content.trim()) {
      errors.content = 'Content is required.'
    } else if (newsDetails.content.trim().length < 10) {
      errors.content = 'Content must be at least 10 characters.'
    }

    if (
      newsDetails.videoEmbedLink &&
      !/^https:\/\/(www\.)?youtube\.com\/embed\/.+/.test(
        newsDetails.videoEmbedLink
      )
    ) {
      errors.videoEmbedLink = 'Invalid YouTube embed link.'
    }

    if (!newsDetails.publishDate) {
      errors.publishDate = 'Publish date is required.'
    }

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
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
      if (
        newsDetails.coverImage &&
        typeof newsDetails.coverImage !== 'string'
      ) {
        try {
          const s3UploadedUrl = await uploadToS3(newsDetails.coverImage)
          newsDetails.coverImage = s3UploadedUrl
        } catch (error) {
          console.log('Image upload failed:', error)
          return
        }
      }
      console.log('Submitting news details:', newsDetails)

      const res = await axios.put(`${API_BASE_URL}/news/${id}`, newsDetails, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      if (res.status == apiConstants.success) {
        enqueueSnackbar(res.data.message, { variant: 'success' })
        fetchNewsDetails()
      }
    } catch (err) {
      console.log('Error updating news:', err)
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
        <div className='flex items-center gap-4 mb-6'>
          <Link href='/admin/news'>
            <button className='mr-2 text-white'>
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
          <h1 className='text-2xl font-bold'>News Editor</h1>
        </div>
        <form onSubmit={handleSubmit}>
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
                    setNewsDetails((prev) => ({ ...prev, coverImage: null }))
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
                  <span className='text-[#FEF200] mr-1'>
                    Click to upload<span className='text-red-500'>*</span>
                  </span>
                  or drag and drop
                  <br />
                  SVG, PNG, JPG or GIF (max. 800x400)
                </p>
              </label>
            )}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <div className='col-span-2 bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Title<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='title'
                value={newsDetails.title}
                onChange={handleChange}
                className='w-full bg-transparent text-white outline-none'
                required
                disabled={submitting}
              />
            </div>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Publish Date<span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                name='publishDate'
                value={newsDetails.publishDate}
                onChange={handleChange}
                className='w-full bg-transparent text-white outline-none'
                required
                disabled={submitting}
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

          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Content<span className='text-red-500'>*</span>
            </label>
            <textarea
              name='content'
              value={newsDetails.content}
              onChange={handleChange}
              rows='6'
              className='w-full bg-transparent text-white outline-none resize-none'
              required
              disabled={submitting}
            />
          </div>

          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Video Embed Link
            </label>
            <input
              type='text'
              name='videoEmbedLink'
              value={newsDetails.videoEmbedLink}
              onChange={handleChange}
              className='w-full bg-transparent text-white outline-none'
              disabled={submitting}
            />
          </div>

          <div className='bg-[#00000061] p-2 rounded mb-6'>
            <label className='block text-sm font-medium mb-1'>
              Status<span className='text-red-500'>*</span>
            </label>
            <select
              name='status'
              value={newsDetails.status}
              onChange={handleChange}
              className='w-full bg-transparent text-white outline-none'
            >
              <option value='Draft' className='text-black'>
                Draft
              </option>
              <option value='Published' className='text-black'>
                Published
              </option>
            </select>
          </div>

          <div className='flex justify-center gap-4 mt-6'>
            <button
              type='submit'
              className='bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded transition duration-200'
              disabled={submitting}
            >
              {submitting ? <Loader /> : 'Save Changes'}
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
