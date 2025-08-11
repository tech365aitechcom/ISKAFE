'use client'
import React, { useState } from 'react'

function NoShowButton({ fighter, onNoShow }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const handleNoShow = async () => {
    const result = await onNoShow({
      checkInStatus: 'No Show',
      weighInDate: new Date().toISOString().split('T')[0],
      comments: `Marked as No Show on ${new Date().toLocaleDateString()}`,
    })
    if (result.success) {
      setIsConfirmOpen(false)
    }
  }

  if (fighter.checkInStatus === 'Checked In') {
    return null // Don't show No Show button if already checked in
  }

  return (
    <>
      <button
        onClick={() => setIsConfirmOpen(true)}
        className='bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-xs'
      >
        No Show
      </button>

      {isConfirmOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'>
          <div className='bg-[#0B1739] rounded-lg p-6 w-full max-w-md'>
            <h3 className='text-lg font-bold mb-4 text-red-400'>
              Mark as No Show?
            </h3>
            <p className='text-gray-300 mb-6'>
              Are you sure you want to mark {fighter.firstName}{' '}
              {fighter.lastName} as "No Show"? This action can be reversed
              later.
            </p>
            <div className='flex justify-end space-x-4'>
              <button
                onClick={() => setIsConfirmOpen(false)}
                className='bg-gray-600 px-4 py-2 rounded hover:bg-gray-700'
              >
                Cancel
              </button>
              <button
                onClick={handleNoShow}
                className='bg-red-600 px-4 py-2 rounded hover:bg-red-700'
              >
                Confirm No Show
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export default NoShowButton
