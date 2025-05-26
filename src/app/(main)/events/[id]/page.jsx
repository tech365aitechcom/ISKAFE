'use client'
import React, { use, useEffect, useState } from 'react'
import { API_BASE_URL } from '../../../../constants/index'
import axios from 'axios'
import moment from 'moment'
import FightCard from './_components/FightCard'
import Loader from '../../../_components/Loader'
import RegistrationSection from './_components/RegistrationSection'

const page = ({ params }) => {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState('Details')
  const tabNames = [
    'Details',
    'Registration',
    'Tournaments',
    'Fight Card',
    'Sanctioning Body',
    'Rules',
  ]
  const [isLoading, setIsLoading] = useState(false)
  const [eventDetails, setEventDetails] = useState(null)

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/events/find-by-id/${id}`
      )
      console.log('Event Details:', response)

      setEventDetails(response.data.data)
    } catch (error) {
      console.error('Error fetching event details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEventDetails()
  }, [id])

  const fighters = [
    {
      name: 'Eric Franks',
      location: 'Palmdale, CA, USA',
      record: '1-0-0',
      image: '/fighter1.png',
    },
    {
      name: 'Skyler Williams',
      location: 'Macon, CA, USA',
      record: '0-1-0, Sparring: 1 Bout',
      image: '/fighter2.png',
    },
  ]

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader />
      </div>
    )
  }

  return (
    <div className='bg-[#0f0217] min-h-screen p-8 text-white'>
      <div className='max-w-6xl mx-auto  p-6 rounded-lg shadow-lg'>
        <h1 className='text-4xl font-bold mb-4'>{eventDetails?.title}</h1>
        <div className='w-full bg-transparent border-b border-red-100 mb-10'>
          <div className='flex'>
            {tabNames.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
              px-4 py-2 text-lg font-medium tracking-wider uppercase
              border-b-2 transition-all duration-300 ease-in-out
              ${
                activeTab === tab
                  ? 'text-yellow-500 border-yellow-500'
                  : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600'
              }
            `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        {activeTab === 'Details' ? (
          <div className='flex space-x-8 bg-[#1b0c2e] p-4'>
            <div className='w-1/2'>
              <img
                src='/promo.png'
                alt='Battle for LA Poster'
                className='shadow-lg w-full h-auto'
              />
            </div>
            <div className='flex flex-col justify-between'>
              <div className='w-1/2'>
                <div className='mb-4'>
                  <p className='text-gray-400 text-base'>Event Starts</p>
                  <p className='text-2xl font-bold'>
                    {moment(eventDetails?.startDate).format('MMM DD, h:mm A')}
                  </p>
                </div>
                <div className='mb-4'>
                  <p className='text-gray-400 text-base'>Location</p>
                  <p className='font-semibold text-xl'>
                    {eventDetails?.venueName},{eventDetails?.location}
                  </p>
                </div>
                <div className='mb-4'>
                  <p className='text-gray-400 text-base'>Register Till</p>
                  <p className='font-bold text-xl'>
                    {moment(eventDetails?.registrationClose).format('MMM DD')}
                  </p>
                </div>
              </div>
              <div className='mt-6'>
                <button className='bg-yellow-500 text-black px-6 py-2 font-semibold uppercase text-xl'>
                  Full Rules Muay Thai/Kickboxing - Sanctioned by IKF
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'Teams' ? (
          <>teams</>
        ) : activeTab === 'Registration' ? (
          <RegistrationSection />
        ) : (
          activeTab === 'Fight Card' && <FightCard fighters={fighters} />
        )}
      </div>
    </div>
  )
}

export default page
