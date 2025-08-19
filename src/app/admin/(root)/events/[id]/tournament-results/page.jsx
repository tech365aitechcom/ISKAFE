'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { API_BASE_URL } from '../../../../../../constants/index'
import Loader from '../../../../../_components/Loader'
import PaginationHeader from '../../../../../_components/PaginationHeader'
import Pagination from '../../../../../_components/Pagination'
import axios from 'axios'
import useStore from '../../../../../../stores/useStore'

export default function TournamentResultsPage({ params }) {
  const { id } = use(params)
  const user = useStore((state) => state.user)
  const [results, setResults] = useState([])
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(1)
  const [limit, setLimit] = useState(10)

  // Fetch event data
  const fetchEvent = async () => {
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

  const fetchResults = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/fights?eventId=${id}`)

      const items = response.data.data.items
      const pagination = response.data.data.pagination

      setResults(items)
      setTotalPages(pagination.totalPages)
      setTotalItems(pagination.totalItems)
    } catch (err) {
      console.log('Error fetching bouts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchEvent()
      fetchResults()
    }
  }, [id])

  console.log(results)

  if (loading) {
    return (
      <div className='text-white p-8 flex justify-center relative overflow-hidden'>
        <Loader />
      </div>
    )
  }

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
        <div className='flex justify-between items-center mb-6'>
          {/* Header with back button */}
          <div className='flex items-center gap-4 '>
            <Link href={`/admin/events/view/${id}`}>
              <button className='mr-2'>
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
              <h1 className='text-2xl font-bold'>Tournament Results</h1>
              {event && (
                <p className='text-sm text-gray-300 mt-1'>
                  {event.name} -{' '}
                  {event.startDate
                    ? new Date(event.startDate).toLocaleDateString()
                    : 'Date not set'}
                </p>
              )}
            </div>
          </div>
          <div className='flex gap-2'>
            <button
              onClick={fetchResults}
              disabled={loading}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white disabled:opacity-50'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-4 w-4'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                />
              </svg>
              {loading ? 'Getting Results...' : 'Get Results'}
            </button>
          </div>
        </div>
        <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
          {/* Pagination Header */}
          <PaginationHeader
            limit={limit}
            setLimit={setLimit}
            currentPage={currentPage}
            totalItems={totalItems}
            label='results'
          />

          <div className='overflow-x-auto custom-scrollbar'>
            <table className='w-full text-sm text-left'>
              <thead>
                <tr className='border-b border-gray-600'>
                  <th className='px-4 py-3  whitespace-nowrap'>
                    Bracket Title
                  </th>
                  <th className='px-4 py-3 whitespace-nowrap'>Match IDs</th>
                  <th className='px-4 py-3 whitespace-nowrap'>Round Info</th>
                  <th className='px-4 py-3 whitespace-nowrap'>
                    Classification
                  </th>
                  <th className='px-4 py-3 whitespace-nowrap'>
                    Fighter Result
                  </th>
                  <th className='px-4 py-3 whitespace-nowrap'>
                    Gender & Division
                  </th>
                  <th className='px-4 py-3 whitespace-nowrap'>Weight Range</th>
                  <th className='px-4 py-3 whitespace-nowrap'>Rule Style</th>
                  <th className='px-4 py-3 whitespace-nowrap'>Rule Format</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td
                      colSpan='9'
                      className='px-4 py-8 text-center text-gray-400'
                    >
                      No results found
                    </td>
                  </tr>
                ) : (
                  results.map((res) => {
                    const bracketTitle = `${res.bracket?.title || ''} (${
                      res.bracket?.divisionTitle || ''
                    })`
                    const matchIds = `${res.bout?._id || 'N/A'}`
                    const roundInfo = `${res.bracket?.boutRound || '-'}`
                    const classification = res.bracket?.ageClass || 'N/A'
                    const fighterResultLine = res.winner
                      ? `${res.winner.firstName} ${res.winner.lastName} (${
                          res.winner._id === res.bout?.blueCorner?._id
                            ? 'Blue'
                            : 'Red'
                        }) defeated ${
                          res.winner._id === res.bout?.blueCorner?._id
                            ? `${res.bout?.redCorner?.firstName || ''} ${
                                res.bout?.redCorner?.lastName || ''
                              }`.trim() || 'Opponent'
                            : `${res.bout?.blueCorner?.firstName || ''} ${
                                res.bout?.blueCorner?.lastName || ''
                              }`.trim() || 'Opponent'
                        }`
                      : '-'

                    const genderDivision = `${res.winner?.gender || '-'} ${
                      res.winner?.weightClass || '-'
                    }`
                    const weightRange = res.bracket?.weightClass
                      ? `${res.bracket.weightClass.min} – ${res.bracket.weightClass.max} LBS`
                      : '-'
                    const ruleStyle = res.bracket?.ruleStyle || '-'
                    const ruleFormat = res.event?.format || '-'

                    return (
                      <tr
                        key={res._id}
                        className='border-b border-gray-700 hover:bg-gray-800/30'
                      >
                        <td className='px-4 py-3 whitespace-nowrap'>
                          {bracketTitle}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap'>
                          {matchIds}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap'>
                          {roundInfo}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap'>
                          {classification}
                        </td>
                        <td className='px-4 py-3 text-green-400 whitespace-nowrap'>
                          {fighterResultLine}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap'>
                          {genderDivision}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap'>
                          {weightRange}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap'>
                          {ruleStyle}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap'>
                          {ruleFormat}
                        </td>
                      </tr>
                    )
                  })
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
      </div>
    </div>
  )
}
