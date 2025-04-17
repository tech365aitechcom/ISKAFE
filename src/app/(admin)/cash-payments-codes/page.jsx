'use client'

import { useState } from 'react'
import SelectFromList from './_components/SelectFromList'
import SpecifyEventID from './_components/SpecifyEventID'

export default function CashPaymentAndCodesPage() {
  const [activeButton, setActiveButton] = useState('select')

  const handleToggle = (button) => {
    setActiveButton(button)
  }

  return (
    <div className=' text-white p-8 flex justify-center relative overflow-hidden'>
      <div
        className='absolute -left-10 top-1/2 transform -translate-y-1/2 w-60 h-96 rounded-full opacity-70 blur-xl'
        style={{
          background:
            'linear-gradient(317.9deg, #6F113E 13.43%, rgba(111, 17, 62, 0) 93.61%)',
        }}
      ></div>
      <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-semibold leading-8'>
            Cash Payments & Codes
          </h2>
          <button
            className='text-white px-4 py-2 rounded-md'
            style={{
              background:
                'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
            }}
          >
            Request Code
          </button>
        </div>
        <div className='flex bg-blue-950 p-1 rounded-md w-fit'>
          <button
            onClick={() => handleToggle('select')}
            className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors cursor-pointer ${
              activeButton === 'select' ? 'bg-[#2E3094] shadow-md' : ''
            }`}
          >
            Select From List
          </button>

          <button
            onClick={() => handleToggle('specify')}
            className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors cursor-pointer ${
              activeButton === 'specify' ? 'bg-[#2E3094] shadow-md' : ''
            }`}
          >
            Specify Event ID
          </button>
        </div>
        {activeButton === 'select' ? <SelectFromList /> : <SpecifyEventID />}
      </div>
    </div>
  )
}
