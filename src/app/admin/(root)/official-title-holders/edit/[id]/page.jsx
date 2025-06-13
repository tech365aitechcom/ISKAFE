'use client'
import React, { use, useEffect, useState } from 'react'
import axios from 'axios'
import Loader from '../../../../../_components/Loader'
import { API_BASE_URL, apiConstants } from '../../../../../../constants'
import Link from 'next/link'
import { enqueueSnackbar } from 'notistack'
import useStore from '../../../../../../stores/useStore'

export default function EditOfficialTitleHolderPage({ params }) {
  const { id } = use(params)
  const { user } = useStore()

  const [loading, setLoading] = useState(true)
  const [officialTitle, setOfficialTitle] = useState({
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
  const [submitting, setSubmitting] = useState(false)

  const fetchOfficialTitleDetails = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/official-title-holders/${id}`
      )
      const data = response.data.data
      setOfficialTitle({
        proClassification: data.proClassification || '',
        sport: data.sport || '',
        ageClass: data.ageClass || '',
        weightClass: data.weightClass || '',
        title: data.title || '',
        date: data.date?.split('T')[0] || '',
        notes: data.notes || '',
        fighter: data.fighter?._id || '',
      })
    } catch (err) {
      console.log('Error fetching news details:', err)
      enqueueSnackbar(err.response.data.message, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const selectedClassification = classifications.find(
    (c) => c.label === officialTitle.proClassification
  )

  const sportOptions =
    selectedClassification?.sports.map((sport) => sport.label) || []

  const selectedSport = selectedClassification?.sports.find(
    (s) => s.label === officialTitle.sport
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

  useEffect(() => {
    fetchOfficialTitleDetails()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setOfficialTitle((prev) => ({ ...prev, [name]: value }))
  }

  console.log('Official Title Details:', officialTitle)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await axios.put(
        `${API_BASE_URL}/official-title-holders/${id}`,
        officialTitle,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      )
      if (res.status == apiConstants.success) {
        enqueueSnackbar(res.data.message, { variant: 'success' })
        fetchOfficialTitleDetails()
      }
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message, { variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className='text-white p-8 flex justify-center relative overflow-hidden'>
      <div
        className='absolute -left-10 top-1/2 transform -translate-y-1/2 w-60 h-96 rounded-full opacity-70 blur-xl'
        style={{
          background:
            'linear-gradient(317.9deg, #6F113E 13.43%, rgba(111, 17, 62, 0) 93.61%)',
        }}
      ></div>
      <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
        <div className='flex items-center gap-4 mb-6'>
          <Link href='/admin/official-title-holders'>
            <button className='mr-2 text-white'>
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
          </Link>
          <h1 className='text-2xl font-bold'>Official Title Editor</h1>
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
              const disabled = prevFieldName
                ? !officialTitle[prevFieldName]
                : false

              return (
                <div key={name} className='bg-[#00000061] p-2 rounded'>
                  <label className='block text-sm font-medium mb-1'>
                    {label}
                    <span className='text-red-500'>*</span>
                  </label>
                  {isSelect ? (
                    <select
                      name={name}
                      value={officialTitle[name]}
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
                      value={officialTitle[name]}
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
                value={officialTitle.fighter}
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
              value={officialTitle.notes}
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
              disabled={submitting}
            >
              {submitting ? <Loader /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
