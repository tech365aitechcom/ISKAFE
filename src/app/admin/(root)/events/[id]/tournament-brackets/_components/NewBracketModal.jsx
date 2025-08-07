'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export default function NewBracketModal({ eventId, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    bracketNumber: '',
    divisionTitle: '',
    group: '',
    proClass: '',
    title: '',
    status: 'Open',
    ageClass: '',
    sport: '',
    ruleStyle: '',
    ring: '',
    weightClass: {
      min: '',
      max: '',
      unit: 'lbs'
    },
    fightStartTime: '',
    weighInTime: ''
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('weightClass.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        weightClass: {
          ...prev.weightClass,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Clean the form data to remove empty strings which might cause validation issues
    const cleanedFormData = { ...formData }
    
    // Remove empty optional fields
    if (!cleanedFormData.proClass) delete cleanedFormData.proClass
    if (!cleanedFormData.group) delete cleanedFormData.group
    if (!cleanedFormData.ring) delete cleanedFormData.ring
    if (!cleanedFormData.fightStartTime) delete cleanedFormData.fightStartTime
    if (!cleanedFormData.weighInTime) delete cleanedFormData.weighInTime

    const bracketData = {
      ...cleanedFormData,
      weightClass: {
        min: parseFloat(formData.weightClass.min) || 0,
        max: parseFloat(formData.weightClass.max) || 999,
        unit: formData.weightClass.unit
      },
      fighters: []
    }

    // Debug log to see what we're sending
    console.log('Bracket data being sent:', bracketData)

    await onCreate(bracketData)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0B1739] rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Create New Bracket</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Bracket Number
              </label>
              <input
                type="number"
                name="bracketNumber"
                value={formData.bracketNumber}
                onChange={handleChange}
                placeholder="e.g., 1"
                className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Division Title
              </label>
              <input
                type="text"
                name="divisionTitle"
                value={formData.divisionTitle}
                onChange={handleChange}
                placeholder="e.g., Boys Novice 60 LBS"
                className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Bracket Title
              </label>
              <select
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white"
                required
              >
                <option value="">Select Title</option>
                <option value="Championship">Championship</option>
                <option value="Exhibition">Exhibition</option>
                <option value="Local Championship">Local Championship</option>
                <option value="Regional Championship">Regional Championship</option>
                <option value="National Championship">National Championship</option>
                <option value="International Championship">International Championship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="Open">Open</option>
                <option value="Started">Started</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Age Class
              </label>
              <select
                name="ageClass"
                value={formData.ageClass}
                onChange={handleChange}
                className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white"
                required
              >
                <option value="">Select Age Class</option>
                <option value="Youth">Youth</option>
                <option value="Junior">Junior</option>
                <option value="Adult">Adult</option>
                <option value="Senior">Senior</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Sport
              </label>
              <select
                name="sport"
                value={formData.sport}
                onChange={handleChange}
                className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white"
                required
              >
                <option value="">Select Sport</option>
                <option value="Kickboxing">Kickboxing</option>
                <option value="Boxing">Boxing</option>
                <option value="MMA">MMA</option>
                <option value="Muay Thai">Muay Thai</option>
                <option value="Karate">Karate</option>
                <option value="Taekwondo">Taekwondo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Rule Style
              </label>
              <select
                name="ruleStyle"
                value={formData.ruleStyle}
                onChange={handleChange}
                className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white"
                required
              >
                <option value="">Select Rule Style</option>
                {/* Youth and Junior specific rules */}
                {(formData.ageClass === 'Youth' || formData.ageClass === 'Junior') && (
                  <>
                    <option value="Point Sparring">Point Sparring</option>
                    <option value="Light Contact">Light Contact</option>
                    <option value="Continuous Sparring">Continuous Sparring</option>
                  </>
                )}
                {/* Adult and Senior rules */}
                {(formData.ageClass === 'Adult' || formData.ageClass === 'Senior' || !formData.ageClass) && (
                  <>
                    <option value="Muay Thai">Muay Thai</option>
                    <option value="K-1">K-1</option>
                    <option value="Olympic">Olympic</option>
                    <option value="Point Sparring">Point Sparring</option>
                    <option value="Continuous">Continuous</option>
                    <option value="Full Contact">Full Contact</option>
                    <option value="Semi Contact">Semi Contact</option>
                    <option value="Low Kick">Low Kick</option>
                  </>
                )}
                {/* Default options when no age class selected */}
                {!formData.ageClass && (
                  <>
                    <option value="Point Sparring">Point Sparring</option>
                    <option value="Continuous">Continuous</option>
                    <option value="Full Contact">Full Contact</option>
                    <option value="Semi Contact">Semi Contact</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Ring
              </label>
              <select
                name="ring"
                value={formData.ring}
                onChange={handleChange}
                className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="">Select Ring</option>
                <option value="Ring 1">Ring 1</option>
                <option value="Ring 2">Ring 2</option>
                <option value="Ring 3">Ring 3</option>
                <option value="Ring 4">Ring 4</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Group
              </label>
              <select
                name="group"
                value={formData.group}
                onChange={handleChange}
                className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="">Select Group</option>
                <option value="Group A">Group A</option>
                <option value="Group B">Group B</option>
                <option value="Group C">Group C</option>
                <option value="Group D">Group D</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Pro Class
              </label>
              <select
                name="proClass"
                value={formData.proClass}
                onChange={handleChange}
                className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="">Select Pro Class</option>
                <option value="Pro">Pro</option>
                <option value="Amateur">Amateur</option>
              </select>
            </div>
          </div>

          {/* Weight Class */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Weight Class</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Weight Class Range
                </label>
                <select
                  name="weightClassRange"
                  value={`${formData.weightClass.min}-${formData.weightClass.max}`}
                  onChange={(e) => {
                    const [min, max] = e.target.value.split('-').map(v => parseFloat(v) || 0)
                    setFormData(prev => ({
                      ...prev,
                      weightClass: { ...prev.weightClass, min, max }
                    }))
                  }}
                  className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="0-999">Select Weight Range</option>
                  
                  {/* Youth Weight Classes */}
                  {formData.ageClass === 'Youth' && (
                    <>
                      <option value="40-45">40-45 lbs</option>
                      <option value="45-50">45-50 lbs</option>
                      <option value="50-55">50-55 lbs</option>
                      <option value="55-60">55-60 lbs</option>
                      <option value="60-65">60-65 lbs</option>
                      <option value="65-70">65-70 lbs</option>
                    </>
                  )}
                  
                  {/* Junior Weight Classes */}
                  {formData.ageClass === 'Junior' && (
                    <>
                      <option value="60-65">60-65 lbs</option>
                      <option value="65-70">65-70 lbs</option>
                      <option value="70-75">70-75 lbs</option>
                      <option value="75-80">75-80 lbs</option>
                      <option value="80-85">80-85 lbs</option>
                      <option value="85-90">85-90 lbs</option>
                      <option value="90-95">90-95 lbs</option>
                    </>
                  )}
                  
                  {/* Adult Weight Classes */}
                  {(formData.ageClass === 'Adult' || formData.ageClass === 'Senior') && (
                    <>
                      <option value="100-110">100-110 lbs</option>
                      <option value="110-120">110-120 lbs</option>
                      <option value="120-130">120-130 lbs</option>
                      <option value="130-140">130-140 lbs</option>
                      <option value="140-150">140-150 lbs</option>
                      <option value="150-160">150-160 lbs</option>
                      <option value="160-170">160-170 lbs</option>
                      <option value="170-180">170-180 lbs</option>
                      <option value="180-200">180-200 lbs</option>
                      <option value="200-999">200+ lbs</option>
                    </>
                  )}
                  
                  {/* Custom range input */}
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Show custom inputs if custom is selected */}
              {(formData.weightClass.min === 0 && formData.weightClass.max === 999) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Min Weight
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="weightClass.min"
                      value={formData.weightClass.min || ''}
                      onChange={handleChange}
                      className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Max Weight
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="weightClass.max"
                      value={formData.weightClass.max || ''}
                      onChange={handleChange}
                      className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white"
                      placeholder="999"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Unit
                </label>
                <select
                  name="weightClass.unit"
                  value={formData.weightClass.unit}
                  onChange={handleChange}
                  className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>
          </div>

          {/* Timing Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Fight Start Time
              </label>
              <input
                type="datetime-local"
                name="fightStartTime"
                value={formData.fightStartTime}
                onChange={handleChange}
                className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Weigh-In Time
              </label>
              <input
                type="datetime-local"
                name="weighInTime"
                value={formData.weighInTime}
                onChange={handleChange}
                className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 border border-gray-600 rounded hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Bracket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}