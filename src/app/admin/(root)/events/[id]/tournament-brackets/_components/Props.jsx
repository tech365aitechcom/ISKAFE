'use client'

import React, { useEffect, useState } from 'react'
import ActionButton from './ActionButton'
import { CircleCheck, Copy, RotateCcw, Trash, X, Play } from 'lucide-react'
import InputBox from './InputBox'
import { API_BASE_URL, apiConstants } from '../../../../../../../constants'
import useStore from '../../../../../../../stores/useStore'
import { enqueueSnackbar } from 'notistack'
import axios from 'axios'

export default function Props({
  expandedBracket,
  handleClose,
  onUpdate,
  eventId,
}) {
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
  const [hasUnsavedPropertiesChanges, setHasUnsavedPropertiesChanges] =
    useState(false)
  const [hasUnsavedSettingsChanges, setHasUnsavedSettingsChanges] =
    useState(false)
  const [originalData, setOriginalData] = useState({})

  // Title component fields for auto-generating bracket name
  const [gender, setGender] = useState('')
  const [ruleStyle, setRuleStyle] = useState('')
  const [weightClass, setWeightClass] = useState('')
  const [ageClass, setAgeClass] = useState('')

  useEffect(() => {
    if (expandedBracket) {
      const initialData = {
        bracketName:
          expandedBracket.title || expandedBracket.divisionTitle || '',
        startDayNumber: expandedBracket.startDayNumber?.toString() || '',
        group: expandedBracket.group || '',
        ringNumber: expandedBracket.ringNumber || expandedBracket.ring || '',
        bracketSequence:
          expandedBracket.bracketSequence?.toString() ||
          expandedBracket.bracketNumber?.toString() ||
          '',
        boutRound: expandedBracket.boutRound?.toString() || '',
        maxCompetitors:
          expandedBracket.maxCompetitors?.toString() ||
          expandedBracket.fighters?.length?.toString() ||
          '',
        gender: expandedBracket.gender || '',
        ruleStyle: expandedBracket.ruleStyle || '',
        weightClass: expandedBracket.weightClass
          ? typeof expandedBracket.weightClass === 'string'
            ? expandedBracket.weightClass.replace(' undefined', ' lbs')
            : `${expandedBracket.weightClass.min}-${
                expandedBracket.weightClass.max
              } ${expandedBracket.weightClass.unit || 'lbs'}`
          : '',
        ageClass: expandedBracket.ageClass || '',
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
        .filter((part) => part && part.trim() && part !== 'undefined')
        .map((part) => part.toString().trim().replace(' undefined', ' lbs'))
      if (nameParts.length > 0) {
        setBracketName(nameParts.join(' '))
      }
    }
  }, [gender, ruleStyle, weightClass, ageClass])

  // Track changes to detect unsaved modifications for both sections
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
      ageClass,
    }

    // Properties section fields
    const propertiesFields = [
      'bracketName',
      'group',
      'ringNumber',
      'bracketSequence',
      'gender',
      'ruleStyle',
      'weightClass',
      'ageClass',
    ]
    const hasPropertiesChanges = propertiesFields.some(
      (key) => originalData[key] !== currentData[key]
    )

    // Settings section fields
    const settingsFields = ['startDayNumber', 'boutRound', 'maxCompetitors']
    const hasSettingsChanges = settingsFields.some(
      (key) => originalData[key] !== currentData[key]
    )

    const hasChanges = hasPropertiesChanges || hasSettingsChanges

    setHasUnsavedChanges(hasChanges)
    setHasUnsavedPropertiesChanges(hasPropertiesChanges)
    setHasUnsavedSettingsChanges(hasSettingsChanges)
  }, [
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
    ageClass,
    originalData,
  ])

  // Warn user about unsaved changes when leaving page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue =
          'You have unsaved changes. Are you sure you want to leave?'
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

  const handleSaveProperties = async () => {
    if (!onUpdate || !expandedBracket) return

    // Clear previous validation errors
    setValidationErrors({})

    // Enhanced validation for properties
    const errors = {}

    // Bracket name validation - allow characters commonly used in auto-generation and manual entry
    if (!bracketName || bracketName.trim() === '') {
      errors.bracketName = 'Bracket name is required'
    } else if (bracketName.trim().length > 100) {
      errors.bracketName = 'Bracket name must be less than 100 characters'
    } else if (!/^[a-zA-Z0-9\s'&.+\-()/#:,_]+$/.test(bracketName.trim())) {
      errors.bracketName =
        'Bracket name contains invalid characters. Allowed: letters, numbers, spaces, and common punctuation'
    }

    // Group validation (alphanumeric)
    if (group && !/^[a-zA-Z0-9\s'&.-]+$/.test(group.trim())) {
      errors.group =
        'Group can only contain letters, numbers, spaces, and common punctuation'
    }

    // Ring Number validation (alphanumeric)
    if (ringNumber && !/^[a-zA-Z0-9\s'&.-]+$/.test(ringNumber.trim())) {
      errors.ringNumber =
        'Ring Number can only contain letters, numbers, spaces, and common punctuation'
    }

    // Bracket Sequence validation (required and numeric)
    if (!bracketSequence || bracketSequence.trim() === '') {
      errors.bracketSequence = 'Bracket Sequence Number is required'
    } else if (
      !/^\d+$/.test(bracketSequence.trim()) ||
      parseInt(bracketSequence) <= 0
    ) {
      errors.bracketSequence = 'Bracket Sequence must be a positive number'
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return // Don't proceed with save
    }

    setLoading(true)
    try {
      const updateData = {
        title: bracketName.trim(), // Use the actual bracket name for the title
        divisionTitle: bracketName.trim(), // Store actual name in divisionTitle
        group: group || '',
        ringNumber: ringNumber || '',
        bracketNumber:
          parseInt(bracketSequence) || expandedBracket.bracketNumber,
        // Include title component fields
        gender: gender || '',
        ruleStyle: ruleStyle || expandedBracket.ruleStyle || '',
        // Keep existing weightClass object structure for API
        weightClass: expandedBracket.weightClass,
        ageClass: ageClass || expandedBracket.ageClass || '',
        // Preserve other bracket data to avoid overwrites
        sport: expandedBracket.sport,
      }

      console.log('Updating bracket properties with data:', updateData)
      const result = await axios.put(
        `${API_BASE_URL}/brackets/${expandedBracket._id}`,
        updateData
      )
      if (result.status === apiConstants.success) {
        enqueueSnackbar('Bracket properties saved successfully!', {
          variant: 'success',
        })

        setHasUnsavedPropertiesChanges(false)
        setValidationErrors({}) // Clear any validation errors
      } else {
        enqueueSnackbar(
          'Error saving properties: ' + (result.error || 'Unknown error'),
          {
            variant: 'error',
          }
        )
      }
    } catch (error) {
      console.error('Save properties error:', error)
      enqueueSnackbar('Error saving properties: ' + error.message, {
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!onUpdate || !expandedBracket) return

    // Clear previous validation errors
    setValidationErrors({})

    // Enhanced validation for settings
    const errors = {}

    // Mandatory field validation for numeric fields
    if (!startDayNumber || startDayNumber.trim() === '') {
      errors.startDayNumber = 'Start on Day Number is required'
    } else if (
      !/^\d+$/.test(startDayNumber.trim()) ||
      parseInt(startDayNumber) <= 0
    ) {
      errors.startDayNumber = 'Start on Day Number must be a positive number'
    }

    if (!boutRound || boutRound.trim() === '') {
      errors.boutRound = 'Bout Round Duration is required'
    } else if (!/^\d+$/.test(boutRound.trim()) || parseInt(boutRound) <= 0) {
      errors.boutRound =
        'Bout Round Duration must be a positive number (seconds)'
    }

    if (!maxCompetitors || maxCompetitors.trim() === '') {
      errors.maxCompetitors = 'Max Competitors is required'
    } else if (
      !/^\d+$/.test(maxCompetitors.trim()) ||
      parseInt(maxCompetitors) <= 0
    ) {
      errors.maxCompetitors = 'Max Competitors must be a positive number'
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return // Don't proceed with save
    }

    setLoading(true)
    try {
      const updateData = {
        startDayNumber: parseInt(startDayNumber),
        boutRound: parseInt(boutRound),
        maxCompetitors: parseInt(maxCompetitors),
      }

      console.log('Updating bracket settings with data:', updateData)

      const result = await axios.put(
        `${API_BASE_URL}/brackets/${expandedBracket._id}`,
        updateData
      )
      if (result.status === apiConstants.success) {
        enqueueSnackbar('Bracket settings saved successfully!', {
          variant: 'success',
        })

        onUpdate()
        setHasUnsavedSettingsChanges(false)
        setValidationErrors({}) // Clear any validation errors
      } else {
        enqueueSnackbar(
          'Error saving settings: ' + (result.error || 'Unknown error'),
          {
            variant: 'error',
          }
        )
      }
    } catch (error) {
      console.error('Save settings error:', error)
      enqueueSnackbar('Error saving settings: ' + error.message, {
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicate = async () => {
    if (!expandedBracket) return

    setLoading(true)
    try {
      // Create a copy of the bracket data with proper validation
      const duplicateData = {
        bracketNumber: (expandedBracket.bracketNumber || 0) + 1,
        title: `${expandedBracket.title || 'Bracket'}`,
        divisionTitle: `${expandedBracket.divisionTitle || ''} (Copy)`,
        sport: expandedBracket.sport || '',
        ruleStyle: expandedBracket.ruleStyle || '',
        ageClass: expandedBracket.ageClass || '',
        weightClass: expandedBracket.weightClass,
        group: expandedBracket.group || '',
        ringNumber: expandedBracket.ring || '',
        boutRound: 0,
        maxCompetitors: 0,
        fighters: [],
        event: expandedBracket.event?._id || '',
      }

      console.log('Duplicating bracket with data:', duplicateData)

      const response = await fetch(`${API_BASE_URL}/brackets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(duplicateData),
      })

      const responseData = await response.json()
      console.log('Duplicate response:', responseData)

      if (response.ok && responseData.success) {
        enqueueSnackbar('Bracket duplicated successfully!', {
          variant: 'success',
        })
        onUpdate()
      } else {
        const errorMsg = responseData.message || `HTTP ${response.status}`
        enqueueSnackbar('Error duplicating bracket: ' + errorMsg, {
          variant: 'error',
        })
        console.error('Duplicate error details:', responseData)
      }
    } catch (error) {
      console.error('Duplicate bracket error:', error)
      enqueueSnackbar('Error duplicating bracket: ' + error.message, {
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
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
    setHasUnsavedPropertiesChanges(false)
    setHasUnsavedSettingsChanges(false)
  }

  const handleUpdateBracketStatus = async () => {
    if (!expandedBracket) return

    setLoading(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/brackets/${expandedBracket._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            status: expandedBracket.status === 'Open' ? 'Started' : 'Completed',
          }),
        }
      )

      if (response.ok) {
        enqueueSnackbar('Bracket started successfully!', {
          variant: 'success',
        })
        if (onUpdate) {
          onUpdate()
        }
      } else {
        enqueueSnackbar('Error starting bracket', {
          variant: 'error',
        })
      }
    } catch (error) {
      enqueueSnackbar('Error starting bracket: ' + error.message, {
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!expandedBracket) return

    if (
      confirm(
        `Are you sure you want to delete this bracket? This action cannot be undone.`
      )
    ) {
      setLoading(true)
      try {
        const response = await fetch(
          `${API_BASE_URL}/brackets/${expandedBracket._id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        )

        if (response.ok) {
          enqueueSnackbar('Bracket deleted successfully!', {
            variant: 'success',
          })
          handleClose() // Close the details panel
          onUpdate() // Refresh to update the list
        } else {
          enqueueSnackbar('Error deleting bracket', {
            variant: 'error',
          })
        }
      } catch (error) {
        enqueueSnackbar('Error deleting bracket: ' + error.message, {
          variant: 'error',
        })
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
                Reset
              </button>
            </div>
            <input
              type='text'
              value={bracketName || ''}
              onChange={(e) => {
                // Allow characters commonly used in auto-generation and manual entry
                const cleanValue = e.target.value.replace(
                  /[^a-zA-Z0-9\s'&.+\-()/#:,_]/g,
                  ''
                )
                setBracketName(cleanValue)
                // Clear validation error when user starts typing
                if (validationErrors.bracketName) {
                  setValidationErrors((prev) => {
                    const { bracketName, ...rest } = prev
                    return rest
                  })
                }
              }}
              onKeyPress={(e) => {
                // Prevent invalid characters - allow characters used in auto-generation
                if (
                  !/[a-zA-Z0-9\s'&.+\-()/#:,_]/.test(e.key) &&
                  ![
                    'Backspace',
                    'Delete',
                    'Tab',
                    'ArrowLeft',
                    'ArrowRight',
                  ].includes(e.key)
                ) {
                  e.preventDefault()
                }
              }}
              placeholder='Auto-generated or enter manually'
              className={`w-full bg-transparent text-white text-xl rounded py-1 focus:outline-none placeholder-gray-400 ${
                validationErrors.bracketName
                  ? 'border-b-2 border-red-500'
                  : 'focus:border-white'
              }`}
            />
            {validationErrors.bracketName && (
              <div className='text-red-400 text-xs mt-1'>
                ⚠ {validationErrors.bracketName}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleClose}
          className='ml-4 p-2 hover:bg-gray-700 rounded'
        >
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
            <h4 className='text-md font-medium text-white mb-3'>
              Title Components
            </h4>
            <div className='grid grid-cols-4 gap-4'>
              <div>
                <label className='block text-xs text-gray-300 mb-1'>
                  Gender
                </label>
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
                <label className='block text-xs text-gray-300 mb-1'>
                  Age Class
                </label>
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
                <label className='block text-xs text-gray-300 mb-1'>
                  Rule Style
                </label>
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
                      <option value='Continuous Sparring'>
                        Continuous Sparring
                      </option>
                    </>
                  )}
                  {/* Adult rules */}
                  {(ageClass === 'Adult' ||
                    ageClass === 'Senior' ||
                    !ageClass) && (
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
                <label className='block text-xs text-gray-300 mb-1'>
                  Weight Class
                </label>
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
                  {(ageClass === 'Adult' ||
                    ageClass === 'Senior' ||
                    !ageClass) && (
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
              onChange={(value) => {
                setGroup(value)
                // Clear validation error when user starts typing
                if (validationErrors.group) {
                  setValidationErrors((prev) => {
                    const { group, ...rest } = prev
                    return rest
                  })
                }
              }}
              validation='alphanumeric'
              error={validationErrors.group}
              disabled={loading}
            />
            <InputBox
              label='Ring Number'
              placeholder='e.g., Ring 1'
              value={ringNumber}
              onChange={(value) => {
                setRingNumber(value)
                // Clear validation error when user starts typing
                if (validationErrors.ringNumber) {
                  setValidationErrors((prev) => {
                    const { ringNumber, ...rest } = prev
                    return rest
                  })
                }
              }}
              validation='alphanumeric'
              error={validationErrors.ringNumber}
              disabled={loading}
            />
            <InputBox
              label='Bracket Sequence Number'
              type='number'
              placeholder='e.g., 1'
              min='1'
              value={bracketSequence}
              onChange={(value) => {
                setBracketSequence(value)
                // Clear validation error when user starts typing
                if (validationErrors.bracketSequence) {
                  setValidationErrors((prev) => {
                    const { bracketSequence, ...rest } = prev
                    return rest
                  })
                }
              }}
              validation='numeric'
              required={true}
              error={validationErrors.bracketSequence}
              disabled={loading}
            />
          </div>

          {/* Bracket Properties Save Button */}
          <div className='mt-6 flex justify-end'>
            <ActionButton
              icon={<CircleCheck size={14} />}
              label={
                hasUnsavedPropertiesChanges
                  ? 'Save Properties'
                  : 'Update Properties'
              }
              bg={
                hasUnsavedPropertiesChanges
                  ? '#4CAF50'
                  : 'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)'
              }
              onClick={handleSaveProperties}
              disabled={
                loading ||
                Object.keys(validationErrors).some((key) =>
                  [
                    'bracketName',
                    'group',
                    'ringNumber',
                    'bracketSequence',
                  ].includes(key)
                )
              }
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
              onChange={(value) => {
                setStartDayNumber(value)
                // Clear validation error when user starts typing
                if (validationErrors.startDayNumber) {
                  setValidationErrors((prev) => {
                    const { startDayNumber, ...rest } = prev
                    return rest
                  })
                }
              }}
              validation='numeric'
              error={validationErrors.startDayNumber}
              disabled={loading}
            />
            <InputBox
              label='Bout Round Duration (sec)'
              required={true}
              type='number'
              placeholder='e.g., 120'
              min='1'
              value={boutRound}
              onChange={(value) => {
                setBoutRound(value)
                // Clear validation error when user starts typing
                if (validationErrors.boutRound) {
                  setValidationErrors((prev) => {
                    const { boutRound, ...rest } = prev
                    return rest
                  })
                }
              }}
              validation='numeric'
              error={validationErrors.boutRound}
              disabled={loading}
            />
            <InputBox
              label='Max Competitors'
              required={true}
              type='number'
              placeholder='e.g., 16'
              min='1'
              value={maxCompetitors}
              onChange={(value) => {
                setMaxCompetitors(value)
                // Clear validation error when user starts typing
                if (validationErrors.maxCompetitors) {
                  setValidationErrors((prev) => {
                    const { maxCompetitors, ...rest } = prev
                    return rest
                  })
                }
              }}
              validation='numeric'
              error={validationErrors.maxCompetitors}
              disabled={loading}
            />
          </div>

          <div className='mt-4 text-sm text-gray-400'>
            Note: The max competitor count for this bracket above only applies
            to online registrations. It does not affect what you can do here.
          </div>

          {/* Bracket Settings Save Button */}
          <div className='mt-6 flex justify-end'>
            <ActionButton
              icon={<CircleCheck size={14} />}
              label={
                hasUnsavedSettingsChanges ? 'Save Settings' : 'Update Settings'
              }
              bg={
                hasUnsavedSettingsChanges
                  ? '#4CAF50'
                  : 'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)'
              }
              onClick={handleSaveSettings}
              disabled={
                loading ||
                Object.keys(validationErrors).some((key) =>
                  ['startDayNumber', 'boutRound', 'maxCompetitors'].includes(
                    key
                  )
                )
              }
            />
          </div>
        </div>

        {/* Unsaved Changes Indicators */}
        {hasUnsavedPropertiesChanges &&
          Object.keys(validationErrors).length === 0 && (
            <div className='bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4'>
              <div className='flex items-center text-yellow-400 text-sm'>
                <span className='mr-2'>⚠</span>
                <span>
                  You have unsaved changes in Bracket Properties. Click "Save
                  Properties" to save.
                </span>
              </div>
            </div>
          )}
        {hasUnsavedSettingsChanges &&
          Object.keys(validationErrors).length === 0 && (
            <div className='bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4'>
              <div className='flex items-center text-yellow-400 text-sm'>
                <span className='mr-2'>⚠</span>
                <span>
                  You have unsaved changes in Bracket Settings. Click "Save
                  Settings" to save.
                </span>
              </div>
            </div>
          )}

        {/* Validation Error Display */}
        {Object.keys(validationErrors).length > 0 && (
          <div className='bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6'>
            <div className='flex items-center mb-2'>
              <span className='text-red-400 text-sm font-medium'>
                ⚠ Validation Errors:
              </span>
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
          {(expandedBracket === 'Open' ||
            expandedBracket.status === 'Started') && (
            <ActionButton
              icon={<Play size={14} />}
              label='Start Bracket'
              bg='#4CAF50'
              onClick={handleUpdateBracketStatus}
              disabled={loading}
            />
          )}

          <ActionButton
            icon={<Copy size={14} />}
            label='Duplicate'
            bg='#FFCA28'
            onClick={handleDuplicate}
            disabled={loading}
          />
          {/* <ActionButton
            icon={<RotateCcw size={14} />}
            label='Reset'
            border
            onClick={handleReset}
            disabled={loading}
          /> */}
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
