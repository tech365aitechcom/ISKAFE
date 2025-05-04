'use client'

import { useState } from 'react'

export default function BracketCard({ fighter1, fighter2, roundNumber }) {
  const [isToggled, setIsToggled] = useState(false)

  const handleToggle = () => {
    setIsToggled((prevState) => !prevState)
  }

  return (
    <div className='relative flex flex-col items-center w-full text-white font-sans'>
      {/* Round Box */}
      <div className='relative z-10 flex flex-col items-center justify-center border border-[#8C8C8C] rounded-xl px-6 py-4 shadow-lg'>
        <div className='text-center mb-1 font-semibold'>
          Round {roundNumber}
        </div>
        <div className='flex items-center gap-2'>
          <span>Bout</span>
          <div
            className={`w-10 h-5 ${
              isToggled ? 'bg-[#2E3094]' : 'bg-transparent border border-white'
            } rounded-full relative`}
            onClick={handleToggle}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
                isToggled ? 'left-5' : 'left-1'
              }`}
            />
          </div>
        </div>
        <button
          className='mt-2 px-4 py-1 text-white rounded-md text-sm disabled:cursor-not-allowed disabled:bg-[#3F3F3F]'
          style={
            isToggled
              ? {
                  background:
                    'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
                }
              : { background: '#3F3F3F', opacity: 0.5 }
          }
          disabled={!isToggled}
        >
          Declare Decision
        </button>
      </div>

      <div className='relative w-full h-12 flex items-center justify-center'>
        <div className='absolute top-0 w-0.5 h-8 bg-[#8C8C8C]'></div>
        <div className='absolute top-8 w-64 h-16 flex justify-between items-start'>
          <div className='w-0.5 h-8 bg-[#8C8C8C]' />
          <div className='w-0.5 h-8 bg-[#8C8C8C]' />
          <div className='absolute top-0 left-0 right-0 h-0.5 bg-[#8C8C8C]' />
        </div>
      </div>

      <div className='grid grid-cols-2 gap-20 mt-4 z-10'>
        {[fighter1, fighter2].map((fighter, idx) => (
          <div key={idx} className='text-center'>
            <img
              src={fighter.src}
              alt={fighter.name}
              className='w-60 h-60 object-cover border border-[#D9E2F930]'
            />
            <div className='mt-2 text-lg font-semibold'>{fighter.name}</div>
            <div>Age: {fighter.age} yrs</div>
          </div>
        ))}
      </div>
    </div>
  )
}
