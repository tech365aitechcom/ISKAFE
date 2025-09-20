'use client'

import { useState, useEffect } from 'react'
import { X, ArrowLeft } from 'lucide-react'
import { API_BASE_URL } from '../../../../../../../constants'
import axios from 'axios'
import {
  sportsData,
  titleData,
  proClassData,
  getAgeClasses,
  getWeightClasses,
  getDisciplines,
} from './bracketUtils'

export default function BoutModal({
  bracket,
  onClose,
  onCreate,
  editBout = null,
}) {
  const [step, setStep] = useState(1)
  const [fighters, setFighters] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    proClass: '',
    sport: '',
    discipline: '',
    ageClass: '',
    weightClass: '',
    beltColor: '',
    boutNumber: '',
    numberOfRounds: 3,
    roundDuration: 90,
    notes: '',
    redCorner: '',
    blueCorner: '',
  })

  const [fighterDetails, setFighterDetails] = useState({
    redCornerDetails: {
      weight: '',
      height: { feet: '', inches: '' },
    },
    blueCornerDetails: {
      weight: '',
      height: { feet: '', inches: '' },
    },
  })

  const [redFighter, setRedFighter] = useState(null)
  const [blueFighter, setBlueFighter] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchFighters()
    if (editBout) {
      populateFormWithBoutData(editBout)
    }
  }, [editBout])

  const fetchFighters = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/brackets/${bracket._id}`
      )
      console.log('Fetched fighters:', response.data.data)

      const bracketFighters = response.data.data.fighters || []

      // Handle new structure where fighters are {fighter: {...}, seed: number}
      const fightersList = bracketFighters.map((f) => {
        if (f.fighter && typeof f.fighter === 'object') {
          // New format - extract fighter object and add seed
          return { ...f.fighter, seed: f.seed }
        } else {
          // Old format - fighter is already the object
          return f
        }
      })

      setFighters(fightersList)
    } catch (err) {
      console.error('Error fetching fighters:', err)
    }
  }

  const populateFormWithBoutData = (bout) => {
    // Get title and proClass from bracket if not directly available
    const title = bout.title || bout.bracket?.title || ''
    const proClass = bout.proClass || bout.bracket?.proClass || ''

    // Find matching weight class from the available options
    let weightClassValue = ''
    if (bout.weightClass && bout.ageClass) {
      const weightClasses = getWeightClasses(bout.ageClass)
      const matchingClass = weightClasses.find(
        (wc) =>
          wc.min === bout.weightClass.min && wc.max === bout.weightClass.max
      )
      weightClassValue = matchingClass ? matchingClass.value : ''
    }

    setFormData({
      title: title,
      proClass: proClass,
      sport: bout.sport || '',
      discipline: bout.discipline || '',
      ageClass: bout.ageClass || '',
      weightClass: weightClassValue,
      beltColor: bout.beltColor || '',
      boutNumber: bout.boutNumber || '',
      numberOfRounds: bout.numberOfRounds || 3,
      roundDuration: bout.roundDuration || 90,
      notes: bout.notes || '',
      redCorner: bout.redCorner?._id || '',
      blueCorner: bout.blueCorner?._id || '',
    })

    if (bout.redCorner) {
      setRedFighter(bout.redCorner)
    }
    if (bout.blueCorner) {
      setBlueFighter(bout.blueCorner)
    }

    setFighterDetails({
      redCornerDetails: {
        weight: bout.redCornerDetails?.weight || '',
        height: {
          feet: bout.redCornerDetails?.height?.feet || '',
          inches: bout.redCornerDetails?.height?.inches || '',
        },
      },
      blueCornerDetails: {
        weight: bout.blueCornerDetails?.weight || '',
        height: {
          feet: bout.blueCornerDetails?.height?.feet || '',
          inches: bout.blueCornerDetails?.height?.inches || '',
        },
      },
    })
  }
  console.log('Form Data:', redFighter)

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value }

      // Reset dependent fields when parent changes
      if (name === 'sport') {
        newFormData.ageClass = ''
        newFormData.weightClass = ''
        newFormData.discipline = ''
        // Only reset belt color if switching away from BJJ
        if (value !== 'bjj-male' && value !== 'bjj-female') {
          newFormData.beltColor = ''
        }
      }

      if (name === 'ageClass') {
        newFormData.weightClass = ''
      }

      return newFormData
    })
  }

  const handleFighterDetailsChange = (
    corner,
    field,
    value,
    subField = null
  ) => {
    // Validate numeric input for weight and height fields
    let processedValue = value

    if (field === 'weight' || (field === 'height' && subField)) {
      // Only allow positive numbers and decimal points
      processedValue = value.replace(/[^0-9.]/g, '')

      // Prevent multiple decimal points
      const decimalCount = (processedValue.match(/\./g) || []).length
      if (decimalCount > 1) {
        const firstDecimalIndex = processedValue.indexOf('.')
        processedValue =
          processedValue.substring(0, firstDecimalIndex + 1) +
          processedValue.substring(firstDecimalIndex + 1).replace(/\./g, '')
      }

      // For height in feet/inches, ensure reasonable limits
      if (field === 'height') {
        const numValue = parseFloat(processedValue)
        if (subField === 'feet' && numValue > 8) {
          processedValue = '8' // Max 8 feet
        } else if (subField === 'inches' && numValue >= 12) {
          processedValue = '11' // Max 11 inches
        }
      }

      // For weight, ensure reasonable limits (0-1000 lbs)
      if (field === 'weight') {
        const numValue = parseFloat(processedValue)
        if (numValue > 1000) {
          processedValue = '1000'
        }
      }
    }

    setFighterDetails((prev) => ({
      ...prev,
      [corner]: {
        ...prev[corner],
        [field]: subField
          ? { ...prev[corner][field], [subField]: processedValue }
          : processedValue,
      },
    }))
  }

  const handleStep1Submit = (e) => {
    e.preventDefault()

    // Validate required fields
    const errors = []

    if (!formData.proClass) {
      errors.push('Pro Class is required')
    }

    if (!formData.sport) {
      errors.push('Sport is required')
    }

    if (formData.sport.includes('bjj') && !formData.discipline) {
      errors.push('Discipline is required for BJJ')
    }

    if (!formData.ageClass) {
      errors.push('Age Class is required')
    }

    if (!formData.weightClass) {
      errors.push('Weight Class is required')
    }

    if (!formData.roundDuration) {
      errors.push('Round Duration is required')
    }

    if (errors.length > 0) {
      alert('Please fix the following errors:\n• ' + errors.join('\n• '))
      return
    }

    setStep(2)
  }

  const handleFinalSubmit = async (e) => {
    e.preventDefault()

    // Validate required fighter details
    const errors = []

    if (!redFighter || !blueFighter) {
      errors.push('Both Red Corner and Blue Corner fighters must be selected')
    }

    // Validate weight fields (required)
    if (
      !fighterDetails.redCornerDetails.weight ||
      fighterDetails.redCornerDetails.weight.trim() === ''
    ) {
      errors.push('Red Corner fighter weight is required')
    }

    if (
      !fighterDetails.blueCornerDetails.weight ||
      fighterDetails.blueCornerDetails.weight.trim() === ''
    ) {
      errors.push('Blue Corner fighter weight is required')
    }

    // Validate height fields (required)
    if (
      !fighterDetails.redCornerDetails.height.feet ||
      fighterDetails.redCornerDetails.height.feet.trim() === ''
    ) {
      errors.push('Red Corner fighter height (feet) is required')
    }

    if (
      !fighterDetails.redCornerDetails.height.inches ||
      fighterDetails.redCornerDetails.height.inches.trim() === ''
    ) {
      errors.push('Red Corner fighter height (inches) is required')
    }

    if (
      !fighterDetails.blueCornerDetails.height.feet ||
      fighterDetails.blueCornerDetails.height.feet.trim() === ''
    ) {
      errors.push('Blue Corner fighter height (feet) is required')
    }

    if (
      !fighterDetails.blueCornerDetails.height.inches ||
      fighterDetails.blueCornerDetails.height.inches.trim() === ''
    ) {
      errors.push('Blue Corner fighter height (inches) is required')
    }

    // Validate numeric values
    if (
      fighterDetails.redCornerDetails.weight &&
      isNaN(parseFloat(fighterDetails.redCornerDetails.weight))
    ) {
      errors.push('Red Corner fighter weight must be a valid number')
    }

    if (
      fighterDetails.blueCornerDetails.weight &&
      isNaN(parseFloat(fighterDetails.blueCornerDetails.weight))
    ) {
      errors.push('Blue Corner fighter weight must be a valid number')
    }

    if (
      fighterDetails.redCornerDetails.height.feet &&
      isNaN(parseInt(fighterDetails.redCornerDetails.height.feet))
    ) {
      errors.push('Red Corner fighter height (feet) must be a valid number')
    }

    if (
      fighterDetails.redCornerDetails.height.inches &&
      isNaN(parseInt(fighterDetails.redCornerDetails.height.inches))
    ) {
      errors.push('Red Corner fighter height (inches) must be a valid number')
    }

    if (
      fighterDetails.blueCornerDetails.height.feet &&
      isNaN(parseInt(fighterDetails.blueCornerDetails.height.feet))
    ) {
      errors.push('Blue Corner fighter height (feet) must be a valid number')
    }

    if (
      fighterDetails.blueCornerDetails.height.inches &&
      isNaN(parseInt(fighterDetails.blueCornerDetails.height.inches))
    ) {
      errors.push('Blue Corner fighter height (inches) must be a valid number')
    }

    if (errors.length > 0) {
      alert('Please fix the following errors:\n• ' + errors.join('\n• '))
      return
    }

    setLoading(true)

    // Get weight class details
    const selectedWeightClass = getWeightClasses(formData.ageClass).find(
      (w) => w.value === formData.weightClass
    )

    const boutData = {
      ...formData,
      weightClass: selectedWeightClass
        ? {
            min: selectedWeightClass.min,
            max: selectedWeightClass.max,
            unit: 'lbs',
          }
        : null,
      numberOfRounds: parseInt(formData.numberOfRounds),
      roundDuration: parseInt(formData.roundDuration),
      redCorner: redFighter?._id || '',
      blueCorner: blueFighter?._id || '',
      redCornerDetails: {
        weight: parseFloat(fighterDetails.redCornerDetails.weight) || null,
        height: {
          feet: parseInt(fighterDetails.redCornerDetails.height.feet) || null,
          inches:
            parseInt(fighterDetails.redCornerDetails.height.inches) || null,
        },
      },
      blueCornerDetails: {
        weight: parseFloat(fighterDetails.blueCornerDetails.weight) || null,
        height: {
          feet: parseInt(fighterDetails.blueCornerDetails.height.feet) || null,
          inches:
            parseInt(fighterDetails.blueCornerDetails.height.inches) || null,
        },
      },
    }

    if (editBout) {
      // Update existing bout
      try {
        const response = await axios.put(
          `${API_BASE_URL}/bouts/${editBout._id}`,
          boutData
        )
        await onCreate(response.data.data) // Reuse onCreate callback for consistency
      } catch (error) {
        console.error('Error updating bout:', error)
      }
    } else {
      // Create new bout
      await onCreate(boutData)
    }
    setLoading(false)
  }

  const selectFighter = (fighter, corner) => {
    // Convert height from inches to feet and inches
    const convertHeightFromInches = (totalInches) => {
      if (!totalInches) return { feet: '', inches: '' }
      const feet = Math.floor(totalInches / 12)
      const inches = totalInches % 12
      return { feet: feet.toString(), inches: inches.toString() }
    }

    const heightData = convertHeightFromInches(fighter.height)
    const weightData = fighter.walkAroundWeight || fighter.weight || ''

    if (corner === 'red') {
      setRedFighter(fighter)
      setFormData((prev) => ({ ...prev, redCorner: fighter._id }))
      // Pre-populate fighter details with new data structure
      setFighterDetails((prev) => ({
        ...prev,
        redCornerDetails: {
          weight: weightData.toString(),
          height: heightData,
        },
      }))
    } else {
      setBlueFighter(fighter)
      setFormData((prev) => ({ ...prev, blueCorner: fighter._id }))
      // Pre-populate fighter details with new data structure
      setFighterDetails((prev) => ({
        ...prev,
        blueCornerDetails: {
          weight: weightData.toString(),
          height: heightData,
        },
      }))
    }
  }

  const renderStep1 = () => (
    <form onSubmit={handleStep1Submit} className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div>
          <label className='block text-sm font-medium text-white mb-2'>
            Select Title
          </label>
          <select
            name='title'
            value={formData.title}
            onChange={handleChange}
            className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
          >
            <option value=''>Select Title</option>
            {titleData.map((option) => (
              <option key={option.value} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-white mb-2'>
            Select Pro Class <span className='text-red-500'>*</span>
          </label>
          <select
            name='proClass'
            value={formData.proClass}
            onChange={handleChange}
            className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
            required
          >
            <option value=''>Select Pro Class</option>
            {proClassData.map((option) => (
              <option key={option.value} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-white mb-2'>
            Select Sport <span className='text-red-500'>*</span>
          </label>
          <select
            name='sport'
            value={formData.sport}
            onChange={handleChange}
            className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
            required
          >
            <option value=''>Select Sport</option>
            {sportsData.map((option) => (
              <option key={option.value} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
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
            className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
            disabled={!formData.sport.includes('bjj')}
          >
            <option value=''>Select Discipline</option>
            {getDisciplines(formData.sport).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-white mb-2'>
            Age Classes <span className='text-red-500'>*</span>
          </label>
          <select
            name='ageClass'
            value={formData.ageClass}
            onChange={handleChange}
            className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
            disabled={!formData.sport}
            required
          >
            <option value=''>Select Age Class</option>
            {getAgeClasses(formData.sport).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-white mb-2'>
            Select Weight Class <span className='text-red-500'>*</span>
          </label>
          <select
            name='weightClass'
            value={formData.weightClass}
            onChange={handleChange}
            className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
            disabled={!formData.ageClass}
            required
          >
            <option value=''>Select Weight Class</option>
            {getWeightClasses(formData.ageClass).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {(formData.sport === 'bjj-male' || formData.sport === 'bjj-female') && (
          <div>
            <label className='block text-sm font-medium text-white mb-2'>
              Belt Color
            </label>
            <select
              name='beltColor'
              value={formData.beltColor}
              onChange={handleChange}
              className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
            >
              <option value=''>Select Belt Color</option>
              <option value='white'>White</option>
              <option value='blue'>Blue</option>
              <option value='purple'>Purple</option>
              <option value='brown'>Brown</option>
              <option value='black'>Black</option>
              <option value='coral'>Coral</option>
              <option value='red'>Red</option>
            </select>
          </div>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div>
          <label className='block text-sm font-medium text-white mb-2'>
            Bout Number
          </label>
          <input
            type='number'
            name='boutNumber'
            value={formData.boutNumber}
            onChange={handleChange}
            min={1}
            placeholder='e.g., 1'
            className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-white mb-2'>
            Number of Rounds
          </label>
          <input
            type='number'
            name='numberOfRounds'
            value={formData.numberOfRounds}
            onChange={handleChange}
            className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
            min='1'
            max='12'
            placeholder='Default based on discipline/sport'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-white mb-2'>
            Round Duration (sec) <span className='text-red-500'>*</span>
          </label>
          <input
            type='number'
            name='roundDuration'
            value={formData.roundDuration}
            onChange={handleChange}
            className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
            min='30'
            max='600'
            placeholder='90'
            required
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-white mb-2'>
          Notes
        </label>
        <textarea
          name='notes'
          value={formData.notes}
          onChange={handleChange}
          rows='3'
          className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
          placeholder='Free text field for comments or bout-specific instructions'
        />
      </div>

      <div className='flex justify-end gap-4 pt-4 border-t border-gray-600'>
        <button
          type='button'
          onClick={onClose}
          className='px-4 py-2 text-gray-300 border border-gray-600 rounded hover:bg-gray-700'
        >
          Cancel
        </button>
        <button
          type='submit'
          className='px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
        >
          Next: Assign Fighters
        </button>
      </div>
    </form>
  )

  const renderStep2 = () => (
    <div className='space-y-6'>
      <div className='flex items-center gap-4 mb-6'>
        <button
          onClick={() => setStep(1)}
          className='flex items-center gap-2 text-gray-300 hover:text-white'
        >
          <ArrowLeft size={16} />
          Back to Bout Details
        </button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Red Corner */}
        <div className='space-y-4'>
          <h3 className='text-lg font-medium text-red-400'>Red Corner</h3>

          {redFighter ? (
            <div className='space-y-4'>
              <div className='p-4 bg-red-900/20 border border-red-500/30 rounded-lg'>
                <div className='flex justify-between items-start mb-4'>
                  <div>
                    <h4 className='font-medium text-white'>
                      {redFighter.firstName} {redFighter.lastName}
                    </h4>
                    <p className='text-sm text-gray-300'>
                      DOB:{' '}
                      {redFighter.dateOfBirth
                        ? new Date(redFighter.dateOfBirth).toLocaleDateString()
                        : 'N/A'}
                    </p>
                    <p className='text-sm text-gray-300'>
                      Age:{' '}
                      {redFighter.dateOfBirth
                        ? new Date().getFullYear() -
                          new Date(redFighter.dateOfBirth).getFullYear()
                        : 'N/A'}
                    </p>
                    <p className='text-sm text-gray-300'>
                      Record: {redFighter.systemRecord || 'N/A'}
                    </p>
                    <p className='text-sm text-gray-300'>
                      From:{' '}
                      {redFighter.city +
                        ', ' +
                        redFighter.state +
                        ', ' +
                        redFighter.country}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setRedFighter(null)
                      setFighterDetails((prev) => ({
                        ...prev,
                        redCornerDetails: {
                          weight: '',
                          height: { feet: '', inches: '' },
                        },
                      }))
                    }}
                    className='text-red-400 hover:text-red-300'
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Fighter Details Form */}
                <div className='grid grid-cols-2 gap-4 pt-4 border-t border-red-500/30'>
                  <div>
                    <label className='block text-sm font-medium text-white mb-2'>
                      Weight <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      value={fighterDetails.redCornerDetails.weight}
                      onChange={(e) =>
                        handleFighterDetailsChange(
                          'redCornerDetails',
                          'weight',
                          e.target.value
                        )
                      }
                      className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
                      placeholder='Enter weight (lbs)'
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-white mb-2'>
                      Height <span className='text-red-500'>*</span>
                    </label>
                    <div className='flex gap-2'>
                      <input
                        type='text'
                        value={fighterDetails.redCornerDetails.height.feet}
                        onChange={(e) =>
                          handleFighterDetailsChange(
                            'redCornerDetails',
                            'height',
                            e.target.value,
                            'feet'
                          )
                        }
                        className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
                        placeholder='Feet'
                        required
                      />
                      <input
                        type='text'
                        value={fighterDetails.redCornerDetails.height.inches}
                        onChange={(e) =>
                          handleFighterDetailsChange(
                            'redCornerDetails',
                            'height',
                            e.target.value,
                            'inches'
                          )
                        }
                        className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
                        placeholder='Inches'
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='space-y-3 max-h-64 overflow-y-auto'>
              <p className='text-sm text-gray-400'>
                Select Red Corner Fighter:
              </p>
              {fighters.map((fighter) => (
                <button
                  key={fighter._id}
                  onClick={() => selectFighter(fighter, 'red')}
                  disabled={blueFighter?._id === fighter._id}
                  className='w-full text-left p-3 bg-[#07091D] border border-gray-600 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <div className='font-medium text-white'>
                    {fighter.firstName} {fighter.lastName}
                  </div>
                  <div className='text-sm text-gray-300'>
                    Weight:{' '}
                    {fighter.walkAroundWeight || fighter.weight || 'N/A'}{' '}
                    {fighter.weightUnit || 'lbs'} • Age:{' '}
                    {fighter.dateOfBirth
                      ? new Date().getFullYear() -
                        new Date(fighter.dateOfBirth).getFullYear()
                      : 'N/A'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Blue Corner */}
        <div className='space-y-4'>
          <h3 className='text-lg font-medium text-blue-400'>Blue Corner</h3>

          {blueFighter ? (
            <div className='space-y-4'>
              <div className='p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg'>
                <div className='flex justify-between items-start mb-4'>
                  <div>
                    <h4 className='font-medium text-white'>
                      {blueFighter.firstName} {blueFighter.lastName}
                    </h4>
                    <p className='text-sm text-gray-300'>
                      DOB:{' '}
                      {blueFighter.dateOfBirth
                        ? new Date(blueFighter.dateOfBirth).toLocaleDateString()
                        : 'N/A'}
                    </p>
                    <p className='text-sm text-gray-300'>
                      Age:{' '}
                      {blueFighter.dateOfBirth
                        ? new Date().getFullYear() -
                          new Date(blueFighter.dateOfBirth).getFullYear()
                        : 'N/A'}
                    </p>
                    <p className='text-sm text-gray-300'>
                      Record: {blueFighter.systemRecord || 'N/A'}
                    </p>
                    <p className='text-sm text-gray-300'>
                      From:{' '}
                      {blueFighter.city +
                        ', ' +
                        blueFighter.state +
                        ', ' +
                        blueFighter.country}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setBlueFighter(null)
                      setFighterDetails((prev) => ({
                        ...prev,
                        blueCornerDetails: {
                          weight: '',
                          height: { feet: '', inches: '' },
                        },
                      }))
                    }}
                    className='text-blue-400 hover:text-blue-300'
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Fighter Details Form */}
                <div className='grid grid-cols-2 gap-4 pt-4 border-t border-blue-500/30'>
                  <div>
                    <label className='block text-sm font-medium text-white mb-2'>
                      Weight <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      value={fighterDetails.blueCornerDetails.weight}
                      onChange={(e) =>
                        handleFighterDetailsChange(
                          'blueCornerDetails',
                          'weight',
                          e.target.value
                        )
                      }
                      className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
                      placeholder='Enter weight (lbs)'
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-white mb-2'>
                      Height <span className='text-red-500'>*</span>
                    </label>
                    <div className='flex gap-2'>
                      <input
                        type='text'
                        value={fighterDetails.blueCornerDetails.height.feet}
                        onChange={(e) =>
                          handleFighterDetailsChange(
                            'blueCornerDetails',
                            'height',
                            e.target.value,
                            'feet'
                          )
                        }
                        className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
                        placeholder='Feet'
                        required
                      />
                      <input
                        type='text'
                        value={fighterDetails.blueCornerDetails.height.inches}
                        onChange={(e) =>
                          handleFighterDetailsChange(
                            'blueCornerDetails',
                            'height',
                            e.target.value,
                            'inches'
                          )
                        }
                        className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
                        placeholder='Inches'
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='space-y-3 max-h-64 overflow-y-auto'>
              <p className='text-sm text-gray-400'>
                Select Blue Corner Fighter:
              </p>
              {fighters.map((fighter) => (
                <button
                  key={fighter._id}
                  onClick={() => selectFighter(fighter, 'blue')}
                  disabled={redFighter?._id === fighter._id}
                  className='w-full text-left p-3 bg-[#07091D] border border-gray-600 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <div className='font-medium text-white'>
                    {fighter.firstName} {fighter.lastName}
                  </div>
                  <div className='text-sm text-gray-300'>
                    Weight:{' '}
                    {fighter.walkAroundWeight || fighter.weight || 'N/A'}{' '}
                    {fighter.weightUnit || 'lbs'} • Age:{' '}
                    {fighter.dateOfBirth
                      ? new Date().getFullYear() -
                        new Date(fighter.dateOfBirth).getFullYear()
                      : 'N/A'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className='flex justify-end gap-4 pt-4 border-t border-gray-600'>
        <button
          type='button'
          onClick={onClose}
          className='px-4 py-2 text-gray-300 border border-gray-600 rounded hover:bg-gray-700'
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleFinalSubmit}
          className='px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
          disabled={loading || !redFighter || !blueFighter}
        >
          {loading
            ? editBout
              ? 'Updating...'
              : 'Creating...'
            : editBout
            ? 'Update Bout'
            : 'Create Bout'}
        </button>
      </div>
    </div>
  )

  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4'>
      <div className='bg-[#0B1739] rounded-lg p-6 w-full max-w-6xl max-h-[85vh] overflow-y-auto my-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-bold text-white'>
            {step === 1
              ? `${
                  editBout ? 'Edit' : 'Create New'
                } Bout - Step 1: Bout Details`
              : `${
                  editBout ? 'Edit' : 'Create New'
                } Bout - Step 2: Assign Fighters`}
          </h2>
          <button onClick={onClose} className='text-gray-400 hover:text-white'>
            <X size={24} />
          </button>
        </div>

        {step === 1 ? renderStep1() : renderStep2()}
      </div>
    </div>
  )
}
