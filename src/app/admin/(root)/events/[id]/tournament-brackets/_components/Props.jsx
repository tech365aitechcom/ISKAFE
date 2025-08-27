'use client'

import React, { useEffect, useState } from 'react'
import ActionButton from './ActionButton'
import { CircleCheck, Copy, RotateCcw, Trash, X, Play } from 'lucide-react'
import InputBox from './InputBox'
import { API_BASE_URL, apiConstants } from '../../../../../../../constants'
import useStore from '../../../../../../../stores/useStore'
import { enqueueSnackbar } from 'notistack'
import axios from 'axios'
import {
  allWeightClasses,
  mapWeightClassToDisplay,
  mapAgeClassFromOld,
  getWeightClassObject,
  proClassData,
  titleData,
  sportsData,
  disciplineData,
  bracketCriteriaData,
  bracketRuleData,
  bracketStatusData,
  getAgeClasses,
  getWeightClasses,
  getDisciplines,
  generateBracketName,
} from './bracketUtils'

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

  // Bracket form fields
  const [proClass, setProClass] = useState('')
  const [ruleStyle, setRuleStyle] = useState('')
  const [weightClass, setWeightClass] = useState('')
  const [ageClass, setAgeClass] = useState('')
  const [title, setTitle] = useState('')
  const [sport, setSport] = useState('')
  const [discipline, setDiscipline] = useState('')
  const [bracketCriteria, setBracketCriteria] = useState('')
  const [bracketStatus, setBracketStatus] = useState('')
  const [bracketNumber, setBracketNumber] = useState('')
  const [group, setGroup] = useState('')

  useEffect(() => {
    if (expandedBracket) {
      const initialData = {
        bracketName: expandedBracket.divisionTitle || '',
        startDayNumber: expandedBracket.startDayNumber?.toString() || '',
        ringNumber: expandedBracket.ring || '',
        bracketSequence: expandedBracket.sequenceNumber?.toString() || '',
        boutRound: expandedBracket.boutRound?.toString() || '',
        maxCompetitors:
          expandedBracket.maxCompetitors?.toString() ||
          expandedBracket.fighters?.length?.toString() ||
          '',
        proClass: expandedBracket.proClass || '',
        ruleStyle: expandedBracket.ruleStyle || '',
        weightClass: mapWeightClassToDisplay(null, expandedBracket.weightClass),
        ageClass: mapAgeClassFromOld(expandedBracket.ageClass),
        title: expandedBracket.title || '',
        sport: expandedBracket.sport || '',
        discipline: expandedBracket.discipline || '',
        bracketCriteria: expandedBracket.bracketCriteria || '',
        bracketStatus: expandedBracket.status || '',
        bracketNumber: expandedBracket.bracketNumber?.toString() || '',
        group: expandedBracket.group || '',
      }

      // Store original data for comparison
      setOriginalData(initialData)

      // Only update form fields if we don't have unsaved changes
      if (!hasUnsavedChanges) {
        setBracketName(initialData.bracketName)
        setStartDayNumber(initialData.startDayNumber)
        setRingNumber(initialData.ringNumber)
        setBracketSequence(initialData.bracketSequence)
        setBoutRound(initialData.boutRound)
        setMaxCompetitors(initialData.maxCompetitors)
        setProClass(initialData.proClass)
        setRuleStyle(initialData.ruleStyle)
        setWeightClass(initialData.weightClass)
        setAgeClass(initialData.ageClass)
        setTitle(initialData.title)
        setSport(initialData.sport)
        setDiscipline(initialData.discipline)
        setBracketCriteria(initialData.bracketCriteria)
        setBracketStatus(initialData.bracketStatus)
        setBracketNumber(initialData.bracketNumber)
        setGroup(initialData.group)
      }
    }
  }, [expandedBracket, hasUnsavedChanges])

  // Auto-generate bracket name when title components change
  useEffect(() => {
    if (proClass || ruleStyle || weightClass || ageClass) {
      const nameParts = [proClass, ageClass, ruleStyle, weightClass]
        .filter((part) => part && part.trim() && part !== 'undefined')
        .map((part) => part.toString().trim().replace(' undefined', ' lbs'))
      if (nameParts.length > 0) {
        setBracketName(nameParts.join(' '))
      }
    }
  }, [proClass, ruleStyle, weightClass, ageClass])

  // Generate bracket name functionality
  const handleGenerateName = () => {
    const ageClassOptions = getAgeClasses(sport)
    const weightClassOptions = getWeightClasses(ageClass)
    const generatedName = generateBracketName(
      ageClass,
      bracketCriteria,
      weightClass,
      ageClassOptions,
      weightClassOptions
    )
    setBracketName(generatedName)
  }

  // Track changes to detect unsaved modifications for both sections
  useEffect(() => {
    const currentData = {
      bracketName,
      startDayNumber,
      ringNumber,
      bracketSequence,
      boutRound,
      maxCompetitors,
      proClass,
      ruleStyle,
      weightClass,
      ageClass,
      title,
      sport,
      discipline,
      bracketCriteria,
      bracketStatus,
      bracketNumber,
      group,
    }

    // Properties section fields
    const propertiesFields = [
      'bracketName',
      'proClass',
      'ruleStyle',
      'weightClass',
      'ageClass',
      'title',
      'sport',
      'discipline',
      'bracketCriteria',
      'bracketStatus',
      'bracketNumber',
    ]
    const hasPropertiesChanges = propertiesFields.some(
      (key) => originalData[key] !== currentData[key]
    )

    // Settings section fields
    const settingsFields = [
      'startDayNumber',
      'group',
      'ringNumber',
      'bracketSequence',
      'boutRound',
      'maxCompetitors',
    ]
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
    ringNumber,
    bracketSequence,
    boutRound,
    maxCompetitors,
    proClass,
    ruleStyle,
    weightClass,
    ageClass,
    title,
    sport,
    discipline,
    bracketCriteria,
    bracketStatus,
    bracketNumber,
    group,
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

    // Bracket name validation - required
    if (!bracketName || bracketName.trim() === '') {
      errors.bracketName = 'Bracket name is required'
    } else if (bracketName.trim().length > 100) {
      errors.bracketName = 'Bracket name must be less than 100 characters'
    }

    // Title validation - required
    if (!title || title.trim() === '') {
      errors.title = 'Title is required'
    }

    // Bracket Rule validation - required
    if (!ruleStyle || ruleStyle.trim() === '') {
      errors.ruleStyle = 'Bracket Rule is required'
    }

    // Bracket Status validation - required
    if (!bracketStatus || bracketStatus.trim() === '') {
      errors.bracketStatus = 'Bracket Status is required'
    }

    // Pro Class validation - required
    if (!proClass || proClass.trim() === '') {
      errors.proClass = 'Pro Class is required'
    }

    // Sport validation - required
    if (!sport || sport.trim() === '') {
      errors.sport = 'Sport is required'
    }

    // Age Class validation - required
    if (!ageClass || ageClass.trim() === '') {
      errors.ageClass = 'Age Class is required'
    }

    // Weight Class validation - required
    if (!weightClass || weightClass.trim() === '') {
      errors.weightClass = 'Weight Class is required'
    }

    // Disciplines validation - required for BJJ
    if (sport?.includes('bjj') && (!discipline || discipline.trim() === '')) {
      errors.discipline = 'Discipline is required for BJJ'
    }

    // Bracket Criteria validation - required
    if (!bracketCriteria || bracketCriteria.trim() === '') {
      errors.bracketCriteria = 'Bracket Criteria is required'
    }

    // Bracket Number validation - required and must be positive
    if (!bracketNumber || bracketNumber.toString().trim() === '') {
      errors.bracketNumber = 'Bracket Number is required'
    } else {
      const numStr = String(bracketNumber).trim()
      if (!/^\d+$/.test(numStr) || parseInt(numStr) <= 0) {
        errors.bracketNumber = 'Bracket Number must be a positive number'
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return // Don't proceed with save
    }

    setLoading(true)
    try {
      const weightClassObj = getWeightClassObject(weightClass)

      const updateData = {
        title: title || expandedBracket.title || '',
        divisionTitle: bracketName.trim(), // Store actual name in divisionTitle
        ringNumber: ringNumber || '',
        sequenceNumber: parseInt(bracketSequence),
        // Include title component fields
        proClass: proClass || '',
        ruleStyle: ruleStyle || expandedBracket.ruleStyle || '',
        // Convert weight class value back to object structure for API
        weightClass: weightClassObj || expandedBracket.weightClass,
        ageClass: ageClass || expandedBracket.ageClass || '',
        // Include new dropdown fields
        sport: sport || expandedBracket.sport || '',
        discipline: discipline || expandedBracket.discipline || '',
        bracketCriteria:
          bracketCriteria || expandedBracket.bracketCriteria || '',
        status: bracketStatus || expandedBracket.status || '',
        bracketNumber:
          parseInt(bracketNumber) || expandedBracket.bracketNumber || 1,
        group: group || expandedBracket.group || '',
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

    // Start on Day Number is OPTIONAL - only validate if provided
    if (startDayNumber && String(startDayNumber).trim() !== '') {
      const dayStr = String(startDayNumber).trim()
      if (!/^\d+$/.test(dayStr) || parseInt(dayStr) <= 0) {
        errors.startDayNumber = 'Start on Day Number must be a positive number'
      }
    }

    // Ring Number validation (optional but must be positive if provided)
    if (ringNumber && String(ringNumber).trim() !== '') {
      const ringStr = String(ringNumber).trim()
      if (!/^\d+$/.test(ringStr) || parseInt(ringStr) <= 0) {
        errors.ringNumber = 'Ring Number must be a positive number'
      }
    }

    // Bracket Sequence validation (optional but must be positive if provided)
    if (bracketSequence && String(bracketSequence).trim() !== '') {
      const seqStr = String(bracketSequence).trim()
      if (!/^\d+$/.test(seqStr) || parseInt(seqStr) <= 0) {
        errors.bracketSequence = 'Bracket Sequence must be a positive number'
      }
    }

    // Bout Round validation - required
    if (!boutRound || String(boutRound).trim() === '') {
      errors.boutRound = 'Bout Round Duration is required'
    } else {
      const roundStr = String(boutRound).trim()
      if (!/^\d+$/.test(roundStr) || parseInt(roundStr) <= 0) {
        errors.boutRound =
          'Bout Round Duration must be a positive number (seconds)'
      }
    }

    // Max Competitors validation - required
    if (!maxCompetitors || String(maxCompetitors).trim() === '') {
      errors.maxCompetitors = 'Max Competitors is required'
    } else {
      const maxStr = String(maxCompetitors).trim()
      if (!/^\d+$/.test(maxStr) || parseInt(maxStr) <= 0) {
        errors.maxCompetitors = 'Max Competitors must be a positive number'
      }
    }

    // Group validation (optional but must be positive if provided)
    if (group && String(group).trim() !== '') {
      const groupStr = String(group).trim()
      if (!/^\d+$/.test(groupStr) || parseInt(groupStr) <= 0) {
        errors.group = 'Group must be a positive number'
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return // Don't proceed with save
    }

    setLoading(true)
    try {
      const updateData = {
        startDayNumber:
          startDayNumber && startDayNumber.trim() !== ''
            ? parseInt(startDayNumber)
            : null,
        group: group && group.trim() !== '' ? group : null,
        ring: ringNumber && ringNumber.trim() !== '' ? ringNumber : null,
        sequenceNumber:
          bracketSequence && bracketSequence.trim() !== ''
            ? parseInt(bracketSequence)
            : null,
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
      enqueueSnackbar(error?.response?.data?.message, {
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
            status: 'Started',
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

  const handleReset = async () => {
    if (!expandedBracket) return

    try {
      const response = await fetch(
        `${API_BASE_URL}/brackets/${expandedBracket._id}/reset`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
        }
      )

      if (response.ok) {
        enqueueSnackbar('Bracket reset successfully!', {
          variant: 'success',
        })
        onUpdate()
      }
    } catch (error) {
      enqueueSnackbar('Error resetting bracket: ' + error.message, {
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
      {/* Bracket Properties Section */}
      <div className='space-y-6'>
        <div className='bg-[#07091D] p-6 rounded-lg'>
          <h3 className='text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2'>
            Props
          </h3>

          {/* Row 1: Title, Bracket Rule, Bracket Status, Pro Class */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Title <span className='text-red-500'>*</span>
              </label>
              <select
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (validationErrors.title) {
                    setValidationErrors((prev) => {
                      const { title, ...rest } = prev
                      return rest
                    })
                  }
                }}
                className={`w-full bg-[#00000061] border border-gray-600 rounded px-3 py-2 text-white ${
                  validationErrors.title ? 'border-red-500' : ''
                }`}
              >
                <option value=''>Select Title</option>
                {titleData.map((option) => (
                  <option key={option.value} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
              {validationErrors.title && (
                <div className='text-red-400 text-xs mt-1'>
                  ⚠ {validationErrors.title}
                </div>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Bracket Rule <span className='text-red-500'>*</span>
              </label>
              <select
                value={ruleStyle}
                onChange={(e) => {
                  setRuleStyle(e.target.value)
                  if (validationErrors.ruleStyle) {
                    setValidationErrors((prev) => {
                      const { ruleStyle, ...rest } = prev
                      return rest
                    })
                  }
                }}
                className={`w-full bg-[#00000061] border border-gray-600 rounded px-3 py-2 text-white ${
                  validationErrors.ruleStyle ? 'border-red-500' : ''
                }`}
              >
                <option value=''>Select Bracket Rule</option>
                {bracketRuleData.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {validationErrors.ruleStyle && (
                <div className='text-red-400 text-xs mt-1'>
                  ⚠ {validationErrors.ruleStyle}
                </div>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Bracket Status <span className='text-red-500'>*</span>
              </label>
              <select
                value={bracketStatus}
                onChange={(e) => {
                  setBracketStatus(e.target.value)
                  if (validationErrors.bracketStatus) {
                    setValidationErrors((prev) => {
                      const { bracketStatus, ...rest } = prev
                      return rest
                    })
                  }
                }}
                className={`w-full bg-[#00000061] border border-gray-600 rounded px-3 py-2 text-white ${
                  validationErrors.bracketStatus ? 'border-red-500' : ''
                }`}
              >
                <option value=''>Select Bracket Status</option>
                {bracketStatusData.map((option) => (
                  <option key={option.value} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
              {validationErrors.bracketStatus && (
                <div className='text-red-400 text-xs mt-1'>
                  ⚠ {validationErrors.bracketStatus}
                </div>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Select Pro Class <span className='text-red-500'>*</span>
              </label>
              <select
                value={proClass}
                onChange={(e) => {
                  setProClass(e.target.value)
                  if (validationErrors.proClass) {
                    setValidationErrors((prev) => {
                      const { proClass, ...rest } = prev
                      return rest
                    })
                  }
                }}
                className={`w-full bg-[#00000061] border border-gray-600 rounded px-3 py-2 text-white ${
                  validationErrors.proClass ? 'border-red-500' : ''
                }`}
              >
                <option value=''>Select Pro Class</option>
                {proClassData.map((option) => (
                  <option key={option.value} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
              {validationErrors.proClass && (
                <div className='text-red-400 text-xs mt-1'>
                  ⚠ {validationErrors.proClass}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Sport, Disciplines, Age Classes, Weight Class */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Select Sport <span className='text-red-500'>*</span>
              </label>
              <select
                value={sport}
                onChange={(e) => {
                  setSport(e.target.value)
                  setAgeClass('')
                  setWeightClass('')
                  setDiscipline('')
                  if (validationErrors.sport) {
                    setValidationErrors((prev) => {
                      const { sport, ...rest } = prev
                      return rest
                    })
                  }
                }}
                className={`w-full bg-[#00000061] border border-gray-600 rounded px-3 py-2 text-white ${
                  validationErrors.sport ? 'border-red-500' : ''
                }`}
              >
                <option value=''>Select Sport</option>
                {sportsData.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {validationErrors.sport && (
                <div className='text-red-400 text-xs mt-1'>
                  ⚠ {validationErrors.sport}
                </div>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Disciplines{' '}
                {sport?.includes('bjj') && (
                  <span className='text-red-500'>*</span>
                )}
              </label>
              <select
                value={discipline}
                onChange={(e) => {
                  setDiscipline(e.target.value)
                  if (validationErrors.discipline) {
                    setValidationErrors((prev) => {
                      const { discipline, ...rest } = prev
                      return rest
                    })
                  }
                }}
                className={`w-full bg-[#00000061] border border-gray-600 rounded px-3 py-2 text-white ${
                  validationErrors.discipline ? 'border-red-500' : ''
                }`}
                disabled={!sport?.includes('bjj')}
              >
                <option value=''>Select Discipline</option>
                {getDisciplines(sport).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {validationErrors.discipline && (
                <div className='text-red-400 text-xs mt-1'>
                  ⚠ {validationErrors.discipline}
                </div>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Age Classes <span className='text-red-500'>*</span>
              </label>
              <select
                value={ageClass}
                onChange={(e) => {
                  setAgeClass(e.target.value)
                  setWeightClass('')
                  if (validationErrors.ageClass) {
                    setValidationErrors((prev) => {
                      const { ageClass, ...rest } = prev
                      return rest
                    })
                  }
                }}
                className={`w-full bg-[#00000061] border border-gray-600 rounded px-3 py-2 text-white ${
                  validationErrors.ageClass ? 'border-red-500' : ''
                }`}
                disabled={!sport}
              >
                <option value=''>Select Age Class</option>
                {getAgeClasses(sport).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {validationErrors.ageClass && (
                <div className='text-red-400 text-xs mt-1'>
                  ⚠ {validationErrors.ageClass}
                </div>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Select Weight Class <span className='text-red-500'>*</span>
              </label>
              <select
                value={weightClass}
                onChange={(e) => {
                  setWeightClass(e.target.value)
                  if (validationErrors.weightClass) {
                    setValidationErrors((prev) => {
                      const { weightClass, ...rest } = prev
                      return rest
                    })
                  }
                }}
                className={`w-full bg-[#00000061] border border-gray-600 rounded px-3 py-2 text-white ${
                  validationErrors.weightClass ? 'border-red-500' : ''
                }`}
                disabled={!ageClass}
              >
                <option value=''>Select Weight Class</option>
                {getWeightClasses(ageClass).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {validationErrors.weightClass && (
                <div className='text-red-400 text-xs mt-1'>
                  ⚠ {validationErrors.weightClass}
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Bracket Criteria, Bracket Number */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Bracket Criteria <span className='text-red-500'>*</span>
              </label>
              <select
                value={bracketCriteria}
                onChange={(e) => {
                  setBracketCriteria(e.target.value)
                  if (validationErrors.bracketCriteria) {
                    setValidationErrors((prev) => {
                      const { bracketCriteria, ...rest } = prev
                      return rest
                    })
                  }
                }}
                className={`w-full bg-[#00000061] border border-gray-600 rounded px-3 py-2 text-white ${
                  validationErrors.bracketCriteria ? 'border-red-500' : ''
                }`}
              >
                <option value=''>Select Bracket Criteria</option>
                {bracketCriteriaData.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {validationErrors.bracketCriteria && (
                <div className='text-red-400 text-xs mt-1'>
                  ⚠ {validationErrors.bracketCriteria}
                </div>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Bracket Number <span className='text-red-500'>*</span>
              </label>
              <input
                type='number'
                value={bracketNumber}
                onChange={(e) => {
                  const value = e.target.value
                  if (
                    value === '' ||
                    (parseInt(value) > 0 && !isNaN(parseInt(value)))
                  ) {
                    setBracketNumber(value)
                    if (validationErrors.bracketNumber) {
                      setValidationErrors((prev) => {
                        const { bracketNumber, ...rest } = prev
                        return rest
                      })
                    }
                  }
                }}
                min={1}
                placeholder='e.g., 1'
                className={`w-full bg-[#00000061] border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 ${
                  validationErrors.bracketNumber ? 'border-red-500' : ''
                }`}
              />
              {validationErrors.bracketNumber && (
                <div className='text-red-400 text-xs mt-1'>
                  ⚠ {validationErrors.bracketNumber}
                </div>
              )}
            </div>
          </div>

          {/* Row 4: Bracket Name with Generate Button */}
          <div className='space-y-4'>
            <div className='flex gap-4 items-end'>
              <div className='flex-1'>
                <label className='block text-sm font-medium text-white mb-2'>
                  Bracket Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={bracketName || ''}
                  onChange={(e) => {
                    const cleanValue = e.target.value.replace(
                      /[^a-zA-Z0-9\s'&.+\-()/#:,_]/g,
                      ''
                    )
                    setBracketName(cleanValue)
                    if (validationErrors.bracketName) {
                      setValidationErrors((prev) => {
                        const { bracketName, ...rest } = prev
                        return rest
                      })
                    }
                  }}
                  placeholder='Generated bracket name will appear here'
                  className={`w-full bg-[#00000061] border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 ${
                    validationErrors.bracketName ? 'border-red-500' : ''
                  }`}
                />
                {validationErrors.bracketName && (
                  <div className='text-red-400 text-xs mt-1'>
                    ⚠ {validationErrors.bracketName}
                  </div>
                )}
              </div>
              <button
                type='button'
                onClick={handleGenerateName}
                className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
              >
                Reset Bracket Name
              </button>
            </div>
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
                    'title',
                    'ruleStyle',
                    'bracketStatus',
                    'proClass',
                    'sport',
                    'ageClass',
                    'weightClass',
                    'discipline',
                    'bracketCriteria',
                    'bracketNumber',
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

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            {/* Row 1: Start Day Number, Group */}
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Starts on Day Number
              </label>
              <input
                type='number'
                value={startDayNumber}
                onChange={(e) => {
                  const value = e.target.value
                  if (
                    value === '' ||
                    (parseInt(value) >= 0 && !isNaN(parseInt(value)))
                  ) {
                    setStartDayNumber(value)
                    if (validationErrors.startDayNumber) {
                      setValidationErrors((prev) => {
                        const { startDayNumber, ...rest } = prev
                        return rest
                      })
                    }
                  }
                }}
                min={1}
                placeholder='OPTIONAL'
                className={`w-full bg-[#00000061] border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 ${
                  validationErrors.startDayNumber ? 'border-red-500' : ''
                }`}
              />
              {validationErrors.startDayNumber && (
                <div className='text-red-400 text-xs mt-1'>
                  ⚠ {validationErrors.startDayNumber}
                </div>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Group
              </label>
              <input
                type='number'
                value={group}
                onChange={(e) => {
                  const value = e.target.value
                  if (
                    value === '' ||
                    (parseInt(value) >= 0 && !isNaN(parseInt(value)))
                  ) {
                    setGroup(value)
                    if (validationErrors.group) {
                      setValidationErrors((prev) => {
                        const { group, ...rest } = prev
                        return rest
                      })
                    }
                  }
                }}
                min={1}
                placeholder='OPTIONAL'
                className={`w-full bg-[#00000061] border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 ${
                  validationErrors.group ? 'border-red-500' : ''
                }`}
              />
              {validationErrors.group && (
                <div className='text-red-400 text-xs mt-1'>
                  ⚠ {validationErrors.group}
                </div>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            {/* Row 2: Ring Number, Bracket Sequence Number */}
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Ring Number
              </label>
              <input
                type='number'
                value={ringNumber}
                onChange={(e) => {
                  const value = e.target.value
                  if (
                    value === '' ||
                    (parseInt(value) >= 0 && !isNaN(parseInt(value)))
                  ) {
                    setRingNumber(value)
                    if (validationErrors.ringNumber) {
                      setValidationErrors((prev) => {
                        const { ringNumber, ...rest } = prev
                        return rest
                      })
                    }
                  }
                }}
                min={1}
                placeholder='OPTIONAL'
                className={`w-full bg-[#00000061] border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 ${
                  validationErrors.ringNumber ? 'border-red-500' : ''
                }`}
              />
              {validationErrors.ringNumber && (
                <div className='text-red-400 text-xs mt-1'>
                  ⚠ {validationErrors.ringNumber}
                </div>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Bracket Sequence Number
              </label>
              <input
                type='number'
                value={bracketSequence}
                onChange={(e) => {
                  const value = e.target.value
                  if (
                    value === '' ||
                    (parseInt(value) >= 0 && !isNaN(parseInt(value)))
                  ) {
                    setBracketSequence(value)
                    if (validationErrors.bracketSequence) {
                      setValidationErrors((prev) => {
                        const { bracketSequence, ...rest } = prev
                        return rest
                      })
                    }
                  }
                }}
                min={1}
                placeholder='OPTIONAL'
                className={`w-full bg-[#00000061] border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 ${
                  validationErrors.bracketSequence ? 'border-red-500' : ''
                }`}
              />
              {validationErrors.bracketSequence && (
                <div className='text-red-400 text-xs mt-1'>
                  ⚠ {validationErrors.bracketSequence}
                </div>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            {/* Row 3: Bout Round Duration, Max Competitors */}
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Bout Round Duration (sec){' '}
                <span className='text-red-500'>*</span>
              </label>
              <input
                type='number'
                value={boutRound}
                onChange={(e) => {
                  const value = e.target.value
                  if (
                    value === '' ||
                    (parseInt(value) > 0 && !isNaN(parseInt(value)))
                  ) {
                    setBoutRound(value)
                    if (validationErrors.boutRound) {
                      setValidationErrors((prev) => {
                        const { boutRound, ...rest } = prev
                        return rest
                      })
                    }
                  }
                }}
                min={1}
                placeholder='90'
                className={`w-full bg-[#00000061] border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 ${
                  validationErrors.boutRound ? 'border-red-500' : ''
                }`}
              />
              {validationErrors.boutRound && (
                <div className='text-red-400 text-xs mt-1'>
                  ⚠ {validationErrors.boutRound}
                </div>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Max Competitors <span className='text-red-500'>*</span>
              </label>
              <input
                type='number'
                value={maxCompetitors || '4'}
                onChange={(e) => {
                  const value = e.target.value
                  if (
                    value === '' ||
                    (parseInt(value) > 0 && !isNaN(parseInt(value)))
                  ) {
                    setMaxCompetitors(value)
                    if (validationErrors.maxCompetitors) {
                      setValidationErrors((prev) => {
                        const { maxCompetitors, ...rest } = prev
                        return rest
                      })
                    }
                  }
                }}
                min={1}
                placeholder='4'
                className={`w-full bg-[#00000061] border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 ${
                  validationErrors.maxCompetitors ? 'border-red-500' : ''
                }`}
              />
              {validationErrors.maxCompetitors && (
                <div className='text-red-400 text-xs mt-1'>
                  ⚠ {validationErrors.maxCompetitors}
                </div>
              )}
            </div>
          </div>

          <div className='mt-4 text-sm text-gray-400 italic'>
            The max competitor count for this bracket above only applies to
            online registrations. It does not affect what you can do here.
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
                  [
                    'startDayNumber',
                    'ringNumber',
                    'bracketSequence',
                    'boutRound',
                    'maxCompetitors',
                    'group',
                  ].includes(key)
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

        {/* Action Buttons with Descriptions */}
        <div className='my-8'>
          {/* Start Bracket - Only show if status is Open */}
          {(expandedBracket?.status === 'Open' ||
            expandedBracket?.status !== 'Started') && (
            <div className='text-center mb-8'>
              <p className='text-white text-sm mb-4'>
                Start the bracket to begin tournament matches.
              </p>
              <div className='flex justify-center'>
                <ActionButton
                  icon={<Play size={14} />}
                  label='Start Bracket'
                  bg='#4CAF50'
                  onClick={handleUpdateBracketStatus}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Reset Bracket */}
          <div className='text-center mb-8'>
            <p className='text-white text-sm mb-4'>
              Reset the bracket back to it was before it was started.{' '}
              <strong>NOTE: This will delete all bouts and results.</strong>
            </p>
            <div className='flex justify-center'>
              <ActionButton
                icon={<RotateCcw size={14} />}
                label='Reset Bracket'
                bg='#FFA500'
                onClick={handleReset}
                disabled={loading}
              />
            </div>
          </div>

          {/* Duplicate Bracket */}
          <div className='text-center mb-8'>
            <p className='text-white text-sm mb-4'>
              Make a copy of this bracket. Note that only the bracket will be
              copied, but not its fighters or bouts.
            </p>
            <div className='flex justify-center'>
              <ActionButton
                icon={<Copy size={14} />}
                label='Duplicate Bracket'
                bg='#6B7280'
                onClick={handleDuplicate}
                disabled={loading}
              />
            </div>
          </div>

          {/* Delete Bracket */}
          <div className='text-center mb-8'>
            <p className='text-white text-sm mb-4'>
              Delete this bracket.{' '}
              <strong>
                NOTE: This will delete the bracket, its bouts, any bout results,
                and any suspensions issued for those bouts, and it cannot be
                undone.
              </strong>
            </p>
            <div className='flex justify-center'>
              <ActionButton
                icon={<Trash size={14} color='#fff' />}
                label='Delete Bracket'
                bg='#F35050'
                onClick={handleDelete}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
