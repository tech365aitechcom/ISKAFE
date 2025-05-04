'use client'
import React, { useState } from 'react'
import { AddVenuesForm } from './AddVenuesForm'
import { VenuesList } from './VenuesList'

export const VenueContainer = () => {
  const [showAddVenuesForm, setShowAddVenues] = useState(false)
  return (
    <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
      {showAddVenuesForm ? (
        <AddVenuesForm setShowAddVenues={setShowAddVenues} />
      ) : (
        <VenuesList setShowAddVenues={setShowAddVenues} />
      )}
    </div>
  )
}
