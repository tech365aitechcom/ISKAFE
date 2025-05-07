'use client'
import React, { use, useEffect, useState } from 'react'
import axios from 'axios'
import Loader from '../../../../../_components/Loader'
import { API_BASE_URL } from '../../../../../../constants'
import Link from 'next/link'

export default function ViewNewsPage({ params }) {
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [newsDetails, setNewsDetails] = useState(null)

  useEffect(() => {
    const fetchNewsDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/news/${id}`)
        setNewsDetails(response.data.data)
      } catch (error) {
        console.error('Error fetching news details:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchNewsDetails()
  }, [id])

  const imageSrc =
    newsDetails?.imageUrl && process.env.NEXT_PUBLIC_BASE_URL
      ? new URL(
          newsDetails.imageUrl,
          process.env.NEXT_PUBLIC_BASE_URL
        ).toString()
      : null

  if (loading || !newsDetails) return <Loader />

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
        <div className='w-full'>
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
            <h1 className='text-2xl font-bold'>News Post Details</h1>
          </div>
          {/* Image Display */}
          <div className='mb-8'>
            {imageSrc ? (
              <div className='relative w-72 h-52 rounded-lg overflow-hidden border border-[#D9E2F930]'>
                <img
                  src={imageSrc}
                  alt='Selected'
                  className='w-full h-full object-cover'
                />
              </div>
            ) : (
              <p className='text-[#AEB9E1]'>No image uploaded.</p>
            )}
          </div>

          <h2 className='font-bold mb-4 uppercase text-sm'>Details</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <div className='col-span-2 bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>Title</label>
              <input
                type='text'
                value={newsDetails.title}
                readOnly
                className='w-full bg-transparent text-white outline-none'
              />
            </div>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Publish Date
              </label>
              <input
                type='date'
                value={newsDetails.publishDate?.split('T')[0]}
                readOnly
                className='w-full bg-transparent text-white outline-none'
              />
            </div>
          </div>

          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>Category</label>
            <input
              type='text'
              value={newsDetails.category?.name || 'N/A'}
              readOnly
              className='w-full bg-transparent text-white outline-none'
            />
          </div>

          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>Content</label>
            <textarea
              value={newsDetails.content}
              readOnly
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
              value={newsDetails.videoLink || ''}
              readOnly
              className='w-full bg-transparent text-white outline-none'
            />
          </div>

          <div className='bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>Status</label>
            <input
              type='text'
              value={newsDetails.isPublished ? 'Published' : 'Draft'}
              readOnly
              className='w-full bg-transparent text-white outline-none'
            />
          </div>
        </div>
      </div>
    </div>
  )
}
