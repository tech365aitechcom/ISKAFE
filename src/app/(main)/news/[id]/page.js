'use client'

import axios from 'axios'
import {
  ChevronLeft,
  Facebook,
  Twitter,
  Instagram,
  Link as LinkIcon,
  Play,
  Calendar,
  User,
  Phone,
  Linkedin,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState, use as usePromise } from 'react'
import { API_BASE_URL } from '../../../../constants/index'
import Loader from '../../../_components/Loader'
import moment from 'moment'
import { enqueueSnackbar } from 'notistack'

const NewsDetailsPage = ({ params }) => {
  const { id } = usePromise(params)
  const [loading, setLoading] = useState(true)
  const [newsDetails, setNewsDetails] = useState(null)
  const [pageUrl, setPageUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageUrl(window.location.href)
    }
  }, [])

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

  const handleShare = (platform) => {
    const title = encodeURIComponent(newsDetails.title)
    const url = encodeURIComponent(pageUrl)
    const message = encodeURIComponent(`${newsDetails.title} - ${pageUrl}`)

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`, // still public-style
      twitter: `https://twitter.com/intent/tweet?text=${message}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${message}`,
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pageUrl)
    enqueueSnackbar('Link copied to clipboard!', {
      variant: 'success',
    })
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className='bg-[#28133A80] min-h-screen'>
      <div className='max-w-7xl mx-auto px-4 py-6'>
        {/* Header with Back Button */}
        <div className='flex items-center mb-8'>
          <h2 className='text-white text-2xl md:text-4xl font-bold'>News</h2>
        </div>

        {/* Main Content Container */}
        <div className='bg-[#1A0B24] rounded-2xl shadow-2xl overflow-hidden'>
          {/* Hero Section */}
          <div className='relative'>
            {/* Featured Image */}
            <div className='relative w-full h-[300px] md:h-[400px] lg:h-[500px]'>
              <Image
                src={newsDetails.coverImage}
                alt='News Cover'
                fill
                sizes='100vw'
                className='object-cover'
                priority
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
            </div>

            {/* Title Overlay */}
            <div className='absolute bottom-0 left-0 right-0 p-6 md:p-8'>
              <h1 className='text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight'>
                {newsDetails.title}
              </h1>

              {/* Meta Information */}
              <div className='flex flex-wrap items-center gap-4 md:gap-6 text-gray-200'>
                <div className='flex items-center gap-2'>
                  <User size={16} />
                  <span className='text-sm md:text-base'>
                    {newsDetails.createdBy?.firstName}{' '}
                    {newsDetails.createdBy?.lastName}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Calendar size={16} />
                  <span className='text-sm md:text-base'>
                    {moment(newsDetails.createdAt).format('MMMM Do, YYYY')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className='p-6 md:p-8'>
            {/* Social Share Section */}
            <div className='flex items-center justify-between mb-8 pb-6 border-b border-gray-700'>
              <h3 className='text-white text-lg font-semibold'>
                Share this article
              </h3>
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => handleShare('facebook')}
                  className='p-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg'
                  aria-label='Share on Facebook'
                >
                  <Facebook size={20} className='text-white' />
                </button>

                <button
                  onClick={() => handleShare('twitter')}
                  className='p-3 bg-sky-500 hover:bg-sky-600 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg'
                  aria-label='Share on Twitter'
                >
                  <Twitter size={20} className='text-white' />
                </button>

                <button
                  onClick={() => handleShare('linkedin')}
                  className='p-3 bg-blue-800 hover:bg-blue-900 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg'
                  aria-label='Share on LinkedIn'
                >
                  <Linkedin size={20} className='text-white' />
                </button>

                <button
                  onClick={() => handleShare('whatsapp')}
                  className='p-3 bg-green-500 hover:bg-green-600 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg'
                  aria-label='Share on WhatsApp'
                >
                  <Phone size={20} className='text-white' />
                </button>

                <button
                  onClick={handleCopyLink}
                  className='p-3 bg-gray-600 hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg'
                  aria-label='Copy link'
                >
                  <LinkIcon size={20} className='text-white' />
                </button>
              </div>
            </div>

            {/* Video Section - Enhanced */}
            {newsDetails.videoEmbedLink && (
              <div className='mb-8'>
                <div className='flex items-center justify-between mb-6'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-lg'>
                      <Play size={20} className='text-white' />
                    </div>
                    <div>
                      <h3 className='text-white text-xl font-bold'>
                        Featured Video
                      </h3>
                      <p className='text-gray-400 text-sm'>
                        Watch the full story
                      </p>
                    </div>
                  </div>
                </div>

                <div className='relative group'>
                  {/* Video Container with Enhanced Styling */}
                  <div className='relative w-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 to-black'>
                    {/* Animated Border */}
                    <div className='absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 animate-pulse'></div>

                    {/* Video Frame */}
                    <div className='relative bg-black rounded-2xl overflow-hidden'>
                      {/* Video Aspect Ratio Container */}
                      <div className='aspect-video w-full relative'>
                        <iframe
                          src={newsDetails.videoEmbedLink}
                          title='News Video'
                          className='w-full h-full border-0 rounded-2xl'
                          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                          allowFullScreen
                        ></iframe>

                        {/* Loading Placeholder */}
                        <div className='absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center rounded-2xl -z-10'>
                          <div className='text-center'>
                            <div className='w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4 mx-auto'>
                              <Play size={24} className='text-white ml-1' />
                            </div>
                            <p className='text-gray-300 text-sm'>
                              Loading video...
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Video Overlay Controls */}
                    <div className='absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                      <div className='flex items-center gap-2'>
                        <button className='p-2 bg-black/70 backdrop-blur-sm rounded-full hover:bg-black/90 transition-colors'>
                          <svg
                            className='w-4 h-4 text-white'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path d='M15 10l-5.5 3.5V6.5L15 10z' />
                            <path
                              fillRule='evenodd'
                              d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Article Content */}
            <div className='prose prose-invert prose-lg max-w-none'>
              <div className='text-gray-200 leading-relaxed text-base md:text-lg whitespace-pre-line'>
                {newsDetails.content}
              </div>
            </div>

            {/* Bottom Meta Section */}
            <div className='mt-12 pt-8 border-t border-gray-700'>
              <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center'>
                    <User size={20} className='text-white' />
                  </div>
                  <div>
                    <p className='text-white font-semibold'>
                      {newsDetails.createdBy?.firstName}{' '}
                      {newsDetails.createdBy?.lastName}
                    </p>
                    <p className='text-gray-400 text-sm'>Author</p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-gray-400 text-sm'>Published</p>
                  <p className='text-white font-medium'>
                    {moment(newsDetails.createdAt).format('MMMM Do, YYYY')}
                  </p>
                </div>
              </div>
              <Link
                href='/news'
                className='flex items-center justify-center text-white hover:text-gray-300 transition-colors group w-full text-center mt-8'
              >
                <ChevronLeft size={20} className='mr-2' />
                Back to news
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsDetailsPage
