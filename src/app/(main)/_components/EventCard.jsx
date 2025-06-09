'use client'
import React, { useState } from 'react'
import { Flag } from 'lucide-react'
import Link from 'next/link'

const EventCard = ({
  imageUrl,
  imageAlt,
  id,
  location,
  month,
  day,
  name,
  description,
  className,
  status,
}) => {
  // Status badge color mapping
  const statusColors = {
    live: 'bg-green-500',
    upcoming: 'bg-blue-500',
    closed: 'bg-red-500',
  }

  // Determine the badge color based on status
  const badgeColor = statusColors[status?.toLowerCase()] || 'bg-gray-500'

  return (
    <div
      className={`w-full max-w-sm overflow-hidden rounded-lg bg-black text-white border border-[#D9E2F930] ${className}`}
    >
      <div className='relative h-64 w-full overflow-hidden'>
        <img
          src={imageUrl}
          alt={imageAlt}
          className='h-full w-full object-cover'
        />
        {/* Status badge - top right corner */}
        {status && (
          <div
            className={`absolute top-4 right-4 ${badgeColor} px-2 py-1 rounded text-xs font-bold`}
          >
            {status}
          </div>
        )}
        <div className='absolute bottom-4 left-4 flex items-center bg-black bg-opacity-70 px-2 py-1 rounded'>
          <div className='mr-2'>
            <Flag className='h-4 w-4 text-red-500' />
          </div>
          <span className='text-xs font-medium'>{location}</span>
        </div>
      </div>
      <div className='p-4 flex'>
        <div className='flex flex-col items-center justify-center mr-4'>
          <div className='text-yellow-500 text-xs font-bold'>{month}</div>
          <div className='text-white text-2xl font-bold'>{day}</div>
        </div>
        <div className='flex flex-col flex-grow'>
          <h3 className='font-bold text-lg leading-tight mb-1'>{name}</h3>
          <p className='text-gray-400 text-sm mb-3'>{description}</p>

          <div className='flex space-x-2 mt-auto'>
            <Link href={`/events/${id}`}>
              <button className='bg-transparent hover:bg-gray-800 border border-gray-600 text-gray-300 font-medium py-1 px-3 rounded text-sm transition-colors'>
                View Details
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventCard
