'use client'
import React, { use, useEffect, useState } from 'react'
import { API_BASE_URL } from '../../../../constants/index'
import axios from 'axios'
import moment from 'moment'
import FightCard from './_components/FightCard'
import Tournament from './_components/Tournament'
import Loader from '../../../_components/Loader'
import RegistrationSection from './_components/RegistrationSection'
import Link from 'next/link'
import { ArrowLeftIcon } from 'lucide-react'
import EventDetailsSection from './_components/EventDetailsSection'
import PdfViewer from './_components/PdfViewer'

const page = ({ params }) => {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState('Details')
  const tabNames = [
    'Details',
    'Registration',
    'Tournaments',
    'Fight Card',
    'Fighters Registered',
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
              {eventDetails?.promoter && (
                <p className='text-gray-400 text-sm'>
                  Presented by: {eventDetails.promoter.name}
                </p>
              )}
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
      <div className='sticky top-0 bg-[#0f0217] z-40'>
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
          <EventDetailsSection id={id} eventDetails={eventDetails} />
        )}

        {activeTab === 'Registration' && (
          <RegistrationSection eventId={id} padding={'p-4'} showTable={true} />
        )}

        {activeTab === 'Tournaments' && (
          <Tournament eventDetails={eventDetails} />
        )}

        {activeTab === 'Fight Card' && (
          <FightCard eventDetails={eventDetails} />
        )}

        {activeTab === 'Sanctioning Body' && (
          <div className='bg-[#1b0c2e] rounded-xl p-6 md:p-8 shadow-lg'>
            <h2 className='text-3xl font-bold text-yellow-500 mb-6 border-b border-yellow-700 pb-2'>
              Sanctioning Body
            </h2>

            <div className='flex flex-col md:flex-row items-start gap-6'>
              <img
                src={eventDetails?.sectioningBodyImage}
                alt={eventDetails?.sectioningBodyName}
                className='w-full md:w-44 rounded-lg shadow-md object-cover'
              />

              <div className='flex-1'>
                <h3 className='text-2xl font-semibold text-white mb-3'>
                  {eventDetails?.sectioningBodyName}
                </h3>
                <p className='text-gray-300 leading-relaxed tracking-wide'>
                  {eventDetails?.sectioningBodyDescription}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Fighters Registered' && (
          <div className='bg-[#1b0c2e] rounded-lg p-6'>
            <h2 className='text-2xl font-bold text-yellow-500 mb-6 border-b border-gray-700 pb-2'>
              Registered Fighters
            </h2>

            <div className='mb-6'>
              <h3 className='text-gray-400 text-sm font-medium mb-1'>
                Total Fighters Registered
              </h3>
              <p className='text-white font-bold text-2xl'>
                {eventDetails?.registeredFighters?.length || 0}
              </p>
            </div>

            {eventDetails?.registeredFighters?.length > 0 ? (
              <div className='overflow-x-auto custom-scrollbar'>
                <table className='min-w-full bg-[#140b23] text-white border border-gray-700 rounded-lg'>
                  <thead>
                    <tr className='text-left text-gray-400 uppercase text-sm border-b border-gray-700'>
                      <th className='py-3 px-4'>Name</th>
                      <th className='py-3 px-4'>Weight Class</th>
                      <th className='py-3 px-4'>Country</th>
                      <th className='py-3 px-4'></th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventDetails?.registeredFighters &&
                      eventDetails?.registeredFighters?.map((reg, idx) => (
                        <tr
                          key={idx}
                          className='border-b border-gray-800 hover:bg-[#1e112d] transition'
                        >
                          <td className='py-3 px-4 font-medium'>
                            {reg?.firstName} {reg?.lastName}
                          </td>
                          <td className='py-3 px-4'>{reg?.weightClass}</td>
                          <td className='py-3 px-4'>{reg?.country}</td>
                          <td className='py-3 px-4'>
                            <a
                              href={`/fighters/${reg.fighterProfileId}`}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-yellow-400 hover:text-yellow-300 font-semibold text-sm'
                            >
                              View Profile →
                            </a>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className='text-gray-300'>No fighters registered yet.</p>
            )}
          </div>
        )}

        {activeTab === 'Rules' && (
          <div className='bg-[#1b0c2e] rounded-lg p-8'>
            <h2 className='text-2xl font-bold text-yellow-500 mb-6'>Rules</h2>
            <div className='prose prose-lg max-w-none'>
              {eventDetails?.rules ? (
                <PdfViewer pdfUrl={eventDetails.rules} />
              ) : (
                <p className='text-gray-300'>No rules available</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default page
