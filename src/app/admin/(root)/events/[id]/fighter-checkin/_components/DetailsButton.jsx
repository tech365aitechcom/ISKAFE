'use client'
import React, { useState } from 'react'

function DetailsButton({ fighter }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className='bg-green-600 px-3 py-1 rounded hover:bg-green-700'
      >
        Details
      </button>

      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-800/30'>
          <div className='bg-[#0B1739] rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-bold'>
                {fighter.firstName} {fighter.lastName} - Profile Details
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className='text-gray-400 hover:text-white text-2xl'
              >
                ×
              </button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Personal Information */}
              <div>
                <h3 className='font-bold mb-2 text-blue-400'>
                  Personal Information
                </h3>
                <div className='space-y-2 text-sm'>
                  <div>
                    <span className='text-gray-400'>Name:</span>{' '}
                    {fighter.firstName} {fighter.lastName}
                  </div>
                  <div>
                    <span className='text-gray-400'>Gender:</span>{' '}
                    {fighter.gender || 'N/A'}
                  </div>
                  <div>
                    <span className='text-gray-400'>Date of Birth:</span>{' '}
                    {fighter.dateOfBirth
                      ? new Date(fighter.dateOfBirth).toLocaleDateString()
                      : 'N/A'}
                  </div>
                  <div>
                    <span className='text-gray-400'>Age:</span>{' '}
                    {fighter.dateOfBirth
                      ? new Date().getFullYear() -
                        new Date(fighter.dateOfBirth).getFullYear()
                      : 'N/A'}
                  </div>
                  <div>
                    <span className='text-gray-400'>Email:</span>{' '}
                    {fighter.email}
                  </div>
                  <div>
                    <span className='text-gray-400'>Phone:</span>{' '}
                    {fighter.phoneNumber}
                  </div>
                </div>
              </div>

              {/* Physical Attributes */}
              <div>
                <h3 className='font-bold mb-2 text-blue-400'>
                  Physical Attributes
                </h3>
                <div className='space-y-2 text-sm'>
                  <div>
                    <span className='text-gray-400'>Height:</span>{' '}
                    {fighter.height} {fighter.heightUnit || 'inches'}
                  </div>
                  <div>
                    <span className='text-gray-400'>Weight:</span>{' '}
                    {fighter.walkAroundWeight} {fighter.weightUnit}
                  </div>
                  <div>
                    <span className='text-gray-400'>Weight Class:</span>{' '}
                    {fighter.weightClass || 'N/A'}
                  </div>
                  <div>
                    <span className='text-gray-400'>Skill Level:</span>{' '}
                    {fighter.skillLevel || 'N/A'}
                  </div>
                  <div>
                    <span className='text-gray-400'>Rule Style:</span>{' '}
                    {fighter.ruleStyle || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Training Information */}
              <div>
                <h3 className='font-bold mb-2 text-blue-400'>
                  Training Information
                </h3>
                <div className='space-y-2 text-sm'>
                  <div>
                    <span className='text-gray-400'>Gym:</span>{' '}
                    {fighter.gymName || 'N/A'}
                  </div>
                  <div>
                    <span className='text-gray-400'>Trainer:</span>{' '}
                    {fighter.trainerName || 'N/A'}
                  </div>
                  <div>
                    <span className='text-gray-400'>Trainer Phone:</span>{' '}
                    {fighter.trainerPhone || 'N/A'}
                  </div>
                  <div>
                    <span className='text-gray-400'>Trainer Email:</span>{' '}
                    {fighter.trainerEmail || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Fighter Details */}
              <div>
                <h3 className='font-bold mb-2 text-blue-400'>
                  Fighter Details
                </h3>
                <div className='space-y-2 text-sm'>
                  <div>
                    <span className='text-gray-400'>Professional:</span>{' '}
                    {fighter.proFighter ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <span className='text-gray-400'>Paid to Fight:</span>{' '}
                    {fighter.paidToFight ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <span className='text-gray-400'>System Record:</span>{' '}
                    {fighter.systemRecord || 'N/A'}
                  </div>
                  <div>
                    <span className='text-gray-400'>Additional Records:</span>{' '}
                    {fighter.additionalRecords || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Payment & Legal */}
              <div>
                <h3 className='font-bold mb-2 text-blue-400'>
                  Payment & Legal
                </h3>
                <div className='space-y-2 text-sm'>
                  <div>
                    <span className='text-gray-400'>Payment Method:</span>{' '}
                    {fighter.paymentMethod || 'N/A'}
                  </div>
                  {fighter.cashCode && (
                    <div>
                      <span className='text-gray-400'>Cash Code:</span>{' '}
                      {fighter.cashCode}
                    </div>
                  )}
                  <div>
                    <span className='text-gray-400'>Adult Registration:</span>{' '}
                    {fighter.isAdult ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <span className='text-gray-400'>Legal Disclaimer:</span>{' '}
                    {fighter.legalDisclaimerAccepted
                      ? 'Accepted'
                      : 'Not Accepted'}
                  </div>
                </div>
              </div>

              {/* Admin Information */}
              <div>
                <h3 className='font-bold mb-2 text-blue-400'>
                  Admin Information
                </h3>
                <div className='space-y-2 text-sm'>
                  <div>
                    <span className='text-gray-400'>Status:</span>{' '}
                    {fighter.status || 'Pending'}
                  </div>
                  <div>
                    <span className='text-gray-400'>Registration Date:</span>{' '}
                    {fighter.createdAt
                      ? new Date(fighter.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </div>
                  <div>
                    <span className='text-gray-400'>Check-in Status:</span>{' '}
                    {fighter.checkInStatus || 'Not Checked'}
                  </div>
                </div>
              </div>
            </div>

            <div className='flex justify-end mt-6'>
              <button
                onClick={() => setIsModalOpen(false)}
                className='bg-blue-600 px-4 py-2 rounded hover:bg-blue-700'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DetailsButton
