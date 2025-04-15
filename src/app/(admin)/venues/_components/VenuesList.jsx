import React from 'react'
import { VenuesTable } from './VenuesTable'
import { venues } from '@/constants'

export const VenuesList = ({ setShowAddVenues }) => {
  return (
    <>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-semibold leading-8'>Venues</h2>
        <button
          className='text-white px-4 py-2 rounded-md cursor-pointer'
          style={{
            background:
              'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
          }}
          onClick={() => setShowAddVenues(true)}
        >
          Create New
        </button>
      </div>
      <VenuesTable venues={venues} />
    </>
  )
}
