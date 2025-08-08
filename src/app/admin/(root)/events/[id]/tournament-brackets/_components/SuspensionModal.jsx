'use client'

import React, { useState, useEffect } from 'react'
import { X, Upload, Calendar } from 'lucide-react'
import { API_BASE_URL } from '../../../../../../../constants'
import useStore from '../../../../../../../stores/useStore'

export default function SuspensionModal({ fighter, onClose, onSave }) {
  const user = useStore((state) => state.user)
  const [formData, setFormData] = useState({
    suspensionType: '',
    suspensionDuration: '',
    suspensionStartDate: '',
    suspensionEndDate: '',
    suspensionNotes: '',
    medicalClearanceRequired: false,
    medicalDocument: null,
  })
  const [loading, setLoading] = useState(false)

  const suspensionTypes = [
    'Medical',
    'Disciplinary',
    'No-Show',
    'Weight Missed',
    'Other',
  ]

  useEffect(() => {
    // Auto-calculate end date when start date and duration change
    if (formData.suspensionStartDate && formData.suspensionDuration) {
      const startDate = new Date(formData.suspensionStartDate)
      const endDate = new Date(startDate)
      endDate.setDate(
        startDate.getDate() + parseInt(formData.suspensionDuration)
      )

      setFormData((prev) => ({
        ...prev,
        suspensionEndDate: endDate.toISOString().split('T')[0],
      }))
    }
  }, [formData.suspensionStartDate, formData.suspensionDuration])

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target

    if (type === 'file') {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }))
    } else if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create FormData for file upload if needed
      const submitData = new FormData()

      // Add basic suspension data
      const suspensionData = {
        fighter: fighter._id,
        suspensionType: formData.suspensionType,
        suspensionDuration: parseInt(formData.suspensionDuration),
        suspensionStartDate: formData.suspensionStartDate,
        suspensionEndDate: formData.suspensionEndDate,
        suspensionNotes: formData.suspensionNotes,
        medicalClearanceRequired: formData.medicalClearanceRequired,
        status: 'Active',
        createdBy: user._id,
      }

      // Add basic data as JSON
      submitData.append('suspensionData', JSON.stringify(suspensionData))

      // Add file if present
      if (formData.medicalDocument) {
        submitData.append('medicalDocument', formData.medicalDocument)
      }

      const response = await fetch(`${API_BASE_URL}/suspensions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
        body: submitData,
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          onSave(data.data)
          onClose()
          alert('Suspension added successfully!')
        } else {
          alert('Error adding suspension: ' + data.message)
        }
      } else {
        alert('Error adding suspension')
      }
    } catch (err) {
      alert('Error adding suspension: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'>
      <div className='bg-[#0B1739] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-bold text-white'>
            Add Suspension - {fighter.firstName} {fighter.lastName}
          </h2>
          <button onClick={onClose} className='text-gray-400 hover:text-white'>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Suspension Type */}
          <div>
            <label className='block text-sm font-medium text-white mb-2'>
              Suspension Type *
            </label>
            <select
              name='suspensionType'
              value={formData.suspensionType}
              onChange={handleChange}
              className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
              required
            >
              <option value=''>Select Suspension Type</option>
              {suspensionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Duration and Dates */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Duration (Days) *
              </label>
              <input
                type='number'
                name='suspensionDuration'
                value={formData.suspensionDuration}
                onChange={handleChange}
                min='1'
                max='3650'
                className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Start Date *
              </label>
              <input
                type='date'
                name='suspensionStartDate'
                value={formData.suspensionStartDate}
                onChange={handleChange}
                className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                End Date *
              </label>
              <input
                type='date'
                name='suspensionEndDate'
                value={formData.suspensionEndDate}
                onChange={handleChange}
                className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
                required
              />
            </div>
          </div>

          {/* Medical Clearance Required */}
          {formData.suspensionType === 'Medical' && (
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  name='medicalClearanceRequired'
                  id='medicalClearanceRequired'
                  checked={formData.medicalClearanceRequired}
                  onChange={handleChange}
                  className='w-4 h-4'
                />
                <label
                  htmlFor='medicalClearanceRequired'
                  className='text-white'
                >
                  Medical clearance required before lifting suspension
                </label>
              </div>

              {/* Medical Document Upload */}
              {formData.medicalClearanceRequired && (
                <div>
                  <label className='block text-sm font-medium text-white mb-2'>
                    Upload Medical Document
                  </label>
                  <div className='border-2 border-dashed border-gray-600 rounded-lg p-4'>
                    <div className='text-center'>
                      <Upload className='mx-auto h-12 w-12 text-gray-400' />
                      <div className='mt-2'>
                        <input
                          type='file'
                          name='medicalDocument'
                          onChange={handleChange}
                          accept='.pdf,.jpg,.jpeg,.png,.doc,.docx'
                          className='hidden'
                          id='medicalDocumentUpload'
                        />
                        <label
                          htmlFor='medicalDocumentUpload'
                          className='cursor-pointer inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-[#07091D] hover:bg-gray-700'
                        >
                          Choose File
                        </label>
                      </div>
                      <p className='mt-2 text-xs text-gray-400'>
                        PDF, DOC, DOCX, JPG, PNG up to 10MB
                      </p>
                      {formData.medicalDocument && (
                        <p className='mt-2 text-sm text-green-400'>
                          Selected: {formData.medicalDocument.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Suspension Notes */}
          <div>
            <label className='block text-sm font-medium text-white mb-2'>
              Suspension Notes
            </label>
            <textarea
              name='suspensionNotes'
              value={formData.suspensionNotes}
              onChange={handleChange}
              rows='4'
              className='w-full bg-[#07091D] border border-gray-600 rounded px-3 py-2 text-white'
              placeholder='Additional details or context regarding the suspension...'
            />
          </div>

          {/* Fighter Info Display */}
          <div className='p-4 bg-[#07091D] rounded-lg'>
            <h3 className='text-sm font-medium text-white mb-2'>
              Fighter Information
            </h3>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-gray-400'>Name:</span>
                <span className='ml-2 text-white'>
                  {fighter.firstName} {fighter.lastName}
                </span>
              </div>
              <div>
                <span className='text-gray-400'>Email:</span>
                <span className='ml-2 text-white'>{fighter.email}</span>
              </div>
              <div>
                <span className='text-gray-400'>Weight Class:</span>
                <span className='ml-2 text-white'>
                  {fighter.weightClass || 'N/A'}
                </span>
              </div>
              <div>
                <span className='text-gray-400'>Training Experience:</span>
                <span className='ml-2 text-white'>
                  {fighter.trainingExperience || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
              type='submit'
              className='px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50'
              disabled={
                loading ||
                !formData.suspensionType ||
                !formData.suspensionDuration ||
                !formData.suspensionStartDate
              }
            >
              {loading ? 'Adding...' : 'Add Suspension'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
