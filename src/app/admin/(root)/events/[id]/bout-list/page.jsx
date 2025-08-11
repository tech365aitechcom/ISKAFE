'use client'

import React, { useState, useEffect, use } from 'react'
import { ArrowLeft, Trophy, Search } from 'lucide-react'
import Link from 'next/link'
import { API_BASE_URL } from '../../../../../../constants'
import Loader from '../../../../../_components/Loader'
import BoutResultModal from '../tournament-brackets/_components/BoutResultModal'
import axios from 'axios'
import moment from 'moment'
import PaginationHeader from '../../../../../_components/PaginationHeader'
import Pagination from '../../../../../_components/Pagination'

export default function BoutListPage({ params }) {
  const { id } = use(params)
  const [event, setEvent] = useState(null)
  const [brackets, setBrackets] = useState([])
  const [allBouts, setAllBouts] = useState([])
  const [filteredBouts, setFilteredBouts] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(1)
  const [limit, setLimit] = useState(10)
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
    if (id) {
      fetchAllBouts()
    }
  }, [id])

  useEffect(() => {
    applyFilters()
  }, [allBouts, filters])

  const fetchAllBouts = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/bouts/event/${id}`)

      const bouts = response.data.data.items
      const pagination = response.data.data.pagination

      setAllBouts(bouts)
      setTotalPages(pagination.totalPages)
      setTotalItems(pagination.totalItems)

      const uniqueBrackets = Array.from(
        new Map(bouts.map((bout) => [bout.bracket._id, bout.bracket])).values()
      )
      setBrackets(uniqueBrackets)

      // Optionally store event info from first bout
      if (bouts.length > 0) {
        setEvent(bouts[0].bracket.event)
      }
    } catch (err) {
      console.log('Error fetching bouts:', err)
    } finally {
      setLoading(false)
    }
  }

  console.log('All bouts:', allBouts)

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
          bout.bracket?.name
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
      filtered = filtered.filter((bout) => bout.bracket?.ring === filters.ring)
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

  const getUniqueRings = () => {
    const rings = new Set()
    allBouts.forEach((bout) => {
      if (bout.bracket?.ring) {
        rings.add(bout.bracket.ring)
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
          <Link href={`/admin/events/view/${id}`}>
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
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          <div className='border border-[#343B4F] rounded-lg p-4 relative'>
            <span className='text-sm text-[#AEB9E1]'>Total Bouts</span>
            <div className='mt-2'>
              <h2 className='text-2xl font-bold'>{totalItems}</h2>
            </div>
          </div>
          <div className='border border-[#343B4F] rounded-lg p-4 relative'>
            <span className='text-sm text-[#AEB9E1]'>Completed</span>
            <div className='mt-2'>
              <h2 className='text-2xl font-bold'>
                {allBouts.filter((bout) => bout.fight).length}
              </h2>
            </div>
          </div>
          <div className='border border-[#343B4F] rounded-lg p-4 relative'>
            <span className='text-sm text-[#AEB9E1]'>Pending</span>
            <div className='mt-2'>
              <h2 className='text-2xl font-bold'>
                {allBouts.filter((bout) => !bout.fight).length}
              </h2>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className='mb-6 rounded-lg'>
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
                className='w-full pl-10 bg-[#0B1739] border border-gray-600 rounded-md px-3 py-2 text-white'
              />
            </div>

            <select
              value={filters.bracket}
              onChange={(e) =>
                setFilters({ ...filters, bracket: e.target.value })
              }
              className='bg-[#0B1739] border border-gray-600 rounded-md px-3 py-2 text-white'
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
              className='bg-[#0B1739] border border-gray-600 rounded-md px-3 py-2 text-white'
            >
              <option value=''>All Status</option>
              <option value='pending'>Pending</option>
              <option value='started'>Started</option>
              <option value='completed'>Completed</option>
            </select>

            <select
              value={filters.ring}
              onChange={(e) => setFilters({ ...filters, ring: e.target.value })}
              className='bg-[#0B1739] border border-gray-600 rounded-md px-3 py-2 text-white'
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
        <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
          <PaginationHeader
            limit={limit}
            setLimit={setLimit}
            currentPage={currentPage}
            totalItems={totalItems}
            label='bouts'
          />
          <div className='overflow-x-auto custom-scrollbar'>
            <table className='w-full text-sm text-left'>
              <thead>
                <tr className='border-b border-gray-600'>
                  <th className='px-4 py-3 text-left'>Bout</th>
                  <th className='px-4 py-3 text-left'>Bracket Name</th>
                  <th className='px-4 py-3 text-left whitespace-nowrap'>
                    Weight Class
                  </th>
                  <th className='px-4 py-3 text-left whitespace-nowrap'>
                    Age Group
                  </th>
                  <th className='px-4 py-3 text-left'>Red Fighter</th>
                  <th className='px-4 py-3 text-left'>Blue Fighter</th>
                  <th className='px-4 py-3 text-left'>Ring</th>
                  <th className='px-4 py-3 text-left'>Group</th>
                  <th className='px-4 py-3 text-left'>Start Time</th>
                  <th className='px-4 py-3 text-left'>Result</th>
                  <th className='px-4 py-3 text-left'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBouts.length === 0 ? (
                  <tr>
                    <td
                      colSpan='13'
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
                      {/* Bout Number */}
                      <td className='px-4 py-3 font-medium'>
                        #{bout.boutNumber || 'TBD'}
                      </td>

                      {/* Bracket Name */}
                      <td className='px-4 py-3'>
                        {bout.bracket?.divisionTitle || '-'}
                      </td>

                      {/* Weight Class */}
                      <td className='px-4 py-3'>
                        {bout.bracket?.weightClass
                          ? `${bout.bracket.weightClass.min} - ${bout.bracket.weightClass.max} lbs`
                          : '-'}
                      </td>

                      {/* Age Group */}
                      <td className='px-4 py-3'>
                        {bout.bracket?.ageClass || '-'}
                      </td>

                      {/* Red Fighter */}
                      <td className='px-4 py-3 text-red-400'>
                        {bout.redCorner ? (
                          <>
                            <div>{`${bout.redCorner.firstName} ${bout.redCorner.lastName}`}</div>
                            <div className='text-xs text-gray-400'>
                              Age:{' '}
                              {bout.redCorner.dateOfBirth
                                ? new Date().getFullYear() -
                                  new Date(
                                    bout.redCorner.dateOfBirth
                                  ).getFullYear()
                                : 'N/A'}{' '}
                              • {bout.redCorner.walkAroundWeight || 'N/A'}{' '}
                              {bout.redCorner.weightUnit || 'lbs'}
                            </div>
                          </>
                        ) : (
                          'TBD'
                        )}
                      </td>

                      {/* Blue Fighter */}
                      <td className='px-4 py-3 text-blue-400'>
                        {bout.blueCorner ? (
                          <>
                            <div>{`${bout.blueCorner.firstName} ${bout.blueCorner.lastName}`}</div>
                            <div className='text-xs text-gray-400'>
                              Age:{' '}
                              {bout.blueCorner.dateOfBirth
                                ? new Date().getFullYear() -
                                  new Date(
                                    bout.blueCorner.dateOfBirth
                                  ).getFullYear()
                                : 'N/A'}{' '}
                              • {bout.blueCorner.walkAroundWeight || 'N/A'}{' '}
                              {bout.blueCorner.weightUnit || 'lbs'}
                            </div>
                          </>
                        ) : (
                          'TBD'
                        )}
                      </td>

                      {/* Ring */}
                      <td className='px-4 py-3'>{bout.bracket.ring || '-'}</td>

                      {/* Group / Seq */}
                      <td className='px-4 py-3'>{bout.bracket.group || '-'}</td>

                      {/* Start Time */}
                      <td className='px-4 py-3'>
                        {bout.startDate
                          ? moment(bout.startDate).format('YYYY-MM-DD hh:mm A')
                          : '-'}
                      </td>

                      {/* Result */}
                      <td className='px-4 py-3'>{getResultText(bout)}</td>

                      {/* Actions */}
                      <td className='px-4 py-3 whitespace-nowrap'>
                        <button
                          onClick={() => handleResultEdit(bout)}
                          className='flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm '
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

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
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
              fetchAllBouts()
              setShowResultModal(false)
              setSelectedBout(null)
            }}
            eventId={id}
          />
        )}
      </div>
    </div>
  )
}
