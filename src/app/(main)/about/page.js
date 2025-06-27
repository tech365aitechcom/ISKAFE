'use client'
import { Facebook, Instagram, Phone, Twitter } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../../constants'
import axios from 'axios'
import Link from 'next/link'
import Loader from '../../_components/Loader'

const AboutPage = () => {
  const [about, setAbout] = useState(null)
  const [loading, setLoading] = useState(true)

  const getAboutDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/about-us`)
      setAbout(response.data.data)
    } catch (error) {
      console.error('Error fetching about details:', error)
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
    <div className='bg-[#28133A] md:bg-[#28133A80] min-h-screen w-full px-4 py-12 md:px-10 flex justify-center'>
      <div className='w-full max-w-6xl'>
        {/* Logo */}
        <div className='flex justify-center mb-8'>
          <Image
            src={about?.coverImage}
            alt={about?.pageTitle}
            width={300}
            height={300}
            className='object-cover'
          />
        </div>

        {/* Main Info */}
        <div className='text-white text-center space-y-10'>
          <h1 className='text-3xl md:text-5xl font-bold'>{about?.pageTitle}</h1>
          <p className='text-xl font-medium'>{about?.missionStatement}</p>
          <p className='text-lg'>{about?.organizationHistory}</p>
        </div>

        {/* Leadership Section */}
        <div className='my-12 text-center'>
          <h2 className='text-3xl font-bold mb-2 text-white'>
            Leadership Team
          </h2>
          <p className='text-lg opacity-80 mb-6 text-white'>
            Meet the officials who guide our federation
          </p>
          <div className='flex justify-center flex-wrap gap-6'>
            {about?.leadershipTeam.map((member, index) => (
              <div key={index} className='rounded-lg text-center'>
                <div className='w-32 h-32 object-cover rounded-full border-4 border-purple-500 mx-auto p-4'>
                  <img
                    src={member.profilePic}
                    alt={member.name}
                    className='w-full h-full object-cover'
                  />
                </div>
                <h3 className='text-xl font-bold mt-2 text-white'>
                  {member.name}
                </h3>
                <p className='text-white opacity-80'>{member.position}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Button */}
        <div className='text-center my-8'>
          <Link href="contact-us"passHref>
    <button className='inline-flex items-center justify-center border border-white rounded px-6 py-2 text-white'>
      <Phone className='mr-2 w-5 h-5' />
      Contact Us
    </button>
  </Link>

          {/* Social Links */}
          <div className='flex justify-center gap-4 mt-4'>
            <Link href={about?.facebookURL || ''} target='_blank'>
              <Facebook color='white' />
            </Link>
            <Link href={about?.instagramURL || ''} target='_blank'>
              <Instagram color='white' />
            </Link>
            <Link href={about?.twitterURL || ''} target='_blank'>
              <Twitter color='white' />
            </Link>
          </div>
        </div>

        {/* Footer Links */}
      <div className='flex flex-col items-center py-8 gap-4'>
  <a
    href={about?.copyrightNoticePDF || '#'}
    target='_blank'
    rel='noopener noreferrer'
    className='text-white text-lg md:text-2xl font-bold inline-block'
  >
    COPYRIGHT ©2025 COMPETITION TECHNOLOGY
  </a>
  <a
    href={about?.privacyPolicyPDF || '#'}
    target='_blank'
    rel='noopener noreferrer'
    className='text-white text-xl md:text-2xl font-bold hover:text-gray-300 inline-block'
  >
    PRIVACY POLICY
  </a>
  <a
    href={about?.termsConditionsPDF || '#'}
    target='_blank'
    rel='noopener noreferrer'
    className='text-white text-xl md:text-2xl font-bold hover:text-gray-300 inline-block'
  >
    TERMS AND CONDITIONS
  </a>
</div>

        {/* Platform Version */}
        <div className='text-center pb-8'>
          <h3 className='font-bold text-2xl text-white'>Platform Version</h3>
          <p className='text-white text-lg md:text-2xl font-bold'>
            {about?.platformVersion}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
