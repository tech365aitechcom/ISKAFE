'use client'
import { Mail, MapPin, PhoneCall } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import ContactForm from './_components/ContactForm'
import { API_BASE_URL } from '../../../constants'
import axios from 'axios'
import Loader from '../../_components/Loader'

const ContactUs = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const getContactSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/contactUs-settings`)
      console.log('Response:', response.data)

      setData(response.data.data)
    } catch (error) {
      console.log('Error fetching about details:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getContactSettings()
  }, [])

  if (loading) {
    return <Loader />
  }

  return (
    <div className='bg-[#160B25] container p-2 mx-auto mb-32 flex flex-col md:flex-row justify-between'>
      <div className='bg-[#24195D] text-white w-full md:w-[40%] px-8 py-8 pb-12 rounded-tl-lg rounded-bl-lg'>
        <h1 className='font-semibold text-3xl'>Contact Information</h1>
        <p className='text-[#C9C9C9] text-lg font-normal'>
          We&apos;re here to help
        </p>
        <div className='flex flex-col gap-8 mt-28'>
          <div className='flex gap-2'>
            <PhoneCall className='mt-1' />
            <h3 className='text-xl font-normal'>{data?.phone}</h3>
          </div>
          <div className='flex gap-2'>
            <Mail className='mt-1' />
            <h3 className='text-xl font-normal'>{data?.email}</h3>
          </div>
          <div className='flex gap-2'>
            <MapPin className='mt-1' />
            <h3 className='text-xl font-normal'>{data?.address}</h3>
          </div>
        </div>
        <div className='w-full h-[300px] mt-8 rounded-lg overflow-hidden'>
          <iframe
            src={decodeURIComponent(data?.googleMapEmbedUrl?.trim())}
            width='100%'
            height='100%'
            allowFullScreen=''
            loading='lazy'
            referrerPolicy='no-referrer-when-downgrade'
            className='border-0 w-full h-full'
          ></iframe>
        </div>
      </div>
      <ContactForm topics={data?.topics} />
    </div>
  )
}

export default ContactUs
