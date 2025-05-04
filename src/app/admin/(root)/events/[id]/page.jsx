'use client'
import React, { useEffect, useState } from 'react'
import { ChevronDown, Edit, Pencil } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function EventDetailsPage() {
  const params = useParams()
  const [eventId, setEventId] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [event, setEvent] = useState({
    name: 'IKF PKB and PBSC Point Boxing Sparring',
    date: '03/29/2025',
    promoter: 'AK Promotions',
    venueName: 'Ophelia Garmon-Brown Community Center',
    venueAddress: 'Charlotte, NC, USA',
    shortDescription:
      'Semi Contact Muay Thai, Kickboxing and Point Boxing Sparring',
    fullDescription:
      'Semi Contact Muay Thai, Kickboxing and Point Boxing Sparring. Semi Contact Muay Thai, Kickboxing and Point Boxing Sparring',
    sanctioningRules: 'International Kickboxing Federation',
    stats: {
      bracketCount: {
        value: 22,
        breakdown:
          'Girls Brackets: 2 ; Boys Brackets: 2\nWomen Brackets: 2 ; Men Brackets: 2',
      },
      boutCount: {
        value: 0,
        breakdown:
          'Girls Brackets: 0 ; Boys Brackets: 0\nWomen Brackets: 0 ; Men Brackets: 0',
      },
      registrationFee: {
        fighter: '$55',
        trainer: '$30',
        breakdown:
          'Max Fighters per Bracket: 4 ;\nNum Registration Brackets: 6',
      },
      participants: {
        value: 19,
        breakdown: 'Fighters: 17 ; Trainers: 2',
      },
    },
  })

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    if (params?.id) {
      setEventId(params.id)
      console.log('Event ID:', params.id)
    }
  }, [params])

  return (
    <div className='text-white p-8 flex justify-center relative overflow-hidden'>
      <div
        className='absolute -left-10 top-1/2 transform -translate-y-1/2 w-60 h-96 rounded-full opacity-70 blur-xl'
        style={{
          background:
            'linear-gradient(317.9deg, #6F113E 13.43%, rgba(111, 17, 62, 0) 93.61%)',
        }}
      ></div>
      <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
        <div className='flex justify-between mb-6'>
          {/* Header with back button */}
          <div className='flex items-center gap-4 '>
            <Link href={`/admin/events`}>
              <button className='mr-2'>
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
            <h1 className='text-2xl font-bold'>{event.name}</h1>
          </div>
          <div className='relative w-64'>
            {/* Dropdown Button */}
            <button
              onClick={toggleDropdown}
              className='flex items-center justify-between w-full px-4 py-2 bg-[#0A1330] border border-white rounded-lg'
            >
              <span>Features</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className='absolute w-full mt-2 bg-[#081028] shadow-lg z-10'>
                <ul className='py-1'>
                  <li className='mx-4 py-3 border-b border-[#6C6C6C]'>
                    Fighter Check-in
                  </li>
                  <li className='mx-4 py-3 border-b border-[#6C6C6C]'>
                    Bout List
                  </li>
                  <li className='mx-4 py-3 border-b border-[#6C6C6C]'>
                    Spectator Ticket Redemption
                  </li>
                  <li className='mx-4 py-3 border-b border-[#6C6C6C]'>
                    Cash Payment Tokens
                  </li>
                  <li className='mx-4 py-3'>Reports</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
          {/* Bracket Count */}
          <div className='border border-[#343B4F] rounded-lg p-4 relative'>
            <div className='flex justify-between items-start'>
              <span className='text-sm text-[#AEB9E1]'>Bracket Count</span>
              <button className=''>
                <Pencil size={16} />
              </button>
            </div>
            <div className='mt-2'>
              <h2 className='text-2xl font-bold'>
                {event.stats.bracketCount.value}
              </h2>
              <p className='text-sm text-[#AEB9E1] mt-2'>
                Girls Brackets: 2 ; Boys Brackets: 2
                <br />
                Women Brackets: 2 ; Men Brackets: 2
              </p>
            </div>
          </div>

          {/* Bout Count */}
          <div className='border border-[#343B4F] rounded-lg p-4 relative'>
            <div className='flex justify-between items-start'>
              <span className='text-sm text-[#AEB9E1]'>Bout Count</span>
              <Link href={`/admin/events/${eventId}/tournament-brackets`}>
                <button className=''>
                  <Pencil size={16} />
                </button>
              </Link>
            </div>
            <div className='mt-2'>
              <h2 className='text-2xl font-bold'>
                {event.stats.boutCount.value}
              </h2>
              <p className='text-sm text-[#AEB9E1] mt-2'>
                Girls Brackets: 0 ; Boys Brackets: 0
                <br />
                Women Brackets: 0 ; Men Brackets: 0
              </p>
            </div>
          </div>

          {/* Registration Fee */}
          <div className='border border-[#343B4F] rounded-lg p-4 relative'>
            <div className='flex justify-between items-start'>
              <span className='text-sm text-[#AEB9E1]'>Registration Fee</span>
              <button className=''>
                <Pencil size={16} />
              </button>
            </div>
            <div className='mt-2'>
              <h2 className='text-2xl font-bold'>
                <span>{event.stats.registrationFee.fighter}</span>
                <span className='text-sm'>/Fighter</span>
                <span className='ml-2'>
                  {event.stats.registrationFee.trainer}
                </span>
                <span className='text-sm'>/Trainer</span>
              </h2>
              <p className='text-sm text-[#AEB9E1] mt-2'>
                Max Fighters per Bracket: 4 ;
                <br />
                Num Registration Brackets: 6
              </p>
            </div>
          </div>

          {/* Participants */}
          <div className='border border-[#343B4F] rounded-lg p-4 relative'>
            <div className='flex justify-between items-start'>
              <span className='text-sm text-[#AEB9E1]'>Participants</span>
              <button className=''>
                <Pencil size={16} />
              </button>
            </div>
            <div className='mt-2'>
              <h2 className='text-2xl font-bold'>
                {event.stats.participants.value}
              </h2>
              <p className='text-sm text-[#AEB9E1] mt-2'>
                {event.stats.participants.breakdown}
              </p>
            </div>
          </div>
        </div>

        {/* Event Properties */}
        <div className='border border-[#343B4F] rounded-lg p-6 relative mb-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='font-bold text-lg'>EVENT PROPERTIES</h2>
            <button
              className=' px-3 py-1 rounded-md text-sm flex items-center'
              style={{
                background:
                  'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
            >
              <Edit size={16} className='mr-1' />
              Edit
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-y-6'>
            {/* Event Name */}
            <div>
              <p className='text-sm mb-1'>Event Name</p>
              <p className='font-medium'>{event.name}</p>
            </div>

            {/* Date */}
            <div>
              <p className='text-sm mb-1'>Date</p>
              <p className='font-medium'>{event.date}</p>
            </div>

            {/* Promoter */}
            <div>
              <p className='text-sm mb-1'>Promoter</p>
              <p className='font-medium'>{event.promoter}</p>
            </div>

            {/* Venue Name */}
            <div>
              <p className='text-sm mb-1'>Venue Name</p>
              <p className='font-medium'>{event.venueName}</p>
            </div>

            {/* Venue Address */}
            <div>
              <p className='text-sm mb-1'>Venue Address</p>
              <p className='font-medium'>{event.venueAddress}</p>
            </div>

            {/* Short Description */}
            <div className='md:col-span-2'>
              <p className='text-sm mb-1'>Short Description</p>
              <p className='font-medium'>{event.shortDescription}</p>
            </div>

            {/* Full Description */}
            <div className='md:col-span-2'>
              <p className='text-sm mb-1'>Full Description</p>
              <p className='font-medium'>{event.fullDescription}</p>
            </div>

            {/* Sanctioning Rules */}
            <div className='md:col-span-2'>
              <p className='text-sm mb-1'>Sanctioning Rules</p>
              <p className='font-medium'>{event.sanctioningRules}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
