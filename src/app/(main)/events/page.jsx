'use client'
import React, { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '../../../constants/index'
import EventCard from '../_components/EventCard'
import Loader from '../../_components/Loader'
import { getEventStatus } from '../../../utils/eventUtils'

const EventsPage = () => {
  const [eventName, setEventName] = useState('')
  const [country, setCountry] = useState('')
  const [gameType, setGameType] = useState('')

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getEvents = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/events?isPublished=true`
        )
        console.log('Response:', response.data)

        setEvents(response.data.data.items)
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }
    getEvents()
  }, [])

  console.log('Events:', events)

  function getMonth(dateString) {
    const date = new Date(dateString)

    const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(
      date
    )

    return month
  }

  function getDate(dateString) {
    const date = new Date(dateString)
    const day = date.getDate()

    return day
  }

  const handleSearch = () => {
    console.log('Searching for:', { eventName, country, gameType })
  }

  return (
    <div className='relative w-full bg-purple-900'>
      <div className='absolute inset-0 bg-transparent opacity-90 pointer-events-none'></div>
      <div className='relative w-full max-w-6xl mx-auto px-4 pt-16 pb-32'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl md:text-5xl font-bold text-white'>
            UPCOMING EVENTS AND
          </h1>
          <h1 className='text-4xl md:text-5xl font-bold text-red-500'>
            TOURNAMENTS
          </h1>
        </div>
        <div
          className='absolute left-0 right-0 mx-auto px-4 w-full max-w-5xl'
          style={{ top: '70%' }}
        >
          <div className='bg-purple-950 rounded-xl p-8 shadow-xl'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='flex flex-col items-start'>
                <label className='text-white text-sm mb-2'>Search Event</label>
                <input
                  type='text'
                  placeholder='Event Name'
                  className='w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500'
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                />
              </div>
              <div className='flex flex-col items-start'>
                <label className='text-white text-sm mb-2'>Country</label>
                <div className='relative w-full'>
                  <select
                    className='appearance-none w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500'
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value='' className='bg-purple-900'>
                      Select
                    </option>
                    <option value='usa' className='bg-purple-900'>
                      USA
                    </option>
                    <option value='uk' className='bg-purple-900'>
                      UK
                    </option>
                    <option value='japan' className='bg-purple-900'>
                      Japan
                    </option>
                    <option value='korea' className='bg-purple-900'>
                      South Korea
                    </option>
                  </select>
                  <div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
                    <ChevronDown className='h-5 w-5 text-white' />
                  </div>
                </div>
              </div>
              <div className='flex flex-col items-start'>
                <label className='text-white text-sm mb-2'>Game Type</label>
                <div className='relative w-full'>
                  <select
                    className='appearance-none w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500'
                    value={gameType}
                    onChange={(e) => setGameType(e.target.value)}
                  >
                    <option value='' className='bg-purple-900'>
                      Select
                    </option>
                    <option value='fps' className='bg-purple-900'>
                      FPS
                    </option>
                    <option value='moba' className='bg-purple-900'>
                      MOBA
                    </option>
                    <option value='battle-royale' className='bg-purple-900'>
                      Battle Royale
                    </option>
                    <option value='fighting' className='bg-purple-900'>
                      Fighting
                    </option>
                  </select>
                  <div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
                    <ChevronDown className='h-5 w-5 text-white' />
                  </div>
                </div>
              </div>
            </div>
            <div className='mt-8 flex justify-center'>
              <button
                onClick={handleSearch}
                className='bg-red-500 text-white px-12 py-3 rounded font-medium hover:bg-red-600 transition-colors'
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className='w-full h-32 bg-black'></div>
      {loading ? (
        <div className='flex justify-center items-center h-64 bg-black'>
          <Loader />
        </div>
      ) : (
        <div className='bg-black w-full mx-auto px-4 py-52 md:py-16 flex flex-wrap justify-center gap-10 items-center'>
          {events.map((event) => (
            <EventCard
              key={event._id}
              imageUrl={
                'https://images.unsplash.com/photo-1714583173985-fa58ef40c8d4?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
              }
              id={event._id}
              imageAlt={event.name}
              location={
                event.venue?.name +
                ', ' +
                event.venue?.address.country +
                ', ' +
                event.venue?.address.state +
                ', ' +
                event.venue?.address.city +
                ', ' +
                event.venue?.address.street1 +
                ', ' +
                event.venue?.address?.street2 +
                ', ' +
                event.venue?.address.postalCode
              }
              month={getMonth(event.startDate)}
              day={getDate(event.startDate)}
              name={event.name}
              description={event.briefDescription}
              status={getEventStatus(event.startDate, event.endDate)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default EventsPage
