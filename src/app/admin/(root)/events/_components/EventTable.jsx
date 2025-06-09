'use client'

import axios from 'axios'
import { ChevronDown, Eye, Search, SquarePen, Trash } from 'lucide-react'
import moment from 'moment'
import Link from 'next/link'
import { enqueueSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { API_BASE_URL, apiConstants } from '../../../../../constants'
import { getEventStatus } from '../../../../../utils/eventUtils'
import useStore from '../../../../../stores/useStore'
import PaginationHeader from '../../../../_components/PaginationHeader'
import ConfirmationModal from '../../../../_components/ConfirmationModal'
import Pagination from '../../../../_components/Pagination'

export function EventTable({
  events,
  onSuccess,
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  limit,
  setLimit,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
}) {
  const user = useStore((state) => state.user)
  const [publishStatus, setPublishStatus] = useState({})
  const [isDelete, setIsDelete] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => {
    if (events && events.length > 0) {
      const statusMap = {}
      events.forEach((event) => {
        statusMap[event._id] = event.isDraft
      })
      setPublishStatus(statusMap)
    }
  }, [events])

  const handleResetFilter = () => {
    setSelectedStatus('')
    setSelectedType('')
    setSearchQuery('')
  }

  const togglePublishStatus = async (eventId) => {
    const newStatus = !publishStatus[eventId]

    setPublishStatus((prev) => ({
      ...prev,
      [eventId]: newStatus,
    }))

    try {
      const res = await axios.patch(
        `${API_BASE_URL}/events/${eventId}/toggle-status`,
        {
          isDraft: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      )

      if (res.status === apiConstants.success) {
        enqueueSnackbar(
          `Event ${newStatus ? 'published' : 'unpublished'} successfully`,
          {
            variant: 'success',
          }
        )
      }
    } catch (error) {
      console.error('Failed to update publish status:', error)

      setPublishStatus((prev) => ({
        ...prev,
        [eventId]: !newStatus,
      }))

      enqueueSnackbar('Failed to update publish status', { variant: 'error' })
    } finally {
      onSuccess()
    }
  }

  const handleDeleteEvent = async (id) => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/events/${id}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })

      if (res.status === apiConstants.success) {
        enqueueSnackbar('Event deleted successfully', {
          variant: 'success',
        })
        setIsDelete(false)
        onSuccess()
      }
    } catch (error) {
      enqueueSnackbar('Failed to delete event, try again', {
        variant: 'error',
      })
    }
  }

  const filteredEvents = events?.filter((event) => {
    if (!selectedStatus || selectedStatus === 'All') return true

    const now = moment()
    const start = moment(event.startDate)
    const end = moment(event.endDate)

    if (selectedStatus === 'Upcoming') return now.isBefore(start)
    if (selectedStatus === 'Closed') return now.isAfter(end)

    return true
  })

  const renderHeader = (label, key) => (
    <th className='px-4 pb-3 whitespace-nowrap cursor-pointer'>
      <div className='flex items-center gap-1'>{label}</div>
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

      {/* Filters */}
      <div className='flex space-x-4'>
        {/* Status Filter */}
        <div className='relative w-64 mb-4'>
          <label className='block mb-2 text-sm font-medium text-white'>
            Select Status
          </label>
          <div className='relative flex items-center justify-between w-full px-4 py-2 border border-gray-700 rounded-lg'>
            <select
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

        {/* Type Filter */}
        <div className='relative w-64 mb-4'>
          <label className='block mb-2 text-sm font-medium text-white'>
            Select Type
          </label>
          <div className='relative flex items-center justify-between w-full px-4 py-2 border border-gray-700 rounded-lg'>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className='w-full bg-transparent text-white appearance-none outline-none cursor-pointer'
            >
              <option value='' className='text-black'>
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

        {(selectedType || selectedStatus) && (
          <div className='mt-7'>
            <button
              className='border border-gray-700 text-white rounded-lg px-4 py-2 hover:bg-gray-700 transition'
              onClick={handleResetFilter}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
        <PaginationHeader
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          totalItems={totalItems}
          label='venues'
        />
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left'>
            <thead>
              <tr className='text-gray-400 text-sm'>
                {renderHeader('Event Id')}
                {renderHeader('Event Name')}
                {renderHeader('Event Date')}
                {renderHeader('Location')}
                {renderHeader('Registered Participants')}
                {renderHeader('Status')}
                {renderHeader('Promoter')}
                {renderHeader('Actions')}
              </tr>
            </thead>
            <tbody>
              {filteredEvents && filteredEvents.length > 0 ? (
                filteredEvents.map((event, index) => {
                  const isPublic = publishStatus[event._id] || false

                  return (
                    <tr
                      key={index}
                      className={`cursor-pointer ${
                        index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                      }`}
                    >
                      <td className='p-4 whitespace-nowrap'>
                        <Link href={`/admin/events/${event._id}`}>
                          {event._id}
                        </Link>
                      </td>
                      <td className='p-4 whitespace-nowrap'>
                        <Link href={`/admin/events/${event._id}`}>
                          {event.name}
                        </Link>
                      </td>
                      <td className='p-4 whitespace-nowrap'>
                        {moment(event.startDate).format('YYYY/MM/DD')}
                      </td>
                      <td className='p-4 whitespace-nowrap'>
                        {event.venue?.name},{event.venue?.address?.city}
                      </td>
                      <td className='p-4 whitespace-nowrap'>
                        {event.registeredParticipants}
                      </td>
                      <td className='p-4 whitespace-nowrap'>
                        {getEventStatus(event.startDate, event.endDate)}
                      </td>
                      <td className='p-4 whitespace-nowrap'>
                        {event.promoter?.userId.firstName}{' '}
                        {event.promoter?.userId.lastName}
                      </td>
                      <td className='p-4 flex space-x-4 items-center'>
                        {/* View */}
                        <Link href={`/admin/events/view/${event._id}`}>
                          <button className='text-gray-400 hover:text-gray-200 transition'>
                            <Eye size={20} />
                          </button>
                        </Link>

                        {/* Edit */}
                        <Link href={`/admin/events/edit/${event._id}`}>
                          <button className='text-blue-500 hover:underline'>
                            <SquarePen size={20} />
                          </button>
                        </Link>

                        {/* Publish Toggle */}
                        <div className='flex items-center gap-2 whitespace-nowrap'>
                          <span className='text-white'>UnPublish</span>
                          <button
                            onClick={() => togglePublishStatus(event._id)}
                            className={`w-10 h-5 flex items-center rounded-full p-1 duration-300 ease-in-out ${
                              isPublic ? 'bg-violet-500' : 'bg-gray-300'
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                                isPublic ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className='text-white'>Publish</span>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            setIsDelete(true)
                            setSelectedEvent(event._id)
                          }}
                          className='text-red-600 hover:text-red-400 transition'
                        >
                          <Trash size={20} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr className='text-center bg-[#0A1330]'>
                  <td colSpan='9' className='p-4'>
                    No events found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDelete}
          onClose={() => setIsDelete(false)}
          onConfirm={() => handleDeleteEvent(selectedEvent)}
          title='Delete Event'
          message='Are you sure you want to delete this event?'
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  )
}
