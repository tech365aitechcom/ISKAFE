'use client'
import { Check, Facebook, Instagram, Youtube } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../../constants'
import axios from 'axios'
import Link from 'next/link'
import Loader from '../../_components/Loader'

const points = [
  'Event scheduling',
  'Database of fighters, trainers, coaches, teams, camps, officials, venues, commissions, and more',
  'Head-to-head fight cards',
  'Single-elimination tournaments',
  'Results (decisions, stoppages, DQs, etc)',
  'Fighter profiles with fight history and results',
  'Fighter suspensions',
  'Single-elimination tournaments',
]

const AboutPage = () => {
  const [about, setAbout] = useState(null)
  const [loading, setLoading] = useState(true)

  const getAboutDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/about-us`)
      console.log('Response:', response.data)

      setAbout(response.data.data)
    } catch (error) {
      console.log('Error fetching about details:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAboutDetails()
  }, [])

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader />
      </div>
    )
  }

  return (
    <div className='bg-[#28133A] md:bg-[#28133A80] container mx-auto md:p-10 md:px-14 mb-44 p-4 pb-12 rounded-lg flex flex-col items-center justify-center'>
      <div>
        <Image
          src='/ifs-logo.png'
          alt=''
          width={300}
          height={300}
          className='hidden md:block object-cover'
        />
        <Image
          src='/ifs-logo.png'
          alt=''
          width={500}
          height={300}
          className='md:hidden object-cover'
        />
      </div>
      <div className='text-white flex flex-col md:flex-row justify-between items-center mt-6 w-full'>
        <div>
          <h1 className='text-3xl md:text-5xl font-bold'>{about?.pageTitle}</h1>
          <p className='text-xl font-medium mt-4'>{about?.missionStatement}</p>
          <div className='mt-8'>
            <p className='text-xl font-medium'>{about?.organizationHistory}</p>
            {/* <ul className='list-none flex flex-col gap-2 mt-4'>
              {points.map((point, index) => (
                <li key={index} className='text-lg font-medium flex gap-2'>
                  <Check
                    size={20}
                    color='#4E2D92'
                    fontWeight={700}
                    className='mt-1'
                  />
                  {point}
                </li>
              ))}
            </ul> */}
          </div>
          <div className='my-8'>
            <h2 className='text-3xl font-bold text-white mb-2'>
              Leadership Team
            </h2>
            <p className='text-lg text-white opacity-80'>
              Meet the officials who guide our federation
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            {about?.leadershipTeam.map((member, index) => (
              <div
                key={index}
                className=' bg-opacity-10 rounded-lg p-6 flex flex-col items-center'
              >
                <div className='w-24 h-24 rounded-full overflow-hidden mb-4'>
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className='w-full h-full object-cover bg-white'
                  />
                </div>
                <h3 className='text-xl font-bold text-white'>{member.name}</h3>
                <p className='text-white opacity-80'>{member.title}</p>
              </div>
            ))}
          </div>
          <Link href={about?.contactLink || ''}>
            <button className='border border-white rounded-lg px-4 py-2 mt-8'>
              Contact Us
            </button>
          </Link>
          <div className='pt-8'>
            <h2 className='font-bold text-2xl'>Social</h2>
            <div className='flex gap-4 mt-2'>
              <Link href={about?.socialLinks?.facebook || ''} target='_blank'>
                <Facebook />
              </Link>
              <Link href={about?.socialLinks?.instagram || ''} target='_blank'>
                <Instagram />
              </Link>
              <Link href={about?.socialLinks?.youtube || ''} target='_blank'>
                <Youtube />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
