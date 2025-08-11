'use client'

import { useState, useEffect } from 'react'
import { X, ArrowLeft } from 'lucide-react'
import { API_BASE_URL } from '../../../../../../../constants'
import axios from 'axios'

export default function NewBoutModal({ bracket, onClose, onCreate }) {
  const [step, setStep] = useState(1)
  const [fighters, setFighters] = useState([])
  const [formData, setFormData] = useState({
    boutNumber: '',
    sport: bracket?.sport || '',
    ruleStyle: bracket?.ruleStyle || '',
    ageClass: bracket?.ageClass || '',
    weightClass: {
      min: bracket?.weightClass?.min || '',
      max: bracket?.weightClass?.max || '',
      unit: bracket?.weightClass?.unit || 'lbs',
    },
    numberOfRounds: 3,
    roundDuration: 90,
    startDate: '',
    notes: '',
    redCorner: '',
    blueCorner: '',
  })

  const [redFighter, setRedFighter] = useState(null)
  const [blueFighter, setBlueFighter] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchFighters()
  }, [])

  const fetchFighters = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/brackets/${bracket._id}`
      )
      console.log('Fetched fighters:', response.data.data)
      setFighters(response.data.data.fighters || [])
    } catch (err) {
      console.error('Error fetching fighters:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.startsWith('weightClass.')) {
      const field = name.split('.')[1]
      setFormData((prev) => ({
        ...prev,
        weightClass: {
          ...prev.weightClass,
          [field]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleStep1Submit = (e) => {
    e.preventDefault()

    // Validate required fields
    const errors = []

    if (!formData.sport) {
      errors.push('Sport is required')
    }

    if (!formData.ruleStyle) {
      errors.push('Rule Style is required')
    }

    if (!formData.ageClass) {
      errors.push('Age Class is required')
    }

    if (!formData.title) {
      errors.push('Title is required')
    }

    // Weight class validation - at least min weight required
    if (!formData.weightClass.min && !formData.weightClass.max) {
      errors.push('Weight class range is required')
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
    setLoading(true)

    const boutData = {
      ...formData,
      weightClass: {
        min: parseFloat(formData.weightClass.min) || 0,
        max: parseFloat(formData.weightClass.max) || 999,
        unit: formData.weightClass.unit,
      },
      numberOfRounds: parseInt(formData.numberOfRounds),
      roundDuration: parseInt(formData.roundDuration),
      redCorner: redFighter?._id || '',
      blueCorner: blueFighter?._id || '',
    }

    await onCreate(boutData)
    setLoading(false)
  }

  const selectFighter = (fighter, corner) => {
    if (corner === 'red') {
      setRedFighter(fighter)
      setFormData((prev) => ({ ...prev, redCorner: fighter._id }))
    } else {
      setBlueFighter(fighter)
      setFormData((prev) => ({ ...prev, blueCorner: fighter._id }))
    }
  }

  const renderStep1 = () => (
    <form onSubmit={handleStep1Submit} className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-white mb-2'>
            Bout Number
          </label>
          <input
            type='number'
            name='boutNumber'
            value={formData.boutNumber}
            onChange={handleChange}
            className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
            placeholder='Enter bout number (e.g., 1)'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-white mb-2'>
            Sport
          </label>
          <select
            name='sport'
            value={formData.sport}
            onChange={handleChange}
            className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
            required
          >
            <option value=''>Select Sport</option>
            <option value='Kickboxing'>Kickboxing</option>
            <option value='Boxing'>Boxing</option>
            <option value='MMA'>MMA</option>
            <option value='Muay Thai'>Muay Thai</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-white mb-2'>
            Select Title <span className='text-red-500'>*</span>
          </label>
          <select
            name='title'
            value={formData.title || ''}
            onChange={handleChange}
            className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
            required
          >
            <option value=''>Select Title</option>
            <option value='World Championship'>World Championship</option>
            <option value='National Championship'>National Championship</option>
            <option value='Regional Championship'>Regional Championship</option>
            <option value='Local Championship'>Local Championship</option>
            <option value='Exhibition'>Exhibition</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-white mb-2'>
            Select Pro Class
          </label>
          <select
            name='proClass'
            value={formData.proClass || ''}
            onChange={handleChange}
            className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
          >
            <option value=''>Select Pro Class</option>
            <option value='Professional'>Professional</option>
            <option value='Amateur'>Amateur</option>
            <option value='Semi-Professional'>Semi-Professional</option>
          </select>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-white mb-2'>
            Rule Style / Disciplines
          </label>
          <select
            name='ruleStyle'
            value={formData.ruleStyle}
            onChange={handleChange}
            className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
            required
          >
            <option value=''>Select Rule Style</option>
            <option value='Olympic'>Olympic</option>
            <option value='Muay Thai'>Muay Thai</option>
            <option value='Point Sparring'>Point Sparring</option>
            <option value='Full Contact'>Full Contact</option>
            <option value='Modified'>Modified</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-white mb-2'>
            Age Class
          </label>
          <select
            name='ageClass'
            value={formData.ageClass}
            onChange={handleChange}
            className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
            required
          >
            <option value=''>Select Age Class</option>
            <option value='Junior'>Junior</option>
            <option value='Adult'>Adult</option>
            <option value='Senior'>Senior</option>
          </select>
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
            placeholder='Enter number of rounds (1-12)'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-white mb-2'>
            Round Duration (seconds) *
          </label>
          <input
            type='number'
            name='roundDuration'
            value={formData.roundDuration}
            onChange={handleChange}
            className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
            min='30'
            max='600'
            placeholder='Enter duration in seconds (e.g., 90, 120, 180)'
            required
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-white mb-2'>
            Start Date <span className='text-red-500'>*</span>
          </label>
          <input
            type='datetime-local'
            name='startDate'
            value={formData.startDate}
            onChange={handleChange}
            className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
            required
          />
        </div>
      </div>

      {/* Weight Class */}
      <div>
        <h3 className='text-lg font-medium text-white mb-3'>Weight Class</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label className='block text-sm font-medium text-white mb-2'>
              Min Weight
            </label>
            <input
              type='number'
              step='0.1'
              name='weightClass.min'
              value={formData.weightClass.min}
              onChange={handleChange}
              className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
              placeholder='Enter minimum weight (e.g., 135)'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-white mb-2'>
              Max Weight
            </label>
            <input
              type='number'
              step='0.1'
              name='weightClass.max'
              value={formData.weightClass.max}
              onChange={handleChange}
              className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
              placeholder='Enter maximum weight (e.g., 145)'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-white mb-2'>
              Unit
            </label>
            <select
              name='weightClass.unit'
              value={formData.weightClass.unit}
              onChange={handleChange}
              className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
            >
              <option value='lbs'>lbs</option>
              <option value='kg'>kg</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes */}
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
          placeholder='Add any additional notes or special instructions for this bout'
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
            <div className='p-4 bg-red-900/20 border border-red-500/30 rounded-lg'>
              <div className='flex justify-between items-start'>
                <div>
                  <h4 className='font-medium text-white'>
                    {redFighter.firstName} {redFighter.lastName}
                  </h4>
                  <p className='text-sm text-gray-300'>
                    Weight: {redFighter.weight || 'N/A'}{' '}
                    {redFighter.weightUnit || 'lbs'}
                  </p>
                  <p className='text-sm text-gray-300'>
                    Age:{' '}
                    {redFighter.dateOfBirth
                      ? new Date().getFullYear() -
                        new Date(redFighter.dateOfBirth).getFullYear()
                      : 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => setRedFighter(null)}
                  className='text-red-400 hover:text-red-300'
                >
                  <X size={16} />
                </button>
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
                    {fighter.weight || 'N/A'} {fighter.weightUnit || 'lbs'} •
                    Age:{' '}
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
            <div className='p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg'>
              <div className='flex justify-between items-start'>
                <div>
                  <h4 className='font-medium text-white'>
                    {blueFighter.firstName} {blueFighter.lastName}
                  </h4>
                  <p className='text-sm text-gray-300'>
                    Weight: {blueFighter.weight || 'N/A'}{' '}
                    {blueFighter.weightUnit || 'lbs'}
                  </p>
                  <p className='text-sm text-gray-300'>
                    Age:{' '}
                    {blueFighter.dateOfBirth
                      ? new Date().getFullYear() -
                        new Date(blueFighter.dateOfBirth).getFullYear()
                      : 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => setBlueFighter(null)}
                  className='text-blue-400 hover:text-blue-300'
                >
                  <X size={16} />
                </button>
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
                    {fighter.weight || 'N/A'} {fighter.weightUnit || 'lbs'} •
                    Age:{' '}
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
          {loading ? 'Creating...' : 'Create Bout'}
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
              ? 'Create New Bout - Step 1: Bout Details'
              : 'Create New Bout - Step 2: Assign Fighters'}
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
