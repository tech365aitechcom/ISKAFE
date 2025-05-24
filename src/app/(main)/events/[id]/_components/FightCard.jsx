import React, { useState } from 'react'
import { Calendar, Clock, Trophy, Users, Eye } from 'lucide-react'

const FightCard = () => {
  const [matchResult, setMatchResult] = useState('')
  const [judgeScores, setJudgeScores] = useState({
    judge1: '',
    judge2: '',
    judge3: '',
  })
  const [matchStatus, setMatchStatus] = useState('Scheduled')
  const [showFullDetails, setShowFullDetails] = useState(false)

  // Sample fight data based on requirements
  const fightData = {
    boutNumber: 1,
    fighterA: {
      name: 'Jacob Smith',
      image: '/api/placeholder/96/96',
      gym: 'House of Fighters',
    },
    fighterB: {
      name: 'Ethan Johnson',
      image: '/api/placeholder/96/96',
      gym: 'Brave Boxing Club',
    },
    weightClass: 'Featherweight',
    matchDate: '30-04-2024',
    startTime: '3d 6h 10m',
  }

  const handleResultChange = (result) => {
    setMatchResult(result)
  }

  const handleJudgeScoreChange = (judge, score) => {
    setJudgeScores((prev) => ({
      ...prev,
      [judge]: score,
    }))
  }

  return (
    <div className='max-w-6xl mx-auto bg-[#1b0c2e] rounded-2xl overflow-hidden shadow-2xl'>
      {/* Header Section - Bout Number */}
      <div className='bg-black bg-opacity-30 px-6 py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Trophy className='w-5 h-5 text-yellow-400' />
            <span className='text-white font-semibold'>
              Bout #{fightData.boutNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Main Fight Section */}
      <div className='px-8 py-8'>
        <div className='flex items-center justify-between'>
          {/* Fighter A */}
          <div className='flex items-center space-x-6'>
            <div className='w-24 h-24 rounded-2xl overflow-hidden bg-gray-200'>
              <img
                src={fightData.fighterA.image}
                alt={fightData.fighterA.name}
                className='w-full h-full object-cover'
              />
            </div>
            <div className='text-left'>
              <h2 className='text-2xl font-bold text-white mb-1'>
                {fightData.fighterA.name}
              </h2>
              <p className='text-gray-300 text-sm mb-2'>
                {fightData.fighterA.gym}
              </p>
            </div>
          </div>

          {/* VS Section & Weight Class */}
          <div className='flex flex-col items-center mx-8'>
            <div className='text-white text-3xl font-bold mb-2'>VS</div>
            <div className='bg-gray-700 text-white px-4 py-2 rounded-lg text-sm'>
              {fightData.weightClass}
            </div>
          </div>

          {/* Fighter B */}
          <div className='flex items-center space-x-6'>
            <div className='text-right'>
              <h2 className='text-2xl font-bold text-white mb-1'>
                {fightData.fighterB.name}
              </h2>
              <p className='text-gray-300 text-sm mb-2'>
                {fightData.fighterB.gym}
              </p>
            </div>
            <div className='w-24 h-24 rounded-2xl overflow-hidden bg-gray-200'>
              <img
                src={fightData.fighterB.image}
                alt={fightData.fighterB.name}
                className='w-full h-full object-cover'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Match Result Section */}
      <div className='bg-black bg-opacity-20 px-8 py-4 border-t border-gray-600'>
        <div className='mb-4'>
          <h3 className='text-white font-semibold mb-3'>Match Result</h3>
          <div className='flex space-x-4'>
            <button
              onClick={() => handleResultChange('Winner')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                matchResult === 'Winner'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Winner
            </button>
            <button
              onClick={() => handleResultChange('Draw')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                matchResult === 'Draw'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Draw
            </button>
            <button
              onClick={() => handleResultChange('Fighter Name or Draw')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                matchResult === 'Fighter Name or Draw'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Fighter Name or Draw
            </button>
          </div>
        </div>
      </div>

      {/* Judge Scorecard Section */}
      <div className='bg-black bg-opacity-20 px-8 py-4 border-t border-gray-600'>
        <div className='mb-4'>
          <h3 className='text-white font-semibold mb-3'>
            Judge Scorecard Summary
          </h3>
          <div className='grid grid-cols-3 gap-4'>
            {[1, 2, 3].map((judgeNum) => (
              <div key={judgeNum} className='bg-gray-700 rounded-lg p-3'>
                <label className='block text-gray-300 text-sm mb-1'>
                  Judge {judgeNum}
                </label>
                <input
                  type='text'
                  placeholder='29-28'
                  value={judgeScores[`judge${judgeNum}`]}
                  onChange={(e) =>
                    handleJudgeScoreChange(`judge${judgeNum}`, e.target.value)
                  }
                  className='w-full bg-gray-600 text-white px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Match Status & Timing */}
      <div className='bg-black bg-opacity-20 px-8 py-4 border-t border-gray-600'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h3 className='text-white font-semibold mb-2'>Match Status</h3>
            <select
              value={matchStatus}
              onChange={(e) => setMatchStatus(e.target.value)}
              className='bg-gray-700 text-white px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='Scheduled'>Scheduled</option>
              <option value='Ongoing'>Ongoing</option>
              <option value='Completed'>Completed</option>
            </select>
          </div>
          <div className='text-center'>
            <p className='text-white text-lg font-semibold'>
              Starts in:{' '}
              <span className='text-orange-400'>{fightData.startTime}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className='bg-black bg-opacity-30 px-8 py-4'>
        <div className='flex items-center justify-between'>
          {/* Date */}
          <div className='flex items-center space-x-2 text-gray-300'>
            <Calendar className='w-5 h-5' />
            <span className='text-sm'>{fightData.matchDate}</span>
          </div>

          {/* Timer */}
          <div className='flex items-center space-x-2 text-gray-300'>
            <Clock className='w-5 h-5' />
            <span className='text-sm'>Time & Status: {matchStatus}</span>
          </div>

          {/* View Full Details */}
          <div className='flex items-center space-x-4'>
            <button
              onClick={() => setShowFullDetails(!showFullDetails)}
              className='flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors'
            >
              <Eye className='w-4 h-4' />
              <span>View Full Bout Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details Section */}
      {showFullDetails && (
        <div className='bg-black bg-opacity-40 px-8 py-6 border-t border-gray-600'>
          <h3 className='text-white font-semibold mb-4'>
            Detailed Information
          </h3>
          <div className='grid grid-cols-2 gap-6'>
            <div className='space-y-3'>
              <div className='text-gray-300'>
                <span className='font-medium'>Bout Number:</span>{' '}
                {fightData.boutNumber}
              </div>
              <div className='text-gray-300'>
                <span className='font-medium'>Weight Class:</span>{' '}
                {fightData.weightClass}
              </div>
              <div className='text-gray-300'>
                <span className='font-medium'>Match Result:</span>{' '}
                {matchResult || 'TBD'}
              </div>
            </div>
            <div className='space-y-3'>
              <div className='text-gray-300'>
                <span className='font-medium'>Fighter A:</span>{' '}
                {fightData.fighterA.name} ({fightData.fighterA.gym})
              </div>
              <div className='text-gray-300'>
                <span className='font-medium'>Fighter B:</span>{' '}
                {fightData.fighterB.name} ({fightData.fighterB.gym})
              </div>
              <div className='text-gray-300'>
                <span className='font-medium'>Status:</span> {matchStatus}
              </div>
            </div>
          </div>

          {/* Judge Scores Summary */}
          <div className='mt-4 pt-4 border-t border-gray-600'>
            <h4 className='text-white font-medium mb-2'>
              Judge Scores Summary
            </h4>
            <div className='flex space-x-4 text-gray-300 text-sm'>
              <span>Judge 1: {judgeScores.judge1 || 'N/A'}</span>
              <span>Judge 2: {judgeScores.judge2 || 'N/A'}</span>
              <span>Judge 3: {judgeScores.judge3 || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FightCard
