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
import { titleData } from '../tournament-brackets/_components/bracketUtils'

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

  const applyFilters = () => {
    let filtered = [...allBouts]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (bout) => {
          const boutNumber = bout.boutNumber?.toString() || ''
          const redFirstName = bout.redCorner?.firstName || ''
          const redLastName = bout.redCorner?.lastName || ''
          const blueFirstName = bout.blueCorner?.firstName || ''
          const blueLastName = bout.blueCorner?.lastName || ''
          const bracketName = bout.bracket?.name || ''
          const bracketTitle = bout.bracket?.divisionTitle || ''
          const weightClass = bout.bracket?.weightClass ? 
            `${bout.bracket.weightClass.min}-${bout.bracket.weightClass.max}` : ''
          const ageClass = bout.bracket?.ageClass || ''
          const ring = bout.bracket?.ring || ''
          const group = bout.bracket?.group || ''
          
          return (
            boutNumber.toLowerCase().includes(searchLower) ||
            redFirstName.toLowerCase().includes(searchLower) ||
            redLastName.toLowerCase().includes(searchLower) ||
            blueFirstName.toLowerCase().includes(searchLower) ||
            blueLastName.toLowerCase().includes(searchLower) ||
            bracketName.toLowerCase().includes(searchLower) ||
            bracketTitle.toLowerCase().includes(searchLower) ||
            weightClass.toLowerCase().includes(searchLower) ||
            ageClass.toLowerCase().includes(searchLower) ||
            ring.toLowerCase().includes(searchLower) ||
            group.toLowerCase().includes(searchLower)
          )
        }
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
                placeholder='Search fighters, brackets, bout numbers, weight class...'
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
              {titleData.map((title) => (
                <option key={title.value} value={title.value}>
                  {title.label}
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
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>Bout</th>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>Round Number</th>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>Number of Competitors</th>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>Bracket Name</th>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>Weight Class</th>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>Age Group</th>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>Red Fighter</th>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>Blue Fighter</th>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>Ring</th>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>Group</th>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>Start Time</th>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>Result</th>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>Actions</th>
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
                      <td className='px-4 py-3 font-medium whitespace-nowrap'>#{bout.boutNumber || 'TBD'}</td>

                      {/* Round Number */}
                      <td className='px-4 py-3 whitespace-nowrap'>{bout.roundNumber || bout.currentRound || 1}</td>

                      {/* Number of Competitors */}
                      <td className='px-4 py-3 whitespace-nowrap'>{((bout.redCorner ? 1 : 0) + (bout.blueCorner ? 1 : 0)) || 2}</td>

                      {/* Bracket Name */}
                      <td className='px-4 py-3 whitespace-nowrap'>{bout.bracket?.divisionTitle || '-'}</td>

                      {/* Weight Class */}
                      <td className='px-4 py-3 whitespace-nowrap'>
                        {bout.bracket?.weightClass ? `${bout.bracket.weightClass.min}-${bout.bracket.weightClass.max} lbs` : '-'}
                      </td>

                      {/* Age Group */}
                      <td className='px-4 py-3 whitespace-nowrap'>{bout.bracket?.ageClass || '-'}</td>

                      {/* Red Fighter */}
                      <td className='px-4 py-3 text-red-400 whitespace-nowrap'>
                        {bout.redCorner ? (
                          <span>
                            {`${bout.redCorner.firstName} ${bout.redCorner.lastName}`}
                            {bout.redCorner.dateOfBirth || bout.redCorner.walkAroundWeight ? (
                              <span className='text-xs text-gray-400 ml-2'>
                                (Age: {bout.redCorner.dateOfBirth
                                  ? new Date().getFullYear() - new Date(bout.redCorner.dateOfBirth).getFullYear()
                                  : 'N/A'} • {bout.redCorner.walkAroundWeight || 'N/A'} {bout.redCorner.weightUnit || 'lbs'})
                              </span>
                            ) : null}
                          </span>
                        ) : (
                          'TBD'
                        )}
                      </td>

                      {/* Blue Fighter */}
                      <td className='px-4 py-3 text-blue-400 whitespace-nowrap'>
                        {bout.blueCorner ? (
                          <span>
                            {`${bout.blueCorner.firstName} ${bout.blueCorner.lastName}`}
                            {bout.blueCorner.dateOfBirth || bout.blueCorner.walkAroundWeight ? (
                              <span className='text-xs text-gray-400 ml-2'>
                                (Age: {bout.blueCorner.dateOfBirth
                                  ? new Date().getFullYear() - new Date(bout.blueCorner.dateOfBirth).getFullYear()
                                  : 'N/A'} • {bout.blueCorner.walkAroundWeight || 'N/A'} {bout.blueCorner.weightUnit || 'lbs'})
                              </span>
                            ) : null}
                          </span>
                        ) : (
                          'TBD'
                        )}
                      </td>

                      {/* Ring */}
                      <td className='px-4 py-3 whitespace-nowrap'>{bout.bracket.ring || '-'}</td>

                      {/* Group / Seq */}
                      <td className='px-4 py-3 whitespace-nowrap'>{bout.bracket.group || '-'}</td>

                      {/* Start Time */}
                      <td className='px-4 py-3 whitespace-nowrap'>
                        {bout.startDate ? moment(bout.startDate).format('YYYY-MM-DD hh:mm A') : '-'}
                      </td>

                      {/* Result */}
                      <td className='px-4 py-3 whitespace-nowrap'>{getResultText(bout)}</td>

                      {/* Actions */}
                      <td className='px-4 py-3 whitespace-nowrap'>
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
