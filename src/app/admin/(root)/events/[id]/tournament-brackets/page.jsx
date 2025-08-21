'use client'

import { ArrowUpDown, Trash, Plus, Settings, Users, Play } from 'lucide-react'
import BracketList from './_components/BracketList'
import NewBracketModal from './_components/NewBracketModal'
import MoveFightersModal from './_components/MoveFightersModal'
import ReseedBracketsModal from './_components/ReseedBracketsModal'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { API_BASE_URL, apiConstants } from '../../../../../../constants'
import useStore from '../../../../../../stores/useStore'
import Loader from '../../../../../_components/Loader'
import { enqueueSnackbar } from 'notistack'
import axios from 'axios'
import {
  titleData,
  sportsData,
  bracketRuleData,
  bracketStatusData,
  proClassData,
  bracketCriteriaData,
  disciplineData,
  getAgeClasses,
} from './_components/bracketUtils'

export default function TournamentBrackets() {
  const params = useParams()
  const user = useStore((state) => state.user)
  const [eventId, setEventId] = useState(null)
  const [brackets, setBrackets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('view') // view, edit, move, reorder, delete
  const [showActionsDropdown, setShowActionsDropdown] = useState(false)
  const [showNewBracketModal, setShowNewBracketModal] = useState(false)
  const [showMoveFightersModal, setShowMoveFightersModal] = useState(false)
  const [showReseedBracketsModal, setShowReseedBracketsModal] = useState(false)
  const [event, setEvent] = useState(null)

  // Filter states
  const [filters, setFilters] = useState({
    title: '',
    sport: '',
    discipline: '',
    ageClass: '',
    ruleStyle: '',
    bracketStatus: '',
    proClass: '',
    bracketCriteria: '',
    minWeight: '',
    maxWeight: '',
    showWeightRange: false,
  })

  useEffect(() => {
    if (params?.id) {
      setEventId(params.id)
      fetchEvent(params.id)
      fetchBrackets(params.id)
    }
  }, [params, user?.token])

  const fetchEvent = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setEvent(data.data)
        }
      }
    } catch (err) {
      console.error('Error fetching event:', err)
    }
  }

  const fetchBrackets = async (id) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/brackets?eventId=${id}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setBrackets(data.data || [])
        } else {
          setBrackets([])
        }
      } else {
        setBrackets([])
      }
    } catch (err) {
      setError(err.message)
      setBrackets([])
    } finally {
      setLoading(false)
    }
  }

  const handleNewBracket = () => {
    setShowNewBracketModal(true)
    setShowActionsDropdown(false)
  }

  const handleCreateBracket = async (bracketData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/brackets`,
        {
          event: eventId,
          ...bracketData,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      )

      if (response.status === apiConstants.create) {
        enqueueSnackbar(response.data.message, {
          variant: 'success',
        })
        // Refresh the brackets list after successful creation
        await fetchBrackets(eventId)
        setShowNewBracketModal(false)
      }
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.message || 'Failed to create bracket',
        {
          variant: 'error',
        }
      )
      // Re-throw the error so the modal can catch it and not show success
      throw err
    }
  }

  const handleAutoNumberBrackets = async () => {
    try {
      // Auto-number by updating brackets with sequential bracketNumber
      const updates = brackets.map((bracket, index) =>
        fetch(`${API_BASE_URL}/brackets/${bracket._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            ...bracket,
            bracketNumber: index + 1,
          }),
        })
      )

      await Promise.all(updates)
      await fetchBrackets(eventId)
      alert('Brackets auto-numbered successfully!')
    } catch (err) {
      alert('Error auto-numbering brackets: ' + err.message)
    }
    setShowActionsDropdown(false)
  }

  const handleStartAllBrackets = async () => {
    if (
      confirm(
        'Are you sure you want to start all brackets? This will create bouts for all brackets.'
      )
    ) {
      try {
        const updates = brackets
          .filter(
            (bracket) =>
              bracket.status === 'Open' && bracket.fighters?.length >= 2
          )
          .map((bracket) =>
            fetch(`${API_BASE_URL}/brackets/${bracket._id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user?.token}`,
              },
              body: JSON.stringify({
                ...bracket,
                status: 'Started',
              }),
            })
          )

        await Promise.all(updates)
        await fetchBrackets(eventId)
        alert('All eligible brackets started successfully!')
      } catch (err) {
        alert('Error starting brackets: ' + err.message)
      }
    }
    setShowActionsDropdown(false)
  }

  const handleDeleteBracket = async (bracketId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/brackets/${bracketId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })

      if (response.ok) {
        await fetchBrackets(eventId)
        enqueueSnackbar('Bracket deleted successfully!', {
          variant: 'success',
        })
      }
    } catch (err) {
      enqueueSnackbar('Error deleting bracket: ' + err.message, {
        variant: 'error',
      })
    }
  }

  const handleUpdateBracket = async (bracketId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/brackets/${bracketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        await fetchBrackets(eventId)
        return { success: true }
      } else {
        return { success: false, error: 'Failed to update bracket' }
      }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const getModeButtonClass = (buttonMode) =>
    mode === buttonMode
      ? 'bg-blue-600 text-white'
      : 'border border-white text-white hover:bg-white hover:text-black'

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

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen w-full bg-[#07091D]'>
        <Loader />
      </div>
    )
  }

  return (
    <div className='text-white p-8 relative flex justify-center overflow-hidden'>
      <div
        className='absolute -left-10 top-1/2 transform -translate-y-1/2 w-60 h-96 rounded-full opacity-70 blur-xl'
        style={{
          background:
            'linear-gradient(317.9deg, #6F113E 13.43%, rgba(111, 17, 62, 0) 93.61%)',
        }}
      ></div>
      <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
        {/* Header */}
        <div className='flex items-center gap-4 mb-6'>
          <Link href={`/admin/events/view/${eventId}`}>
            <button className='mr-2 hover:bg-gray-700 p-2 rounded'>
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
          <div>
            <h1 className='text-2xl font-bold'>
              Tournament Bracket Management
            </h1>
            {event && (
              <p className='text-sm text-gray-300'>
                {event.name} -{' '}
                {event.startDate
                  ? new Date(event.startDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Date not set'}
              </p>
            )}
          </div>
        </div>

        {/* Management Controls */}
        <div className='flex justify-between items-center mb-6'>
          <div className='flex space-x-2'>
            <button
              onClick={() => setMode(mode === 'edit' ? 'view' : 'edit')}
              className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${getModeButtonClass(
                'edit'
              )}`}
            >
              <Settings size={14} />
              Edit Brackets
            </button>
            <button
              onClick={() => setShowMoveFightersModal(true)}
              className='px-3 py-1 text-sm rounded flex items-center gap-1 border border-white text-white hover:bg-white hover:text-black'
            >
              <Users size={14} />
              Move Fighters
            </button>
            <button
              onClick={() => setShowReseedBracketsModal(true)}
              className='px-3 py-1 text-sm rounded flex items-center gap-1 border border-white text-white hover:bg-white hover:text-black'
            >
              <ArrowUpDown size={14} />
              Reseed Brackets
            </button>
            <button
              onClick={() => setMode(mode === 'delete' ? 'view' : 'delete')}
              className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${getModeButtonClass(
                'delete'
              )}`}
            >
              <Trash size={14} />
              Delete Brackets
            </button>
          </div>

          {/* Actions Dropdown */}
          <div className='relative'>
            <button
              onClick={() => setShowActionsDropdown(!showActionsDropdown)}
              className='bg-green-600 px-4 py-2 text-sm rounded hover:bg-green-700 flex items-center gap-2'
            >
              Actions
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M19 9l-7 7-7-7'
                ></path>
              </svg>
            </button>

            {showActionsDropdown && (
              <div className='absolute right-0 mt-2 w-48 bg-[#0B1739] border border-gray-600 rounded-md shadow-lg z-10'>
                <button
                  onClick={handleNewBracket}
                  className='flex w-full text-left px-4 py-2 text-sm hover:bg-gray-700 items-center gap-2'
                >
                  <Plus size={16} />
                  New Bracket
                </button>
                <button
                  onClick={handleAutoNumberBrackets}
                  className='flex w-full text-left px-4 py-2 text-sm hover:bg-gray-700 items-center gap-2'
                >
                  <Settings size={16} />
                  Auto-Number Brackets
                </button>
                <button
                  onClick={handleStartAllBrackets}
                  className='flex w-full text-left px-4 py-2 text-sm hover:bg-gray-700 items-center gap-2'
                >
                  <Play size={16} />
                  Start All Brackets
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className='mb-6 p-4 bg-[#07091D] rounded-lg'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4'>
            <select
              value={filters.title}
              onChange={(e) =>
                setFilters({ ...filters, title: e.target.value })
              }
              className='bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white'
            >
              <option value=''>All Titles</option>
              {titleData.map((option) => (
                <option key={option.value} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={filters.sport}
              onChange={(e) =>
                setFilters({ ...filters, sport: e.target.value, ageClass: '' })
              }
              className='bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white'
            >
              <option value=''>All Sports</option>
              {sportsData.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={filters.ageClass}
              onChange={(e) =>
                setFilters({ ...filters, ageClass: e.target.value })
              }
              className='bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white'
            >
              <option value=''>All Age Classes</option>
              {getAgeClasses(filters.sport).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={filters.bracketStatus}
              onChange={(e) =>
                setFilters({ ...filters, bracketStatus: e.target.value })
              }
              className='bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white'
            >
              <option value=''>All Status</option>
              {bracketStatusData.map((option) => (
                <option key={option.value} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4'>
            <select
              value={filters.discipline}
              onChange={(e) =>
                setFilters({ ...filters, discipline: e.target.value })
              }
              className='bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white'
            >
              <option value=''>All Disciplines</option>
              {disciplineData.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={filters.ruleStyle}
              onChange={(e) =>
                setFilters({ ...filters, ruleStyle: e.target.value })
              }
              className='bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white'
            >
              <option value=''>All Rule Styles</option>
              {bracketRuleData.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={filters.proClass}
              onChange={(e) =>
                setFilters({ ...filters, proClass: e.target.value })
              }
              className='bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white'
            >
              <option value=''>All Pro Classes</option>
              {proClassData.map((option) => (
                <option key={option.value} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={filters.bracketCriteria}
              onChange={(e) =>
                setFilters({ ...filters, bracketCriteria: e.target.value })
              }
              className='bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white'
            >
              <option value=''>All Criteria</option>
              {bracketCriteriaData.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className='flex items-center gap-4'>
            <div className='flex items-center'>
              <input
                type='checkbox'
                id='showWeightRange'
                checked={filters.showWeightRange}
                onChange={(e) =>
                  setFilters({ ...filters, showWeightRange: e.target.checked })
                }
                className='mr-2'
              />
              <label htmlFor='showWeightRange' className='text-sm'>
                Filter by Weight Range
              </label>
            </div>
          </div>

          {filters.showWeightRange && (
            <div className='flex gap-4 items-center mt-4'>
              <div>
                <label className='block text-sm mb-1'>Min Weight (lbs)</label>
                <input
                  type='number'
                  value={filters.minWeight}
                  onChange={(e) =>
                    setFilters({ ...filters, minWeight: e.target.value })
                  }
                  className='bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white w-32'
                  placeholder='Min'
                />
              </div>
              <div>
                <label className='block text-sm mb-1'>Max Weight (lbs)</label>
                <input
                  type='number'
                  value={filters.maxWeight}
                  onChange={(e) =>
                    setFilters({ ...filters, maxWeight: e.target.value })
                  }
                  className='bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white w-32'
                  placeholder='Max'
                />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className='mb-4 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg'>
            <p className='text-red-400'>Error: {error}</p>
          </div>
        )}

        {/* Brackets List */}
        <BracketList
          brackets={filteredBrackets}
          eventId={eventId}
          mode={mode}
          onRefresh={() => fetchBrackets(eventId)}
          onDelete={handleDeleteBracket}
          onUpdate={() => fetchBrackets(eventId)}
        />

        {brackets.length === 0 && !loading && (
          <div className='text-center py-12'>
            <p className='text-gray-400 mb-4'>
              No brackets created yet for this event.
            </p>
            <button
              onClick={handleNewBracket}
              className='bg-blue-600 px-6 py-3 rounded hover:bg-blue-700'
            >
              Create First Bracket
            </button>
          </div>
        )}

        {/* New Bracket Modal */}
        {showNewBracketModal && (
          <NewBracketModal
            eventId={eventId}
            onClose={() => setShowNewBracketModal(false)}
            onCreate={handleCreateBracket}
          />
        )}

        {/* Move Fighters Modal */}
        {showMoveFightersModal && (
          <MoveFightersModal
            isOpen={showMoveFightersModal}
            onClose={() => setShowMoveFightersModal(false)}
            brackets={brackets}
            eventId={eventId}
            onUpdate={() => fetchBrackets(eventId)}
          />
        )}

        {/* Reseed Brackets Modal */}
        {showReseedBracketsModal && (
          <ReseedBracketsModal
            isOpen={showReseedBracketsModal}
            onClose={() => setShowReseedBracketsModal(false)}
            brackets={brackets}
            eventId={eventId}
            onUpdate={() => fetchBrackets(eventId)}
            filters={filters}
          />
        )}
      </div>
    </div>
  )
}
