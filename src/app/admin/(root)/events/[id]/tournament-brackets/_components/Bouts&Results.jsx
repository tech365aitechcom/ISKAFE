'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash, Play, Clock, User } from 'lucide-react'
import { API_BASE_URL, apiConstants } from '../../../../../../../constants'
import useStore from '../../../../../../../stores/useStore'
import NewBoutModal from './NewBoutModal'
import BoutCard from './BoutCard'
import Loader from '../../../../../../_components/Loader'
import axios from 'axios'
import { enqueueSnackbar } from 'notistack'

export default function BoutsAndResults({ bracket, eventId }) {
  const user = useStore((state) => state.user)
  const [bouts, setBouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showNewBoutModal, setShowNewBoutModal] = useState(false)

  useEffect(() => {
    if (bracket?._id && eventId) {
      fetchBouts()
    }
  }, [bracket?._id, eventId])

  const fetchBouts = async () => {
    try {
      setLoading(true)
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
          const boutsList = data.data || []

          // Fetch fight data for each bout
          const boutsWithFights = await Promise.all(
            boutsList.map(async (bout) => {
              try {
                // Check if bout has fight results
                const fightResponse = await fetch(
                  `${API_BASE_URL}/fights?eventId=${eventId}&bracketId=${bracket._id}&boutId=${bout._id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${user?.token}`,
                    },
                  }
                )

                if (fightResponse.ok) {
                  const fightData = await fightResponse.json()
                  if (fightData.success && fightData.data.items.length > 0) {
                    // Attach fight data to bout
                    return {
                      ...bout,
                      fight: fightData.data.items[0], // Get the first fight result
                    }
                  }
                }
                return bout
              } catch (err) {
                console.error(`Error fetching fight for bout ${bout._id}:`, err)
                return bout
              }
            })
          )

          setBouts(boutsWithFights)
        } else {
          setBouts([])
        }
      } else {
        setBouts([])
      }
    } catch (err) {
      setError(err.message)
      setBouts([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBout = async (boutData) => {
    try {
      const response = await axios.post(
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
      console.log('Bout created:', response.data)
      if (response.status === apiConstants.create) {
        await fetchBouts()
        setShowNewBoutModal(false)
        enqueueSnackbar(response.data.message || 'Bout created successfully!', {
          variant: 'success',
        })
      }
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Error creating bout', {
        variant: 'error',
      })
    }
  }

  const handleDeleteBout = async (boutId) => {
    if (confirm('Are you sure you want to delete this bout?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/bouts/${boutId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        })

        if (response.ok) {
          await fetchBouts()
          alert('Bout deleted successfully!')
        } else {
          alert('Error deleting bout')
        }
      } catch (err) {
        alert('Error deleting bout: ' + err.message)
      }
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

  return (
    <div className='space-y-6'>
      {/* Bouts Grid */}
      {bouts.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-gray-400 mb-4'>
            No bouts created yet for this bracket.
          </p>
          <button
            onClick={() => setShowNewBoutModal(true)}
            className='bg-blue-600 px-6 py-3 rounded hover:bg-blue-700 text-white'
          >
            Create First Bout
          </button>
        </div>
      ) : (
        <div>
          <div className='flex justify-end w-full items-center mb-4'>
            <button
              onClick={() => setShowNewBoutModal(true)}
              className='bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 text-white text-sm mb-2'
            >
              Add New Bout <Plus className='inline ml-2' size={16} />
            </button>
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
            {bouts.map((bout, index) => {
              const isLastOddItem =
                bouts.length % 2 !== 0 && index === bouts.length - 1

              return (
                <div
                  key={bout._id}
                  className={isLastOddItem ? 'flex gap-4' : ''}
                >
                  <BoutCard
                    bout={bout}
                    onDelete={() => handleDeleteBout(bout._id)}
                    onUpdate={fetchBouts}
                    eventId={eventId}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* New Bout Modal */}
      {showNewBoutModal && (
        <NewBoutModal
          bracket={bracket}
          onClose={() => setShowNewBoutModal(false)}
          onCreate={handleCreateBout}
        />
      )}
    </div>
  )
}
