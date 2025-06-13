'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { API_BASE_URL, apiConstants } from '../../../../../constants'
import { enqueueSnackbar } from 'notistack'
import useStore from '../../../../../stores/useStore'

export const AddOfficialTitle = ({ setShowAddTitleForm }) => {
  const [formData, setFormData] = useState({
    proClassification: '',
    sport: '',
    ageClass: '',
    weightClass: '',
    title: '',
    date: '',
    notes: '',
    fighter: '',
  })

  const [classifications, setClassifications] = useState([])
  const [fighters, setFighters] = useState([])

  const { user } = useStore()

  const fetchMasterData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/master/proClassifications`
      )
      setClassifications(response.data.result)
    } catch (err) {
      console.error('Failed to fetch classifications:', err)
    }
  }

  const fetchFighters = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/fighter`)
      setFighters(response.data.data)
    } catch (err) {
      console.error('Failed to fetch fighters:', err)
    }
  }

  useEffect(() => {
    fetchMasterData()
    fetchFighters()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
      ...(name === 'proClassification' && { sport: '', weightClass: '' }),
      ...(name === 'sport' && { weightClass: '' }),
    }))
  }

  const selectedClassification = classifications.find(
    (c) => c.label === formData.proClassification
  )

  const sportOptions =
    selectedClassification?.sports.map((sport) => sport.label) || []

  const selectedSport = selectedClassification?.sports.find(
    (s) => s.label === formData.sport
  )

  const weightClassOptions = selectedSport?.weightClass || []
  const ageClassOptions = selectedSport?.ageClass || []

  const getFullName = (fighter) => {
    return [fighter.firstName, fighter.lastName].filter(Boolean).join(' ')
  }
  console.log('fighters', fighters)

  const selectOptionsMap = {
    proClassification: classifications.map((c) => c.label),
    sport: sportOptions,
    ageClass: ageClassOptions,
    weightClass: weightClassOptions,
    fighter: fighters.map((f) => ({
      label: getFullName(f.userId),
      value: f._id,
    })),
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(
        `${API_BASE_URL}/official-title-holders`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      )
      console.log('Response:', response)

      if (response.status === apiConstants.create) {
        enqueueSnackbar(response.data.message, { variant: 'success' })
        setFormData({
          proClassification: '',
          sport: '',
          ageClass: '',
          weightClass: '',
          title: '',
          date: '',
          notes: '',
          fighter: '',
        })
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message, { variant: 'error' })
    }
  }

  return (
    <div className='min-h-screen text-white bg-dark-blue-900'>
      <div className='w-full'>
        <div className='flex items-center gap-4 mb-6'>
          <button
            className='text-white'
            onClick={() => setShowAddTitleForm(false)}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M10 19l-7-7m0 0l7-7m-7 7h18'
              />
            </svg>
          </button>
          <h1 className='text-xl font-medium'>Add New Title</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            {[
              { label: 'Pro Classification', name: 'proClassification' },
              { label: 'Sport', name: 'sport' },
              { label: 'Age Class', name: 'ageClass' },
              { label: 'Weight Class', name: 'weightClass' },
              { label: 'Title Name', name: 'title' },
              { label: 'Date', name: 'date', type: 'date' },
            ].map(({ label, name, type = 'text' }, index, arr) => {
              const isSelect = selectOptionsMap[name] !== undefined

              // Determine previous field name, or null if first
              const prevFieldName = index > 0 ? arr[index - 1].name : null

              // Disable current field if previous is not selected (and previous exists)
              const disabled = prevFieldName ? !formData[prevFieldName] : false

              return (
                <div key={name} className='bg-[#00000061] p-2 rounded'>
                  <label className='block text-sm font-medium mb-1'>
                    {label}
                    <span className='text-red-500'>*</span>
                  </label>
                  {isSelect ? (
                    <select
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      className='w-full bg-transparent outline-none text-white'
                      required={!disabled}
                      disabled={disabled}
                    >
                      <option value='' className='text-black'>
                        Select {label}
                      </option>
                      {selectOptionsMap[name].map((opt) => (
                        <option key={opt} value={opt} className='text-black'>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={type}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      className='w-full bg-transparent outline-none'
                      required={!disabled}
                      disabled={disabled}
                    />
                  )}
                </div>
              )
            })}

            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>Fighter</label>
              <select
                name='fighter'
                value={formData.fighter}
                onChange={handleChange}
                className='w-full bg-transparent outline-none text-white'
              >
                <option value='' className='text-black'>
                  Select Fighter
                </option>
                {selectOptionsMap.fighter.map((f) => (
                  <option key={f.value} value={f.value} className='text-black'>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className='bg-[#00000061] p-2 rounded mb-4'>
            <label className='block text-xs font-medium mb-1'>
              Notes (Optional)
            </label>
            <textarea
              name='notes'
              value={formData.notes}
              onChange={handleChange}
              rows='3'
              className='w-full bg-transparent outline-none resize-none'
              maxLength={500}
            />
          </div>

          <div className='flex justify-center gap-4 mt-6'>
            <button
              type='submit'
              className='bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded transition duration-200'
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
