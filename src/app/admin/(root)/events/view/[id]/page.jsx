'use client'
import React, { useEffect, useState } from 'react'
import { ChevronDown, Edit, Pencil } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { API_BASE_URL} from "../../../../../../constants"
import Loader from "../../../../../_components/Loader"

export default function EventDetailsPage() {
  const params = useParams()
  const [eventId, setEventId] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    if (params?.id) {
      setEventId(params.id)
      fetchEventData(params.id)
    }
  }, [params])

  const fetchEventData = async (id) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/events/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch event data')
      }
      const data = await response.json()
      if (data.success) {
        setEvent(data.data)
      } else {
        throw new Error(data.message || 'Error fetching event')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

    const formatAddress = (address) => {
    if (!address) return 'N/A';
    if (typeof address === 'string') return address;
    
    const { street1, street2, city, state, postalCode, country } = address;
    return [
      street1,
      street2,
      `${city}, ${state} ${postalCode}`,
      country
    ].filter(Boolean).join(', ');
  }

   if (loading) {
    return (
      <div className='flex items-center justify-center h-screen w-full bg-[#07091D]'>
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-white p-8 flex justify-center">
        <div className="bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-white p-8 flex justify-center">
        <div className="bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full">
          <p>Event not found</p>
        </div>
      </div>
    )
  }

  // Format the event data to match your component's structure
 const formattedEvent = {
    name: event.name,
    date: new Date(event.startDate).toLocaleDateString('en-US'),
    promoter: event.promoter?.userId?.name || 'N/A',
    venueName: event.venue?.name || 'N/A',
    venueAddress: formatAddress(event.venue?.address),
    shortDescription: event.briefDescription || 'N/A',
    fullDescription: event.fullDescription || 'N/A',
    sanctioningRules: event.sectioningBodyName || 'N/A',
    stats: {
      bracketCount: {
        value: 0, // You'll need to get this from your data
        breakdown: 'No breakdown available',
      },
      boutCount: {
        value: 0, // You'll need to get this from your data
        breakdown: 'No breakdown available',
      },
      registrationFee: {
        fighter: '$0', // You'll need to get this from your data
        trainer: '$0', // You'll need to get this from your data
        breakdown: 'No breakdown available',
      },
      participants: {
        value: event.registeredParticipants || 0,
        breakdown: `Fighters: ${event.registeredFighters?.length || 0}`,
      },
    },
  }


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
            <h1 className='text-2xl font-bold'>{formattedEvent.name}</h1>
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
                {formattedEvent.stats.bracketCount.value}
              </h2>
              <p className='text-sm text-[#AEB9E1] mt-2 whitespace-pre-line'>
                {formattedEvent.stats.bracketCount.breakdown}
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
                {formattedEvent.stats.boutCount.value}
              </h2>
              <p className='text-sm text-[#AEB9E1] mt-2 whitespace-pre-line'>
                {formattedEvent.stats.boutCount.breakdown}
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
                <span>{formattedEvent.stats.registrationFee.fighter}</span>
                <span className='text-sm'>/Fighter</span>
                <span className='ml-2'>
                  {formattedEvent.stats.registrationFee.trainer}
                </span>
                <span className='text-sm'>/Trainer</span>
              </h2>
              <p className='text-sm text-[#AEB9E1] mt-2 whitespace-pre-line'>
                {formattedEvent.stats.registrationFee.breakdown}
              </p>
            </div>
          </div>

          {/* Participants */}
          <div className='border border-[#343B4F] rounded-lg p-4 relative'>
            <div className='flex justify-between items-start'>
              <span className='text-sm text-[#AEB9E1]'>Participants</span>
              
            </div>
            <div className='mt-2'>
              <h2 className='text-2xl font-bold'>
                {formattedEvent.stats.participants.value}
              </h2>
              <p className='text-sm text-[#AEB9E1] mt-2 whitespace-pre-line'>
                {formattedEvent.stats.participants.breakdown}
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
              <p className='font-medium'>{formattedEvent.name}</p>
            </div>

            {/* Date */}
            <div>
              <p className='text-sm mb-1'>Date</p>
              <p className='font-medium'>{formattedEvent.date}</p>
            </div>

            {/* Promoter */}
            <div>
              <p className='text-sm mb-1'>Promoter</p>
              <p className='font-medium'>{formattedEvent.promoter}</p>
            </div>

            {/* Venue Name */}
            <div>
              <p className='text-sm mb-1'>Venue Name</p>
              <p className='font-medium'>{formattedEvent.venueName}</p>
            </div>

            {/* Venue Address */}
            <div>
              <p className='text-sm mb-1'>Venue Address</p>
              <p className='font-medium'>{formattedEvent.venueAddress}</p>
            </div>

            {/* Short Description */}
            <div className='md:col-span-2'>
              <p className='text-sm mb-1'>Short Description</p>
              <p className='font-medium'>{formattedEvent.shortDescription}</p>
            </div>

            {/* Full Description */}
            <div className='md:col-span-2'>
              <p className='text-sm mb-1'>Full Description</p>
              <p className='font-medium'>{formattedEvent.fullDescription}</p>
            </div>

            {/* Sanctioning Rules */}
            <div className='md:col-span-2'>
              <p className='text-sm mb-1'>Sanctioning Rules</p>
              <p className='font-medium'>{formattedEvent.sanctioningRules}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}