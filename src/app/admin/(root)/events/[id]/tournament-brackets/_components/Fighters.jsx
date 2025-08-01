import { Plus, User, Trash, Edit } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../../../../../../constants'
import useStore from '../../../../../../../stores/useStore'
import AddFighterModal from './AddFighterModal'

export default function Fighters({ expandedBracket, eventId, onUpdate }) {
  const user = useStore((state) => state.user)
  const [fighters, setFighters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    if (expandedBracket?._id) {
      fetchBracketFighters()
    }
  }, [expandedBracket?._id])

  const fetchBracketFighters = async () => {
    try {
      setLoading(true)
      
      console.log('=== Fetching Bracket Fighters Debug ===')
      console.log('Expanded bracket:', expandedBracket)
      console.log('Event ID:', eventId)
      
      // First, get the latest bracket data to ensure we have updated fighters list
      const bracketResponse = await fetch(`${API_BASE_URL}/brackets/${expandedBracket._id}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      
      let currentBracket = expandedBracket
      if (bracketResponse.ok) {
        const bracketData = await bracketResponse.json()
        console.log('Fresh bracket data from API:', bracketData)
        console.log('Fresh bracket data.data structure:', JSON.stringify(bracketData.data, null, 2))
        if (bracketData.success) {
          currentBracket = bracketData.data
        }
      } else {
        console.error('Failed to fetch bracket data:', bracketResponse.status)
      }
      
      // Fetch all fighters for this event
      const response = await fetch(`${API_BASE_URL}/registrations/event/${eventId}?registrationType=fighter`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('All fighters response:', data)
        if (data.success && data.data.items) {
          // Filter fighters that belong to this bracket using the updated bracket data
          const bracketFighters = currentBracket.fighters || []
          console.log('Current bracket fighters IDs:', bracketFighters)
          console.log('All available fighters:', data.data.items.length)
          console.log('Sample fighter IDs:', data.data.items.slice(0, 3).map(f => f._id))
          
          const assignedFighters = data.data.items.filter(fighter => {
            const isAssigned = bracketFighters.includes(fighter._id)
            if (isAssigned) {
              console.log(`Fighter ${fighter.firstName} ${fighter.lastName} (${fighter._id}) is assigned to bracket`)
            }
            return isAssigned
          })
          console.log('Assigned fighters found:', assignedFighters.length)
          console.log('Assigned fighters:', assignedFighters.map(f => `${f.firstName} ${f.lastName}`))
          setFighters(assignedFighters)
        }
      } else {
        console.error('Failed to fetch fighters:', response.status)
      }
    } catch (err) {
      console.error('Error fetching fighters:', err)
      setFighters([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddFighter = () => {
    setShowAddModal(true)
  }

  const handleFighterAdded = async () => {
    // Refresh fighters list after adding
    await fetchBracketFighters()
    // Also notify parent to refresh bracket data
    if (onUpdate) {
      onUpdate()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white">Loading fighters...</div>
      </div>
    )
  }

  if (!expandedBracket) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-400">No bracket data available</div>
      </div>
    )
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-lg font-semibold leading-8'>
          Fighters in this bracket ({fighters.length})
        </h2>
        <button
          className='text-white px-4 py-2 rounded-md flex gap-2 items-center'
          style={{
            background:
              'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
          }}
          onClick={handleAddFighter}
        >
          <Plus size={18} />
          Add Fighter
        </button>
      </div>

      {fighters.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-400 mb-4">No fighters assigned to this bracket yet.</p>
          <button
            onClick={handleAddFighter}
            className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-700 text-white"
          >
            Add First Fighter
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {fighters.map((fighter, index) => (
            <div key={fighter._id || index} className='bg-[#07091D] border border-gray-600 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-3'>
                  {fighter.profilePhoto ? (
                    <img
                      src={fighter.profilePhoto}
                      alt={`${fighter.firstName} ${fighter.lastName}`}
                      className='w-12 h-12 rounded-full object-cover border-2 border-purple-500'
                    />
                  ) : (
                    <div className='w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-purple-500 flex items-center justify-center'>
                      <User className='w-6 h-6 text-gray-300' />
                    </div>
                  )}
                  <div>
                    <h3 className='font-medium text-white'>
                      {fighter.firstName} {fighter.lastName}
                    </h3>
                    <p className='text-sm text-gray-400'>
                      {fighter.weightClass || 'No weight class'}
                    </p>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <button className='text-blue-400 hover:text-blue-300 p-1'>
                    <Edit size={16} />
                  </button>
                  <button className='text-red-400 hover:text-red-300 p-1'>
                    <Trash size={16} />
                  </button>
                </div>
              </div>
              
              <div className='space-y-2 text-sm text-gray-300'>
                <div className='flex justify-between'>
                  <span>Age:</span>
                  <span>
                    {fighter.dateOfBirth ? 
                      new Date().getFullYear() - new Date(fighter.dateOfBirth).getFullYear() 
                      : 'N/A'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Weight:</span>
                  <span>{fighter.walkAroundWeight || 'N/A'} {fighter.weightUnit || 'lbs'}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Experience:</span>
                  <span>{fighter.skillLevel || 'N/A'}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Style:</span>
                  <span>{fighter.ruleStyle || 'N/A'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Fighter Modal */}
      <AddFighterModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        eventId={eventId}
        bracketId={expandedBracket?._id}
        bracket={expandedBracket}
        onFighterAdded={handleFighterAdded}
      />
    </div>
  )
}
