'use client'

import {
  ChevronDown,
  ChevronRight,
  Edit,
  Trash,
  Move,
  ArrowUpDown,
} from 'lucide-react'
import React, { useState } from 'react'
import Props from './Props'
import Fighters from './Fighters'
import BoutsAndResults from './Bouts&Results'
import EditBracketModal from './EditBracketModal'
import { API_BASE_URL } from '../../../../../../../constants'
import useStore from '../../../../../../../stores/useStore'

export default function BracketList({
  brackets,
  eventId,
  mode,
  onRefresh,
  onDelete,
  onUpdate,
}) {
  const user = useStore((state) => state.user)
  const [activeTab, setActiveTab] = useState('props')
  const [expandedBracket, setExpandedBracket] = useState(null)
  const [editingBracket, setEditingBracket] = useState(null)

  // Function to refresh the expanded bracket data
  const refreshExpandedBracket = async () => {
    if (expandedBracket?._id) {
      try {
        console.log('Refreshing expanded bracket:', expandedBracket._id)
        const response = await fetch(
          `${API_BASE_URL}/brackets/${expandedBracket._id}`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        )
        if (response.ok) {
          const data = await response.json()
          console.log('Refreshed bracket data:', data)
          if (data.success) {
            setExpandedBracket(data.data)
            console.log(
              'Updated expanded bracket with fighters:',
              data.data.fighters
            )
          }
        } else {
          console.error('Failed to refresh bracket:', response.status)
        }
      } catch (err) {
        console.error('Error refreshing bracket:', err)
      }
    }
  }

  const handleToggle = (button) => {
    setActiveTab(button)
  }

  const handleClose = () => {
    setExpandedBracket(null)
  }

  const handleDeleteBracket = async (bracket) => {
    if (
      confirm(
        `Are you sure you want to delete bracket "${
          bracket.title || bracket.divisionTitle
        }"?`
      )
    ) {
      await onDelete(bracket._id)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'text-blue-500 bg-blue-500/20'
      case 'started':
        return 'text-green-500 bg-green-500/20'
      case 'completed':
        return 'text-gray-500 bg-gray-500/20'
      default:
        return 'text-gray-500 bg-gray-500/20'
    }
  }

  const renderModeActions = (bracket) => {
    switch (mode) {
      case 'edit':
        return (
          <button
            onClick={() => setEditingBracket(bracket)}
            className='flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700'
          >
            <Edit size={14} />
            Edit
          </button>
        )
      case 'delete':
        return (
          <button
            onClick={() => handleDeleteBracket(bracket)}
            className='flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700'
          >
            <Trash size={14} />
            Delete
          </button>
        )
      case 'move':
        return (
          <button className='flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700'>
            <Move size={14} />
            Move Fighters
          </button>
        )
      case 'reorder':
        return (
          <button className='flex items-center gap-1 px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700'>
            <ArrowUpDown size={14} />
            Reseed
          </button>
        )
      default:
        return null
    }
  }

  if (!brackets || brackets.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-400'>No brackets found.</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {brackets.map((bracket, index) => (
        <div
          key={bracket._id || index}
          className='border border-[#C5C5C5] rounded-xl overflow-hidden'
        >
          <div className='p-8 border-b border-white'>
            <div className='flex justify-between items-center'>
              <div>
                <div className='flex items-center gap-3 mb-2'>
                  <span className='text-sm text-gray-400'>
                    #{bracket.bracketNumber || index + 1}
                  </span>
                  <h2 className='font-medium text-xl'>
                    {bracket.divisionTitle || bracket.title}
                  </h2>
                  {bracket.group && (
                    <span className='text-xs px-2 py-1 bg-blue-600/20 text-blue-300 rounded'>
                      {bracket.group}
                    </span>
                  )}
                </div>
                <p className='text-gray-300'>
                  {bracket.ageClass} • {bracket.sport} • {bracket.ruleStyle}
                  {bracket.weightClass && (
                    <>
                      {' '}
                      • {bracket.weightClass.min}-{bracket.weightClass.max}{' '}
                      {bracket.weightClass.unit || 'lbs'}
                    </>
                  )}
                </p>
                <div className='flex items-center gap-4 mt-1 text-sm text-gray-400'>
                  {bracket.ring && <span>Ring: {bracket.ring}</span>}
                  {bracket.fighters && bracket.fighters.length > 0 && (
                    <span>
                      Fighters: {bracket.fighters.length}
                      {bracket.maxCompetitors &&
                        ` / ${bracket.maxCompetitors} max`}
                    </span>
                  )}
                  {bracket.bouts && bracket.bouts.length > 0 && (
                    <span>Bouts: {bracket.bouts.length}</span>
                  )}
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <span
                  className={`text-sm px-2 py-1 rounded ${getStatusColor(
                    bracket.status
                  )}`}
                >
                  {bracket.status}
                </span>
                {mode !== 'view' && renderModeActions(bracket)}
              </div>
            </div>
          </div>
          <div className='px-8 py-5'>
            <button
              className='text-lg flex items-center'
              onClick={() => {
                setExpandedBracket(
                  expandedBracket?._id === bracket._id ? null : bracket
                )
                setActiveTab('props')
              }}
            >
              <span>Check Details</span>
              {expandedBracket?._id === bracket._id ? (
                <ChevronDown />
              ) : (
                <ChevronRight />
              )}
            </button>

            {expandedBracket?._id === bracket._id && (
              <>
                {/* Tabs */}
                <div className='flex border border-[#797979] px-2 py-1 rounded-md w-fit my-5'>
                  {['props', 'fighters', 'bouts&results'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleToggle(tab)}
                      className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${
                        activeTab === tab ? 'bg-[#2E3094] shadow-md' : ''
                      }`}
                    >
                      {tab === 'props' && 'Bracket Properties'}
                      {tab === 'fighters' && 'Fighters'}
                      {tab === 'bouts&results' && 'Bouts & Results'}
                    </button>
                  ))}
                </div>

                {activeTab === 'props' ? (
                  <Props
                    expandedBracket={expandedBracket}
                    handleClose={handleClose}
                    onUpdate={onUpdate}
                    eventId={eventId}
                  />
                ) : activeTab === 'fighters' ? (
                  <Fighters
                    expandedBracket={expandedBracket}
                    eventId={eventId}
                    onUpdate={async () => {
                      // First refresh the expanded bracket to get latest data
                      await refreshExpandedBracket()
                      // Then refresh the main bracket list
                      if (onRefresh) {
                        await onRefresh()
                      }
                      // Finally call parent update
                      if (onUpdate) {
                        onUpdate()
                      }
                    }}
                  />
                ) : (
                  <BoutsAndResults
                    bracket={expandedBracket}
                    eventId={eventId}
                  />
                )}
              </>
            )}
          </div>
        </div>
      ))}

      {/* Edit Bracket Modal */}
      {editingBracket && (
        <EditBracketModal
          bracket={editingBracket}
          onClose={() => setEditingBracket(null)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  )
}
