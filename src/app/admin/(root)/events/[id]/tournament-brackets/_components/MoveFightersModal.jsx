'use client'

import React, { useState, useEffect } from 'react'
import { X, Move, Users, ArrowRight } from 'lucide-react'
import { API_BASE_URL } from '../../../../../../../constants'
import useStore from '../../../../../../../stores/useStore'
import { enqueueSnackbar } from 'notistack'

export default function MoveFightersModal({
  isOpen,
  onClose,
  brackets,
  eventId,
  onUpdate,
}) {
  const user = useStore((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [draggedFighter, setDraggedFighter] = useState(null)
  const [dragOverBracket, setDragOverBracket] = useState(null)
  const [bracketsWithFighters, setBracketsWithFighters] = useState([])

  useEffect(() => {
    if (isOpen && brackets) {
      fetchBracketFighters()
    }
  }, [isOpen, brackets])

  const fetchBracketFighters = async () => {
    try {
      setLoading(true)
      const bracketsWithDetails = await Promise.all(
        brackets.map(async (bracket) => {
          try {
            const response = await fetch(
              `${API_BASE_URL}/brackets/${bracket._id}`,
              {
                headers: {
                  Authorization: `Bearer ${user?.token}`,
                },
              }
            )

            if (response.ok) {
              const data = await response.json()
              if (data.success && data.data) {
                return {
                  ...bracket,
                  fighters: data.data.fighters || [],
                }
              }
            }
            return { ...bracket, fighters: [] }
          } catch (err) {
            console.error(
              `Error fetching fighters for bracket ${bracket._id}:`,
              err
            )
            return { ...bracket, fighters: [] }
          }
        })
      )
      setBracketsWithFighters(bracketsWithDetails)
    } catch (err) {
      console.error('Error fetching bracket fighters:', err)
      enqueueSnackbar('Error loading bracket fighters', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (e, fighter, sourceBracketId) => {
    const dragData = {
      fighter,
      sourceBracketId,
      fighterIndex: bracketsWithFighters
        .find((b) => b._id === sourceBracketId)
        ?.fighters?.findIndex(
          (f) => f._id === fighter._id || f.fighter?._id === fighter._id
        ),
    }

    setDraggedFighter(dragData)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', JSON.stringify(dragData))

    // Add visual feedback
    e.target.style.opacity = '0.5'
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedFighter(null)
    setDragOverBracket(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e, bracketId) => {
    e.preventDefault()
    setDragOverBracket(bracketId)
  }

  const handleDragLeave = (e) => {
    // Only clear drag over if we're leaving the bracket container entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverBracket(null)
    }
  }

  const handleDrop = async (e, targetBracketId) => {
    e.preventDefault()
    setDragOverBracket(null)

    if (!draggedFighter) return

    const { fighter, sourceBracketId } = draggedFighter

    // Don't allow dropping on the same bracket
    if (sourceBracketId === targetBracketId) {
      enqueueSnackbar('Cannot move fighter to the same bracket', {
        variant: 'warning',
      })
      return
    }

    // Check if fighter already exists in target bracket
    const fighterId = fighter._id || fighter.fighter?._id
    const targetBracket = bracketsWithFighters.find(
      (b) => b._id === targetBracketId
    )
    const fighterAlreadyExists = targetBracket?.fighters?.some(
      (f) => (f._id || f.fighter?._id) === fighterId
    )

    if (fighterAlreadyExists) {
      const fighterName = getFighterName(fighter)
      const targetBracketName = targetBracket?.divisionTitle || 'target bracket'
      enqueueSnackbar(`${fighterName} is already in ${targetBracketName}`, {
        variant: 'warning',
      })
      return
    }

    await moveFighter(fighter, sourceBracketId, targetBracketId)
  }

  const moveFighter = async (fighter, sourceBracketId, targetBracketId) => {
    try {
      setLoading(true)

      // Get actual fighter data - handle both old and new format
      const fighterId = fighter._id || fighter.fighter?._id
      const fighterData = fighter.fighter || fighter

      // Get current state of both brackets
      const sourceBracket = bracketsWithFighters.find(
        (b) => b._id === sourceBracketId
      )
      const targetBracket = bracketsWithFighters.find(
        (b) => b._id === targetBracketId
      )

      if (!sourceBracket || !targetBracket) {
        throw new Error('Source or target bracket not found')
      }

      // Remove fighter from source bracket's fighters array
      const updatedSourceFighters = sourceBracket.fighters
        .filter((f) => (f._id || f.fighter?._id) !== fighterId)
        .map((f, index) => ({
          fighter: f._id || f.fighter?._id || f,
          seed: index + 1, // Re-seed remaining fighters
        }))

      // Add fighter to target bracket's fighters array
      const updatedTargetFighters = [
        ...targetBracket.fighters.map((f) => ({
          fighter: f._id || f.fighter?._id || f,
          seed: f.seed || 1,
        })),
        {
          fighter: fighterId,
          seed: targetBracket.fighters.length + 1,
        },
      ]

      // Update source bracket
      const sourceResponse = await fetch(
        `${API_BASE_URL}/brackets/${sourceBracketId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            fighters: updatedSourceFighters,
          }),
        }
      )

      if (!sourceResponse.ok) {
        throw new Error('Failed to update source bracket')
      }

      // Update target bracket
      const targetResponse = await fetch(
        `${API_BASE_URL}/brackets/${targetBracketId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            fighters: updatedTargetFighters,
          }),
        }
      )

      if (!targetResponse.ok) {
        // Rollback source bracket changes
        try {
          await fetch(`${API_BASE_URL}/brackets/${sourceBracketId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user?.token}`,
            },
            body: JSON.stringify({
              fighters: sourceBracket.fighters.map((f) => ({
                fighter: f._id || f.fighter?._id || f,
                seed: f.seed || 1,
              })),
            }),
          })
        } catch (rollbackErr) {
          console.error(
            'Failed to rollback source bracket changes:',
            rollbackErr
          )
        }
        throw new Error('Failed to update target bracket')
      }

      // Update local state
      setBracketsWithFighters((prev) =>
        prev.map((bracket) => {
          if (bracket._id === sourceBracketId) {
            // Remove fighter from source bracket
            return {
              ...bracket,
              fighters: bracket.fighters.filter(
                (f) => (f._id || f.fighter?._id) !== fighterId
              ),
            }
          } else if (bracket._id === targetBracketId) {
            // Add fighter to target bracket
            return {
              ...bracket,
              fighters: [
                ...bracket.fighters,
                { ...fighter, seed: bracket.fighters.length + 1 },
              ],
            }
          }
          return bracket
        })
      )

      const sourceBracketName =
        bracketsWithFighters.find((b) => b._id === sourceBracketId)
          ?.divisionTitle || 'source bracket'
      const targetBracketName =
        bracketsWithFighters.find((b) => b._id === targetBracketId)
          ?.divisionTitle || 'target bracket'

      enqueueSnackbar(
        `Successfully moved ${fighterData.firstName} ${fighterData.lastName} from ${sourceBracketName} to ${targetBracketName}`,
        { variant: 'success' }
      )
    } catch (error) {
      console.error('Error moving fighter:', error)
      enqueueSnackbar(`Failed to move fighter: ${error.message}`, {
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const getFighterName = (fighter) => {
    const fighterData = fighter.fighter || fighter
    return `${fighterData.firstName || 'Unknown'} ${
      fighterData.lastName || 'Fighter'
    }`
  }

  const getFighterCount = (bracket) => {
    return bracket.fighters?.length || 0
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4'>
      <div className='bg-[#0B1739] rounded-lg w-full max-w-7xl max-h-[90vh] flex flex-col'>
        {/* Header */}
        <div className='flex justify-between items-center p-6 border-b border-gray-600'>
          <div className='flex items-center gap-3'>
            <Move className='text-purple-400' size={24} />
            <h2 className='text-xl font-bold text-white'>
              Move Fighters Between Brackets
            </h2>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-white transition-colors'
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Instructions */}
        <div className='p-4 bg-blue-900/20 border-b border-gray-600'>
          <div className='flex items-center gap-2 text-blue-300 text-sm'>
            <Users size={16} />
            <span>
              Drag and drop fighters between brackets. Changes are saved
              automatically.
            </span>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-hidden'>
          {loading ? (
            <div className='flex items-center justify-center h-full'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2'></div>
                <p className='text-gray-400'>Loading brackets...</p>
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 h-full overflow-y-auto'>
              {bracketsWithFighters.map((bracket) => (
                <div
                  key={bracket._id}
                  className={`relative bg-[#07091D] rounded-lg border-2 transition-all duration-200 ${
                    dragOverBracket === bracket._id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, bracket._id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, bracket._id)}
                >
                  {/* Bracket Header */}
                  <div className='p-4 border-b border-gray-600'>
                    <div className='flex items-center justify-between mb-2'>
                      <h3 className='font-semibold text-white truncate'>
                        {bracket.divisionTitle || bracket.title}
                      </h3>
                      <span className='text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded'>
                        #{bracket.bracketNumber || 1}
                      </span>
                    </div>
                    <p className='text-sm text-gray-400 mb-1 truncate'>
                      {bracket.ageClass} • {bracket.sport}
                    </p>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-gray-500'>
                        {getFighterCount(bracket)} fighters
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          bracket.status === 'Open'
                            ? 'bg-blue-500/20 text-blue-300'
                            : bracket.status === 'Started'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-gray-500/20 text-gray-300'
                        }`}
                      >
                        {bracket.status}
                      </span>
                    </div>
                  </div>

                  {/* Fighters List */}
                  <div className='p-4 space-y-2 max-h-96 overflow-y-auto'>
                    {bracket.fighters && bracket.fighters.length > 0 ? (
                      bracket.fighters.map((fighter, index) => {
                        const fighterId = fighter._id || fighter.fighter?._id
                        return (
                          <div
                            key={fighterId || index}
                            draggable
                            onDragStart={(e) =>
                              handleDragStart(e, fighter, bracket._id)
                            }
                            onDragEnd={handleDragEnd}
                            className={`p-3 bg-gray-800 rounded-lg cursor-move hover:bg-gray-700 transition-colors border-l-4 border-purple-500 ${
                              draggedFighter?.fighter?._id === fighterId
                                ? 'opacity-50'
                                : ''
                            }`}
                          >
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center gap-2'>
                                <span className='text-xs bg-purple-600 text-white px-2 py-1 rounded font-mono'>
                                  #{fighter.seed || index + 1}
                                </span>
                                <span className='text-sm font-medium text-white'>
                                  {getFighterName(fighter)}
                                </span>
                              </div>
                              <Move size={14} className='text-gray-500' />
                            </div>
                            {fighter.fighter?.email || fighter.email ? (
                              <p className='text-xs text-gray-400 mt-1 ml-8'>
                                {fighter.fighter?.email || fighter.email}
                              </p>
                            ) : null}
                          </div>
                        )
                      })
                    ) : (
                      <div className='text-center py-8'>
                        <Users
                          className='mx-auto text-gray-600 mb-2'
                          size={32}
                        />
                        <p className='text-gray-500 text-sm'>
                          No fighters in this bracket
                        </p>
                        <p className='text-gray-600 text-xs mt-1'>
                          Drop fighters here to add them
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Drop Zone Indicator */}
                  {dragOverBracket === bracket._id && draggedFighter && (
                    <div className='absolute inset-0 bg-purple-500/20 border-2 border-purple-500 border-dashed rounded-lg flex items-center justify-center'>
                      <div className='bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2'>
                        <ArrowRight size={16} />
                        <span>Drop to move fighter here</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='p-6 border-t border-gray-600 flex justify-between items-center'>
          <div className='text-sm text-gray-400'>
            Total brackets: {bracketsWithFighters.length} • Total fighters:{' '}
            {bracketsWithFighters.reduce(
              (sum, bracket) => sum + getFighterCount(bracket),
              0
            )}
          </div>
          <div className='flex gap-3'>
            <button
              onClick={() => {
                fetchBracketFighters()
              }}
              disabled={loading}
              className='px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-700 transition-colors disabled:opacity-50'
            >
              Refresh
            </button>
            <button
              onClick={() => {
                onUpdate?.()
                onClose()
              }}
              className='px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors'
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
