import React, { useState, useEffect } from 'react'
import { X, Search, User } from 'lucide-react'
import { API_BASE_URL } from '../../../../../../../constants'
import useStore from '../../../../../../../stores/useStore'
import { enqueueSnackbar } from 'notistack'

export default function AddFighterModal({
  isOpen,
  onClose,
  eventId,
  bracketId,
  bracket,
  onFighterAdded,
  alreadyAddedFighters,
}) {
  const user = useStore((state) => state.user)
  const [availableFighters, setAvailableFighters] = useState([])
  const [filteredFighters, setFilteredFighters] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFighters, setSelectedFighters] = useState([])
  const [activeGenderTab, setActiveGenderTab] = useState('Male')

  useEffect(() => {
    if (isOpen && eventId) {
      fetchAvailableFighters()
    }
  }, [isOpen, eventId])

  useEffect(() => {
    // Filter fighters based on search query and gender
    const filtered = availableFighters.filter((fighter) => {
      const fullName = `${fighter.firstName} ${fighter.lastName}`.toLowerCase()
      const gym = (fighter.gymName || '').toLowerCase()
      const weightClass = (fighter.weightClass || '').toLowerCase()
      const query = searchQuery.toLowerCase()
      const gender = fighter.gender || 'Male'

      const matchesSearch =
        fullName.includes(query) ||
        gym.includes(query) ||
        weightClass.includes(query)
      const matchesGender = gender === activeGenderTab

      return matchesSearch && matchesGender
    })
    setFilteredFighters(filtered)
  }, [searchQuery, availableFighters, activeGenderTab])

  const fetchAvailableFighters = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${API_BASE_URL}/registrations/event/${eventId}?registrationType=fighter`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.items) {
          const allFighters = data.data.items
          // Exclude already added fighters
          const filteredFighters = allFighters.filter(
            (f) => !alreadyAddedFighters.some((af) => af === f._id)
          )
          setAvailableFighters(filteredFighters)
        }
      }
    } catch (err) {
      console.error('Error fetching fighters:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFighterSelect = (fighter) => {
    setSelectedFighters((prev) => {
      const isSelected = prev.find((f) => f._id === fighter._id)
      if (isSelected) {
        return prev.filter((f) => f._id !== fighter._id)
      } else {
        return [...prev, fighter]
      }
    })
  }

  const handleAddFighters = async () => {
    if (selectedFighters.length === 0) return

    try {
      console.log('=== Adding Fighters Debug ===')
      console.log('Bracket data:', bracket)
      console.log('Selected fighters:', selectedFighters)

      // Get existing fighters in bracket and add new ones
      const existingFighterIds = (bracket?.fighters || []).map(
        (f) => f._id || f
      )
      const newFighterIds = selectedFighters.map((f) => f._id)
      // Remove duplicates by using Set
      const allFighterIds = [
        ...new Set([...existingFighterIds, ...newFighterIds]),
      ]

      // Try PUT with clean bracket data
      console.log('Updating bracket with new fighters...')

      const response = await fetch(`${API_BASE_URL}/brackets/${bracketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ fighters: allFighterIds }),
      })

      console.log('Final response status:', response?.status)
      const responseData = response
        ? await response.json()
        : { success: false, message: 'No response received' }
      console.log('Final response data:', responseData)

      if (response.ok) {
        enqueueSnackbar('Fighters added successfully!', {
          variant: 'success',
        })
        onFighterAdded?.()
        setSelectedFighters([])
        onClose()
      } else {
        console.error('Failed to add fighters:', responseData)
        enqueueSnackbar(responseData.message || 'Unknown error', {
          variant: 'error',
        })
      }
    } catch (err) {
      console.error('Error adding fighters:', err)
      enqueueSnackbar(err.message, {
        variant: 'error',
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4'>
      <div className='bg-[#0B1739] rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col'>
        {/* Header */}
        <div className='flex justify-between items-center p-6 border-b border-gray-600'>
          <h2 className='text-xl font-bold text-white'>
            Add Fighters to Bracket
          </h2>
          <button onClick={onClose} className='text-gray-400 hover:text-white'>
            <X size={24} />
          </button>
        </div>

        {/* Gender Tabs */}
        <div className='border-b border-gray-600'>
          <div className='flex'>
            {['Male', 'Female'].map((gender) => (
              <button
                key={gender}
                onClick={() => setActiveGenderTab(gender)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeGenderTab === gender
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-[#07091D]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className='p-6 border-b border-gray-600'>
          <div className='relative'>
            <Search
              className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
              size={20}
            />
            <input
              type='text'
              placeholder='Search fighters by name, gym, or weight class...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 bg-[#07091D] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500'
            />
          </div>
          {selectedFighters.length > 0 && (
            <div className='mt-3 text-sm text-blue-400'>
              {selectedFighters.length} fighter(s) selected
            </div>
          )}
        </div>

        {/* Fighter List */}
        <div className='flex-1 overflow-y-auto p-6'>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='text-white'>Loading fighters...</div>
            </div>
          ) : filteredFighters.length === 0 ? (
            <div className='text-center py-8'>
              <User className='mx-auto mb-4 text-gray-400' size={48} />
              <p className='text-gray-400'>
                {searchQuery
                  ? 'No fighters found matching your search.'
                  : 'No fighters available.'}
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {filteredFighters.map((fighter) => {
                const isSelected = selectedFighters.find(
                  (f) => f._id === fighter._id
                )
                return (
                  <div
                    key={fighter._id}
                    onClick={() => handleFighterSelect(fighter)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                        : 'border-gray-600 bg-[#07091D] hover:border-gray-500'
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      {fighter.profilePhoto ? (
                        <img
                          src={fighter.profilePhoto}
                          alt={`${fighter.firstName} ${fighter.lastName}`}
                          className='w-12 h-12 rounded-full object-cover'
                        />
                      ) : (
                        <div className='w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center'>
                          <User className='w-6 h-6 text-gray-300' />
                        </div>
                      )}
                      <div className='flex-1'>
                        <h3 className='font-medium text-white'>
                          {fighter.firstName} {fighter.lastName}
                        </h3>
                        <p className='text-sm text-gray-400'>
                          {fighter.gymName || 'No gym specified'}
                        </p>
                      </div>
                      <div className='text-right'>
                        <div className='text-sm text-gray-300'>
                          {fighter.walkAroundWeight || 'N/A'}{' '}
                          {fighter.weightUnit || 'lbs'}
                        </div>
                        <div className='text-xs text-gray-400'>
                          {fighter.skillLevel ||
                            fighter.weightClass ||
                            'No category'}
                        </div>
                      </div>
                    </div>

                    <div className='mt-3 grid grid-cols-2 gap-4 text-xs text-gray-400'>
                      <div>
                        <span className='text-gray-500'>Age:</span>{' '}
                        {fighter.dateOfBirth
                          ? new Date().getFullYear() -
                            new Date(fighter.dateOfBirth).getFullYear()
                          : 'N/A'}
                      </div>
                      <div>
                        <span className='text-gray-500'>Style:</span>{' '}
                        {fighter.ruleStyle || 'N/A'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex justify-end gap-4 p-6 border-t border-gray-600'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-400 hover:text-white'
          >
            Cancel
          </button>
          <button
            onClick={handleAddFighters}
            disabled={selectedFighters.length === 0}
            className={`px-6 py-2 rounded-lg font-medium ${
              selectedFighters.length > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Add{' '}
            {selectedFighters.length > 0 ? `${selectedFighters.length} ` : ''}
            Fighter{selectedFighters.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
