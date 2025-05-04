'use client'
import React, { useState } from 'react'
import FighterAndRankingTable from './FighterAndRankingTable'
import { rankings } from '../../../../../constants'

export const FighterAndRankingContainer = () => {
  const [showAddVenuesForm, setShowAddVenues] = useState(false)
  return (
    <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
      {showAddVenuesForm ? (
        <></>
      ) : (
        <>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-2xl font-semibold leading-8'>
              Fighter & Rankings
            </h2>
            {/* <button
              className='text-white px-4 py-2 rounded-md'
              style={{
                background:
                  'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
              onClick={() => setShowAddVenues(true)}
            >
              Create New
            </button> */}
          </div>{' '}
          <FighterAndRankingTable rankings={rankings} />
        </>
      )}
    </div>
  )
}
