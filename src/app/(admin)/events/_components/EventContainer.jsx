'use client'
import React, { useState } from 'react'
import { EventTable } from './EventTable'
import { events } from '../../../../constants/index'
import { AddEventForm } from './AddEventForm'

export const EventContainer = () => {
  const [showAddEventForm, setShowAddEvent] = useState(false)
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
          <EventTable events={events} />
        </>
      )}
    </div>
  )
}
