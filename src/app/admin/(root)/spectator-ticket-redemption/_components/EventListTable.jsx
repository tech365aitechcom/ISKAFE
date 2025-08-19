import React from 'react'
import { RefreshCw, AlertCircle, Calendar } from 'lucide-react'
import PaginationHeader from '../../../../_components/PaginationHeader'
import Pagination from '../../../../_components/Pagination'

export default function EventListTable({
  eventsLoading,
  error,
  fetchEvents,
  paginatedEvents,
  eventsPagination,
  setEventsPagination,
  setSelectedEvent,
  setShowRedemptionPanel,
}) {
  if (eventsLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <RefreshCw size={24} className='animate-spin text-purple-400 mr-2' />
        <span className='text-gray-300'>Loading events...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <AlertCircle size={32} className='text-red-400 mx-auto mb-2' />
        <p className='text-red-400 mb-4'>{error}</p>
        <button
          onClick={fetchEvents}
          className='text-purple-400 hover:text-white transition-colors'
        >
          Try Again
        </button>
      </div>
    )
  }

  if (paginatedEvents.length === 0) {
    return (
      <div className='text-center py-8'>
        <Calendar size={32} className='text-gray-400 mx-auto mb-2' />
        <p className='text-gray-400'>No events found matching your criteria</p>
      </div>
    )
  }

  return (
    <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
      <PaginationHeader
        limit={eventsPagination.pageSize}
        setLimit={(newSize) =>
          setEventsPagination((prev) => ({
            ...prev,
            pageSize: newSize,
            currentPage: 1,
          }))
        }
        currentPage={eventsPagination.currentPage}
        totalItems={eventsPagination.totalItems}
        label='events'
      />
      <div className='overflow-x-auto custom-scrollbar'>
        <table className='w-full text-sm text-left'>
          <thead>
            <tr className='text-gray-400 text-sm'>
              <th className='px-4 pb-3 whitespace-nowrap'>Event ID</th>
              <th className='px-4 pb-3 whitespace-nowrap'>Event Name</th>
              <th className='px-4 pb-3 whitespace-nowrap'>Event Date</th>
              <th className='px-4 pb-3 whitespace-nowrap'>Event Location</th>
              <th className='px-4 pb-3 whitespace-nowrap'>Event Status</th>
              <th className='px-4 pb-3 whitespace-nowrap'>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEvents.length > 0 ? (
              paginatedEvents.map((event, index) => (
                <tr
                  key={event.id}
                  className={`cursor-pointer ${
                    index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                  }`}
                >
                  <td className='p-4 whitespace-nowrap font-mono text-sm'>
                    {event.eventId}
                  </td>
                  <td className='p-4 whitespace-nowrap font-medium'>
                    {event.name}
                  </td>
                  <td className='p-4 whitespace-nowrap'>
                    {new Date(event.date).toLocaleDateString()}
                  </td>
                  <td className='p-4 whitespace-nowrap'>{event.location}</td>
                  <td className='p-4 whitespace-nowrap'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.status.toLowerCase() === 'live'
                          ? 'bg-green-900/50 text-green-400'
                          : event.status.toLowerCase() === 'upcoming'
                          ? 'bg-blue-900/50 text-blue-400'
                          : event.status.toLowerCase() === 'draft'
                          ? 'bg-gray-900/50 text-gray-400'
                          : 'bg-red-900/50 text-red-400'
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className='p-4 whitespace-nowrap'>
                    <button
                      onClick={() => {
                        setSelectedEvent(event)
                        setShowRedemptionPanel(true)
                      }}
                      disabled={['draft', 'closed'].includes(event.status.toLowerCase())}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        ['upcoming', 'live'].includes(event.status.toLowerCase())
                          ? 'bg-gradient-to-r from-[#CB3CFF] to-[#7F25FB] text-white hover:opacity-90'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Open Redemption Panel
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr className='text-center bg-[#0A1330]'>
                <td colSpan='6' className='p-4'>
                  No events found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={eventsPagination.currentPage}
        totalPages={eventsPagination.totalPages}
        onPageChange={(page) =>
          setEventsPagination((prev) => ({
            ...prev,
            currentPage: page,
          }))
        }
      />
    </div>
  )
}
