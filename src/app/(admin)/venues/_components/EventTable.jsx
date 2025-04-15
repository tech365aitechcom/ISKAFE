'use client'

import { ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'

export function VenuesTable({ venues }) {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  })

  const sortedVenues = [...venues].sort((a, b) => {
    if (!sortConfig.key) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    } else {
      return sortConfig.direction === 'asc'
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1
    }
  })

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      } else {
        return { key, direction: 'asc' }
      }
    })
  }

  const renderHeader = (label, key) => (
    <th
      className='px-4 pb-3 whitespace-nowrap cursor-pointer'
      onClick={() => handleSort(key)}
    >
      <div className='flex items-center gap-1'>
        {label}
        <ChevronsUpDown className='w-4 h-4 text-gray-400' />
      </div>
    </th>
  )

  return (
    <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
      <div className='mb-4 pb-4 p-4 flex justify-between items-center border-b border-[#343B4F]'>
        <p className='text-sm'>Next 10 Venues</p>
        <p className='text-sm'>1 - 10 of {venues.length}</p>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm text-left'>
          <thead>
            <tr className='text-gray-400 text-sm'>
              {renderHeader('ID', 'id')}
              {renderHeader('Venue Name', 'name')}
              {renderHeader('Added On', 'date')}
              {renderHeader('Address', 'address')}
              {renderHeader('URL', 'url')}
            </tr>
          </thead>
          <tbody>
            {sortedVenues.map((venue, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                }`}
              >
                <td className='p-4'>{venue.id}</td>
                <td className='p-4'>{venue.name}</td>
                <td className='p-4'>{venue.date}</td>
                <td className='p-4'>{venue.address}</td>
                <td className='p-4'>{venue.url}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
