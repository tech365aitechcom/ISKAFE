'use client'
import React, { useEffect, useState } from 'react'
import { EventTable } from './EventTable'
import { AddEventForm } from './AddEventForm'
import axios from 'axios'
import Loader from '../../_components/Loader'
import { API_BASE_URL } from '../../../../../constants'

export const EventContainer = () => {
  const [showAddEventForm, setShowAddEvent] = useState(false)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const getEvents = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/events/find-all?page=1&limit=10`
      )
      console.log('Response:', response.data)

      setEvents(response.data.data.events)
    } catch (error) {
      console.log('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getEvents()
  }, [showAddEventForm])

  return (
    <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
      {showAddEventForm ? (
        <AddEventForm setShowAddEvent={setShowAddEvent} />
      ) : (
        <>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-2xl font-semibold leading-8'>Events</h2>
            <button
              className='text-white px-4 py-2 rounded-md cursor-pointer'
              style={{
                background:
                  'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
              onClick={() => setShowAddEvent(true)}
            >
              Create New
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <EventTable events={events} onSuccess={getEvents} />
          )}
        </>
      )}
    </div>
  )
}
