import { Plus, User, Trash, Edit } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../../../../../../constants'
import useStore from '../../../../../../../stores/useStore'

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
      // Fetch fighters assigned to this bracket
      const response = await fetch(`${API_BASE_URL}/registrations/event/${eventId}?registrationType=fighter`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.items) {
          // Filter fighters that belong to this bracket (if bracket has fighters array)
          const bracketFighters = expandedBracket.fighters || []
          const assignedFighters = data.data.items.filter(fighter => 
            bracketFighters.includes(fighter._id)
          )
          setFighters(assignedFighters)
        }
      }
    } catch (err) {
      console.error('Error fetching fighters:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFighter = () => {
    setShowAddModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white">Loading fighters...</div>
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
    </div>
  )
}
