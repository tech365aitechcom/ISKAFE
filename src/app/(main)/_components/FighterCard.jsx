'use client'
import React from 'react'
import { Flag } from 'lucide-react'
import Link from 'next/link'

const FighterCard = ({
  id,
  image,
  location = 'Unknown Location',
  name = '',
  bio = '',
  style = '',
  className = '',
}) => {
  return (
    <div
      className={`w-full max-w-sm h-[380px] flex flex-col justify-between rounded-2xl bg-black text-white border border-[#D9E2F930] shadow-lg transition-transform hover:scale-[1.02] ${className}`}
    >
      {/* Image Section */}
      <div className='relative h-64 w-full flex items-center justify-center bg-black rounded-t-2xl overflow-hidden'>
        <img
          src={image}
          alt={name}
          className='max-h-full max-w-full object-cover'
        />
        <div className='absolute bottom-4 left-4 flex items-center bg-black bg-opacity-70 px-2 py-1 rounded-md backdrop-blur-sm'>
          <Flag className='h-4 w-4 text-red-500 mr-2' />
          <span className='text-xs font-medium text-white truncate max-w-[200px]'>
            {location}
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className='p-4 flex flex-col justify-between flex-grow'>
        <div>
          <h3 className='font-semibold text-lg leading-tight text-white line-clamp-1 mb-1 capitalize'>
            {name}
          </h3>

          {style && (
            <span className='inline-block bg-yellow-500 text-black text-xs font-semibold px-2 py-1 rounded-full mb-2 w-fit'>
              {style}
            </span>
          )}

          <p className='text-gray-400 text-sm line-clamp-2'>{bio}</p>
        </div>
      </div>

      <div className='p-4'>
        <Link href={`/fighters/${id}`}>
          <button className='bg-transparent hover:bg-gray-800 border border-gray-600 text-gray-300 font-medium py-1 px-3 rounded text-sm transition-colors'>
            View Profile
          </button>
        </Link>
      </div>
    </div>
  )
}

export default FighterCard
