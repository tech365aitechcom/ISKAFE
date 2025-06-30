'use client'
import React from 'react'
import { Flag } from 'lucide-react'
import Link from 'next/link'

const FighterCard = ({
  id,
  image,
  city = '',
  state = '',
  country = '',
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
        {image ? (
          <img src={image} alt={name} className='h-full w-full object-cover' />
        ) : (
          <div className='h-full w-full flex items-center justify-center bg-gray-900'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='96'
              height='96'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='text-gray-500'
            >
              <path d='M12 12c2.67 0 8 1.34 8 4v2H4v-2c0-2.66 5.33-4 8-4z' />
              <circle cx='12' cy='7' r='4' />
            </svg>
          </div>
        )}

        <div className='absolute bottom-4 left-4 z-10 flex items-center bg-black bg-opacity-70 px-2 py-1 rounded-md backdrop-blur-sm'>
          <Flag className='h-4 w-4 text-red-500 mr-2' />
          <span className='text-xs font-medium text-white truncate max-w-[200px]'>
            {city ? `${city}, ` : ''}
            {state ? `${state}, ` : ''}
            {country}
          </span>
        </div>

        {style && (
          <span className='inline-block bg-yellow-500 text-black text-xs font-semibold px-2 py-1 rounded-full w-fit absolute top-2 right-2 z-10'>
            {style}
          </span>
        )}
      </div>

      {/* Info Section */}
      <div className='p-4 flex flex-col justify-between flex-grow'>
        <div>
          <h3 className='font-semibold text-lg leading-tight text-white line-clamp-1 mb-1 capitalize'>
            {name}
          </h3>

          <p className='text-gray-400 text-sm line-clamp-2'>{bio}</p>
        </div>
      </div>

      {/* Button Section */}
      <div className='p-4 relative z-10'>
        <Link href={`/fighters/${id}`} passHref>
          <button className='bg-transparent hover:bg-gray-800 border border-gray-600 text-gray-300 font-medium py-1 px-4 rounded text-sm transition-colors'>
            View Profile
          </button>
        </Link>
      </div>
    </div>
  )
}

export default FighterCard
