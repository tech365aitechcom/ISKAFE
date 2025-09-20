'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash, Trophy } from 'lucide-react'
import { API_BASE_URL, apiConstants } from '../../../../../../../constants'
import useStore from '../../../../../../../stores/useStore'
import BoutModal from './BoutModal'
import BoutResultModal from './BoutResultModal'
import Loader from '../../../../../../_components/Loader'
import PaginationHeader from '../../../../../../_components/PaginationHeader'
import Pagination from '../../../../../../_components/Pagination'
import axios from 'axios'
import { enqueueSnackbar } from 'notistack'
import ConfirmationModal from '../../../../../../_components/ConfirmationModal'
import { sportsData } from './bracketUtils'

export default function BoutsAndResults({ bracket, eventId }) {
  const user = useStore((state) => state.user)
  const [bouts, setBouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showNewBoutModal, setShowNewBoutModal] = useState(false)
  const [isDelete, setIsDelete] = useState(false)
  const [selectedBout, setSelectedBout] = useState(null)
  const [editBout, setEditBout] = useState(null)
  const [showResultModal, setShowResultModal] = useState(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    if (bracket?._id && eventId) {
      fetchBouts()
    }
  }, [bracket?._id, eventId])

  // Reset to page 1 when limit changes
  useEffect(() => {
    setCurrentPage(1)
  }, [limit])

  const fetchBouts = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${API_BASE_URL}/bouts?bracketId=${bracket?._id}`
      )
      const allBouts = response.data.data || []
      setBouts(allBouts)
      setTotalItems(allBouts.length)
    } catch (err) {
      setError(err.message)
      setBouts([])
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBoutClick = () => {
    // Check if there are at least 2 fighters in the bracket
    if (!bracket?.fighters || bracket.fighters.length < 2) {
      enqueueSnackbar(
        `Cannot create bout: Only ${
          bracket?.fighters?.length || 0
        } fighter(s) available in this bracket. At least 2 fighters are required to create a bout.`,
        {
          variant: 'warning',
        }
      )
      return
    }
    setShowNewBoutModal(true)
  }

  const handleCreateBout = async (boutData) => {
    try {
      let response
      if (editBout) {
        // Update existing bout - this is handled in NewBoutModal
        response = { status: apiConstants.success }
      } else {
        // Create new bout
        response = await axios.post(
          `${API_BASE_URL}/bouts`,
          {
            ...boutData,
            bracket: bracket._id,
          },
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        )
      }

      console.log('Bout operation completed:', response.data)
      if (
        response.status === apiConstants.create ||
        response.status === apiConstants.success
      ) {
        await fetchBouts()
        setShowNewBoutModal(false)
        setEditBout(null)
        enqueueSnackbar(
          editBout
            ? 'Bout updated successfully!'
            : response.data?.message || 'Bout created successfully!',
          {
            variant: 'success',
          }
        )
      }
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.message ||
          `Error ${editBout ? 'updating' : 'creating'} bout`,
        {
          variant: 'error',
        }
      )
    }
  }

  const handleEditBout = (bout) => {
    setEditBout(bout)
    setShowNewBoutModal(true)
  }

  const handleDeleteBout = async (boutId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/bouts/${boutId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      if (response.status === apiConstants.success) {
        await fetchBouts()
        setIsDelete(false)
        setSelectedBout(null)
        enqueueSnackbar(response.data.message || 'Bout deleted successfully!', {
          variant: 'success',
        })
      }
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Error deleting bout', {
        variant: 'error',
      })
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <p className='text-red-400'>Error: {error}</p>
      </div>
    )
  }

  const handleBoutStart = async (bout) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/bouts/${bout._id}`,
        {
          ...bout,
          startDate: new Date().toISOString(),
          isStarted: !bout.isStarted,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      )
      if (response.status === apiConstants.success) {
        await fetchBouts()
        enqueueSnackbar(
          `Bout ${bout.isStarted ? 'stopped' : 'started'} successfully!`,
          { variant: 'success' }
        )
      }
    } catch (err) {
      enqueueSnackbar('Error updating bout status', { variant: 'error' })
    }
  }

  const getSportLabel = (sportValue) => {
    const sport = sportsData.find((s) => s.label === sportValue)
    return sport ? sport.label : sportValue
  }

  const getResultText = (bout) => {
    if (bout.fight) {
      const result = bout.fight
      const winner =
        result.winner === bout.redCorner?._id ? bout.redCorner : bout.blueCorner
      return `${winner?.firstName} ${winner?.lastName} by ${result?.resultMethod}`
    }
    return 'Pending'
  }

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / limit)
  const startIndex = (currentPage - 1) * limit
  const endIndex = startIndex + limit
  const paginatedBouts = bouts.slice(startIndex, endIndex)

  return (
    <div className='space-y-6'>
      {/* Add Bout Button */}
      <div className='flex justify-end w-full items-center mb-4'>
        <button
          onClick={handleCreateBoutClick}
          className='bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 text-white text-sm'
        >
          Add Bout <Plus className='inline ml-2' size={16} />
        </button>
      </div>

      {/* Bouts Table */}
      {bouts.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-gray-400 mb-4'>
            No bouts created yet for this bracket.
          </p>
          <button
            onClick={handleCreateBoutClick}
            className='bg-blue-600 px-6 py-3 rounded hover:bg-blue-700 text-white'
          >
            Create First Bout
          </button>
        </div>
      ) : (
        <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
          <PaginationHeader
            limit={limit}
            setLimit={setLimit}
            currentPage={currentPage}
            totalItems={totalItems}
            label='bouts'
          />
          <div className='overflow-x-auto custom-scrollbar'>
            <table className='w-full bg-[#0B1739]'>
              <thead>
                <tr className='border-b border-gray-600'>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>
                    Bout Number
                  </th>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>
                    Round
                  </th>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>
                    Competitors <span className='text-red-500'>*</span>
                  </th>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>
                    Sport
                  </th>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>
                    Discipline
                  </th>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>
                    Weight
                  </th>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>
                    Result Method
                  </th>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>
                    Judge Scores <span className='text-red-500'>*</span>
                  </th>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>
                    Outcome
                  </th>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>
                    Bout Has Started <span className='text-red-500'>*</span>
                  </th>
                  <th className='px-4 py-3 text-left text-white font-medium whitespace-nowrap'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedBouts.length > 0 ? (
                  paginatedBouts.map((bout, index) => (
                    <tr
                      key={bout?._id}
                      className='border-b border-gray-700 hover:bg-gray-800/50'
                    >
                      {/* Bout Number */}
                      <td className='px-4 py-3 text-white whitespace-nowrap'>
                        #{bout.boutNumber || startIndex + index + 1}
                      </td>

                      {/* Round */}
                      <td className='px-4 py-3 text-white whitespace-nowrap'>
                        {bout.numberOfRounds || 'TBD'}
                      </td>

                      {/* Competitors */}
                      <td className='px-4 py-3 text-white whitespace-nowrap'>
                        <div className='flex items-center gap-1'>
                          <div className='w-3 h-3 bg-red-500 rounded-full'></div>
                          <span>
                            {bout.redCorner
                              ? `${bout.redCorner.firstName} ${bout.redCorner.lastName}`
                              : 'TBD'}
                          </span>
                          <span className='text-gray-400 mx-1'>vs</span>
                          <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
                          <span>
                            {bout.blueCorner
                              ? `${bout.blueCorner.firstName} ${bout.blueCorner.lastName}`
                              : 'TBD'}
                          </span>
                        </div>
                      </td>

                      {/* Sport */}
                      <td className='px-4 py-3 text-white whitespace-nowrap'>
                        {getSportLabel(bout.sport)}
                      </td>

                      {/* Discipline */}
                      <td className='px-4 py-3 text-white whitespace-nowrap'>
                        {bout.discipline || 'N/A'}
                      </td>

                      {/* Weight */}
                      <td className='px-4 py-3 text-white whitespace-nowrap'>
                        {bout.weightClass
                          ? `${bout.weightClass.min}-${bout.weightClass.max} ${
                              bout.weightClass.unit || 'lbs'
                            }`
                          : 'N/A'}
                      </td>

                      {/* Result Method */}
                      <td className='px-4 py-3 text-white whitespace-nowrap'>
                        {bout.fight?.resultMethod || 'Pending'}
                      </td>

                      {/* Judge Scores */}
                      <td className='px-4 py-3 text-white whitespace-nowrap'>
                        {bout.fight?.judgeScores ? (
                          <div className=''>
                            J1: {bout.fight.judgeScores.red[0] || 0}-
                            {bout.fight.judgeScores.blue[0] || 0} | J2:{' '}
                            {bout.fight.judgeScores.red[1] || 0}-
                            {bout.fight.judgeScores.blue[1] || 0} | J3:{' '}
                            {bout.fight.judgeScores.red[2] || 0}-
                            {bout.fight.judgeScores.blue[2] || 0}
                          </div>
                        ) : (
                          <span className='text-gray-400'>Pending</span>
                        )}
                      </td>

                      {/* Outcome */}
                      <td className='px-4 py-3 text-white whitespace-nowrap'>
                        <span
                          className={`px-2 py-1 rounded ${
                            bout.fight
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {getResultText(bout)}
                        </span>
                      </td>

                      {/* Bout Has Started Toggle */}
                      <td className='px-4 py-3 whitespace-nowrap'>
                        <label className='flex items-center cursor-pointer'>
                          <div className='relative'>
                            <input
                              type='checkbox'
                              checked={bout.isStarted || false}
                              onChange={() => handleBoutStart(bout)}
                              className='sr-only'
                            />
                            <div
                              className={`block w-10 h-6 rounded-full transition-colors duration-200 ${
                                bout.isStarted ? 'bg-green-600' : 'bg-gray-600'
                              }`}
                            >
                              <div
                                className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                                  bout.isStarted
                                    ? 'transform translate-x-4'
                                    : ''
                                }`}
                              ></div>
                            </div>
                          </div>
                        </label>
                      </td>

                      {/* Actions */}
                      <td className='px-4 py-3 whitespace-nowrap'>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleEditBout(bout)}
                            className='p-1 text-blue-400 hover:text-blue-300'
                            title='Edit Bout'
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setIsDelete(true)
                              setSelectedBout(bout?._id)
                            }}
                            className='p-1 text-red-400 hover:text-red-300'
                            title='Delete Bout'
                          >
                            <Trash size={16} />
                          </button>
                          <button
                            onClick={() => setShowResultModal(bout)}
                            className='p-1 text-green-400 hover:text-green-300'
                            title='Enter Result'
                          >
                            <Trophy size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className='text-center bg-[#0A1330]'>
                    <td colSpan='11' className='p-4 text-gray-400'>
                      No bouts found on this page.
                    </td>
                  </tr>
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
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDelete}
        onClose={() => setIsDelete(false)}
        onConfirm={() => handleDeleteBout(selectedBout)}
        title='Delete Bout'
        message='Are you sure you want to delete this bout?'
      />

      {/* New Bout Modal */}
      {showNewBoutModal && (
        <BoutModal
          bracket={bracket}
          onClose={() => {
            setShowNewBoutModal(false)
            setEditBout(null)
          }}
          onCreate={handleCreateBout}
          editBout={editBout}
        />
      )}

      {/* Bout Result Modal */}
      {showResultModal && (
        <BoutResultModal
          bout={showResultModal}
          onClose={() => setShowResultModal(null)}
          onUpdate={fetchBouts}
          eventId={eventId}
        />
      )}
    </div>
  )
}
