'use client'

import { ArrowUpDown, Trash } from 'lucide-react'
import BracketList from './_components/BracketList'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { brackets } from '../../../../../../constants'

export default function TournamentBrackets() {
  const params = useParams()
  const [eventId, setEventId] = useState(null)

  useEffect(() => {
    if (params?.id) {
      setEventId(params.id)
      console.log('Event ID:', params.id)
    }
  }, [params])

  return (
    <div className='text-white p-8 relative flex justify-center overflow-hidden'>
      <div
        className='absolute -left-10 top-1/2 transform -translate-y-1/2 w-60 h-96 rounded-full opacity-70 blur-xl'
        style={{
          background:
            'linear-gradient(317.9deg, #6F113E 13.43%, rgba(111, 17, 62, 0) 93.61%)',
        }}
      ></div>
      <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
        {/* Header */}
        <div className='flex items-center gap-4 mb-6'>
          <Link href={`/admin/events/${eventId}`}>
            <button className='mr-2 cursor-pointer'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 19l-7-7m0 0l7-7m-7 7h18'
                />
              </svg>
            </button>
          </Link>
          <h1 className='text-2xl font-bold'>Tournament Brackets</h1>
          <div className='ml-auto flex space-x-2'>
            <button className='border border-white px-3 py-1 text-sm rounded flex items-center gap-1 cursor-pointer'>
              <ArrowUpDown size={14} />
              <span className='mr-1'>Reorder</span>
            </button>
            <button className='bg-[#F35050] px-3 py-1 text-sm rounded flex items-center gap-1 cursor-pointer'>
              <Trash size={14} color='#fff' />
              <span className='mr-1'>Delete</span>
            </button>
          </div>
        </div>
        {/* Brackets List */}
        <BracketList brackets={brackets} />
      </div>
    </div>
  )
}
