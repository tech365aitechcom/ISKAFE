'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import {
  sportsData,
  disciplineData,
  titleData,
  bracketRuleData,
  bracketStatusData,
  proClassData,
  bracketCriteriaData,
  youthWeightClasses,
  adultWeightClasses,
  getAgeClasses,
  getWeightClasses,
  getDisciplines,
  generateBracketName,
} from './bracketUtils'

export default function NewBracketModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    bracketNumber: '',
    bracketName: '',
    title: '',
    bracketRule: '',
    bracketStatus: 'Open',
    proClass: '',
    sport: '',
    discipline: '',
    ageClass: '',
    weightClass: '',
    bracketCriteria: 'none',
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isCreated, setIsCreated] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value }

      // Reset dependent fields when parent changes
      if (name === 'sport') {
        newFormData.ageClass = ''
        newFormData.weightClass = ''
        newFormData.discipline = ''
      }

      if (name === 'ageClass') {
        newFormData.weightClass = ''
      }

      return newFormData
    })

    // Clear errors for the field being updated
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleGenerateName = () => {
    const ageClassOptions = getAgeClasses(formData.sport)
    const weightClassOptions = getWeightClasses(formData.ageClass)
    const generatedName = generateBracketName(
      formData.ageClass,
      formData.bracketCriteria,
      formData.weightClass,
      ageClassOptions,
      weightClassOptions
    )
    setFormData((prev) => ({ ...prev, bracketName: generatedName }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title) newErrors.title = 'Title is required'
    if (!formData.bracketRule)
      newErrors.bracketRule = 'Bracket rule is required'
    if (!formData.bracketStatus)
      newErrors.bracketStatus = 'Bracket status is required'
    if (!formData.proClass) newErrors.proClass = 'Pro class is required'
    if (!formData.sport) newErrors.sport = 'Sport is required'
    if (!formData.ageClass) newErrors.ageClass = 'Age class is required'
    if (!formData.weightClass)
      newErrors.weightClass = 'Weight class is required'
    if (!formData.bracketName)
      newErrors.bracketName = 'Bracket name is required'
    if (!formData.bracketNumber)
      newErrors.bracketNumber = 'Bracket number is required'
    if (!formData.bracketCriteria || formData.bracketCriteria === '')
      newErrors.bracketCriteria = 'Bracket criteria is required'

    // BJJ specific validation
    if (formData.sport.includes('bjj') && !formData.discipline) {
      newErrors.discipline = 'Discipline is required for BJJ'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Get weight class details
      const selectedWeightClass = getWeightClasses(formData.ageClass).find(
        (w) => w.value === formData.weightClass
      )

      const bracketData = {
        bracketNumber: parseInt(formData.bracketNumber) || 1,
        divisionTitle: formData.bracketName,
        title: formData.title,
        status: formData.bracketStatus,
        sport: formData.sport,
        discipline: formData.discipline || null,
        ageClass: formData.ageClass,
        ruleStyle: formData.bracketRule,
        proClass: formData.proClass,
        bracketCriteria: formData.bracketCriteria || 'none',
        weightClass: selectedWeightClass
          ? {
              min: selectedWeightClass.min,
              max: selectedWeightClass.max,
              unit: 'lbs',
            }
          : null,
        fighters: [],
      }

      console.log('Bracket data being sent:', bracketData)

      await onCreate(bracketData)
      
      // Only show success and close modal if onCreate succeeded
      setLoading(false)
      setIsCreated(true)

      // Reset form after successful creation
      setTimeout(() => {
        setFormData({
          bracketNumber: '',
          bracketName: '',
          title: '',
          bracketRule: '',
          bracketStatus: 'Open',
          proClass: '',
          sport: '',
          discipline: '',
          ageClass: '',
          weightClass: '',
          bracketCriteria: 'none',
        })
        setErrors({})
        setIsCreated(false)
        onClose() // Close modal after successful creation
      }, 2000) // Give user time to see success message
    } catch (error) {
      // Handle errors - don't show success message or close modal
      setLoading(false)
      setIsCreated(false)
      console.error('Error creating bracket:', error)
      // The error snackbar is already handled by the parent component
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4'>
      <div className='bg-[#0B1739] rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-bold text-white'>Create New Bracket</h2>
          <button onClick={onClose} className='text-gray-400 hover:text-white'>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {isCreated && (
            <div className='mb-4 p-4 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg'>
              <p className='text-green-400'>
                Bracket created successfully! Closing modal...
              </p>
            </div>
          )}
          {/* Row 1: Title, Bracket Rule, Bracket Status, Pro Class */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Title <span className='text-red-500'>*</span>
              </label>
              <select
                name='title'
                value={formData.title}
                onChange={handleChange}
                className={`w-full bg-[#07091D] border rounded px-3 py-2 text-white ${
                  errors.title ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value=''>Select Title</option>
                {titleData.map((option) => (
                  <option key={option.value} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.title && (
                <p className='text-red-500 text-xs mt-1'>{errors.title}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Bracket Rule <span className='text-red-500'>*</span>
              </label>
              <select
                name='bracketRule'
                value={formData.bracketRule}
                onChange={handleChange}
                className={`w-full bg-[#07091D] border rounded px-3 py-2 text-white ${
                  errors.bracketRule ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value=''>Select Bracket Rule</option>
                {bracketRuleData.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.bracketRule && (
                <p className='text-red-500 text-xs mt-1'>
                  {errors.bracketRule}
                </p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Bracket Status <span className='text-red-500'>*</span>
              </label>
              <select
                name='bracketStatus'
                value={formData.bracketStatus}
                onChange={handleChange}
                className={`w-full bg-[#07091D] border rounded px-3 py-2 text-white ${
                  errors.bracketStatus ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                {bracketStatusData.map((option) => (
                  <option key={option.value} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.bracketStatus && (
                <p className='text-red-500 text-xs mt-1'>
                  {errors.bracketStatus}
                </p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Select Pro Class <span className='text-red-500'>*</span>
              </label>
              <select
                name='proClass'
                value={formData.proClass}
                onChange={handleChange}
                className={`w-full bg-[#07091D] border rounded px-3 py-2 text-white ${
                  errors.proClass ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value=''>Select Pro Class</option>
                {proClassData.map((option) => (
                  <option key={option.value} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.proClass && (
                <p className='text-red-500 text-xs mt-1'>{errors.proClass}</p>
              )}
            </div>
          </div>

          {/* Row 2: Sport, Disciplines, Age Classes, Weight Class */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Select Sport <span className='text-red-500'>*</span>
              </label>
              <select
                name='sport'
                value={formData.sport}
                onChange={handleChange}
                className={`w-full bg-[#07091D] border rounded px-3 py-2 text-white ${
                  errors.sport ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value=''>Select Sport</option>
                {sportsData.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.sport && (
                <p className='text-red-500 text-xs mt-1'>{errors.sport}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Disciplines{' '}
                {formData.sport.includes('bjj') && (
                  <span className='text-red-500'>*</span>
                )}
              </label>
              <select
                name='discipline'
                value={formData.discipline}
                onChange={handleChange}
                className={`w-full bg-[#07091D] border rounded px-3 py-2 text-white ${
                  errors.discipline ? 'border-red-500' : 'border-gray-600'
                }`}
                disabled={!formData.sport.includes('bjj')}
              >
                <option value=''>Select Discipline</option>
                {getDisciplines(formData.sport).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.discipline && (
                <p className='text-red-500 text-xs mt-1'>{errors.discipline}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Age Classes <span className='text-red-500'>*</span>
              </label>
              <select
                name='ageClass'
                value={formData.ageClass}
                onChange={handleChange}
                className={`w-full bg-[#07091D] border rounded px-3 py-2 text-white ${
                  errors.ageClass ? 'border-red-500' : 'border-gray-600'
                }`}
                disabled={!formData.sport}
              >
                <option value=''>Select Age Class</option>
                {getAgeClasses(formData.sport).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.ageClass && (
                <p className='text-red-500 text-xs mt-1'>{errors.ageClass}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Select Weight Class <span className='text-red-500'>*</span>
              </label>
              <select
                name='weightClass'
                value={formData.weightClass}
                onChange={handleChange}
                className={`w-full bg-[#07091D] border rounded px-3 py-2 text-white ${
                  errors.weightClass ? 'border-red-500' : 'border-gray-600'
                }`}
                disabled={!formData.ageClass}
              >
                <option value=''>Select Weight Class</option>
                {getWeightClasses(formData.ageClass).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.weightClass && (
                <p className='text-red-500 text-xs mt-1'>
                  {errors.weightClass}
                </p>
              )}
            </div>
          </div>

          {/* Row 3: Bracket Criteria, Bracket Number */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Bracket Criteria <span className='text-red-500'>*</span>
              </label>
              <select
                name='bracketCriteria'
                value={formData.bracketCriteria}
                onChange={handleChange}
                className={`w-full bg-[#07091D] border rounded px-3 py-2 text-white ${
                  errors.bracketCriteria ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                {bracketCriteriaData.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.bracketCriteria && (
                <p className='text-red-500 text-xs mt-1'>
                  {errors.bracketCriteria}
                </p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Bracket Number <span className='text-red-500'>*</span>
              </label>
              <input
                type='number'
                name='bracketNumber'
                value={formData.bracketNumber}
                onChange={handleChange}
                min={1}
                placeholder='e.g., 1'
                className={`w-full bg-[#07091D] border rounded px-3 py-2 text-white placeholder-gray-400 ${
                  errors.bracketNumber ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.bracketNumber && (
                <p className='text-red-500 text-xs mt-1'>
                  {errors.bracketNumber}
                </p>
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
                  name='bracketName'
                  value={formData.bracketName}
                  onChange={handleChange}
                  placeholder='Generated bracket name will appear here'
                  className={`w-full bg-[#07091D] border rounded px-3 py-2 text-white placeholder-gray-400 ${
                    errors.bracketName ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {errors.bracketName && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors.bracketName}
                  </p>
                )}
              </div>
              <button
                type='button'
                onClick={handleGenerateName}
                className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
              >
                Generate Bracket Name
              </button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className='flex justify-end gap-4 pt-4 border-t border-gray-600'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-gray-300 border border-gray-600 rounded hover:bg-gray-700'
              disabled={loading || isCreated}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
              disabled={loading || isCreated}
            >
              {loading
                ? 'Creating...'
                : isCreated
                ? 'Created!'
                : 'Create Bracket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
