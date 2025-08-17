'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash, Play, Clock, User } from 'lucide-react'
import { API_BASE_URL, apiConstants } from '../../../../../../../constants'
import useStore from '../../../../../../../stores/useStore'
import BoutModal from './BoutModal'
import BoutCard from './BoutCard'
import Loader from '../../../../../../_components/Loader'
import axios from 'axios'
import { enqueueSnackbar } from 'notistack'
import ConfirmationModal from '../../../../../../_components/ConfirmationModal'

export default function BoutsAndResults({ bracket, eventId }) {
  const user = useStore((state) => state.user)
  const [bouts, setBouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showNewBoutModal, setShowNewBoutModal] = useState(false)
  const [isDelete, setIsDelete] = useState(false)
  const [selectedBout, setSelectedBout] = useState(null)
  const [editBout, setEditBout] = useState(null)

  useEffect(() => {
    if (bracket?._id && eventId) {
      fetchBouts()
    }
  }, [bracket?._id, eventId])

  const fetchBouts = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${API_BASE_URL}/bouts?bracketId=${bracket?._id}`
      )
      setBouts(response.data.data || [])
    } catch (err) {
      setError(err.message)
      setBouts([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBoutClick = () => {
    // Check if there are at least 2 fighters in the bracket
    if (!bracket?.fighters || bracket.fighters.length < 2) {
      enqueueSnackbar(
        `Cannot create bout: Only ${bracket?.fighters?.length || 0} fighter(s) available in this bracket. At least 2 fighters are required to create a bout.`,
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
      if (response.status === apiConstants.create || response.status === apiConstants.success) {
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
        err.response?.data?.message || `Error ${editBout ? 'updating' : 'creating'} bout`, 
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

  return (
    <div className='space-y-6'>
      {/* Bouts Grid */}
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
        <div>
          <div className='flex justify-end w-full items-center mb-4'>
            <button
              onClick={handleCreateBoutClick}
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
                  key={bout?._id}
                  className={isLastOddItem ? 'flex gap-4' : ''}
                >
                  <BoutCard
                    bout={bout}
                    onDelete={() => {
                      setIsDelete(true)
                      setSelectedBout(bout?._id)
                    }}
                    onEdit={handleEditBout}
                    onUpdate={fetchBouts}
                    eventId={eventId}
                  />
                </div>
              )
            })}
          </div>
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
    </div>
  )
}
