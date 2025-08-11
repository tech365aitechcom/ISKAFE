'use client'
import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { API_BASE_URL } from '../../../../../../constants'
import Loader from '../../../../../_components/Loader'
import useStore from '../../../../../../stores/useStore'
import PaginationHeader from '../../../../../_components/PaginationHeader'
import Pagination from '../../../../../_components/Pagination'
import CheckinForm from './_components/CheckinForm'
import DetailsButton from './_components/DetailsButton'
import NoShowButton from './_components/NoShowButton'

export default function FighterCheckinPage({ params }) {
  const { id } = use(params)
  const user = useStore((state) => state.user)
  const [fighters, setFighters] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(1)
  const [limit, setLimit] = useState(10)

  const fetchFighters = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${API_BASE_URL}/registrations/event/${id}?registrationType=fighter`
      )

      if (!response.ok) throw new Error('Failed to fetch fighters')
      const data = await response.json()

      if (data.success) {
        setFighters(Array.isArray(data.data.items) ? data.data.items : [])
        setTotalPages(data.data.pagination.totalPages)
        setTotalItems(data.data.pagination.totalItems)
      } else {
        throw new Error(data.message || 'Error fetching fighters')
      }
    } catch (err) {
      setError(err.message)
      setFighters([]) // Ensure fighters is always an array
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFighters()
  }, [id])

  const handleCheckin = async (registrationId, formData) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/registrations/${registrationId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            ...formData,
            checkInStatus: 'Checked In',
            weighInDate:
              formData.weighInDate || new Date().toISOString().split('T')[0],
          }),
        }
      )

      if (!response.ok) throw new Error('Check-in failed')

      const result = await response.json()

      if (result.success || result.data) {
        // Update local state
        setFighters((prev) =>
          prev.map((f) =>
            f._id === registrationId
              ? { ...f, checkInStatus: 'Checked In', ...formData }
              : f
          )
        )
        return { success: true }
      } else {
        throw new Error(result.message || 'Check-in failed')
      }
    } catch (err) {
      console.error('Check-in error:', err)
      return { success: false, error: err.message }
    }
  }

  if (loading)
    return (
      <div className='flex items-center justify-center h-screen w-full bg-[#07091D]'>
        <Loader />
      </div>
    )

  if (error)
    return (
      <div className='text-white p-8'>
        <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg'>
          <p className='text-red-500'>Error: {error}</p>
          <Link href={`/admin/events/view/${id}`}>
            <button className='mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700'>
              Back to Event
            </button>
          </Link>
        </div>
      </div>
    )

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
        <div className='flex justify-between mb-6'>
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
            <h1 className='text-2xl font-bold'>Fighter Check-in</h1>
          </div>
        </div>
        <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
          {/* Pagination Header */}
          <PaginationHeader
            limit={limit}
            setLimit={setLimit}
            currentPage={currentPage}
            totalItems={totalItems}
            label='fighter checkin'
          />

          <div className='overflow-x-auto custom-scrollbar'>
            <table className='min-w-full bg-[#0B1739] rounded-lg'>
              <thead>
                <tr>
                  <th className='px-6 py-3 text-left'>ID</th>
                  <th className='px-6 py-3 text-left'>Name</th>
                  <th className='px-6 py-3 text-left'>Age</th>
                  <th className='px-6 py-3 text-left'>Category</th>
                  <th className='px-6 py-3 text-left'>Weight</th>
                  <th className='px-6 py-3 text-left'>Status</th>
                  <th className='px-6 py-3 text-left'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fighters.length === 0 ? (
                  <tr>
                    <td
                      colSpan='7'
                      className='px-4 py-8 text-center text-gray-400'
                    >
                      No results found
                    </td>
                  </tr>
                ) : (
                  fighters.map((fighter, index) => (
                    <tr
                      key={fighter._id}
                      className={`cursor-pointer ${
                        index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                      }`}
                    >
                      <td className='px-6 py-4'>{index + 1}</td>
                      <td className='px-6 py-4'>
                        {fighter.firstName} {fighter.lastName}
                      </td>
                      <td className='px-6 py-4'>
                        {fighter.dateOfBirth
                          ? new Date().getFullYear() -
                            new Date(fighter.dateOfBirth).getFullYear()
                          : 'N/A'}
                      </td>
                      <td className='px-6 py-4'>
                        {fighter.skillLevel || fighter.category || 'N/A'}
                      </td>
                      <td className='px-6 py-4'>
                        {fighter.walkAroundWeight || fighter.weight || 'N/A'}{' '}
                        {fighter.weightUnit || 'lbs'}
                      </td>
                      <td className='px-6 py-4'>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            fighter.checkInStatus === 'Checked In'
                              ? 'bg-green-500 text-white'
                              : fighter.checkInStatus === 'No Show'
                              ? 'bg-red-500 text-white'
                              : 'bg-yellow-500 text-black'
                          }`}
                        >
                          {fighter.checkInStatus || 'Not Checked'}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex space-x-2'>
                          <CheckinForm
                            fighter={fighter}
                            onCheckin={(data) =>
                              handleCheckin(fighter._id, data)
                            }
                            onSuccess={fetchFighters}
                          />
                          <DetailsButton fighter={fighter} />
                          <NoShowButton
                            fighter={fighter}
                            onNoShow={(data) =>
                              handleCheckin(fighter._id, data)
                            }
                          />
                        </div>
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
      </div>
    </div>
  )
}
