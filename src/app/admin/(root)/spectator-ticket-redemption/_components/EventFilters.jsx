import React from 'react'
import { Search } from 'lucide-react'

export default function EventFilters({
  searchQuery,
  setSearchQuery,
  eventDateFilter,
  setEventDateFilter,
  eventLocationFilter,
  setEventLocationFilter,
  eventStatusFilter,
  setEventStatusFilter,
  uniqueLocations
}) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
      <div className='relative'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
          <Search size={18} className='text-gray-400' />
        </div>
        <input
          type='text'
          className='bg-transparent border border-gray-700 text-white rounded-md pl-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-600'
          placeholder='Search events...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <input
        type='date'
        className='bg-transparent border border-gray-700 text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-600'
        value={eventDateFilter}
        onChange={(e) => setEventDateFilter(e.target.value)}
        placeholder='Filter by date'
      />

      <select
        className='bg-[#0A1330] border border-gray-700 text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-600'
        value={eventLocationFilter}
        onChange={(e) => setEventLocationFilter(e.target.value)}
      >
        <option value=''>All Locations</option>
        {uniqueLocations.map((location) => (
          <option key={location} value={location}>
            {location}
          </option>
        ))}
      </select>

      <select
        className='bg-[#0A1330] border border-gray-700 text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-600'
        value={eventStatusFilter}
        onChange={(e) => setEventStatusFilter(e.target.value)}
      >
        <option value='all'>All</option>
        <option value='upcoming'>Upcoming</option>
        <option value='closed'>Closed</option>
      </select>
    </div>
  )
}