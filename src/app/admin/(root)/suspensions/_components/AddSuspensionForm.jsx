'use client'

import useStore from '../../../../../stores/useStore'
import { API_BASE_URL, apiConstants } from '../../../../../constants'
import axios from 'axios'
import { enqueueSnackbar } from 'notistack'
import React, { useEffect, useState } from 'react'
import Loader from '../../../../_components/Loader'

export const AddSuspensionForm = ({ setShowAddSuspensionForm }) => {
  const [formData, setFormData] = useState({
    status: '',
    type: '',
    incidentDate: '',
    sportingEventUID: '',
    description: '',
    daysWithoutTraining: '',
    daysBeforeCompeting: '',
    indefinite: false,
    person: '',
  })
  const { user } = useStore()
  const [errors, setErrors] = useState({})
  const [generatedID, setGeneratedID] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(false)
  const [sportsLoaded, setSportsLoaded] = useState(false)
  const [weightClassesLoaded, setWeightClassesLoaded] = useState(false)

  const getPeople = async () => {
    setLoading(true)
    try {
      const queryParams = {
        page: 1,
        limit: 500,
      }

      const filteredParams = Object.fromEntries(
        Object.entries(queryParams).filter(
          ([_, value]) => value !== '' && value !== null && value !== undefined
        )
      )

      const queryString = new URLSearchParams(filteredParams).toString()

      const response = await axios.get(
        `${API_BASE_URL}/people?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      )

      setPeople(response.data.items)
    } catch (error) {
      console.log('Error fetching people:', error)
      enqueueSnackbar('Failed to load people', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getPeople()
    setGeneratedID(`TEMP-${Math.floor(Math.random() * 10000)}`)
  }, [])

  const validateField = (name, value) => {
    switch (name) {
      case 'status':
        return value.trim() === '' ? 'Status is required' : ''
      case 'type':
        return value.trim() === '' ? 'Suspension type is required' : ''
      case 'incidentDate':
        if (value.trim() === '') return 'Incident date is required'
        const selectedDate = new Date(value)
        const today = new Date()
        if (selectedDate > today) return 'Incident date cannot be in the future'
        return ''
      case 'description':
        if (value.trim() === '') return 'Description is required'
        if (value.length < 10)
          return 'Description must be at least 10 characters'
        return ''
      case 'daysWithoutTraining':
        if (value !== '' && (isNaN(value) || parseInt(value) < 0)) {
          return 'Must be a non-negative number'
        }
        return ''
      case 'daysBeforeCompeting':
        if (value !== '' && (isNaN(value) || parseInt(value) < 0)) {
          return 'Must be a non-negative number'
        }
        return ''
      case 'person':
        return value.trim() === '' ? 'Suspended person is required' : ''
      default:
        return ''
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        ...(name === 'indefinite' && checked && {
          daysWithoutTraining: '',
          daysBeforeCompeting: '',
        }),
      }))
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    const error = validateField(name, value)
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    let isValid = true

    const requiredFields = [
      'status',
      'type',
      'incidentDate',
      'description',
      'person',
    ]

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field])
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    })

    const optionalFields = ['daysWithoutTraining', 'daysBeforeCompeting']
    optionalFields.forEach((field) => {
      if (formData[field] !== '') {
        const error = validateField(field, formData[field])
        if (error) {
          newErrors[field] = error
          isValid = false
        }
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (submitting) return

    if (validateForm()) {
      setSubmitting(true)

      try {
        let payload = {
          ...formData,
          daysWithoutTraining: formData.daysWithoutTraining
            ? parseInt(formData.daysWithoutTraining)
            : null,
          daysBeforeCompeting: formData.daysBeforeCompeting
            ? parseInt(formData.daysBeforeCompeting)
            : null,
        }

        if (formData.indefinite) {
          delete payload.daysBeforeCompeting
          delete payload.daysWithoutTraining
        }

        const response = await axios.post(
          `${API_BASE_URL}/suspensions`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        )

        if (response.status === apiConstants.create) {
          enqueueSnackbar(
            response.data.message || 'Suspension saved successfully',
            { variant: 'success' }
          )
          setShowAddSuspensionForm(false)
        }
      } catch (error) {
        enqueueSnackbar(
          error.response?.data?.message || 'Failed to save suspension',
          { variant: 'error' }
        )
        console.error('Submission error:', error)
      } finally {
        setSubmitting(false)
      }
    } else {
      enqueueSnackbar('Please fix the errors in the form', {
        variant: 'error',
      })
    }
  }

  const handleCancel = () => {
    setShowAddSuspensionForm(false)
  }

  if (loading) return <Loader />

  return (
    <div className="min-h-screen text-white w-full">
      <div className="w-full mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            className="mr-2 text-white hover:text-purple-300 transition-colors"
            onClick={() => setShowAddSuspensionForm(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Add New Suspension</h1>
          {generatedID && (
            <p className="text-sm text-gray-300 mt-1">
              Suspension ID: <span className="font-mono text-white">{generatedID}</span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div className="bg-[#00000061] p-3 rounded">
                <label className="block text-sm font-medium mb-1">
                  Status<span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none py-1"
                  required
                >
                  <option value="Select Status" className="text-black">
                    Select Status
                  </option>
                  <option value="Active" className="text-black">
                    Active
                  </option>
                  <option value="Pending" className="text-black">
                    Pending
                  </option>
                  <option value="Closed" className="text-black">
                    Closed
                  </option>
                </select>
                {errors.status && (
                  <p className="text-red-500 text-xs mt-1">{errors.status}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Indicates if the suspension is enforced
                </p>
              </div>

              {/* Type */}
              <div className="bg-[#00000061] p-3 rounded">
                <label className="block text-sm font-medium mb-1">
                  Type<span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none py-1"
                  required
                >
                  <option value="" className="text-black">
                    Make a selection
                  </option>
                  <option value="Disciplinary" className="text-black">
                    Disciplinary
                  </option>
                  <option value="Medical" className="text-black">
                    Medical
                  </option>
                </select>
                {errors.type && (
                  <p className="text-red-500 text-xs mt-1">{errors.type}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Defines category of suspension
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Incident Date */}
              <div className="bg-[#00000061] p-3 rounded">
                <label className="block text-sm font-medium mb-1">
                  Incident Date<span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="incidentDate"
                  value={formData.incidentDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full bg-transparent outline-none py-1"
                  required
                />
                {errors.incidentDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.incidentDate}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  The date of the incident triggering suspension
                </p>
              </div>

              {/* Sporting Event UID */}
              <div className="bg-[#00000061] p-3 rounded">
                <label className="block text-sm font-medium mb-1">
                  Sporting Event UID
                </label>
                <input
                  type="text"
                  name="sportingEventUID"
                  value={formData.sportingEventUID}
                  onChange={handleChange}
                  placeholder="Enter event reference"
                  className="w-full bg-transparent outline-none py-2"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Reference to related sporting event (optional)
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#00000061] p-3 rounded mt-4">
              <label className="block text-sm font-medium mb-1">
                Description<span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the context and reason for suspension (minimum 10 characters)"
                rows={4}
                className="w-full bg-transparent outline-none py-1 resize-vertical"
                required
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Context and reason for suspension (minimum 10 characters
                required)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Days Without Training */}
              <div className="bg-[#00000061] p-3 rounded">
                <label className="block text-sm font-medium mb-1">
                  Days Without Training
                </label>
                <input
                  type="number"
                  name="daysWithoutTraining"
                  value={formData.daysWithoutTraining}
                  onChange={handleChange}
                  placeholder="Option"
                  min="0"
                  disabled={formData.indefinite}
                  className={`w-full bg-transparent outline-none py-1 ${
                    formData.indefinite ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
                {errors.daysWithoutTraining && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.daysWithoutTraining}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Sets when training can resume
                </p>
              </div>

              {/* Days Before Competing */}
              <div className="bg-[#00000061] p-3 rounded">
                <label className="block text-sm font-medium mb-1">
                  Days Before Competing
                </label>
                <input
                  type="number"
                  name="daysBeforeCompeting"
                  value={formData.daysBeforeCompeting}
                  onChange={handleChange}
                  placeholder="Option"
                  min="0"
                  disabled={formData.indefinite}
                  className={`w-full bg-transparent outline-none py-1  ${
                    formData.indefinite ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
                {errors.daysBeforeCompeting && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.daysBeforeCompeting}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Sets when competition is allowed again
                </p>
              </div>
            </div>

            {/* Indefinite Checkbox */}
            <div className="bg-[#00000061] p-3 rounded mt-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="indefinite"
                  checked={formData.indefinite}
                  onChange={handleChange}
                  className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium">
                  Indefinite Suspension
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Overrides all date-based fields when checked
              </p>
            </div>

            {/* Suspended Person */}
            <div className="mb-6 bg-[#00000061] p-3 rounded mt-4">
              <label className="block text-sm font-medium mb-1">
                Suspended Person<span className="text-red-500">*</span>
              </label>
              <select
                name="person"
                value={formData.person}
                onChange={handleChange}
                className="w-full outline-none"
                required
              >
                <option value="" className="text-black">
                  Select person
                </option>
                {people.map((person) => (
                  <option
                    key={person._id}
                    value={person._id}
                    className="text-black"
                  >
                    {person.firstName + " " + person.lastName} ({person.email})
                  </option>
                ))}
              </select>
              {errors.person && (
                <p className="text-red-500 text-xs mt-1">{errors.person}</p>
              )}
            </div>
          </div>

          {/* Footer - Action Buttons */}
          <div className="">
            <div className="flex justify-center gap-4 mt-8">
              <button
                type="submit"
                disabled={submitting}
                className={`bg-purple-600 ${
                  submitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-purple-700"
                } text-white font-medium py-2 px-6 rounded transition duration-200`}
              >
                {submitting ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded transition duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}