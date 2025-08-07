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
  const [validationErrors, setValidationErrors] = useState({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [originalData, setOriginalData] = useState({})
  
  // Title component fields for auto-generating bracket name
  const [gender, setGender] = useState('')
  const [ruleStyle, setRuleStyle] = useState('')
  const [weightClass, setWeightClass] = useState('')
  const [ageClass, setAgeClass] = useState('')

  useEffect(() => {
    if (expandedBracket) {
      const initialData = {
        bracketName: expandedBracket.title || expandedBracket.divisionTitle || '',
        startDayNumber: expandedBracket.startDayNumber?.toString() || '',
        group: expandedBracket.group || '',
        ringNumber: expandedBracket.ringNumber || expandedBracket.ring || '',
        bracketSequence: expandedBracket.bracketSequence?.toString() || expandedBracket.bracketNumber?.toString() || '',
        boutRound: expandedBracket.boutRound?.toString() || '',
        maxCompetitors: expandedBracket.maxCompetitors?.toString() || expandedBracket.fighters?.length?.toString() || '',
        gender: expandedBracket.gender || '',
        ruleStyle: expandedBracket.ruleStyle || '',
        weightClass: expandedBracket.weightClass ? 
          (typeof expandedBracket.weightClass === 'string' ? 
            expandedBracket.weightClass.replace(' undefined', ' lbs') : 
            `${expandedBracket.weightClass.min}-${expandedBracket.weightClass.max} ${expandedBracket.weightClass.unit || 'lbs'}`) : '',
        ageClass: expandedBracket.ageClass || ''
      }
      
      // Store original data for comparison
      setOriginalData(initialData)
      
      // Only update form fields if we don't have unsaved changes
      if (!hasUnsavedChanges) {
        setBracketName(initialData.bracketName)
        setStartDayNumber(initialData.startDayNumber)
        setGroup(initialData.group)
        setRingNumber(initialData.ringNumber)
        setBracketSequence(initialData.bracketSequence)
        setBoutRound(initialData.boutRound)
        setMaxCompetitors(initialData.maxCompetitors)
        setGender(initialData.gender)
        setRuleStyle(initialData.ruleStyle)
        setWeightClass(initialData.weightClass)
        setAgeClass(initialData.ageClass)
      }
    }
  }, [expandedBracket, hasUnsavedChanges])

  // Auto-generate bracket name when title components change
  useEffect(() => {
    if (gender || ruleStyle || weightClass || ageClass) {
      const nameParts = [gender, ageClass, ruleStyle, weightClass]
        .filter(part => part && part.trim() && part !== 'undefined')
        .map(part => part.toString().trim().replace(' undefined', ' lbs'))
      if (nameParts.length > 0) {
        setBracketName(nameParts.join(' '))
      }
    }
  }, [gender, ruleStyle, weightClass, ageClass])

  // Track changes to detect unsaved modifications
  useEffect(() => {
    const currentData = {
      bracketName,
      startDayNumber,
      group, 
      ringNumber,
      bracketSequence,
      boutRound,
      maxCompetitors,
      gender,
      ruleStyle,
      weightClass,
      ageClass
    }
    
    const hasChanges = Object.keys(originalData).some(key => 
      originalData[key] !== currentData[key]
    )
    
    setHasUnsavedChanges(hasChanges)
  }, [bracketName, startDayNumber, group, ringNumber, bracketSequence, boutRound, maxCompetitors, gender, ruleStyle, weightClass, ageClass, originalData])

  // Warn user about unsaved changes when leaving page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return 'You have unsaved changes. Are you sure you want to leave?'
      }
    }

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  const handleSaveChanges = async () => {
    if (!onUpdate || !expandedBracket) return
    
    // Clear previous validation errors
    setValidationErrors({})
    
    // Enhanced validation
    const errors = {}
    
    // Bracket name validation - allow characters commonly used in auto-generation and manual entry
    if (!bracketName || bracketName.trim() === '') {
      errors.bracketName = 'Bracket name is required'
    } else if (bracketName.trim().length > 100) {
      errors.bracketName = 'Bracket name must be less than 100 characters'
    } else if (!/^[a-zA-Z0-9\s'&.+\-()/#:,_]+$/.test(bracketName.trim())) {
      errors.bracketName = 'Bracket name contains invalid characters. Allowed: letters, numbers, spaces, and common punctuation'
    }
    
    // Mandatory field validation for numeric fields
    if (!startDayNumber || startDayNumber.trim() === '') {
      errors.startDayNumber = 'Start on Day Number is required'
    } else if (!/^\d+$/.test(startDayNumber.trim()) || parseInt(startDayNumber) <= 0) {
      errors.startDayNumber = 'Start on Day Number must be a positive number'
    }
    
    if (!boutRound || boutRound.trim() === '') {
      errors.boutRound = 'Bout Round Duration is required'
    } else if (!/^\d+$/.test(boutRound.trim()) || parseInt(boutRound) <= 0) {
      errors.boutRound = 'Bout Round Duration must be a positive number (seconds)'
    }
    
    if (!maxCompetitors || maxCompetitors.trim() === '') {
      errors.maxCompetitors = 'Max Competitors is required'
    } else if (!/^\d+$/.test(maxCompetitors.trim()) || parseInt(maxCompetitors) <= 0) {
      errors.maxCompetitors = 'Max Competitors must be a positive number'
    }
    
    // Bracket Sequence validation
    if (bracketSequence && (!/^\d+$/.test(bracketSequence.trim()) || parseInt(bracketSequence) <= 0)) {
      errors.bracketSequence = 'Bracket Sequence must be a positive number'
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      // Show first error as main feedback
      const firstError = Object.values(errors)[0]
      return // Don't proceed with save
    }
    
    setLoading(true)
    try {
      const updateData = {
        title: bracketName.trim(), // Use the actual bracket name for the title
        divisionTitle: bracketName.trim(), // Store actual name in divisionTitle
        startDayNumber: parseInt(startDayNumber),
        boutRound: parseInt(boutRound), 
        maxCompetitors: parseInt(maxCompetitors),
        group: group || '',
        ringNumber: ringNumber || '',
        bracketNumber: parseInt(bracketSequence) || expandedBracket.bracketNumber,
        // Include title component fields
        gender: gender || '',
        ruleStyle: ruleStyle || expandedBracket.ruleStyle || '',
        // Keep existing weightClass object structure for API
        weightClass: expandedBracket.weightClass || {min: 0, max: 999, unit: 'lbs'},
        ageClass: ageClass || expandedBracket.ageClass || '',
        // Preserve other bracket data to avoid overwrites
        sport: expandedBracket.sport,
        status: expandedBracket.status,
        event: expandedBracket.event
      }
      
      console.log('Updating bracket with data:', updateData)
      
      const result = await onUpdate(expandedBracket._id, updateData)
      if (result.success) {
        alert('✓ Changes saved successfully!')
        
        // Fetch the updated bracket data from the server
        try {
          const response = await fetch(`${API_BASE_URL}/brackets/${expandedBracket._id}`, {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          })
          
          if (response.ok) {
            const refreshedData = await response.json()
            if (refreshedData.success && refreshedData.data) {
              // Update form fields with fresh data from server
              const refreshedBracket = refreshedData.data
              
              const updatedData = {
                bracketName: refreshedBracket.divisionTitle || refreshedBracket.title || '',
                startDayNumber: refreshedBracket.startDayNumber?.toString() || startDayNumber || '1', // Keep user input if API doesn't save
                group: refreshedBracket.group || '',
                ringNumber: refreshedBracket.ringNumber || refreshedBracket.ring || '',
                bracketSequence: refreshedBracket.bracketSequence?.toString() || refreshedBracket.bracketNumber?.toString() || '',
                boutRound: refreshedBracket.boutRound?.toString() || boutRound || '120', // Keep user input if API doesn't save
                maxCompetitors: refreshedBracket.maxCompetitors?.toString() || maxCompetitors || refreshedBracket.fighters?.length?.toString() || '16', // Keep user input if API doesn't save
                gender: refreshedBracket.gender || '',
                ruleStyle: refreshedBracket.ruleStyle || '',
                weightClass: refreshedBracket.weightClass ? 
                  (typeof refreshedBracket.weightClass === 'string' ? 
                    refreshedBracket.weightClass.replace(' undefined', ' lbs') : 
                    `${refreshedBracket.weightClass.min}-${refreshedBracket.weightClass.max} ${refreshedBracket.weightClass.unit || 'lbs'}`) : '',
                ageClass: refreshedBracket.ageClass || ''
              }
              
              console.log('Updating form fields with:', updatedData)
              
              // Update all form fields with refreshed data
              setBracketName(updatedData.bracketName)
              setStartDayNumber(updatedData.startDayNumber)
              setGroup(updatedData.group)
              setRingNumber(updatedData.ringNumber)
              setBracketSequence(updatedData.bracketSequence)
              setBoutRound(updatedData.boutRound)
              setMaxCompetitors(updatedData.maxCompetitors)
              setGender(updatedData.gender)
              setRuleStyle(updatedData.ruleStyle)
              setWeightClass(updatedData.weightClass)
              setAgeClass(updatedData.ageClass)
              
              // Update original data for comparison
              setOriginalData(updatedData)
              
              console.log('Form fields updated. Current values:', {
                bracketName: updatedData.bracketName,
                startDayNumber: updatedData.startDayNumber,
                boutRound: updatedData.boutRound,
                maxCompetitors: updatedData.maxCompetitors
              })
            }
          }
        } catch (fetchError) {
          console.error('Error fetching updated bracket data:', fetchError)
          // If fetch fails, use the data we sent as fallback
          const savedData = {
            bracketName: updateData.divisionTitle || updateData.title,
            startDayNumber: updateData.startDayNumber.toString(),
            group: updateData.group,
            ringNumber: updateData.ringNumber,
            bracketSequence: updateData.bracketNumber.toString(),
            boutRound: updateData.boutRound.toString(),
            maxCompetitors: updateData.maxCompetitors.toString(),
            gender: updateData.gender,
            ruleStyle: updateData.ruleStyle,
            weightClass: updateData.weightClass,
            ageClass: updateData.ageClass
          }
          setOriginalData(savedData)
        }
        
        setHasUnsavedChanges(false)
        setValidationErrors({}) // Clear any validation errors
        
        // Force a small delay to ensure state updates are applied
        setTimeout(() => {
          console.log('Final form state check:', {
            startDayNumber,
            boutRound, 
            maxCompetitors,
            bracketName
          })
        }, 100)
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
    if (confirm('Are you sure you want to reset all changes? This will revert to the last saved values.')) {
      // Reset to original data
      setBracketName(originalData.bracketName || '')
      setStartDayNumber(originalData.startDayNumber || '')
      setGroup(originalData.group || '')
      setRingNumber(originalData.ringNumber || '')
      setBracketSequence(originalData.bracketSequence || '')
      setBoutRound(originalData.boutRound || '')
      setMaxCompetitors(originalData.maxCompetitors || '')
      setGender(originalData.gender || '')
      setRuleStyle(originalData.ruleStyle || '')
      setWeightClass(originalData.weightClass || '')
      setAgeClass(originalData.ageClass || '')
      
      // Clear validation errors and unsaved changes flag
      setValidationErrors({})
      setHasUnsavedChanges(false)
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
              onChange={(e) => {
                // Allow characters commonly used in auto-generation and manual entry
                const cleanValue = e.target.value.replace(/[^a-zA-Z0-9\s'&.+\-()/#:,_]/g, '')
                setBracketName(cleanValue)
                // Clear validation error when user starts typing
                if (validationErrors.bracketName) {
                  setValidationErrors(prev => ({ ...prev, bracketName: undefined }))
                }
              }}
              onKeyPress={(e) => {
                // Prevent invalid characters - allow characters used in auto-generation
                if (!/[a-zA-Z0-9\s'&.+\-()/#:,_]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                  e.preventDefault()
                }
              }}
              placeholder='Auto-generated or enter manually'
              className={`w-full bg-transparent text-white text-xl rounded py-1 focus:outline-none placeholder-gray-400 ${
                validationErrors.bracketName ? 'border-b-2 border-red-500' : 'focus:border-white'
              }`}
            />
            {validationErrors.bracketName && (
              <div className='text-red-400 text-xs mt-1'>
                ⚠ {validationErrors.bracketName}
              </div>
            )}
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
              validation='alphanumeric'
            />
            <InputBox
              label='Ring Number'
              placeholder='e.g., Ring 1'
              value={ringNumber}
              onChange={setRingNumber}
              validation='alphanumeric'
            />
            <InputBox
              label='Bracket Sequence Number'
              type='number'
              placeholder='e.g., 1'
              min='1'
              value={bracketSequence}
              onChange={setBracketSequence}
              validation='numeric'
              required={true}
              error={validationErrors.bracketSequence}
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
              required={true}
              type='number'
              placeholder='e.g., 1'
              min='1'
              value={startDayNumber}
              onChange={setStartDayNumber}
              validation='numeric'
              error={validationErrors.startDayNumber}
            />
            <InputBox
              label='Bout Round Duration (sec)'
              required={true}
              type='number'
              placeholder='e.g., 120'
              min='1'
              value={boutRound}
              onChange={setBoutRound}
              validation='numeric'
              error={validationErrors.boutRound}
            />
            <InputBox
              label='Max Competitors'
              required={true}
              type='number'
              placeholder='e.g., 16'
              min='1'
              value={maxCompetitors}
              onChange={setMaxCompetitors}
              validation='numeric'
              error={validationErrors.maxCompetitors}
            />
          </div>
          
          <div className='mt-4 text-sm text-gray-400'>
            Note: The max competitor count for this bracket above only applies to
            online registrations. It does not affect what you can do here.
          </div>
        </div>

        {/* Unsaved Changes Indicator */}
        {hasUnsavedChanges && Object.keys(validationErrors).length === 0 && (
          <div className='bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4'>
            <div className='flex items-center text-yellow-400 text-sm'>
              <span className='mr-2'>⚠</span>
              <span>You have unsaved changes. Click "Update Settings" to save or "Reset" to discard.</span>
            </div>
          </div>
        )}

        {/* Validation Error Display */}
        {Object.keys(validationErrors).length > 0 && (
          <div className='bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6'>
            <div className='flex items-center mb-2'>
              <span className='text-red-400 text-sm font-medium'>⚠ Validation Errors:</span>
            </div>
            <ul className='list-disc list-inside space-y-1'>
              {Object.entries(validationErrors).map(([field, error]) => (
                <li key={field} className='text-red-300 text-sm'>
                  {error}
                </li>
              ))}
            </ul>
            <div className='text-xs text-red-400 mt-2'>
              Please fix the above errors before saving changes.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex space-x-4 my-8 justify-center'>
          <ActionButton
            icon={<CircleCheck size={14} />}
            label={hasUnsavedChanges ? 'Save Changes' : 'Update Settings'}
            bg={hasUnsavedChanges ? '#4CAF50' : 'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)'}
            onClick={handleSaveChanges}
            disabled={loading || Object.keys(validationErrors).length > 0}
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
