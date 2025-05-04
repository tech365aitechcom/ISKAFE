'use client'

import axios from 'axios'
import {
  ChevronLeft,
  Facebook,
  Twitter,
  Instagram,
  Link as LinkIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { use, useEffect, useState } from 'react'
import { API_BASE_URL } from '../../../../constants/index'
import Loader from '../../../_components/Loader'

const NewsDetailsPage = ({ params }) => {
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [newsDetails, setNewsDetails] = useState(null)

  useEffect(() => {
    const fetchNewsDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/news/${id}`)
        console.log('News Details:', response.data.data)

        setNewsDetails(response.data.data)
      } catch (error) {
        console.error('Error fetching news details:', error)
        console.log('Error fetching news details:', error)
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

  if (loading) {
    return <Loader />
  }

  return (
    <div className='bg-[#28133A80] p-4 max-w-7xl mx-auto flex flex-col md:flex-row gap-4 my-6'>
      <div className='w-full md:w-[50%] h-fit'>
        <div className='relative w-full h-[500px]'>
          <Image
            src={imageSrc}
            alt='News Image'
            fill
            sizes='(max-width: 768px) 100vw, 50vw'
            className='object-cover rounded'
          />
        </div>

        <div className='bg-[#050310B2] opacity-75 p-4'>
          <h3 className='text-white text-xl font-bold'>
            <span className='text-[#BDBDBD]'>Written By: </span>
            {newsDetails.createdBy?.fullName}
          </h3>
          <h3 className='text-white text-xl font-bold'>
            <span className='text-[#BDBDBD]'>Posted On: </span>
            {newsDetails.publishDate}
          </h3>
        </div>
      </div>

      <div className='text-white w-full'>
        <Link href={'/news'} className='flex items-center mb-4'>
          <ChevronLeft size={24} />
          Back
        </Link>
        <h1 className='text-2xl md:text-5xl font-bold uppercase'>
          {newsDetails.title}
        </h1>

        {/* Share Icons */}
        <div className='flex gap-4 mt-4 mb-6'>
          <Facebook className='cursor-pointer hover:text-blue-500 transition-colors' />
          <Twitter className='cursor-pointer hover:text-sky-400 transition-colors' />
          <Instagram className='cursor-pointer hover:text-pink-500 transition-colors' />
          <LinkIcon className='cursor-pointer hover:text-gray-300 transition-colors' />
        </div>

        <p className='leading-6 mt-2'>{newsDetails.content}</p>
      </div>
    </div>
  )
}

export default NewsDetailsPage
