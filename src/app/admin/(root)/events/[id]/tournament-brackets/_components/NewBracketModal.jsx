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
      <div className="bg-[#0B1739] rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto my-auto relative top-4">
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
                <option value="youth">Youth</option>
                <option value="adult">Adult</option>
                <option value="senior">Senior</option>
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
                <option value="kickboxing">Kickboxing</option>
                <option value="boxing">Boxing</option>
                <option value="mma">MMA</option>
                <option value="muay thai">Muay Thai</option>
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
                <option value="muay thai">Muay Thai</option>
                <option value="olympic">Olympic</option>
                <option value="point sparring">Point Sparring</option>
                <option value="continuous">Continuous</option>
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
                  Min Weight
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="weightClass.min"
                  value={formData.weightClass.min}
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
                  value={formData.weightClass.max}
                  onChange={handleChange}
                  className="w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="999"
                />
              </div>

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