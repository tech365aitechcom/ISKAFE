'use client'

import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Edit,
  Trophy,
  Clock,
  User,
  Filter,
  Search,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { API_BASE_URL } from '../../../../../../constants'
import useStore from '../../../../../../stores/useStore'
import Loader from '../../../../../_components/Loader'
import BoutResultModal from '../tournament-brackets/_components/BoutResultModal'

export default function BoutListPage() {
  const params = useParams()
  const user = useStore((state) => state.user)
  const [eventId, setEventId] = useState(null)
  const [event, setEvent] = useState(null)
  const [brackets, setBrackets] = useState([])
  const [allBouts, setAllBouts] = useState([])
  const [filteredBouts, setFilteredBouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBout, setSelectedBout] = useState(null)
  const [showResultModal, setShowResultModal] = useState(false)

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    bracket: '',
    status: '',
    ring: '',
  })

  useEffect(() => {
    if (params?.id) {
      setEventId(params.id)
      fetchEventData(params.id)
    }
  }, [params])

  useEffect(() => {
    if (eventId) {
      fetchBrackets()
    }
  }, [eventId])

  useEffect(() => {
    applyFilters()
  }, [allBouts, filters])

  const fetchEventData = async (id) => {
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

  const fetchBrackets = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${API_BASE_URL}/brackets?eventId=${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setBrackets(data.data || [])
          // Fetch bouts for each bracket
          await fetchAllBouts(data.data || [])
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

  const fetchAllBouts = async (bracketsData) => {
    try {
      const boutPromises = bracketsData.map(async (bracket) => {
        const response = await fetch(
          `${API_BASE_URL}/bouts?bracketId=${bracket._id}`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            // Fetch fight data for each bout in this bracket
            const boutsWithFights = await Promise.all(
              data.data.map(async (bout) => {
                try {
                  // Get fight result for this bout
                  const fightResponse = await fetch(
                    `${API_BASE_URL}/fights?eventId=${eventId}&bracketId=${bracket._id}&boutId=${bout._id}`,
                    {
                      headers: {
                        Authorization: `Bearer ${user?.token}`,
                      },
                    }
                  )

                  let fightData = null
                  if (fightResponse.ok) {
                    const fightResult = await fightResponse.json()
                    if (
                      fightResult.success &&
                      fightResult.data.items.length > 0
                    ) {
                      fightData = fightResult.data.items[0]
                    }
                  }

                  return {
                    ...bout,
                    fight: fightData,
                    bracketInfo: {
                      name: bracket.title || bracket.divisionTitle,
                      weightClass: bracket.weightClass,
                      ageClass: bracket.ageClass,
                      ring: bracket.ring,
                    },
                  }
                } catch (err) {
                  console.error(
                    `Error fetching fight for bout ${bout._id}:`,
                    err
                  )
                  return {
                    ...bout,
                    fight: null,
                    bracketInfo: {
                      name: bracket.title || bracket.divisionTitle,
                      weightClass: bracket.weightClass,
                      ageClass: bracket.ageClass,
                      ring: bracket.ring,
                    },
                  }
                }
              })
            )

            return boutsWithFights
          }
        }
        return []
      })

      const allBoutsArrays = await Promise.all(boutPromises)
      const flattenedBouts = allBoutsArrays.flat()
      setAllBouts(flattenedBouts)
    } catch (err) {
      console.error('Error fetching bouts:', err)
    }
  }

  const applyFilters = () => {
    let filtered = [...allBouts]

    if (filters.search) {
      filtered = filtered.filter(
        (bout) =>
          bout.redCorner?.firstName
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          bout.redCorner?.lastName
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          bout.blueCorner?.firstName
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          bout.blueCorner?.lastName
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          bout.bracketInfo?.name
            ?.toLowerCase()
            .includes(filters.search.toLowerCase())
      )
    }

    if (filters.bracket) {
      filtered = filtered.filter((bout) => bout.bracket._id === filters.bracket)
    }

    if (filters.status) {
      if (filters.status === 'completed') {
        filtered = filtered.filter((bout) => bout.fight)
      } else if (filters.status === 'pending') {
        filtered = filtered.filter((bout) => !bout.fight)
      } else if (filters.status === 'started') {
        filtered = filtered.filter((bout) => bout.startDate && !bout.fight)
      }
    }

    if (filters.ring) {
      filtered = filtered.filter(
        (bout) => bout.bracketInfo?.ring === filters.ring
      )
    }

    setFilteredBouts(filtered)
  }

  const handleResultEdit = (bout) => {
    setSelectedBout(bout)
    setShowResultModal(true)
  }

  const getStatusBadge = (bout) => {
    if (bout.fight) {
      return (
        <span className='px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs'>
          Completed
        </span>
      )
    } else if (bout.startDate) {
      return (
        <span className='px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs'>
          Started
        </span>
      )
    } else {
      return (
        <span className='px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs'>
          Pending
        </span>
      )
    }
  }

  const getResultText = (bout) => {
    if (bout.fight) {
      const winner =
        bout.fight.winner === bout.redCorner._id
          ? bout.redCorner
          : bout.blueCorner
      return `Winner: ${winner.firstName} ${winner.lastName} by ${bout.fight.resultMethod}`
    }
    return '-'
  }

  const formatTime = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getUniqueRings = () => {
    const rings = new Set()
    allBouts.forEach((bout) => {
      if (bout.bracketInfo?.ring) {
        rings.add(bout.bracketInfo.ring)
      }
    })
    return Array.from(rings)
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen w-full bg-[#07091D]'>
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className='text-white p-8'>
        <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg'>
          <p className='text-red-500'>Error: {error}</p>
          <Link href={`/admin/events/view/${eventId}`}>
            <button className='mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700'>
              Back to Event
            </button>
          </Link>
        </div>
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
              <ArrowLeft size={24} />
            </button>
          </Link>
          <div>
            <h1 className='text-2xl font-bold'>Bout List</h1>
            {event && (
              <p className='text-sm text-gray-300'>
                {event.name} ({new Date(event.startDate).toLocaleDateString()})
              </p>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
          <div className='bg-[#07091D] p-4 rounded-lg'>
            <div className='text-2xl font-bold text-blue-400'>
              {allBouts.length}
            </div>
            <div className='text-sm text-gray-400'>Total Bouts</div>
          </div>
          <div className='bg-[#07091D] p-4 rounded-lg'>
            <div className='text-2xl font-bold text-green-400'>
              {allBouts.filter((bout) => bout.fight).length}
            </div>
            <div className='text-sm text-gray-400'>Completed</div>
          </div>
          <div className='bg-[#07091D] p-4 rounded-lg'>
            <div className='text-2xl font-bold text-yellow-400'>
              {allBouts.filter((bout) => bout.startDate && !bout.fight).length}
            </div>
            <div className='text-sm text-gray-400'>In Progress</div>
          </div>
          <div className='bg-[#07091D] p-4 rounded-lg'>
            <div className='text-2xl font-bold text-gray-400'>
              {allBouts.filter((bout) => !bout.startDate).length}
            </div>
            <div className='text-sm text-gray-400'>Pending</div>
          </div>
        </div>

        {/* Filters */}
        <div className='mb-6 p-4 bg-[#07091D] rounded-lg'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='relative'>
              <Search
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                size={16}
              />
              <input
                type='text'
                placeholder='Search fighters or brackets...'
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className='w-full pl-10 bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white'
              />
            </div>

            <select
              value={filters.bracket}
              onChange={(e) =>
                setFilters({ ...filters, bracket: e.target.value })
              }
              className='bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white'
            >
              <option value=''>All Brackets</option>
              {brackets.map((bracket) => (
                <option key={bracket._id} value={bracket._id}>
                  {bracket.title || bracket.divisionTitle}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className='bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white'
            >
              <option value=''>All Status</option>
              <option value='pending'>Pending</option>
              <option value='started'>Started</option>
              <option value='completed'>Completed</option>
            </select>

            <select
              value={filters.ring}
              onChange={(e) => setFilters({ ...filters, ring: e.target.value })}
              className='bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white'
            >
              <option value=''>All Rings</option>
              {getUniqueRings().map((ring) => (
                <option key={ring} value={ring}>
                  {ring}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bouts Table */}
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-[#07091D] rounded-lg'>
            <thead>
              <tr className='border-b border-gray-600'>
                <th className='px-4 py-3 text-left'>Bout #</th>
                <th className='px-4 py-3 text-left'>Bracket</th>
                <th className='px-4 py-3 text-left'>Red Corner</th>
                <th className='px-4 py-3 text-left'>Blue Corner</th>
                <th className='px-4 py-3 text-left'>Ring</th>
                <th className='px-4 py-3 text-left'>Start Time</th>
                <th className='px-4 py-3 text-left'>Status</th>
                <th className='px-4 py-3 text-left'>Result</th>
                <th className='px-4 py-3 text-left'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBouts.length === 0 ? (
                <tr>
                  <td
                    colSpan='9'
                    className='px-4 py-8 text-center text-gray-400'
                  >
                    No bouts found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredBouts.map((bout) => (
                  <tr
                    key={bout._id}
                    className='border-b border-gray-700 hover:bg-gray-800/30'
                  >
                    <td className='px-4 py-3'>
                      <span className='font-medium'>
                        #{bout.boutNumber || 'TBD'}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <div>
                        <div className='font-medium text-sm'>
                          {bout.bracketInfo?.name}
                        </div>
                        <div className='text-xs text-gray-400'>
                          {bout.bracketInfo?.ageClass} • {bout.sport}
                        </div>
                        <div className='text-xs text-gray-400'>
                          {bout.bracketInfo?.weightClass?.min}-
                          {bout.bracketInfo?.weightClass?.max}{' '}
                          {bout.bracketInfo?.weightClass?.unit}
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 bg-red-500 rounded-full'></div>
                        <div>
                          <div className='font-medium text-sm'>
                            {bout.redCorner
                              ? `${bout.redCorner.firstName} ${bout.redCorner.lastName}`
                              : 'TBD'}
                          </div>
                          {bout.redCorner && (
                            <div className='text-xs text-gray-400'>
                              Age:{' '}
                              {bout.redCorner.dateOfBirth
                                ? new Date().getFullYear() -
                                  new Date(
                                    bout.redCorner.dateOfBirth
                                  ).getFullYear()
                                : 'N/A'}{' '}
                              • {bout.redCorner.weight || 'N/A'} lbs
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
                        <div>
                          <div className='font-medium text-sm'>
                            {bout.blueCorner
                              ? `${bout.blueCorner.firstName} ${bout.blueCorner.lastName}`
                              : 'TBD'}
                          </div>
                          {bout.blueCorner && (
                            <div className='text-xs text-gray-400'>
                              Age:{' '}
                              {bout.blueCorner.dateOfBirth
                                ? new Date().getFullYear() -
                                  new Date(
                                    bout.blueCorner.dateOfBirth
                                  ).getFullYear()
                                : 'N/A'}{' '}
                              • {bout.blueCorner.weight || 'N/A'} lbs
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <span className='text-sm'>
                        {bout.bracketInfo?.ring || '-'}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <span className='text-sm'>
                        {formatTime(bout.startDate)}
                      </span>
                    </td>
                    <td className='px-4 py-3'>{getStatusBadge(bout)}</td>
                    <td className='px-4 py-3'>
                      <div className='text-sm'>{getResultText(bout)}</div>
                      {bout.fight?.resultDetails && (
                        <div className='text-xs text-gray-400'>
                          Round {bout.fight.resultDetails.round} •{' '}
                          {bout.fight.resultDetails.time}
                        </div>
                      )}
                    </td>
                    <td className='px-4 py-3'>
                      <button
                        onClick={() => handleResultEdit(bout)}
                        className='flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm'
                      >
                        <Trophy size={14} />
                        {bout.fight ? 'Edit' : 'Enter'} Result
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Results showing count */}
        <div className='mt-4 text-sm text-gray-400 text-center'>
          Showing {filteredBouts.length} of {allBouts.length} bouts
        </div>

        {/* Result Modal */}
        {showResultModal && selectedBout && (
          <BoutResultModal
            bout={selectedBout}
            onClose={() => {
              setShowResultModal(false)
              setSelectedBout(null)
            }}
            onUpdate={() => {
              fetchBrackets() // Refresh all data
              setShowResultModal(false)
              setSelectedBout(null)
            }}
            eventId={eventId}
          />
        )}
      </div>
    </div>
  )
}
