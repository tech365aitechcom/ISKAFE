import React, { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon, Trophy, Users } from 'lucide-react'
import moment from 'moment'

const Tournament = ({ eventDetails }) => {
  const [selectedAgeClass, setSelectedAgeClass] = useState('')
  const [expandedBrackets, setExpandedBrackets] = useState({})
  const [filteredBrackets, setFilteredBrackets] = useState([])
  const [showBrackets, setShowBrackets] = useState(false)

  // Extract unique age classes from brackets
  const ageClasses = [
    ...new Set(
      eventDetails?.brackets?.map((bracket) => bracket.ageClass).filter(Boolean)
    ),
  ]

  const toggleBracket = (bracketId) => {
    setExpandedBrackets((prev) => ({
      ...prev,
      [bracketId]: !prev[bracketId],
    }))
  }

  const handleGetBrackets = () => {
    if (!eventDetails?.brackets) return

    let brackets = eventDetails.brackets

    // Filter by age class if selected
    if (selectedAgeClass) {
      brackets = brackets.filter(
        (bracket) => bracket.ageClass === selectedAgeClass
      )
    }

    setFilteredBrackets(brackets)
    setShowBrackets(true)
  }

  const getFighterTitle = (fighter) => {
    // Check if fighter has championship titles or ranks
    if (
      fighter.systemRecord === '0-0-0' &&
      fighter.skillLevel?.includes('Novice')
    ) {
      return null
    }
    // Add logic for championship titles if available in API
    return null
  }

  if (!eventDetails?.publishBrackets) {
    return (
      <div className='bg-[#1b0c2e] rounded-xl p-6 md:p-8 shadow-lg'>
        <h2 className='text-3xl font-bold text-yellow-500 mb-6 border-b border-yellow-700 pb-2'>
          Tournament Brackets
        </h2>
        <div className='text-center py-8'>
          <p className='text-gray-300 text-lg'>
            Tournament Brackets are not available for this event.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-[#1b0c2e] rounded-xl p-6 md:p-8 shadow-lg'>
      <h2 className='text-3xl font-bold text-yellow-500 mb-6 border-b border-yellow-700 pb-2'>
        Tournament Brackets
      </h2>

      {/* Event Header Info */}
      <div className='mb-8'>
        {/* Filter Section */}
        <div className='bg-[#140b23] rounded-lg p-6'>
          <div className='flex flex-col md:flex-row items-start md:items-end gap-4'>
            <div className='flex-1'>
              <label className='block text-white font-medium mb-2'>
                Age Class Filter (Optional)
              </label>
              <select
                value={selectedAgeClass}
                onChange={(e) => setSelectedAgeClass(e.target.value)}
                className='w-full bg-gray-700 text-white px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 border border-gray-600'
              >
                <option value=''>Select Age Class</option>
                {ageClasses.map((ageClass) => (
                  <option key={ageClass} value={ageClass}>
                    {ageClass}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleGetBrackets}
              className='px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors flex items-center space-x-2'
            >
              <Trophy className='w-4 h-4' />
              <span>Get Brackets</span>
            </button>
          </div>
        </div>
      </div>

      {/* Brackets Display */}
      {showBrackets && (
        <div className='space-y-4'>
          {filteredBrackets.length === 0 ? (
            <div className='text-center py-8'>
              <p className='text-gray-300 text-lg'>
                No brackets found for the selected criteria.
              </p>
            </div>
          ) : (
            filteredBrackets.map((bracket) => (
              <div
                key={bracket._id}
                className='bg-[#140b23] rounded-lg overflow-hidden shadow-lg'
              >
                {/* Bracket Header */}
                <div
                  className='px-6 py-4 bg-black bg-opacity-30 cursor-pointer hover:bg-opacity-40 transition-colors'
                  onClick={() => toggleBracket(bracket._id)}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-4'>
                      <div className='flex items-center space-x-2'>
                        <Trophy className='w-5 h-5 text-yellow-400' />
                        <span className='text-white font-semibold'>
                          Bracket #{bracket.bracketNumber}
                        </span>
                      </div>
                      <div className='text-yellow-400 font-medium'>
                        {bracket.weightClass?.min && bracket.weightClass?.max
                          ? `${bracket.weightClass.min} - ${bracket.weightClass.max} lbs`
                          : bracket.divisionTitle}
                      </div>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <div className='text-gray-300 text-sm'>
                        {bracket.fighters?.length || 0} fighters
                      </div>
                      {expandedBrackets[bracket._id] ? (
                        <ChevronUpIcon className='w-5 h-5 text-gray-400' />
                      ) : (
                        <ChevronDownIcon className='w-5 h-5 text-gray-400' />
                      )}
                    </div>
                  </div>

                  {/* Bracket Info */}
                  <div className='mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-400'>
                    <span className='bg-gray-700 px-3 py-1 rounded'>
                      {bracket.ruleStyle || bracket.sport}
                    </span>
                    <span className='bg-gray-700 px-3 py-1 rounded'>
                      {bracket.ageClass} • {bracket.proClass}
                    </span>
                    {bracket.group && (
                      <span className='bg-gray-700 px-3 py-1 rounded'>
                        {bracket.group}
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        bracket.status === 'Open'
                          ? 'bg-green-600 text-white'
                          : bracket.status === 'Started'
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {bracket.status}
                    </span>
                  </div>
                </div>

                {/* Expanded Bracket Content */}
                {expandedBrackets[bracket._id] && (
                  <div className='px-6 py-6 border-t border-gray-700'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      {/* Bracket Details */}
                      <div>
                        <h4 className='text-white font-semibold mb-4'>
                          Bracket Information
                        </h4>
                        <div className='space-y-3'>
                          <div className='text-gray-300'>
                            <span className='font-medium'>Division:</span>{' '}
                            {bracket.divisionTitle}
                          </div>
                          <div className='text-gray-300'>
                            <span className='font-medium'>Sport:</span>{' '}
                            {bracket.sport}
                          </div>
                          <div className='text-gray-300'>
                            <span className='font-medium'>Rule Style:</span>{' '}
                            {bracket.ruleStyle}
                          </div>
                          {bracket.ring && (
                            <div className='text-gray-300'>
                              <span className='font-medium'>Ring:</span>{' '}
                              {bracket.ring}
                            </div>
                          )}
                          {bracket.fightStartTime && (
                            <div className='text-gray-300'>
                              <span className='font-medium'>Fight Start:</span>{' '}
                              {moment(bracket.fightStartTime).format(
                                'MMM DD, YYYY HH:mm'
                              )}
                            </div>
                          )}
                          {bracket.weighInTime && (
                            <div className='text-gray-300'>
                              <span className='font-medium'>Weigh-in:</span>{' '}
                              {moment(bracket.weighInTime).format(
                                'MMM DD, YYYY HH:mm'
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Fighter Seeding */}
                      <div>
                        <h4 className='text-white font-semibold mb-4 flex items-center space-x-2'>
                          <Users className='w-4 h-4' />
                          <span>Fighter Seeding</span>
                        </h4>
                        {bracket.fighters && bracket.fighters.length > 0 ? (
                          <div className='space-y-3'>
                            {bracket.fighters.map((fighterItem, index) => {
                              // Handle new structure where fighter might be {fighter: {...}, seed: number}
                              const fighter = fighterItem.fighter || fighterItem
                              const seed = fighterItem.seed || index + 1
                              const fighterTitle = getFighterTitle(fighter)
                              return (
                                <div
                                  key={fighter._id}
                                  className='bg-gray-800 rounded-lg p-3'
                                >
                                  <div className='flex items-center justify-between'>
                                    <div className='flex items-center space-x-3'>
                                      <div className='w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm'>
                                        {seed}
                                      </div>
                                      <div>
                                        <div className='text-white font-medium'>
                                          {fighter.createdBy?.fighterProfile ? (
                                            <a
                                              href={`/fighters/${fighter.createdBy.fighterProfile._id}`}
                                              target='_blank'
                                              rel='noopener noreferrer'
                                              className='text-yellow-400 hover:text-yellow-300 transition-colors'
                                            >
                                              Seed {index + 1}:{' '}
                                              {fighter.firstName}{' '}
                                              {fighter.lastName}
                                            </a>
                                          ) : (
                                            <span>
                                              Seed {index + 1}:{' '}
                                              {fighter.firstName}{' '}
                                              {fighter.lastName}
                                            </span>
                                          )}
                                        </div>
                                        <div className='text-gray-400 text-sm'>
                                          {fighter.country} •{' '}
                                          {fighter.weightClass}
                                        </div>
                                        {fighterTitle && (
                                          <div className='text-yellow-400 text-xs font-medium mt-1'>
                                            🏆 {fighterTitle}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {fighter.createdBy?.fighterProfile && (
                                      <a
                                        href={`/fighters/${fighter.createdBy.fighterProfile._id}`}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-blue-400 hover:text-blue-300 text-sm font-medium'
                                      >
                                        View Profile →
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className='text-gray-400 text-center py-4'>
                            No fighters registered yet
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Initial State Message */}
      {!showBrackets && (
        <div className='text-center py-8'>
          <div className='bg-[#140b23] rounded-lg p-8'>
            <Trophy className='w-16 h-16 text-yellow-500 mx-auto mb-4' />
            <h3 className='text-xl font-semibold text-white mb-2'>
              Tournament Brackets
            </h3>
            <p className='text-gray-300 mb-6'>
              View all tournament brackets and fighter seeding for this event.
              Use the filter above to narrow down by age class, then click "Get
              Brackets" to view.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tournament
