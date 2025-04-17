import { useState } from 'react'
import { Search } from 'lucide-react'

export default function SelectFromList() {
  const [searchQuery, setSearchQuery] = useState('')

  const events = [
    'IKF Point Muay Thai and PBSC Point Boxing Sparring Seminar by Anthony Bui- Mexico (03/22/2025)',
    'ISCF Semi-Contact MMA Technical Bouts (03/29/2025)',
    'PBSC Point Boxing Sparring Circuit - Bishop, CA (03/29/2025)',
    'PBSC Point Boxing Sparring Circuit - Newport Beach 2025 (04/05/2025)',
    'Orlando IKF ALL DIVISIONS PKB/PMT (03/30/2025)',
    'IKF PKB and PBSC Point Boxing Sparring,Charlotte, NC (03/29/2025)',
    'PBSC Point Boxing Sparring Circuit - EVO Sport Expo 2025 (04/12/2025)',
    'PBSC Point Boxing Sparring Circuit - EVO Sport Expo 2025 (04/12/2025)',
    'PBSC Point Boxing Sparring Circuit - EVO Sport Expo 2025 (04/12/2025)',
    'IKF Semi-Contact Kickboxing & Muay Thai (04/13/2025)',
    'Fusion IKF Point Sparring Tournament (04/26/2025)',
    'IKF Point Muay Thai / Kickboxing And PBSC Point Boxing Sparring -Moncks, Corner- Sunday! (04/13/2025)',
    'IKF PKB and PBSC Point Boxing Sparring,Charlotte, NC (03/29/2025)',
    'PBSC Point Boxing Sparring Circuit - EVO Sport Expo 2025 (04/12/2025)',
  ]

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

      <div className='flex flex-wrap gap-4'>
        {events.map((event, index) => (
          <button
            key={index}
            className='bg-[#AEBFFF33] text-left p-2 rounded text-sm transition-colors duration-200 flex-grow min-w-min cursor-pointer'
            style={{ maxWidth: 'fit-content' }}
          >
            {event}
          </button>
        ))}
      </div>
    </div>
  )
}
