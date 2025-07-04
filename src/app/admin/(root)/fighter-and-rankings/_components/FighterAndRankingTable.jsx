'use client'

import { ChevronDown, Eye, NotebookPen, SquarePen } from 'lucide-react'
import { useState } from 'react'

export default function FighterAndRankingTable({ rankings }) {
  const [classification, setClassification] = useState('Amateur')
  const [sport, setSport] = useState('Kickboxing')
  const [weightClass, setWeightClass] = useState('')
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')
  const [isApproved, setIsApproved] = useState(false)

  const toggleSwitch = (eventId) => {
    setIsApproved((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }))
  }

  const handleResetFilter = () => {
    setWeightClass('')
    setSport('Kickboxing')
    setClassification('Amateur')
    setCountry('')
    setState('')
  }

  const renderHeader = (label, key) => (
    <th
      className='px-4 pb-3 whitespace-nowrap cursor-pointer'
      //   onClick={() => handleSort(key)}
    >
      <div className='flex items-center gap-1'>
        {label}
        {/* <ChevronsUpDown className='w-4 h-4 text-gray-400' /> */}
      </div>
    </th>
  )

  // Sport options data
  const sportOptions = [
    'Kickboxing',
    'Boxing',
    'Muay Thai',
    'MMA',
    'Karate',
    'Taekwondo'
  ]

  // Weight class options data
  const weightClassOptions = [
    'Flyweight',
    'Bantamweight',
    'Featherweight',
    'Lightweight',
    'Welterweight',
    'Middleweight',
    'Light Heavyweight',
    'Heavyweight',
    'Super Heavyweight'
  ]

  // Country and state options data
  const countryOptions = ['USA', 'Brazil', 'Thailand', 'Netherlands', 'Japan', 'UK']
  const stateOptions = ['California', 'Florida', 'Texas', 'New York', 'Nevada']

  return (
    <div className=''>
      <div className='flex items-center gap-4'>
        <div className='flex flex-wrap gap-4'>
          {/* Classification Filter */}
          <div className='relative w-64 mb-4'>
            <label
              htmlFor='pro-classification'
              className='block mb-2 text-sm font-medium text-white'
            >
              Select Classification
            </label>
            <div className='relative flex items-center justify-between w-full px-4 py-2 border border-gray-700 rounded-lg'>
              <select
                id='pro-classification'
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                className='w-full bg-transparent text-white appearance-none outline-none cursor-pointer'
              >
                <option value='Pro' className='text-black'>
                  Pro
                </option>
                <option value='Semi Pro' className='text-black'>
                  Semi Pro
                </option>
                <option value='Amateur' className='text-black'>
                  Amateur
                </option>
              </select>
              <ChevronDown
                size={16}
                className='absolute right-4 pointer-events-none'
              />
            </div>
          </div>

          {/* Sport Filter - Fixed with correct options */}
          <div className='relative w-64 mb-4'>
            <label
              htmlFor='sport'
              className='block mb-2 text-sm font-medium text-white'
            >
              Select Sport
            </label>
            <div className='relative flex items-center justify-between w-full px-4 py-2 border border-gray-700 rounded-lg'>
              <select
                id='sport'
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className='w-full bg-transparent text-white appearance-none outline-none cursor-pointer'
              >
                {sportOptions.map((sport) => (
                  <option key={sport} value={sport} className='text-black'>
                    {sport}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className='absolute right-4 pointer-events-none'
              />
            </div>
          </div>

          {/* Weight Class Filter */}
          <div className='relative w-64 mb-4'>
            <label
              htmlFor='weightClass'
              className='block mb-2 text-sm font-medium text-white'
            >
              Select Weight Class
            </label>
            <div className='relative flex items-center justify-between w-full px-4 py-2 border border-gray-700 rounded-lg'>
              <select
                id='weightClass'
                value={weightClass}
                onChange={(e) => setWeightClass(e.target.value)}
                className='w-full bg-transparent text-white appearance-none outline-none cursor-pointer'
              >
                <option value='' className='text-black'>
                  All Weight Classes
                </option>
                {weightClassOptions.map((weightClass) => (
                  <option key={weightClass} value={weightClass} className='text-black'>
                    {weightClass}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className='absolute right-4 pointer-events-none'
              />
            </div>
          </div>

          {/* Country Filter - New */}
          <div className='relative w-64 mb-4'>
            <label
              htmlFor='country'
              className='block mb-2 text-sm font-medium text-white'
            >
              Select Country
            </label>
            <div className='relative flex items-center justify-between w-full px-4 py-2 border border-gray-700 rounded-lg'>
              <select
                id='country'
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className='w-full bg-transparent text-white appearance-none outline-none cursor-pointer'
              >
                <option value='' className='text-black'>
                  All Countries
                </option>
                {countryOptions.map((country) => (
                  <option key={country} value={country} className='text-black'>
                    {country}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className='absolute right-4 pointer-events-none'
              />
            </div>
          </div>

          {/* State Filter - New */}
          <div className='relative w-64 mb-4'>
            <label
              htmlFor='state'
              className='block mb-2 text-sm font-medium text-white'
            >
              Select State
            </label>
            <div className='relative flex items-center justify-between w-full px-4 py-2 border border-gray-700 rounded-lg'>
              <select
                id='state'
                value={state}
                onChange={(e) => setState(e.target.value)}
                className='w-full bg-transparent text-white appearance-none outline-none cursor-pointer'
              >
                <option value='' className='text-black'>
                  All States
                </option>
                {stateOptions.map((state) => (
                  <option key={state} value={state} className='text-black'>
                    {state}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className='absolute right-4 pointer-events-none'
              />
            </div>
          </div>
        </div>

        {(classification !== 'Amateur' ||
          sport !== 'Kickboxing' ||
          weightClass ||
          country ||
          state) && (
          <button
            className='border border-gray-700 rounded-lg px-4 py-2 mb-1'
            onClick={handleResetFilter}
          >
            Reset Filter
          </button>
        )}
      </div>
      <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
        <div className='mb-4 pb-4 p-4 flex justify-between items-center border-b border-[#343B4F]'>
          <p className='text-sm'>Rankings</p>
          <p className='text-sm'>
            1 - {rankings.length} of {rankings.length}
          </p>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left'>
            <thead>
              <tr className='text-gray-400 text-sm'>
                {renderHeader('Rank', 'rank')}
                {renderHeader('Fighter Name', 'fighterName')}
                {renderHeader('Age', 'age')}
                {renderHeader('Gender', 'gender')}
                {renderHeader('Wins/Loss/Draw', 'result')}
                {renderHeader('Country', 'country')}
                {renderHeader('Club/Team', 'team')}
                {renderHeader('Actions', 'actions')}
              </tr>
            </thead>
            <tbody>
              {rankings.map((fighter, index) => {
                const approved = isApproved[index] || false
                return (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                    }`}
                  >
                    <td className='p-4'>{fighter.rank}</td>
                    <td className='p-4'>{fighter.fighterName}</td>
                    <td className='p-4'>{fighter.age}</td>
                    <td className='p-4'>{fighter.gender}</td>
                    <td className='p-4'>{fighter.result}</td>
                    <td className='p-4'>{fighter.country}</td>
                    <td className='p-4'>{fighter.team}</td>
                    <td className='p-4 flex items-center space-x-2'>
                      <div className='flex items-center space-x-3'>
                        <span className='text-sm font-medium'>Approve</span>
                        <button
                          onClick={() => toggleSwitch(index)}
                          className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${
                            approved ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                              approved ? 'translate-x-6' : ''
                            }`}
                          />
                        </button>
                        <span className='text-sm font-medium'>Reject</span>{' '}
                      </div>
                      <button className='text-purple-600'>
                        <Eye size={20} />
                      </button>
                      <button className='text-blue-600'>
                        <SquarePen size={20} />
                      </button>
                      <button className='text-white'>
                        <NotebookPen size={20} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}