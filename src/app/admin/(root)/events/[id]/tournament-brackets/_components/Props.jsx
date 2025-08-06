'use client'

import React, { useEffect, useState } from 'react'
import ActionButton from './ActionButton'
import { CircleCheck, Copy, RotateCcw, Trash, X, Play } from 'lucide-react'
import InputBox from './InputBox'
import { API_BASE_URL } from '../../../../../../../constants'
import useStore from '../../../../../../../stores/useStore'

export default function Props({ expandedBracket, handleClose, onUpdate, eventId }) {
  const user = useStore((state) => state.user)
  const [bracketName, setBracketName] = useState('')
  const [loading, setLoading] = useState(false)
  const [startDayNumber, setStartDayNumber] = useState('')
  const [group, setGroup] = useState('')
  const [ringNumber, setRingNumber] = useState('')
  const [bracketSequence, setBracketSequence] = useState('')
  const [boutRound, setBoutRound] = useState('')
  const [maxCompetitors, setMaxCompetitors] = useState('')
  
  // Title component fields for auto-generating bracket name
  const [gender, setGender] = useState('')
  const [ruleStyle, setRuleStyle] = useState('')
  const [weightClass, setWeightClass] = useState('')
  const [ageClass, setAgeClass] = useState('')

  useEffect(() => {
    if (expandedBracket) {
      setBracketName(expandedBracket.title || expandedBracket.divisionTitle || '')
      setStartDayNumber(expandedBracket.startDayNumber || '')
      setGroup(expandedBracket.group || '')
      setRingNumber(expandedBracket.ringNumber || expandedBracket.ring || '')
      setBracketSequence(expandedBracket.bracketSequence || expandedBracket.bracketNumber || '')
      setBoutRound(expandedBracket.boutRound || '')
      setMaxCompetitors(expandedBracket.maxCompetitors || expandedBracket.fighters?.length || '')
      
      // Initialize title component fields from bracket data
      setGender(expandedBracket.gender || '')
      setRuleStyle(expandedBracket.ruleStyle || '')
      setWeightClass(expandedBracket.weightClass ? `${expandedBracket.weightClass.min}-${expandedBracket.weightClass.max} ${expandedBracket.weightClass.unit}` : '')
      setAgeClass(expandedBracket.ageClass || '')
    }
  }, [expandedBracket])

  // Auto-generate bracket name when title components change
  useEffect(() => {
    if (gender || ruleStyle || weightClass || ageClass) {
      const nameParts = [gender, ageClass, ruleStyle, weightClass].filter(part => part && part.trim())
      if (nameParts.length > 0) {
        setBracketName(nameParts.join(' '))
      }
    }
  }, [gender, ruleStyle, weightClass, ageClass])

  const handleSaveChanges = async () => {
    if (!onUpdate || !expandedBracket) return
    
    // Enhanced validation
    const validationErrors = []
    
    // Bracket name validation - only allow alphanumeric and spaces
    if (!bracketName || bracketName.trim() === '') {
      validationErrors.push('Bracket name is required')
    } else if (!/^[a-zA-Z0-9\s]+$/.test(bracketName.trim())) {
      validationErrors.push('Bracket name can only contain letters, numbers, and spaces')
    }
    
    // Mandatory field validation for numeric fields
    if (!startDayNumber || startDayNumber.trim() === '') {
      validationErrors.push('Start on Day Number is required')
    } else if (isNaN(parseInt(startDayNumber)) || parseInt(startDayNumber) <= 0) {
      validationErrors.push('Start on Day Number must be a positive number')
    }
    
    if (!boutRound || boutRound.trim() === '') {
      validationErrors.push('Bout Round Duration is required')
    } else if (isNaN(parseInt(boutRound)) || parseInt(boutRound) <= 0) {
      validationErrors.push('Bout Round Duration must be a positive number')
    }
    
    if (!maxCompetitors || maxCompetitors.trim() === '') {
      validationErrors.push('Max Competitors is required')
    } else if (isNaN(parseInt(maxCompetitors)) || parseInt(maxCompetitors) <= 0) {
      validationErrors.push('Max Competitors must be a positive number')
    }
    
    if (validationErrors.length > 0) {
      alert('Please fix the following errors:\n• ' + validationErrors.join('\n• '))
      return
    }
    
    setLoading(true)
    try {
      const updateData = {
        title: bracketName.trim(),
        startDayNumber: parseInt(startDayNumber),
        boutRound: parseInt(boutRound), 
        maxCompetitors: parseInt(maxCompetitors),
        group: group || '',
        ringNumber: ringNumber || '',
        bracketNumber: parseInt(bracketSequence) || expandedBracket.bracketNumber,
        // Include title component fields
        gender: gender || '',
        ruleStyle: ruleStyle || '',
        weightClass: weightClass || '',
        ageClass: ageClass || ''
      }
      
      console.log('Updating bracket with data:', updateData)
      
      const result = await onUpdate(expandedBracket._id, updateData)
      if (result.success) {
        alert('✓ Changes saved successfully!')
        // Refresh the component state to reflect saved changes
        setStartDayNumber(updateData.startDayNumber.toString())
        setBoutRound(updateData.boutRound.toString())
        setMaxCompetitors(updateData.maxCompetitors.toString())
      } else {
        alert('❌ Error saving changes: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('❌ Error saving changes: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicate = async () => {
    if (!expandedBracket) return
    
    if (confirm('Are you sure you want to duplicate this bracket?')) {
      setLoading(true)
      try {
        // Create a copy of the bracket data with proper validation
        const duplicateData = {
          bracketNumber: (expandedBracket.bracketNumber || 0) + 1,
          title: `${expandedBracket.title || 'Bracket'} (Copy)`,
          divisionTitle: expandedBracket.divisionTitle || '',
          sport: expandedBracket.sport || '',
          ruleStyle: expandedBracket.ruleStyle || '',
          ageClass: expandedBracket.ageClass || '',
          weightClass: expandedBracket.weightClass || { min: 0, max: 999, unit: 'lbs' },
          group: expandedBracket.group || '',
          ringNumber: expandedBracket.ringNumber || '',
          startDayNumber: expandedBracket.startDayNumber || 1,
          boutRound: expandedBracket.boutRound || 90,
          maxCompetitors: expandedBracket.maxCompetitors || 16,
          status: 'Open',
          fighters: [], // Start with no fighters
          event: expandedBracket.event
        }
        
        console.log('Duplicating bracket with data:', duplicateData)
        
        const response = await fetch(`${API_BASE_URL}/brackets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`,
          },
          body: JSON.stringify(duplicateData)
        })
        
        const responseData = await response.json()
        console.log('Duplicate response:', responseData)
        
        if (response.ok && responseData.success) {
          alert('✓ Bracket duplicated successfully!')
          window.location.reload() // Refresh to show the new bracket
        } else {
          const errorMsg = responseData.message || `HTTP ${response.status}`
          alert('❌ Error duplicating bracket: ' + errorMsg)
          console.error('Duplicate error details:', responseData)
        }
      } catch (error) {
        console.error('Duplicate bracket error:', error)
        alert('❌ Error duplicating bracket: ' + error.message)
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

  const handleStartBracket = async () => {
    if (!expandedBracket) return
    
    if (confirm('Are you sure you want to start this bracket? This will create bouts and begin the tournament.')) {
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/brackets/${expandedBracket._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            ...expandedBracket,
            status: 'Started'
          })
        })
        
        if (response.ok) {
          alert('Bracket started successfully!')
          if (onUpdate) {
            onUpdate()
          }
        } else {
          alert('Error starting bracket')
        }
      } catch (error) {
        alert('Error starting bracket: ' + error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleDelete = async () => {
    if (!expandedBracket) return
    
    if (confirm(`Are you sure you want to delete this bracket? This action cannot be undone.`)) {
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/brackets/${expandedBracket._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
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
        <div className='bg-[#00000061] p-3 rounded w-2/3 flex items-center'>
          <div className='w-full'>
            <div className='text-xs mb-1 flex items-center justify-between'>
              <span>
                Bracket Name
                <span className='text-red-500'>*</span>
              </span>
              <button
                onClick={() => setBracketName('')}
                className='text-xs text-gray-400 hover:text-white'
                title='Clear bracket name'
              >
                Clear
              </button>
            </div>
            <input
              type='text'
              value={bracketName || ''}
              onChange={(e) => setBracketName(e.target.value)}
              placeholder='Auto-generated or enter manually'
              className='w-full bg-transparent text-white text-xl rounded py-1 focus:outline-none focus:border-white placeholder-gray-400'
            />
          </div>
        </div>
        <button onClick={handleClose} className='ml-4 p-2 hover:bg-gray-700 rounded'>
          <X size={20} />
        </button>
      </div>

      {/* Bracket Properties Section */}
      <div className='space-y-6'>
        <div className='bg-[#07091D] p-6 rounded-lg'>
          <h3 className='text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2'>
            Bracket Properties
          </h3>
          
          {/* Title Components for Auto-generating Bracket Name */}
          <div className='mb-6'>
            <h4 className='text-md font-medium text-white mb-3'>Title Components</h4>
            <div className='grid grid-cols-4 gap-4'>
              <div>
                <label className='block text-xs text-gray-300 mb-1'>Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className='w-full bg-[#00000061] border border-gray-600 rounded px-3 py-2 text-white text-sm'
                >
                  <option value=''>Select Gender</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                  <option value='Mixed'>Mixed</option>
                </select>
              </div>
              
              <div>
                <label className='block text-xs text-gray-300 mb-1'>Age Class</label>
                <select
                  value={ageClass}
                  onChange={(e) => setAgeClass(e.target.value)}
                  className='w-full bg-[#00000061] border border-gray-600 rounded px-3 py-2 text-white text-sm'
                >
                  <option value=''>Select Age Class</option>
                  <option value='Youth'>Youth</option>
                  <option value='Junior'>Junior</option>
                  <option value='Adult'>Adult</option>
                  <option value='Senior'>Senior</option>
                </select>
              </div>
              
              <div>
                <label className='block text-xs text-gray-300 mb-1'>Rule Style</label>
                <select
                  value={ruleStyle}
                  onChange={(e) => setRuleStyle(e.target.value)}
                  className='w-full bg-[#00000061] border border-gray-600 rounded px-3 py-2 text-white text-sm'
                >
                  <option value=''>Select Rule Style</option>
                  {/* Youth and Junior rules */}
                  {(ageClass === 'Youth' || ageClass === 'Junior') && (
                    <>
                      <option value='Point Sparring'>Point Sparring</option>
                      <option value='Light Contact'>Light Contact</option>
                      <option value='Continuous Sparring'>Continuous Sparring</option>
                    </>
                  )}
                  {/* Adult rules */}
                  {(ageClass === 'Adult' || ageClass === 'Senior' || !ageClass) && (
                    <>
                      <option value='Muay Thai'>Muay Thai</option>
                      <option value='K-1'>K-1</option>
                      <option value='Olympic'>Olympic</option>
                      <option value='Point Sparring'>Point Sparring</option>
                      <option value='Continuous'>Continuous</option>
                      <option value='Full Contact'>Full Contact</option>
                      <option value='Semi Contact'>Semi Contact</option>
                      <option value='Low Kick'>Low Kick</option>
                    </>
                  )}
                  {/* Default options */}
                  {!ageClass && (
                    <>
                      <option value='Point Sparring'>Point Sparring</option>
                      <option value='Continuous'>Continuous</option>
                      <option value='Full Contact'>Full Contact</option>
                      <option value='Semi Contact'>Semi Contact</option>
                    </>
                  )}
                </select>
              </div>
              
              <div>
                <label className='block text-xs text-gray-300 mb-1'>Weight Class</label>
                <select
                  value={weightClass}
                  onChange={(e) => setWeightClass(e.target.value)}
                  className='w-full bg-[#00000061] border border-gray-600 rounded px-3 py-2 text-white text-sm'
                >
                  <option value=''>Select Weight Class</option>
                  {/* Youth Weight Classes */}
                  {ageClass === 'Youth' && (
                    <>
                      <option value='40-45 lbs'>40-45 lbs</option>
                      <option value='45-50 lbs'>45-50 lbs</option>
                      <option value='50-55 lbs'>50-55 lbs</option>
                      <option value='55-60 lbs'>55-60 lbs</option>
                      <option value='60-65 lbs'>60-65 lbs</option>
                    </>
                  )}
                  {/* Junior Weight Classes */}
                  {ageClass === 'Junior' && (
                    <>
                      <option value='60-65 lbs'>60-65 lbs</option>
                      <option value='65-70 lbs'>65-70 lbs</option>
                      <option value='70-75 lbs'>70-75 lbs</option>
                      <option value='75-80 lbs'>75-80 lbs</option>
                      <option value='80-85 lbs'>80-85 lbs</option>
                      <option value='85-90 lbs'>85-90 lbs</option>
                    </>
                  )}
                  {/* Adult Weight Classes */}
                  {(ageClass === 'Adult' || ageClass === 'Senior' || !ageClass) && (
                    <>
                      <option value='100-110 lbs'>100-110 lbs</option>
                      <option value='110-120 lbs'>110-120 lbs</option>
                      <option value='120-130 lbs'>120-130 lbs</option>
                      <option value='130-140 lbs'>130-140 lbs</option>
                      <option value='140-150 lbs'>140-150 lbs</option>
                      <option value='150-160 lbs'>150-160 lbs</option>
                      <option value='160-170 lbs'>160-170 lbs</option>
                      <option value='170-180 lbs'>170-180 lbs</option>
                      <option value='180-200 lbs'>180-200 lbs</option>
                      <option value='200+ lbs'>200+ lbs</option>
                    </>
                  )}
                  {/* Default options if no age class selected */}
                  {!ageClass && (
                    <>
                      <option value='60-65 lbs'>60-65 lbs</option>
                      <option value='65-70 lbs'>65-70 lbs</option>
                      <option value='70-75 lbs'>70-75 lbs</option>
                      <option value='75-80 lbs'>75-80 lbs</option>
                      <option value='80-85 lbs'>80-85 lbs</option>
                      <option value='85+ lbs'>85+ lbs</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
          
          <div className='grid grid-cols-4 gap-6'>
            <InputBox 
              label='Group' 
              placeholder='e.g., Group A'
              value={group} 
              onChange={setGroup} 
            />
            <InputBox
              label='Ring Number'
              placeholder='e.g., Ring 1'
              value={ringNumber}
              onChange={setRingNumber}
            />
            <InputBox
              label='Bracket Sequence Number'
              type='number'
              placeholder='e.g., 1'
              min='1'
              value={bracketSequence}
              onChange={setBracketSequence}
            />
          </div>
        </div>

        {/* Bracket Settings Section */}
        <div className='bg-[#07091D] p-6 rounded-lg'>
          <h3 className='text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2'>
            Bracket Settings
          </h3>
          <div className='grid grid-cols-4 gap-6'>
            <InputBox
              label='Start on Day Number'
              required={false}
              type='number'
              placeholder='e.g., 1'
              min='1'
              value={startDayNumber}
              onChange={setStartDayNumber}
            />
            <InputBox
              label='Bout Round Duration (sec)'
              required
              type='number'
              placeholder='e.g., 120'
              min='1'
              value={boutRound}
              onChange={setBoutRound}
            />
            <InputBox
              label='Max Competitors'
              required
              type='number'
              placeholder='e.g., 16'
              min='1'
              value={maxCompetitors}
              onChange={setMaxCompetitors}
            />
          </div>
          
          <div className='mt-4 text-sm text-gray-400'>
            Note: The max competitor count for this bracket above only applies to
            online registrations. It does not affect what you can do here.
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex space-x-4 my-8 justify-center'>
          <ActionButton
            icon={<CircleCheck size={14} />}
            label='Update Settings'
            bg='linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)'
            onClick={handleSaveChanges}
            disabled={loading}
          />
          <ActionButton
            icon={<Play size={14} />}
            label='Start Bracket'
            bg='#4CAF50'
            onClick={handleStartBracket}
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
