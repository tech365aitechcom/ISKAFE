'use client'
import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { CodesTable } from './CodesTable'

export default function SelectFromList({
  events,
  selectedEvent,
  setSelectedEvent,
  loading,
  error,
  cashCodes,
  currentPage,
  limit,
  setLimit,
  setCurrentPage,
  totalPages,
  totalItems,
}) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter events based on search query
  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className='text-white mt-5 w-full'>
      <h1 className='font-semibold mb-4'>Select Event</h1>

      {/* Search bar */}
      <div className='mb-4'>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <Search size={16} className='text-gray-400' />
          </div>
          <input
            type='text'
            placeholder='Search events...'
            className='w-full py-2 pl-10 pr-3 bg-transparent border border-[#343B4F] rounded-md focus:outline-none focus:[#343B4F] text-white'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {selectedEvent ? (
        <div>
          <div className='bg-[#AEBFFF33] flex items-center gap-12 px-3 py-2 w-fit rounded mb-4'>
            <button className='text-left rounded text-sm transition-colors duration-200'>
              <div className='font-medium'>{selectedEvent.name}</div>
            </button>
            <X
              size={18}
              onClick={() => setSelectedEvent(null)}
              className='cursor-pointer'
            />
          </div>
          <CodesTable
            cashCodes={cashCodes}
            limit={limit}
            setLimit={setLimit}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalItems={totalItems}
          />
        </div>
      ) : (
        <>
          {error && (
            <div className='mb-4 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg'>
              <p className='text-red-400'>Error: {error}</p>
            </div>
          )}
          <div className='flex flex-wrap gap-4'>
            {filteredEvents.map((event, index) => (
              <button
                key={index}
                className='bg-[#AEBFFF33] text-left p-3 rounded text-sm transition-colors duration-200 flex-grow min-w-min hover:bg-[#2E3094]'
                style={{ maxWidth: 'fit-content' }}
                onClick={() => setSelectedEvent(event)}
              >
                <div className='font-medium'>{event.name}</div>
              </button>
            ))}

            {filteredEvents?.length === 0 && !loading && (
              <div className='text-center w-full py-8 text-gray-400'>
                {events?.length === 0
                  ? 'No events found'
                  : 'No events match your search'}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
