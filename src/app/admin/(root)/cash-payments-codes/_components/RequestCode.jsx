'use client'
import React, { useState } from 'react'

export default function RequestCode({ onBack }) {
  const [activeButton, setActiveButton] = useState('fighter')

  const handleToggle = (button) => {
    setActiveButton(button)
  }

  const handleSubmit = () => {}

  return (
    <div className='text-white'>
      {/* Header with back button */}
      <div className='flex items-center gap-4 mb-6'>
        <button className='mr-2 text-white' onClick={onBack}>
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
        <h1 className='text-2xl font-bold'>Request Code</h1>
      </div>

      {/* Toggle buttons */}
      <div className='flex border border-[#343B4F] p-1 rounded-md w-fit mb-6'>
        <button
          onClick={() => handleToggle('fighter')}
          className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${
            activeButton === 'fighter' ? 'bg-[#2E3094] shadow-md' : ''
          }`}
        >
          Fighter
        </button>

        <button
          onClick={() => handleToggle('trainer')}
          className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${
            activeButton === 'trainer' ? 'bg-[#2E3094] shadow-md' : ''
          }`}
        >
          Trainer
        </button>
      </div>

      {/* Form Fields */}
      <form className='space-y-4' onSubmit={handleSubmit}>
        {/* Payer's Name Field */}
        <div>
          <label className='block text-sm mb-2'>Payer's Name</label>
          <input
            type='text'
            placeholder="Start Typing Payer's Name"
            className='w-full border border-[#343B4F] rounded-md p-2 text-[#AEB9E1] text-xs'
          />
        </div>

        {/* Amount Field */}
        <div className='bg-[#00000061] w-fit p-[8px] rounded-lg mb-6'>
          <label className='block text-sm text-gray-400'>
            Amount<span className='text-red-500'>*</span>
          </label>
          <div className='flex items-center'>
            <input
              type='text'
              className='bg-transparent text-white text-lg font-medium focus:outline-none'
              value='90 USD'
            />
          </div>
        </div>

        {/* Payment Description Notes */}
        <div className='bg-[#00000061] px-[8px] py-[4px] rounded-lg mb-6'>
          <label className='block text-sm text-gray-400'>
            Payment Description Notes
          </label>
          <div className='flex items-center'>
            <input
              type='text'
              className='bg-transparent text-white text-lg font-medium focus:outline-none'
              value='Message'
            />
          </div>
        </div>

        {/* Request Code Button */}
        <div className='pt-4 flex justify-center'>
          <button
            type='submit'
            className=' text-white font-medium px-6 py-2 rounded-md transition-colors'
            style={{
              background:
                'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
            }}
          >
            Request Code
          </button>
        </div>
      </form>
    </div>
  )
}
