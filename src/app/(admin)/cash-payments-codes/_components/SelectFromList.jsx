import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { CodesTable } from './CodesTable'
import { cashPaymentAndCodesEvents } from '../../../../constants/index'

export default function SelectFromList({
  selectedEvent,
  setSelectedEvent,
  handleFighterClick,
}) {
  const [searchQuery, setSearchQuery] = useState('')

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
            placeholder='Search for...'
            className='w-full py-2 pl-10 pr-3 bg-transparent border border-[#343B4F] rounded-md focus:outline-none focus:[#343B4F] text-white'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      {selectedEvent ? (
        <div>
          <div className='bg-[#AEBFFF33] flex items-center gap-12 px-3 w-fit '>
            <button className=' text-left p-2 rounded text-sm transition-colors duration-200 min-w-min cursor-pointer'>
              {selectedEvent.name}
            </button>
            <X
              size={18}
              onClick={() => setSelectedEvent(null)}
              className='cursor-pointer'
            />
          </div>
          <CodesTable
            users={selectedEvent.users}
            handleFighterClick={handleFighterClick}
          />
        </div>
      ) : (
        <div className='flex flex-wrap gap-4'>
          {cashPaymentAndCodesEvents.map((event, index) => (
            <button
              key={index}
              className='bg-[#AEBFFF33] text-left p-2 rounded text-sm transition-colors duration-200 flex-grow min-w-min cursor-pointer'
              style={{ maxWidth: 'fit-content' }}
              onClick={() => setSelectedEvent(event)}
            >
              {event.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
