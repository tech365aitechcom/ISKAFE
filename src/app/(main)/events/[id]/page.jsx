'use client'
import React, { use, useEffect, useState } from 'react'
import { API_BASE_URL } from '../../../../constants/index'
import axios from 'axios'
import moment from 'moment'
import FightCard from './_components/FightCard'
import Loader from '../../../_components/Loader'
import RegistrationSection from './_components/RegistrationSection'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeftIcon } from 'lucide-react'

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
  const [loading, setLoading] = useState(false)
  const [eventDetails, setEventDetails] = useState(null)

  const fetchEventDetails = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/events/${id}`)
      console.log('Event Details:', response)
      setEventDetails(response.data.data)
    } catch (error) {
      console.error('Error fetching event details:', error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[#0f0217]'>
        <Loader />
      </div>
    )
  }

  return (
    <div className='bg-[#0f0217] min-h-screen text-white'>
      {/* Header */}
      <div className='border-b border-gray-800'>
        <div className='container mx-auto px-6 py-8'>
          <Link href={'/events'}>
            <button className='text-gray-400 hover:text-gray-300 mb-4 flex items-center text-lg'>
              <ArrowLeftIcon />
              Back to event list
            </button>
          </Link>
          <div className='flex flex-col md:flex-row items-start justify-between'>
            <div>
              <div className='flex items-center gap-3 mb-4'>
                <span className='bg-yellow-500 text-black px-3 py-1 text-xs font-bold uppercase rounded'>
                  {eventDetails?.format}
                </span>
                <span className='bg-gray-700 text-gray-300 px-3 py-1 text-xs font-semibold uppercase rounded'>
                  {eventDetails?.sportType}
                </span>
              </div>
              <h1 className='text-4xl font-bold mb-3 text-white leading-tight'>
                {eventDetails?.name}
              </h1>
              <p className='text-gray-400 text-lg max-w-2xl'>
                {eventDetails?.briefDescription}
              </p>
            </div>
            <div className='md:text-right flex md:flex-col items-center gap-4 md:gap-0'>
              <div className='text-3xl font-bold text-yellow-500 mb-1'>
                {moment(eventDetails?.startDate).format('MMM DD')}
              </div>
              <div className='text-sm text-gray-400'>
                {moment(eventDetails?.startDate).format('YYYY')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className='sticky top-0 bg-[#0f0217] z-50'>
        <div className='container mx-auto px-6 overflow-x-auto custom-scrollbar'>
          <nav className='flex space-x-8 whitespace-nowrap'>
            {tabNames.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-base md:text-lg font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'text-yellow-500 border-yellow-500'
                    : 'text-gray-400 border-transparent hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className='container mx-auto px-6 py-8'>
        {activeTab === 'Details' && (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Left Column - Poster */}
            <div className='lg:col-span-1'>
              <div className='bg-[#1b0c2e] rounded-lg p-6 mb-6'>
                <img
                  src={'/promo.png'}
                  alt='Event Poster'
                  className='w-full rounded-lg mb-6'
                />
                <RegistrationSection eventId={id} />
                {eventDetails?.externalURL && (
                  <a
                    href={eventDetails.externalURL}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 mt-2 px-4 rounded-lg text-center transition-colors'
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </div>

            {/* Right Column - Details */}
            <div className='lg:col-span-2 space-y-8'>
              {/* Event Schedule */}
              <div className='bg-[#1b0c2e] rounded-lg p-6'>
                <h2 className='text-xl font-bold text-yellow-500 mb-6 border-b border-gray-700 pb-2'>
                  Event Schedule
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <h3 className='text-gray-400 text-sm font-medium mb-1'>
                      Event Start
                    </h3>
                    <p className='text-white font-semibold'>
                      {moment(eventDetails?.startDate).format(
                        'ddd, MMM DD • h:mm A'
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className='text-gray-400 text-sm font-medium mb-1'>
                      Event End
                    </h3>
                    <p className='text-white font-semibold'>
                      {moment(eventDetails?.endDate).format(
                        'ddd, MMM DD • h:mm A'
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className='text-gray-400 text-sm font-medium mb-1'>
                      Fights Begin
                    </h3>
                    <p className='text-white font-semibold'>
                      {moment(eventDetails?.fightStartTime).format(
                        'ddd, MMM DD • h:mm A'
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className='text-gray-400 text-sm font-medium mb-1'>
                      Doors Open
                    </h3>
                    <p className='text-white font-semibold'>
                      {moment(eventDetails?.spectatorDoorsOpenTime).format(
                        'ddd, MMM DD • h:mm A'
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className='text-gray-400 text-sm font-medium mb-1'>
                      Weigh-in
                    </h3>
                    <p className='text-white font-semibold'>
                      {moment(eventDetails?.weighInDateTime).format(
                        'ddd, MMM DD • h:mm A'
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className='text-gray-400 text-sm font-medium mb-1'>
                      Rules Meeting
                    </h3>
                    <p className='text-white font-semibold'>
                      {moment(eventDetails?.rulesMeetingTime).format(
                        'ddd, MMM DD • h:mm A'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Registration */}
              <div className='bg-[#1b0c2e] rounded-lg p-6'>
                <h2 className='text-xl font-bold text-yellow-500 mb-6 border-b border-gray-700 pb-2'>
                  Registration
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <h3 className='text-gray-400 text-sm font-medium mb-1'>
                      Registration Opens
                    </h3>
                    <p className='text-white font-semibold'>
                      {moment(eventDetails?.registrationStartDate).format(
                        'MMM DD, YYYY'
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className='text-gray-400 text-sm font-medium mb-1'>
                      Registration Deadline
                    </h3>
                    <p className='text-white font-semibold'>
                      {moment(eventDetails?.registrationDeadline).format(
                        'MMM DD, YYYY • h:mm A'
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className='text-gray-400 text-sm font-medium mb-1'>
                      Registered Participants
                    </h3>
                    <p className='text-white font-bold text-lg'>
                      {eventDetails?.registeredParticipants || 0}
                    </p>
                  </div>
                  <div>
                    <h3 className='text-gray-400 text-sm font-medium mb-1'>
                      Matching Method
                    </h3>
                    <p className='text-white font-semibold'>
                      {eventDetails?.matchingMethod}
                    </p>
                  </div>
                </div>
              </div>

              {/* Venue */}
              <div className='bg-[#1b0c2e] rounded-lg p-6'>
                <h2 className='text-xl font-bold text-yellow-500 mb-6 border-b border-gray-700 pb-2'>
                  Venue Information
                </h2>
                <div className='space-y-4'>
                  <div>
                    <h3 className='text-gray-400 text-sm font-medium mb-1'>
                      Venue
                    </h3>
                    <p className='text-white font-semibold text-lg'>
                      {eventDetails?.venue?.name}
                    </p>
                  </div>
                  <div>
                    <h3 className='text-gray-400 text-sm font-medium mb-1'>
                      Address
                    </h3>
                    <div className='text-white'>
                      <p>{eventDetails?.venue?.address?.street1}</p>
                      {eventDetails?.venue?.address?.street2 && (
                        <p>{eventDetails?.venue?.address?.street2}</p>
                      )}
                      <p>
                        {eventDetails?.venue?.address?.city},{' '}
                        {eventDetails?.venue?.address?.state}{' '}
                        {eventDetails?.venue?.address?.postalCode}
                      </p>
                    </div>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <h3 className='text-gray-400 text-sm font-medium mb-1'>
                        Contact
                      </h3>
                      <p className='text-white'>
                        {eventDetails?.venue?.contactName}
                      </p>
                      <p className='text-gray-300 text-sm'>
                        {eventDetails?.venue?.contactPhone}
                      </p>
                    </div>
                    <div>
                      <h3 className='text-gray-400 text-sm font-medium mb-1'>
                        Capacity
                      </h3>
                      <p className='text-white font-semibold'>
                        {eventDetails?.venue?.capacity} people
                      </p>
                    </div>
                  </div>
                  {eventDetails?.venue?.mapLink && (
                    <div>
                      <a
                        href={eventDetails.venue.mapLink}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center text-yellow-400 hover:text-yellow-300 font-medium'
                      >
                        View on Google Maps →
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Competition Details */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='bg-[#1b0c2e] rounded-lg p-6'>
                  <h2 className='text-xl font-bold text-yellow-500 mb-4 border-b border-gray-700 pb-2'>
                    Categories
                  </h2>
                  <div className='space-y-4'>
                    <div>
                      <h3 className='text-gray-400 text-sm font-medium mb-1'>
                        Age Groups
                      </h3>
                      <p className='text-white'>
                        {eventDetails?.ageCategories?.join(', ') || 'All Ages'}
                      </p>
                    </div>
                    <div>
                      <h3 className='text-gray-400 text-sm font-medium mb-1'>
                        Weight Classes
                      </h3>
                      <p className='text-white'>
                        {eventDetails?.weightClasses?.join(', ') ||
                          'Open Weight'}
                      </p>
                    </div>
                    <div>
                      <h3 className='text-gray-400 text-sm font-medium mb-1'>
                        KO Policy
                      </h3>
                      <p className='text-white'>{eventDetails?.koPolicy}</p>
                    </div>
                  </div>
                </div>

                <div className='bg-[#1b0c2e] rounded-lg p-6'>
                  <h2 className='text-xl font-bold text-yellow-500 mb-4 border-b border-gray-700 pb-2'>
                    Organization
                  </h2>
                  <div className='space-y-4'>
                    <div>
                      <h3 className='text-gray-400 text-sm font-medium mb-1'>
                        Promoter
                      </h3>
                      <p className='text-white font-semibold'>
                        {eventDetails?.promoter?.userId?.firstName}{' '}
                        {eventDetails?.promoter?.userId?.lastName}
                      </p>
                      <p className='text-gray-300 text-sm'>
                        {eventDetails?.promoter?.abbreviation}
                      </p>
                    </div>
                    <div>
                      <h3 className='text-gray-400 text-sm font-medium mb-1'>
                        Sanctioning Body
                      </h3>
                      <p className='text-white'>
                        {eventDetails?.sectioningBodyName ||
                          eventDetails?.promoter?.sanctioningBody}
                      </p>
                    </div>
                    {eventDetails?.iskaRepName && (
                      <div>
                        <h3 className='text-gray-400 text-sm font-medium mb-1'>
                          Representative
                        </h3>
                        <p className='text-white'>{eventDetails.iskaRepName}</p>
                        <p className='text-gray-300 text-sm'>
                          {eventDetails.iskaRepPhone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className='bg-[#1b0c2e] rounded-lg p-6'>
                <h2 className='text-xl font-bold text-yellow-500 mb-4 border-b border-gray-700 pb-2'>
                  About This Event
                </h2>
                <p className='text-gray-300 leading-relaxed mb-4'>
                  {eventDetails?.fullDescription}
                </p>
                {eventDetails?.rules && (
                  <div>
                    <h3 className='text-white font-semibold mb-2'>
                      Rules & Regulations
                    </h3>
                    <p className='text-gray-300 leading-relaxed'>
                      {eventDetails.rules}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Teams' && (
          <div className='bg-[#1b0c2e] rounded-lg p-12 text-center'>
            <h2 className='text-2xl font-bold text-gray-400 mb-4'>Teams</h2>
            <p className='text-gray-500'>
              Team information will be available soon.
            </p>
          </div>
        )}

        {activeTab === 'Registration' && (
          <RegistrationSection eventId={id} padding={'p-4'} />
        )}

        {activeTab === 'Fight Card' && <FightCard fighters={fighters} />}

        {activeTab === 'Sanctioning Body' && (
          <div className='bg-[#1b0c2e] rounded-lg p-8'>
            <h2 className='text-2xl font-bold text-yellow-500 mb-6 text-center'>
              Sanctioning Body
            </h2>
            <div className='text-center max-w-2xl mx-auto'>
              <h3 className='text-xl font-bold text-white mb-4'>
                {eventDetails?.sectioningBodyName ||
                  eventDetails?.promoter?.sanctioningBody}
              </h3>
              <p className='text-gray-300 leading-relaxed'>
                {eventDetails?.sectioningBodyDescription ||
                  'Official sanctioning body for this event.'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'Rules' && (
          <div className='bg-[#1b0c2e] rounded-lg p-8'>
            <h2 className='text-2xl font-bold text-yellow-500 mb-6'>
              Rules & Regulations
            </h2>
            <div className='prose prose-lg max-w-none'>
              <p className='text-gray-300 leading-relaxed text-lg'>
                {eventDetails?.rules ||
                  'Standard competition rules apply. Please contact the promoter for detailed rule specifications.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default page
