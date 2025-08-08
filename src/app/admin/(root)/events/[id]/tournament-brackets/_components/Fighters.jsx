import { Plus, User, Trash, Edit, X, Check } from 'lucide-react'
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
  const [isDeleteMode, setIsDeleteMode] = useState(false)
  const [selectedFighters, setSelectedFighters] = useState([])
  const [isDeleting, setIsDeleting] = useState(false)

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
    setFighters(expandedBracket?.fighters || [])
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

  const handleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode)
    setSelectedFighters([])
  }

  const handleFighterSelect = (fighterId) => {
    setSelectedFighters((prev) =>
      prev.includes(fighterId)
        ? prev.filter((id) => id !== fighterId)
        : [...prev, fighterId]
    )
  }

  const handleDeleteFighters = async () => {
    if (selectedFighters.length === 0) return

    setIsDeleting(true)
    try {
      const remainingFighters = fighters
        .filter((fighter) => !selectedFighters.includes(fighter._id))
        .map((fighter) => fighter._id)

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
        enqueueSnackbar('Fighters deleted successfully!', {
          variant: 'success',
        })
      }

      // Reset states
      setIsDeleteMode(false)
      setSelectedFighters([])

      // Refresh data
      if (onUpdate) {
        await onUpdate()
      }
    } catch (error) {
      console.error('Error deleting fighters:', error)
      enqueueSnackbar('Failed to delete fighters. Please try again.', {
        variant: 'error',
      })
    } finally {
      setIsDeleting(false)
    }
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
          {isDeleteMode && selectedFighters.length > 0 && (
            <span className='ml-2 text-sm text-purple-400'>
              ({selectedFighters.length} selected)
            </span>
          )}
        </h2>
        <div className='flex gap-2'>
          {isDeleteMode ? (
            <>
              <button
                className='text-white px-4 py-2 rounded-md flex gap-2 items-center bg-red-600 hover:bg-red-700 disabled:opacity-50'
                onClick={handleDeleteFighters}
                disabled={selectedFighters.length === 0 || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Delete Selected ({selectedFighters.length})
                  </>
                )}
              </button>
              <button
                className='text-white px-4 py-2 rounded-md flex gap-2 items-center bg-gray-600 hover:bg-gray-700'
                onClick={handleDeleteMode}
                disabled={isDeleting}
              >
                <X size={18} />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                className='text-white px-4 py-2 rounded-md flex gap-2 items-center bg-red-600 hover:bg-red-700'
                onClick={handleDeleteMode}
                disabled={fighters.length === 0}
              >
                <Trash size={18} />
                Delete Fighters
              </button>
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
            </>
          )}
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
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {fighters.map((fighter, index) => (
            <div
              key={fighter._id || index}
              className={`bg-[#07091D] border rounded-lg p-4 transition-colors ${
                isDeleteMode
                  ? selectedFighters.includes(fighter._id)
                    ? 'border-red-500 bg-red-900/20'
                    : 'border-gray-600 hover:border-red-400'
                  : 'border-gray-600'
              }`}
            >
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-3'>
                  {isDeleteMode && (
                    <input
                      type='checkbox'
                      checked={selectedFighters.includes(fighter._id)}
                      onChange={() => handleFighterSelect(fighter._id)}
                      className='w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2'
                    />
                  )}
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
              </div>

              <div className='space-y-2 text-sm text-gray-300'>
                <div className='flex justify-between'>
                  <span>Age:</span>
                  <span>
                    {fighter.dateOfBirth
                      ? new Date().getFullYear() -
                        new Date(fighter.dateOfBirth).getFullYear()
                      : 'N/A'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Weight:</span>
                  <span>
                    {fighter.walkAroundWeight || 'N/A'}{' '}
                    {fighter.weightUnit || 'lbs'}
                  </span>
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
        alreadyAddedFighters={fighters.map((f) => f._id)}
      />
    </div>
  )
}
