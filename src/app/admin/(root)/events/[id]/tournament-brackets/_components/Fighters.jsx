import { Plus, User } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../../../../../../constants'
import useStore from '../../../../../../../stores/useStore'
import AddFighterModal from './AddFighterModal'
import { enqueueSnackbar } from 'notistack'

export default function Fighters({ expandedBracket, eventId, onUpdate }) {
  const user = useStore((state) => state.user)
  const [fighters, setFighters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedFighterId, setSelectedFighterId] = useState(null)
  const [editingFighter, setEditingFighter] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (expandedBracket?._id) {
      console.log('useEffect triggered - expandedBracket changed:', {
        id: expandedBracket._id,
        fighters: expandedBracket.fighters,
        fightersLength: expandedBracket.fighters?.length,
      })
      fetchBracketFighters()
    }
  }, [expandedBracket?._id, JSON.stringify(expandedBracket?.fighters)])

  const fetchBracketFighters = async () => {
    // Handle new structure where fighters have seed values
    const bracketFighters = expandedBracket?.fighters || []
    console.log('fetchBracketFighters - bracketFighters:', bracketFighters)
    
    // Check if fighters are in new format {fighter: ObjectId, seed: Number} or old format [ObjectId]
    if (bracketFighters.length > 0 && typeof bracketFighters[0] === 'object' && bracketFighters[0].fighter) {
      // New format - fighters already populated with details
      console.log('Using new format with fighter objects')
      setFighters(bracketFighters.map(f => ({ ...f.fighter, seed: f.seed })))
    } else if (bracketFighters.length > 0 && typeof bracketFighters[0] === 'string') {
      // Old format - just ObjectIds, need to fetch fighter details
      console.log('Old format detected - just ObjectIds')
      setFighters(bracketFighters.map((fighterId, index) => ({ 
        _id: fighterId, 
        seed: index + 1,
        firstName: 'Loading...',
        lastName: '',
        email: '',
        checkInStatus: 'Not Checked'
      })))
    } else {
      // Already populated with fighter objects
      console.log('Already populated format')
      setFighters(bracketFighters.map((f, index) => ({ ...f, seed: f.seed || index + 1 })))
    }
    setLoading(false)
  }

  const handleAddFighter = () => {
    setShowAddModal(true)
  }


  const handleFighterAdded = async () => {
    console.log('handleFighterAdded called')
    // Notify parent to refresh bracket data
    if (onUpdate) {
      console.log('Calling parent onUpdate...')
      await onUpdate()
    }
    // Also manually trigger a refresh as backup
    console.log('Manually triggering fetchBracketFighters...')
    await fetchBracketFighters()
  }


  const handleFighterClick = (fighterId) => {
    if (selectedFighterId === fighterId) {
      setSelectedFighterId(null)
      setEditingFighter(null)
    } else {
      setSelectedFighterId(fighterId)
      const fighter = fighters.find(f => f._id === fighterId)
      setEditingFighter(fighter ? { ...fighter } : null)
    }
  }

  const handleInputChange = (field, value) => {
    setEditingFighter(prev => ({
      ...prev,
      [field]: value
    }))
  }


  const handleUpdateFighter = async () => {
    if (!editingFighter) return

    setIsUpdating(true)
    try {
      // Update the fighter/registration record
      const registrationResponse = await fetch(
        `${API_BASE_URL}/registrations/${editingFighter._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            walkAroundWeight: editingFighter.walkAroundWeight,
            email: editingFighter.email,
            gender: editingFighter.gender,
            checkInStatus: editingFighter.checkInStatus,
          }),
        }
      )

      // Also update the seed in the bracket if it changed
      const existingFighters = expandedBracket?.fighters || []
      const updatedFighters = existingFighters.map(f => {
        const fighterId = f.fighter?._id || f.fighter || f._id || f
        if (fighterId === editingFighter._id) {
          return {
            fighter: fighterId,
            seed: editingFighter.seed
          }
        }
        return {
          fighter: fighterId,
          seed: f.seed || 1
        }
      })

      const bracketResponse = await fetch(
        `${API_BASE_URL}/brackets/${expandedBracket._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            fighters: updatedFighters,
          }),
        }
      )

      if (registrationResponse.ok && bracketResponse.ok) {
        enqueueSnackbar('Fighter updated successfully!', {
          variant: 'success',
        })
        
        // Refresh data
        if (onUpdate) {
          await onUpdate()
        }
      } else {
        enqueueSnackbar('Failed to update fighter. Please try again.', {
          variant: 'error',
        })
      }
    } catch (error) {
      console.error('Error updating fighter:', error)
      enqueueSnackbar('Failed to update fighter. Please try again.', {
        variant: 'error',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-white'>Loading fighters...</div>
      </div>
    )
  }

  if (!expandedBracket) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-gray-400'>No bracket data available</div>
      </div>
    )
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-lg font-semibold leading-8'>
          Fighters in this bracket ({fighters.length})
        </h2>
        <div className='flex gap-2'>
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
      </div>

      {fighters.length === 0 ? (
        <div className='text-center py-12'>
          <User className='mx-auto mb-4 text-gray-400' size={48} />
          <p className='text-gray-400 mb-4'>
            No fighters assigned to this bracket yet.
          </p>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full text-white'>
            <thead>
              <tr className='border-b border-gray-600'>
                <th className='text-left py-3 px-4 font-medium'>Seed</th>
                <th className='text-left py-3 px-4 font-medium'>Made Weight</th>
                <th className='text-left py-3 px-4 font-medium'>Fighter</th>
              </tr>
            </thead>
            <tbody>
              {fighters.map((fighter, index) => (
                <tr
                  key={fighter._id || index}
                  className='border-b border-gray-700 hover:bg-gray-800/50 cursor-pointer transition-colors'
                  onClick={() => handleFighterClick(fighter._id)}
                >
                  <td className='py-3 px-4'>
                    <span>{fighter.seed || index + 1}</span>
                  </td>
                  <td className='py-3 px-4'>
                    {fighter.checkInStatus === 'Checked In' && (
                      <span className='text-green-400'>✓</span>
                    )}
                  </td>
                  <td className='py-3 px-4'>
                    <span className='text-blue-400 hover:text-blue-300'>
                      {fighter.firstName} {fighter.lastName} ({fighter.dateOfBirth ? new Date().getFullYear() - new Date(fighter.dateOfBirth).getFullYear() : 'N/A'})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Participant Details Section */}
      {selectedFighterId && editingFighter && (
        <div className='mt-6 bg-[#0B1739] border border-[#343B4F] rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            Participant Details
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Person */}
            <div>
              <div className='bg-[#00000061] p-3 rounded'>
                <div className='text-xs mb-1 text-white'>
                  Person
                </div>
                <p className='text-blue-400 font-medium text-xl'>
                  {editingFighter.firstName} {editingFighter.lastName} (DOB: {formatDate(editingFighter.dateOfBirth)})
                </p>
              </div>
            </div>

            {/* Contact */}
            <div>
              <div className='bg-[#00000061] p-3 rounded'>
                <div className='text-xs mb-1 text-white'>
                  Contact
                </div>
                <input
                  type='email'
                  value={editingFighter.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className='w-full bg-transparent text-white text-xl rounded py-1 focus:outline-none placeholder-gray-400'
                  placeholder='Email address'
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <div className='bg-[#00000061] p-3 rounded'>
                <div className='text-xs mb-1 text-white'>
                  Gender
                </div>
                <select
                  value={editingFighter.gender || ''}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className='w-full bg-transparent text-white text-xl rounded py-1 focus:outline-none'
                >
                  <option value='' className='bg-[#0B1739]'>Select Gender</option>
                  <option value='Male' className='bg-[#0B1739]'>Male</option>
                  <option value='Female' className='bg-[#0B1739]'>Female</option>
                  <option value='Other' className='bg-[#0B1739]'>Other</option>
                </select>
              </div>
            </div>

            {/* Empty space for layout */}
            <div></div>

            {/* Seed */}
            <div>
              <div className='bg-[#00000061] p-3 rounded'>
                <div className='text-xs mb-1 text-white'>
                  Seed
                </div>
                <input
                  type='number'
                  value={editingFighter.seed || ''}
                  onChange={(e) => handleInputChange('seed', parseInt(e.target.value))}
                  className='w-full bg-transparent text-white text-xl rounded py-1 focus:outline-none placeholder-gray-400'
                  placeholder='Seed number'
                />
              </div>
            </div>

            {/* Weight */}
            <div>
              <div className='bg-[#00000061] p-3 rounded'>
                <div className='text-xs mb-1 text-white'>
                  Weight
                </div>
                <div className='flex items-center gap-2'>
                  <input
                    type='number'
                    value={editingFighter.walkAroundWeight || ''}
                    onChange={(e) => handleInputChange('walkAroundWeight', parseFloat(e.target.value))}
                    className='w-20 bg-transparent text-white text-xl rounded py-1 focus:outline-none placeholder-gray-400'
                    placeholder='170'
                  />
                  <span className='text-sm text-gray-400'>LBS</span>
                  <label className='flex items-center gap-1 text-sm text-white ml-4'>
                    <span>Is Official Weight</span>
                    <input
                      type='checkbox'
                      checked={editingFighter.checkInStatus === 'Checked In'}
                      onChange={(e) => handleInputChange('checkInStatus', e.target.checked ? 'Checked In' : 'Not Checked')}
                      className='ml-1 w-4 h-4'
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className='mt-6 flex justify-between'>
            <button
                className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors'
                onClick={async () => {
                  // Handle remove fighter from bracket
                  if (confirm('Are you sure you want to remove this fighter from the bracket?')) {
                    try {
                      console.log('Removing fighter:', editingFighter._id)
                      console.log('Current bracket fighters:', expandedBracket?.fighters)
                      
                      const remainingFighters = expandedBracket?.fighters
                        ?.filter((f) => {
                          // Handle different data structures
                          const fighterId = f.fighter?._id || f.fighter || f._id || f
                          console.log('Comparing:', fighterId, 'vs', editingFighter._id)
                          return fighterId !== editingFighter._id
                        })
                        ?.map(f => ({
                          fighter: f.fighter?._id || f.fighter || f._id || f,
                          seed: f.seed || 1
                        })) || []
                      
                      console.log('Remaining fighters after filter:', remainingFighters)

                      const response = await fetch(
                        `${API_BASE_URL}/brackets/${expandedBracket._id}`,
                        {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${user.token}`,
                          },
                          body: JSON.stringify({
                            fighters: remainingFighters,
                          }),
                        }
                      )

                      if (response.ok) {
                        enqueueSnackbar('Fighter removed successfully!', {
                          variant: 'success',
                        })
                        
                        // Close the details panel
                        setSelectedFighterId(null)
                        setEditingFighter(null)
                        
                        // Refresh data
                        if (onUpdate) {
                          await onUpdate()
                        }
                      } else {
                        enqueueSnackbar('Failed to remove fighter. Please try again.', {
                          variant: 'error',
                        })
                      }
                    } catch (error) {
                      console.error('Error removing fighter:', error)
                      enqueueSnackbar('Failed to remove fighter. Please try again.', {
                        variant: 'error',
                      })
                    }
                  }
                }}
              >
                Remove
              </button>
            <div className='flex gap-3'>
              <button
                onClick={() => {
                  setSelectedFighterId(null)
                  setEditingFighter(null)
                }}
                className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors'
              >
                Close
              </button>
              <button
                onClick={handleUpdateFighter}
                disabled={isUpdating}
                className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50'
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
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
        alreadyAddedFighters={fighters.map((f) => f._id)}
      />

    </div>
  )
}
