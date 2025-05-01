'use client'

import axios from 'axios'
import { ChevronDown, ChevronsUpDown, Search, Trash } from 'lucide-react'
import moment from 'moment'
import Link from 'next/link'
import { enqueueSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { API_BASE_URL, apiConstants } from '../../../../../constants'

export function EventTable({ events, onSuccess }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [publicStatus, setPublicStatus] = useState({})
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  })
  const [isDelete, setIsDelete] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  const filteredEvents = events?.filter((event) => {
    const matchesSearch = event?.title
      ?.toLowerCase()
      .includes(searchQuery?.toLowerCase())
    const matchesType = selectedType ? event.city === selectedType : true
    const matchesStatus = selectedStatus
      ? event.status === selectedStatus
      : true
    return matchesSearch && matchesType && matchesStatus
  })

  const sortedEvents = [...(filteredEvents || [])].sort((a, b) => {
    if (!sortConfig.key) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    } else {
      return sortConfig.direction === 'asc'
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1
    }
  })

  useEffect(() => {
    const initialStatus = {}
    sortedEvents.forEach((event) => {
      initialStatus[event._id] = event.isPublished
    })
    setPublicStatus(initialStatus)
  }, [events])

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      } else {
        return { key, direction: 'asc' }
      }
    })
  }

  const handleToggleStatus = (event) => {
    // Toggle between 'Live' and 'Draft' (or any other logic you need)
    const newStatus = event.status === 'Live' ? 'Draft' : 'Live'
    console.log(`Toggled event ${event.name} to status:`, newStatus)
    // Update the event status in your backend/state here
  }

  const handleViewEdit = (event) => {
    // Navigate or open modal
    console.log('Viewing/Editing event:', event)
  }

  const handleManageRegistrations = (event) => {
    console.log('Managing participants for:', event)
  }

  const handleDeleteEvent = async (id) => {
    console.log('Deleting event with ID:', id)
    try {
      const res = await axios.delete(`${API_BASE_URL}/events/delete/${id}`)
      console.log(res, 'Response from delete event')

      if (res.status == apiConstants.success) {
        enqueueSnackbar('Event deleted successfully', {
          variant: 'success',
        })
        setIsDelete(false)
        onSuccess()
      }
    } catch (error) {
      enqueueSnackbar('Failed to delete event,try again', {
        variant: 'error',
      })
    }
  }

  const handleResetFilter = () => {
    setSelectedStatus('')
    setSelectedType('')
    setSearchQuery('')
  }

  const togglePublicStatus = async (eventId) => {
    const newStatus = !publicStatus[eventId]

    setPublicStatus((prev) => ({
      ...prev,
      [eventId]: newStatus,
    }))

    try {
      const res = await axios.put(`${API_BASE_URL}/events/update/${eventId}`, {
        isPublished: newStatus,
      })
      if (res.status == apiConstants.success) {
        enqueueSnackbar(
          `Event ${newStatus ? 'published' : 'unpublished'} successfully`,
          {
            variant: 'success',
          }
        )
      }
    } catch (error) {
      console.error('Failed to update publish status:', error)

      setPublicStatus((prev) => ({
        ...prev,
        [eventId]: !newStatus,
      }))
    }
  }

  function getEventStatus(start, end) {
    const now = new Date()
    const startDate = new Date(start)
    const endDate = new Date(end)

    if (now < startDate) {
      return 'Upcoming'
    } else if (now >= startDate && now <= endDate) {
      return 'Live'
    } else {
      return 'Closed'
    }
  }

  const renderHeader = (label, key) => (
    <th
      className='px-4 pb-3 whitespace-nowrap cursor-pointer'
      onClick={() => handleSort(key)}
    >
      <div className='flex items-center gap-1'>
        {label}
        <ChevronsUpDown className='w-4 h-4 text-gray-400' />
      </div>
    </th>
  )

  return (
    <>
      <div className='relative mb-6'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
          <Search size={18} className='text-gray-400' />
        </div>
        <input
          type='text'
          className='bg-transparent border border-gray-700 text-white rounded-md pl-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600'
          placeholder='Search by Name...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className='flex space-x-4'>
        <div className='relative w-64 mb-4'>
          <div className='w-64 mb-4'>
            <label
              htmlFor='pro-classification'
              className='block mb-2 text-sm font-medium text-white'
            >
              Select Status
            </label>
            <div className='relative flex items-center justify-between w-full px-4 py-2 border border-gray-700 rounded-lg'>
              <select
                id='pro-classification'
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className='w-full bg-transparent text-white appearance-none outline-none cursor-pointer'
              >
                <option value='All' className='text-black'>
                  All
                </option>
                <option value='Upcoming' className='text-black'>
                  Upcoming
                </option>
                <option value='Closed' className='text-black'>
                  Closed
                </option>
              </select>
              <ChevronDown
                size={16}
                className='absolute right-4 pointer-events-none'
              />
            </div>
          </div>
        </div>
        <div className='relative w-64 mb-4'>
          <div className='w-64 mb-4'>
            <label
              htmlFor='pro-classification'
              className='block mb-2 text-sm font-medium text-white'
            >
              Select <span>Type</span>
            </label>
            <div className='relative flex items-center justify-between w-full px-4 py-2 border border-gray-700 rounded-lg'>
              <select
                id='pro-classification'
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className='w-full bg-transparent text-white appearance-none outline-none cursor-pointer'
              >
                <option value='All' className='text-black'>
                  All
                </option>
                <option value='Kickboxing' className='text-black'>
                  Kickboxing
                </option>
                <option value='MMA' className='text-black'>
                  MMA
                </option>
                <option value='Grappling' className='text-black'>
                  Grappling
                </option>
              </select>
              <ChevronDown
                size={16}
                className='absolute right-4 pointer-events-none'
              />
            </div>
          </div>
        </div>

        {(selectedType || selectedStatus) && (
          <button
            className='border border-gray-700 rounded-lg px-4 py-2 mb-4'
            onClick={handleResetFilter}
          >
            Reset Filter
          </button>
        )}
      </div>
      <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
        <div className='mb-4 pb-4 p-4 flex justify-between items-center border-b border-[#343B4F]'>
          <p className='text-sm'>Next 10 Events</p>
          <p className='text-sm'>1 - 10 of {events?.length}</p>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left'>
            <thead>
              <tr className='text-gray-400 text-sm'>
                {renderHeader('Event Name', 'name')}
                {renderHeader('Event Date', 'date')}
                {renderHeader('Location', 'address')}
                {renderHeader('Registered Participants', 'participants')}
                {renderHeader('Status', 'status')}
                {renderHeader('Actions', 'actions')}
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map((event, index) => {
                const isPublic = publicStatus[event._id] || false

                return (
                  <tr
                    key={index}
                    className={`cursor-pointer ${
                      index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                    }`}
                  >
                    <td className='p-4'>
                      <Link href={`/events/${event._id}`}>{event.title}</Link>
                    </td>
                    <td className='p-4'>
                      {moment(event.startDate).format('YYYY/MM/DD')}
                    </td>
                    <td className='p-4'>
                      {event.venueName},{event.location}
                    </td>
                    <td className='p-4'>{event.registeredParticipants}</td>
                    <td className='p-4'>
                      {getEventStatus(event.startDate, event.endDate)}
                    </td>
                    <td className='p-4 flex space-x-4 items-center'>
                      {/* View/Edit */}
                      <button
                        className='text-blue-500 hover:underline block cursor-pointer'
                        onClick={() => handleViewEdit(event)}
                      >
                        View/Edit
                      </button>

                      {/* Manage Registrations */}
                      <button
                        className='text-green-500 hover:underline block cursor-pointer'
                        onClick={() => handleManageRegistrations(event)}
                      >
                        Manage
                      </button>

                      {/* Publish Toggle */}
                      <div className='flex items-center gap-2'>
                        <span>Public</span>
                        <button
                          onClick={() => togglePublicStatus(event._id)}
                          className={`w-10 h-5 flex items-center rounded-full p-1 duration-300 ease-in-out cursor-pointer ${
                            isPublic ? 'bg-violet-500' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                              isPublic ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          setIsDelete(true)
                          setSelectedEvent(event._id)
                        }}
                        className='text-red-600 cursor-pointer'
                      >
                        <Trash size={20} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {isDelete && (
          <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-800/30'>
            <div className='bg-[#0B1739] bg-opacity-80 p-8 rounded-lg text-white w-full max-w-md'>
              <h2 className='text-lg font-semibold mb-4'>Delete Event</h2>
              <p>Are you sure you want to delete this event?</p>
              <div className='flex justify-end mt-6 space-x-4'>
                <button
                  onClick={() => setIsDelete(false)}
                  className='px-5 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 font-medium transition cursor-pointer'
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteEvent(selectedEvent)}
                  className='px-5 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 font-medium transition cursor-pointer'
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
