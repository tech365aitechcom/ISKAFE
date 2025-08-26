'use client'

import { useState, useEffect } from 'react'
import { X, Save, Settings } from 'lucide-react'
import useStore from '../../../../../../../stores/useStore'
import { API_BASE_URL } from '../../../../../../../constants'
import { enqueueSnackbar } from 'notistack'

export default function ReseedBracketsModal({
  isOpen,
  onClose,
  brackets,
  onUpdate,
  filters = {},
}) {
  const user = useStore((state) => state.user)
  const [bracketSettings, setBracketSettings] = useState({})
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  // Apply filters to brackets
  const filteredBrackets = brackets.filter((bracket) => {
    if (
      filters.title &&
      bracket.title?.toLowerCase() !== filters.title.toLowerCase()
    )
      return false
    if (
      filters.sport &&
      bracket.sport?.toLowerCase() !== filters.sport.toLowerCase()
    )
      return false
    if (
      filters.discipline &&
      bracket.discipline?.toLowerCase() !== filters.discipline.toLowerCase()
    )
      return false
    if (
      filters.ageClass &&
      bracket.ageClass?.toLowerCase() !== filters.ageClass.toLowerCase()
    )
      return false
    if (
      filters.ruleStyle &&
      bracket.ruleStyle?.toLowerCase() !== filters.ruleStyle.toLowerCase()
    )
      return false
    if (
      filters.bracketStatus &&
      bracket.status?.toLowerCase() !== filters.bracketStatus.toLowerCase()
    )
      return false
    if (
      filters.proClass &&
      bracket.proClass?.toLowerCase() !== filters.proClass.toLowerCase()
    )
      return false
    if (
      filters.bracketCriteria &&
      bracket.bracketCriteria?.toLowerCase() !==
        filters.bracketCriteria.toLowerCase()
    )
      return false

    if (filters.showWeightRange && filters.minWeight && filters.maxWeight) {
      const min = parseFloat(filters.minWeight)
      const max = parseFloat(filters.maxWeight)
      const bracketMin = bracket.weightClass?.min || 0
      const bracketMax = bracket.weightClass?.max || 999

      if (bracketMin < min || bracketMax > max) return false
    }

    return true
  })

  useEffect(() => {
    if (isOpen && filteredBrackets.length > 0) {
      const initialSettings = {}
      filteredBrackets.forEach((bracket) => {
        initialSettings[bracket._id] = {
          startDayNumber: bracket.startDayNumber?.toString() || '',
          group: bracket.group || '',
          ringNumber: bracket.ring || '',
          bracketSequence: bracket.sequenceNumber?.toString() || '',
          boutRound: bracket.boutRound?.toString() || '',
          maxCompetitors:
            bracket.maxCompetitors?.toString() ||
            bracket.fighters?.length?.toString() ||
            '',
        }
      })
      setBracketSettings(initialSettings)
    }
  }, [isOpen])

  const validateBracket = (bracketId, settings) => {
    const errors = {}
    const requiredFields = [
      'startDayNumber',
      'group',
      'ringNumber',
      'bracketSequence',
    ]

    requiredFields.forEach((field) => {
      if (!settings[field] || settings[field].toString().trim() === '') {
        errors[field] = 'This field is required'
      }
    })

    return errors
  }

  const handleSettingChange = (bracketId, field, value) => {
    setBracketSettings((prev) => {
      const newSettings = {
        ...prev,
        [bracketId]: {
          ...prev[bracketId],
          [field]: value,
        },
      }

      // Validate the bracket after updating
      const bracketErrors = validateBracket(bracketId, newSettings[bracketId])
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        [bracketId]: bracketErrors,
      }))

      return newSettings
    })
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      // Validate all brackets before saving
      let hasErrors = false
      const allErrors = {}

      for (const [bracketId, settings] of Object.entries(bracketSettings)) {
        const errors = validateBracket(bracketId, settings)
        if (Object.keys(errors).length > 0) {
          hasErrors = true
          allErrors[bracketId] = errors
        }
      }

      if (hasErrors) {
        setValidationErrors(allErrors)
        enqueueSnackbar('Please fill in all required fields', {
          variant: 'error',
        })
        setLoading(false)
        return
      }

      const updates = []

      for (const [bracketId, settings] of Object.entries(bracketSettings)) {
        const updateData = {
          startDayNumber:
            settings.startDayNumber && settings.startDayNumber.trim() !== ''
              ? parseInt(settings.startDayNumber)
              : undefined,
          group: settings.group || '',
          ring: settings.ringNumber || '',
          sequenceNumber:
            settings.bracketSequence && settings.bracketSequence.trim() !== ''
              ? parseInt(settings.bracketSequence)
              : undefined,
          boutRound: settings.boutRound
            ? parseInt(settings.boutRound)
            : undefined,
          maxCompetitors: settings.maxCompetitors
            ? parseInt(settings.maxCompetitors)
            : undefined,
        }

        // Remove undefined values
        Object.keys(updateData).forEach((key) => {
          if (updateData[key] === undefined) {
            delete updateData[key]
          }
        })

        updates.push(
          fetch(`${API_BASE_URL}/brackets/${bracketId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user?.token}`,
            },
            body: JSON.stringify(updateData),
          })
        )
      }

      await Promise.all(updates)

      enqueueSnackbar('Bracket settings updated successfully!', {
        variant: 'success',
      })

      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error updating bracket settings:', error)
      enqueueSnackbar('Failed to update bracket settings', {
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-[#0B1739] rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-600'>
          <div>
            <h2 className='text-xl font-bold text-white flex items-center gap-2'>
              <Settings size={20} />
              Reseed Brackets
            </h2>
            <p className='text-sm text-gray-400 mt-1'>
              Update bracket settings for all brackets
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-white p-1'
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto max-h-[calc(90vh-160px)]'>
          {filteredBrackets
            .sort((a, b) => {
              const seqA = a.sequenceNumber || 999
              const seqB = b.sequenceNumber || 999
              return seqA - seqB
            })
            .map((bracket, index) => (
              <div
                key={bracket._id}
                className='mb-6 bg-[#07091D] rounded-lg p-4'
              >
                <div className='mb-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <h3 className='text-lg font-semibold text-white'>
                        {bracket.divisionTitle ||
                          bracket.title ||
                          `Bracket ${bracket.sequenceNumber || index + 1}`}
                      </h3>
                      {bracket.sequenceNumber && (
                        <span className='px-2 py-1 bg-blue-600 text-white text-xs rounded'>
                          Seq: {bracket.sequenceNumber}
                        </span>
                      )}
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm text-gray-400'>
                        Registration Status:
                      </span>
                      <span className='text-white text-xs'>
                        {bracket.status}
                      </span>
                    </div>
                  </div>
                  <p className='text-sm text-gray-400'>
                    {bracket.sport} • {bracket.ageClass} • {bracket.discipline}
                    {bracket.weightClass &&
                      ` • ${bracket.weightClass.min}-${bracket.weightClass.max} lbs`}
                  </p>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                  {/* Start Day Number */}
                  <div>
                    <label className='block text-sm font-medium text-white mb-2'>
                      Start Day Number <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='number'
                      min='1'
                      value={bracketSettings[bracket._id]?.startDayNumber || ''}
                      onChange={(e) =>
                        handleSettingChange(
                          bracket._id,
                          'startDayNumber',
                          e.target.value
                        )
                      }
                      placeholder='Enter day number'
                      className={`w-full px-3 py-2 bg-[#0B1739] border rounded text-white placeholder-gray-400 ${
                        validationErrors[bracket._id]?.startDayNumber
                          ? 'border-red-500'
                          : 'border-gray-600'
                      }`}
                    />
                    {validationErrors[bracket._id]?.startDayNumber && (
                      <p className='text-red-500 text-xs mt-1'>
                        {validationErrors[bracket._id].startDayNumber}
                      </p>
                    )}
                  </div>

                  {/* Group */}
                  <div>
                    <label className='block text-sm font-medium text-white mb-2'>
                      Group <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='number'
                      min='1'
                      value={bracketSettings[bracket._id]?.group || ''}
                      onChange={(e) =>
                        handleSettingChange(
                          bracket._id,
                          'group',
                          e.target.value
                        )
                      }
                      placeholder='Enter group number'
                      className={`w-full px-3 py-2 bg-[#0B1739] border rounded text-white placeholder-gray-400 ${
                        validationErrors[bracket._id]?.group
                          ? 'border-red-500'
                          : 'border-gray-600'
                      }`}
                    />
                    {validationErrors[bracket._id]?.group && (
                      <p className='text-red-500 text-xs mt-1'>
                        {validationErrors[bracket._id].group}
                      </p>
                    )}
                  </div>

                  {/* Ring Number */}
                  <div>
                    <label className='block text-sm font-medium text-white mb-2'>
                      Ring Number <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='number'
                      min='1'
                      value={bracketSettings[bracket._id]?.ringNumber || ''}
                      onChange={(e) =>
                        handleSettingChange(
                          bracket._id,
                          'ringNumber',
                          e.target.value
                        )
                      }
                      placeholder='Enter ring number'
                      className={`w-full px-3 py-2 bg-[#0B1739] border rounded text-white placeholder-gray-400 ${
                        validationErrors[bracket._id]?.ringNumber
                          ? 'border-red-500'
                          : 'border-gray-600'
                      }`}
                    />
                    {validationErrors[bracket._id]?.ringNumber && (
                      <p className='text-red-500 text-xs mt-1'>
                        {validationErrors[bracket._id].ringNumber}
                      </p>
                    )}
                  </div>

                  {/* Bracket Sequence */}
                  <div>
                    <label className='block text-sm font-medium text-white mb-2'>
                      Bracket Sequence <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='number'
                      min='1'
                      value={
                        bracketSettings[bracket._id]?.bracketSequence || ''
                      }
                      onChange={(e) =>
                        handleSettingChange(
                          bracket._id,
                          'bracketSequence',
                          e.target.value
                        )
                      }
                      placeholder='Enter sequence number'
                      className={`w-full px-3 py-2 bg-[#0B1739] border rounded text-white placeholder-gray-400 ${
                        validationErrors[bracket._id]?.bracketSequence
                          ? 'border-red-500'
                          : 'border-gray-600'
                      }`}
                    />
                    {validationErrors[bracket._id]?.bracketSequence && (
                      <p className='text-red-500 text-xs mt-1'>
                        {validationErrors[bracket._id].bracketSequence}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

          {filteredBrackets.length === 0 && (
            <div className='text-center py-12'>
              <p className='text-gray-400'>
                {brackets.length === 0
                  ? 'No brackets found.'
                  : 'No brackets match the current filters.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 p-6 border-t border-gray-600'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-400 hover:text-white border border-gray-600 rounded hover:border-gray-500'
            disabled={loading}
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
          >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
