'use client'

import React, { useEffect, useState } from 'react'
import ActionButton from './ActionButton'
import { CircleCheck, Copy, RotateCcw, Trash, X } from 'lucide-react'
import InputBox from './InputBox'

export default function Props({ expandedBracket, handleClose, onUpdate, eventId }) {
  const [bracketName, setBracketName] = useState('')
  const [loading, setLoading] = useState(false)
  const [startDayNumber, setStartDayNumber] = useState('')
  const [group, setGroup] = useState('')
  const [ringNumber, setRingNumber] = useState('')
  const [bracketSequence, setBracketSequence] = useState('')
  const [boutRound, setBoutRound] = useState('')
  const [maxCompetitors, setMaxCompetitors] = useState('')

  useEffect(() => {
    if (expandedBracket) {
      setBracketName(expandedBracket.title || expandedBracket.divisionTitle || '')
      setStartDayNumber(expandedBracket.startDayNumber || '')
      setGroup(expandedBracket.group || '')
      setRingNumber(expandedBracket.ringNumber || expandedBracket.ring || '')
      setBracketSequence(expandedBracket.bracketSequence || expandedBracket.bracketNumber || '')
      setBoutRound(expandedBracket.boutRound || '')
      setMaxCompetitors(expandedBracket.maxCompetitors || expandedBracket.fighters?.length || '')
    }
  }, [expandedBracket])

  const handleSaveChanges = async () => {
    if (!onUpdate || !expandedBracket) return
    
    setLoading(true)
    try {
      const updateData = {
        title: bracketName,
        startDayNumber: parseInt(startDayNumber) || undefined,
        group,
        ringNumber: ringNumber,
        bracketNumber: parseInt(bracketSequence) || expandedBracket.bracketNumber,
        boutRound: parseInt(boutRound) || undefined,
        maxCompetitors: parseInt(maxCompetitors) || undefined
      }
      
      // Remove undefined values
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      )
      
      const result = await onUpdate(expandedBracket._id, updateData)
      if (result.success) {
        alert('Changes saved successfully!')
      } else {
        alert('Error saving changes: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      alert('Error saving changes: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicate = async () => {
    if (!expandedBracket) return
    
    if (confirm('Are you sure you want to duplicate this bracket?')) {
      setLoading(true)
      try {
        // Create a copy of the bracket data
        const duplicateData = {
          ...expandedBracket,
          bracketNumber: (expandedBracket.bracketNumber || 0) + 1,
          title: `${expandedBracket.title} (Copy)`,
          fighters: [] // Start with no fighters
        }
        
        // Remove fields that shouldn't be duplicated
        delete duplicateData._id
        delete duplicateData.__v
        delete duplicateData.createdAt
        delete duplicateData.updatedAt
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/brackets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(duplicateData)
        })
        
        if (response.ok) {
          alert('Bracket duplicated successfully!')
          window.location.reload() // Refresh to show the new bracket
        } else {
          alert('Error duplicating bracket')
        }
      } catch (error) {
        alert('Error duplicating bracket: ' + error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all changes? This will revert to the original values.')) {
      setBracketName(expandedBracket.title || expandedBracket.divisionTitle || '')
      setStartDayNumber(expandedBracket.startDayNumber || '')
      setGroup(expandedBracket.group || '')
      setRingNumber(expandedBracket.ringNumber || expandedBracket.ring || '')
      setBracketSequence(expandedBracket.bracketSequence || expandedBracket.bracketNumber || '')
      setBoutRound(expandedBracket.boutRound || '')
      setMaxCompetitors(expandedBracket.maxCompetitors || expandedBracket.fighters?.length || '')
    }
  }

  const handleDelete = async () => {
    if (!expandedBracket) return
    
    if (confirm(`Are you sure you want to delete this bracket? This action cannot be undone.`)) {
      setLoading(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/brackets/${expandedBracket._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        })
        
        if (response.ok) {
          alert('Bracket deleted successfully!')
          handleClose() // Close the details panel
          window.location.reload() // Refresh to update the list
        } else {
          alert('Error deleting bracket')
        }
      } catch (error) {
        alert('Error deleting bracket: ' + error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div className='bg-[#00000061] p-3 rounded w-2/3 flex items-center justify-between'>
          <div className='w-full'>
            <div className='text-xs mb-1'>
              Bracket name
              <span className='text-red-500'>*</span>
            </div>
            <input
              type='text'
              value={bracketName || ''}
              onChange={(e) => setBracketName(e.target.value)}
              className='w-full bg-transparent text-white text-xl rounded py-1 focus:outline-none focus:border-white'
            />
          </div>
          <button onClick={handleClose} className='ml-2'>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Properties Content */}
      <div className='space-y-6'>
        <div className='grid grid-cols-4 gap-6'>
          <InputBox
            label='Start on Day Number'
            required={true}
            value={startDayNumber}
            onChange={setStartDayNumber}
          />
          <InputBox label='Group' value={group} onChange={setGroup} />
          <InputBox
            label='Ring Number'
            value={ringNumber}
            onChange={setRingNumber}
          />
          <InputBox
            label='Bracket Sequence Number'
            value={bracketSequence}
            onChange={setBracketSequence}
          />
        </div>

        <div className='grid grid-cols-4 gap-6 mt-4'>
          <InputBox
            label='Bout Round Duration (sec)'
            required
            value={boutRound}
            onChange={setBoutRound}
          />
          <InputBox
            label='Max Competitors'
            required
            value={maxCompetitors}
            onChange={setMaxCompetitors}
          />
        </div>

        <div className='mt-2'>
          Note: The max competitor count for this bracket above only applies to
          online registrations. It does not affect what you can do here.
        </div>

        {/* Action Buttons */}
        <div className='flex space-x-4 my-8 justify-center'>
          <ActionButton
            icon={<CircleCheck size={14} />}
            label='Save Changes'
            bg='linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)'
            onClick={handleSaveChanges}
            disabled={loading}
          />
          <ActionButton
            icon={<Copy size={14} />}
            label='Duplicate'
            bg='#FFCA28'
            onClick={handleDuplicate}
            disabled={loading}
          />
          <ActionButton 
            icon={<RotateCcw size={14} />} 
            label='Reset' 
            border 
            onClick={handleReset}
            disabled={loading}
          />
          <ActionButton
            icon={<Trash size={14} color='#fff' />}
            label='Delete'
            bg='#F35050'
            onClick={handleDelete}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  )
}
