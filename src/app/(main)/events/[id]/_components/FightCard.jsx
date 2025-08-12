import React, { useState } from 'react'
import { Calendar, Clock, Trophy, Users, Eye } from 'lucide-react'
import moment from 'moment'

const FightCard = ({ eventDetails }) => {
  const [showFullDetails, setShowFullDetails] = useState({})

  const toggleDetails = (boutId) => {
    setShowFullDetails((prev) => ({
      ...prev,
      [boutId]: !prev[boutId],
    }))
  }

  // Check if event is Full-Contact format
  const isFullContactEvent = eventDetails?.format === 'Full Contact'

  if (!isFullContactEvent) {
    return (
      <div className='bg-[#1b0c2e] rounded-xl p-6 md:p-8 shadow-lg'>
        <h2 className='text-3xl font-bold text-yellow-500 mb-6 border-b border-yellow-700 pb-2'>
          Fight Card
        </h2>
        <div className='text-center py-8'>
          <p className='text-gray-300 text-lg'>
            Fight Card is not applicable for this event type. This feature is
            only available for Full-Contact events.
          </p>
        </div>
      </div>
    )
  }

  // Extract bouts from brackets
  const allBouts = []
  if (eventDetails?.brackets) {
    eventDetails.brackets.forEach((bracket) => {
      if (bracket.bouts && bracket.bouts.length > 0) {
        bracket.bouts.forEach((bout) => {
          allBouts.push({
            ...bout,
            bracketInfo: {
              divisionTitle: bracket.divisionTitle,
              ageClass: bracket.ageClass,
              sport: bracket.sport,
              ruleStyle: bracket.ruleStyle,
              ring: bracket.ring,
            },
          })
        })
      }
    })
  }

  if (allBouts.length === 0) {
    return (
      <div className='bg-[#1b0c2e] rounded-xl p-6 md:p-8 shadow-lg'>
        <h2 className='text-3xl font-bold text-yellow-500 mb-6 border-b border-yellow-700 pb-2'>
          Fight Card
        </h2>
        <div className='text-center py-8'>
          <p className='text-gray-300 text-lg'>
            No bouts scheduled yet. Bouts will appear here once brackets are
            published and matches are created.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-[#1b0c2e] rounded-xl p-6 md:p-8 shadow-lg'>
      <h2 className='text-3xl font-bold text-yellow-500 mb-6 border-b border-yellow-700 pb-2'>
        Fight Card
      </h2>

      <div className='space-y-6'>
        {allBouts.map((bout, index) => {
          const redCorner = bout.redCorner
          const blueCorner = bout.blueCorner
          const fight = bout.fights && bout.fights[0] // Get the first fight if exists
          const isCompleted = fight?.status === 'Completed'
          const winner = fight?.winner
          const judgeScores = fight?.judgeScores

          return (
            <div
              key={bout._id}
              className='bg-[#140b23] rounded-xl overflow-hidden shadow-lg'
            >
              {/* Header Section - Bout Number */}
              <div className='bg-black bg-opacity-30 px-6 py-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <Trophy className='w-5 h-5 text-yellow-400' />
                    <span className='text-white font-semibold'>
                      Bout #{bout.boutNumber}
                    </span>
                  </div>
                  <div className='text-sm text-gray-400'>
                    {bout.bracketInfo.divisionTitle} • {bout.bracketInfo.ring}
                  </div>
                </div>
              </div>

              {/* Main Fight Section */}
              <div className='px-8 py-8'>
                <div className='flex items-center justify-between'>
                  {/* Red Corner Fighter */}
                  <div className='flex items-center space-x-6'>
                    <div className='w-24 h-24 rounded-2xl overflow-hidden bg-gray-200 flex items-center justify-center'>
                      {redCorner?.profilePhoto ? (
                        <img
                          src={redCorner.profilePhoto}
                          alt={`${redCorner?.firstName} ${redCorner?.lastName}`}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg'>
                          {redCorner?.firstName?.[0]}
                          {redCorner?.lastName?.[0]}
                        </div>
                      )}
                    </div>
                    <div className='text-left'>
                      <h2 className='text-2xl font-bold text-white mb-1'>
                        {redCorner?.firstName} {redCorner?.lastName}
                      </h2>
                      <p className='text-gray-300 text-sm mb-1'>
                        {redCorner?.country}
                      </p>
                      <p className='text-gray-400 text-xs'>
                        {redCorner?.weightClass}
                      </p>
                    </div>
                  </div>

                  {/* VS Section & Weight Class */}
                  <div className='flex flex-col items-center mx-8'>
                    <div className='text-white text-3xl font-bold mb-2'>VS</div>
                    <div className='bg-gray-700 text-white px-4 py-2 rounded-lg text-sm text-center'>
                      {bout.weightClass?.min && bout.weightClass?.max
                        ? `${bout.weightClass.min}-${bout.weightClass.max} lbs`
                        : bout.bracketInfo.ageClass}
                    </div>
                    {bout.bracketInfo.sport && (
                      <div className='text-gray-400 text-xs mt-1'>
                        {bout.bracketInfo.sport} • {bout.bracketInfo.ruleStyle}
                      </div>
                    )}
                  </div>

                  {/* Blue Corner Fighter */}
                  <div className='flex items-center space-x-6'>
                    <div className='text-right'>
                      <h2 className='text-2xl font-bold text-white mb-1'>
                        {blueCorner?.firstName} {blueCorner?.lastName}
                      </h2>
                      <p className='text-gray-300 text-sm mb-1'>
                        {blueCorner?.country}
                      </p>
                      <p className='text-gray-400 text-xs'>
                        {blueCorner?.weightClass}
                      </p>
                    </div>
                    <div className='w-24 h-24 rounded-2xl overflow-hidden bg-gray-200 flex items-center justify-center'>
                      {blueCorner?.profilePhoto ? (
                        <img
                          src={blueCorner.profilePhoto}
                          alt={`${blueCorner?.firstName} ${blueCorner?.lastName}`}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg'>
                          {blueCorner?.firstName?.[0]}
                          {blueCorner?.lastName?.[0]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Result Section */}
              {isCompleted && (
                <div className='bg-black bg-opacity-20 px-8 py-4 border-t border-gray-600'>
                  <div className='mb-4'>
                    <h3 className='text-white font-semibold mb-3'>
                      Match Result
                    </h3>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-4'>
                        <div
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            winner?._id === redCorner?._id
                              ? 'bg-red-600 text-white'
                              : winner?._id === blueCorner?._id
                              ? 'bg-blue-600 text-white'
                              : 'bg-yellow-600 text-white'
                          }`}
                        >
                          {winner
                            ? `Winner: ${winner.firstName} ${winner.lastName}`
                            : 'Draw'}
                        </div>
                        {fight?.resultMethod && (
                          <div className='text-gray-300 text-sm'>
                            by {fight.resultMethod}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Judge Scorecard Section */}
              {isCompleted && judgeScores && (
                <div className='bg-black bg-opacity-20 px-8 py-4 border-t border-gray-600'>
                  <div className='mb-4'>
                    <h3 className='text-white font-semibold mb-3'>
                      Judge Scorecard Summary
                    </h3>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='bg-red-800 bg-opacity-30 rounded-lg p-3'>
                        <div className='text-red-300 text-sm mb-1'>
                          Red Corner
                        </div>
                        <div className='text-white font-bold'>
                          {judgeScores.red?.join(' - ') || 'N/A'}
                        </div>
                      </div>
                      <div className='bg-blue-800 bg-opacity-30 rounded-lg p-3'>
                        <div className='text-blue-300 text-sm mb-1'>
                          Blue Corner
                        </div>
                        <div className='text-white font-bold'>
                          {judgeScores.blue?.join(' - ') || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Match Status & Timing */}
              <div className='bg-black bg-opacity-20 px-8 py-4 border-t border-gray-600'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center space-x-4'>
                    <div
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        isCompleted
                          ? 'bg-green-600 text-white'
                          : 'bg-orange-600 text-white'
                      }`}
                    >
                      {isCompleted ? 'Completed' : 'Scheduled'}
                    </div>
                    {bout.startDate && (
                      <div className='flex items-center space-x-2 text-gray-300'>
                        <Calendar className='w-4 h-4' />
                        <span className='text-sm'>
                          {moment(bout.startDate).format('MMM DD, YYYY HH:mm')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* View Full Details */}
                  <div className='flex items-center space-x-4'>
                    <button
                      onClick={() => toggleDetails(bout._id)}
                      className='flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors'
                    >
                      <Eye className='w-4 h-4' />
                      <span>View Full Bout Details</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details Section */}
              {showFullDetails[bout._id] && (
                <div className='bg-black bg-opacity-40 px-8 py-6 border-t border-gray-600'>
                  <h3 className='text-white font-semibold mb-4'>
                    Detailed Information
                  </h3>
                  <div className='grid grid-cols-2 gap-6'>
                    <div className='space-y-3'>
                      <div className='text-gray-300'>
                        <span className='font-medium'>Bout Number:</span>{' '}
                        {bout.boutNumber}
                      </div>
                      <div className='text-gray-300'>
                        <span className='font-medium'>Sport:</span> {bout.sport}
                      </div>
                      <div className='text-gray-300'>
                        <span className='font-medium'>Rule Style:</span>{' '}
                        {bout.ruleStyle}
                      </div>
                      <div className='text-gray-300'>
                        <span className='font-medium'>Rounds:</span>{' '}
                        {bout.numberOfRounds || 'N/A'}
                      </div>
                    </div>
                    <div className='space-y-3'>
                      <div className='text-gray-300'>
                        <span className='font-medium'>Age Class:</span>{' '}
                        {bout.ageClass}
                      </div>
                      <div className='text-gray-300'>
                        <span className='font-medium'>Round Duration:</span>{' '}
                        {bout.roundDuration ? `${bout.roundDuration}s` : 'N/A'}
                      </div>
                      <div className='text-gray-300'>
                        <span className='font-medium'>Ring:</span>{' '}
                        {bout.bracketInfo.ring}
                      </div>
                      <div className='text-gray-300'>
                        <span className='font-medium'>Status:</span>{' '}
                        {isCompleted ? 'Completed' : 'Scheduled'}
                      </div>
                    </div>
                  </div>

                  {bout.notes && (
                    <div className='mt-4 pt-4 border-t border-gray-600'>
                      <h4 className='text-white font-medium mb-2'>Notes</h4>
                      <p className='text-gray-300 text-sm'>{bout.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FightCard
