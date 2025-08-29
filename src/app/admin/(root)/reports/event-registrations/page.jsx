'use client'

import {
  Search,
  RefreshCw,
  Eye,
  ArrowUp,
  ArrowDown,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import PaginationHeader from '../../../../_components/PaginationHeader'
import Pagination from '../../../../_components/Pagination'
import axios from 'axios'
import { API_BASE_URL, apiConstants } from '../../../../../constants'
import moment from 'moment'
import { enqueueSnackbar } from 'notistack'
import Loader from '../../../../_components/Loader'
import Link from 'next/link'

export default function EventRegistrationListing() {
  // State variables
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegistrationType, setSelectedRegistrationType] = useState('')
  const [regStartDate, setRegStartDate] = useState('')
  const [regEndDate, setRegEndDate] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [selectedEvent, setSelectedEvent] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(1)
  const [limit, setLimit] = useState(10)
  const [sortField, setSortField] = useState('regDate')
  const [sortDirection, setSortDirection] = useState('desc')
  const [events, setEvents] = useState([])
  const [registrationsLoading, setRegistrationsLoading] = useState(false)
  const [eventsLoading, setEventsLoading] = useState(false)
  const [registrations, setRegistrations] = useState([])

  // Function to fetch all registrations with filters
  const getAllRegistrations = async () => {
    setRegistrationsLoading(true)
    try {
      // Construct query parameters
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        sortField: sortField,
        sortDirection: sortDirection,
      })
      
      // Add filters only if they have values
      if (searchQuery) params.append('search', searchQuery)
      if (selectedRegistrationType) params.append('registrationType', selectedRegistrationType)
      if (regStartDate) params.append('regStartDate', regStartDate)
      if (regEndDate) params.append('regEndDate', regEndDate)
      if (selectedEvent) params.append('selectedEvent', selectedEvent)
      if (eventDate) params.append('eventDate', eventDate)

      const response = await axios.get(
        `${API_BASE_URL}/registrations?${params.toString()}`
      )
      
      setRegistrations(response.data.data.items)
      setTotalPages(response.data.data.pagination.totalPages)
      setTotalItems(response.data.data.pagination.totalItems)
    } catch (error) {
      console.error('Error fetching registrations:', error)
      enqueueSnackbar('Failed to load registrations', { variant: 'error' })
    } finally {
      setRegistrationsLoading(false)
    }
  }

  // Fetch events on component mount
  const getEvents = async () => {
    setEventsLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/events?page=1&limit=500`)
      setEvents(response.data.data.items)
    } catch (error) {
      console.error('Error fetching events:', error)
      enqueueSnackbar('Failed to load events', { variant: 'error' })
    } finally {
      setEventsLoading(false)
    }
  }

  // Fetch data when dependencies change
  useEffect(() => {
    getAllRegistrations()
  }, [
    currentPage, 
    limit, 
    sortField, 
    sortDirection,
    searchQuery,
    selectedRegistrationType,
    regStartDate,
    regEndDate,
    eventDate,
    selectedEvent
  ])

  // Fetch events on component mount
  useEffect(() => {
    getEvents()
  }, [])

  // Handler for applying filters (now just resets to first page)
  const handleGetForms = () => {
    // Reset to first page when applying new filters
    setCurrentPage(1)
  }

  // Handler for resetting filters
  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedRegistrationType('')
    setSelectedEvent('')
    setEventDate('')
    setRegStartDate('')
    setRegEndDate('')
    // Reset to first page
    setCurrentPage(1)
  }

  // Handler for toggling verification status
  const handleToggleVerification = async (registration, status) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/registrations/${registration._id}`,
        { status }
      )

      if (response.status === apiConstants.success) {
        enqueueSnackbar('Verification status updated successfully', {
          variant: 'success',
        })
        getAllRegistrations()
      }
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || 'Failed to update status',
        { variant: 'error' }
      )
    }
  }

  // Helper to get verification badge styling
  const getVerificationBadge = (status) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap'
    return status === 'Verified'
      ? `${baseClasses} bg-green-100 text-green-800`
      : status === 'Rejected'
      ? `${baseClasses} bg-red-100 text-red-800`
      : `${baseClasses} bg-yellow-100 text-yellow-800`
  }

  // Helper to render sortable table headers
  const renderHeader = (label, field) => (
    <th
      className='px-4 pb-3 whitespace-nowrap cursor-pointer'
      onClick={() => handleSort(field)}
    >
      <div className='flex items-center gap-1'>
        {label}
        {sortField === field && (
          <span>
            {sortDirection === 'asc' ? (
              <ArrowUp size={14} />
            ) : (
              <ArrowDown size={14} />
            )}
          </span>
        )}
      </div>
    </th>
  )

  // Handler for sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }


  return (
    <div className='text-white p-8 flex justify-center relative overflow-hidden'>
      <div
        className='absolute -left-10 top-1/2 transform -translate-y-1/2 w-60 h-96 rounded-full opacity-70 blur-xl'
        style={{
          background: 'linear-gradient(317.9deg, #6F113E 13.43%, rgba(111, 17, 62, 0) 93.61%)',
        }}
      ></div>
      
      <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-semibold leading-8'>Registration Forms</h2>
          <div className='mb-6'>
            <button
              className='text-white px-4 py-2 rounded-md flex items-center gap-2 transition'
              style={{
                background: 'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
              onClick={handleGetForms}
            >
              <RefreshCw size={18} />
              Apply Filters
            </button>
          </div>
        </div>

        <div className='mb-6 space-y-4'>
          {/* Search input */}
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
              <Search size={18} className='text-gray-400' />
            </div>
            <input
              type='text'
              className='bg-transparent border border-gray-700 text-white rounded-md pl-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600'
              placeholder='Search by Fighter Name or Event...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {/* Registration Date Range */}
            <div>
              <label className='block mb-2 text-sm font-medium text-white'>
                Registration Date Range
              </label>
              <div className='flex gap-2'>
                <input
                  type='date'
                  className='w-full px-3 py-2 bg-transparent border border-gray-700 rounded-lg text-white outline-none'
                  value={regStartDate}
                  onChange={(e) => setRegStartDate(e.target.value)}
                />
                <input
                  type='date'
                  className='w-full px-3 py-2 bg-transparent border border-gray-700 rounded-lg text-white outline-none'
                  value={regEndDate}
                  onChange={(e) => setRegEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Event Date */}
            <div>
              <label className='block mb-2 text-sm font-medium text-white'>
                Event Date
              </label>
              <input
                type='date'
                className='w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-white outline-none'
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>

            {/* Event Name */}
            <div>
              <label className='block mb-2 text-sm font-medium text-white'>
                Event Name
              </label>
              <select
                className='w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-white appearance-none outline-none'
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                <option value='' className='text-black'>Select Event</option>
                {events.map((event) => (
                  <option key={event._id} value={event._id} className='text-black'>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Registration Type */}
            <div>
              <label className='block mb-2 text-sm font-medium text-white'>
                Registration Type
              </label>
              <select
                className='w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-white appearance-none outline-none'
                value={selectedRegistrationType}
                onChange={(e) => setSelectedRegistrationType(e.target.value)}
              >
                <option value='' className='text-black'>All Types</option>
                <option value='fighter' className='text-black'>Fighter</option>
                <option value='trainer' className='text-black'>Trainer</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end mb-6'>
            {/* Reset Filters Button */}
            {(searchQuery || regStartDate || regEndDate || eventDate || selectedEvent || selectedRegistrationType) && (
              <button
                className='border border-gray-700 text-white rounded-lg px-4 py-2 hover:bg-gray-700 transition'
                onClick={handleResetFilters}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
          <PaginationHeader
            limit={limit}
            setLimit={setLimit}
            currentPage={currentPage}
            totalItems={totalItems}
            label='Event Registrations'
          />
          
          <div className='overflow-x-auto custom-scrollbar'>
            <table className='w-full text-sm text-left'>
              <thead>
                <tr className='text-gray-400 text-sm'>
                  {renderHeader('Reg Date', 'regDate')}
                  {renderHeader('Event Date', 'eventDate')}
                  {renderHeader('Event Name', 'eventName')}
                  {renderHeader('Fighter Name', 'fighterName')}
                  {renderHeader('Reg Type', 'registrationType')}
                  {renderHeader('Email', 'email')}
                  {renderHeader('Mobile', 'mobile')}
                  {renderHeader('Age/DOB', 'ageOrDOB')}
                  {renderHeader('Weight Class', 'weightClass')}
                  {renderHeader('Discipline', 'discipline')}
                  {renderHeader('Verified', 'verified')}
                  <th className='px-4 pb-3 whitespace-nowrap'>Actions</th>
                </tr>
              </thead>
              
              <tbody>
                {registrationsLoading ? (
                  <tr className='text-center bg-[#0A1330]'>
                    <td colSpan='12' className='px-4 py-8'>
                      <div className='flex justify-center'>
                        <Loader />
                      </div>
                    </td>
                  </tr>
                ) : registrations.length > 0 ? (
                  registrations.map((registration, index) => (
                    <tr
                      key={registration._id}
                      className={`${index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'}`}
                    >
                      <td className='px-4 py-3 whitespace-nowrap'>
                        {moment(registration.createdAt).format('DD-MM-YYYY')}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        {moment(registration.event?.startDate).format('DD-MM-YYYY')}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis'>
                        {registration.event?.name || 'N/A'}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis'>
                        {registration.firstName + ' ' + registration.lastName}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap capitalize'>
                        {registration.registrationType}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis'>
                        <a
                          href={`mailto:${registration.email}`}
                          className='flex items-center gap-1'
                        >
                          <Mail size={14} />
                          <span className='truncate'>{registration.email}</span>
                        </a>
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        {registration.phoneNumber ? (
                          <a
                            href={`tel:${registration.phoneNumber}`}
                            className='flex items-center gap-1'
                          >
                            <Phone size={14} /> {registration.phoneNumber}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        {moment(registration.dateOfBirth).format('DD-MM-YYYY')}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        {registration.weightClass || 'N/A'}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis'>
                        {registration.event?.sportType || 'N/A'}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        <span className={getVerificationBadge(registration.status)}>
                          {registration.status}
                        </span>
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        <div className='flex items-center justify-center gap-2'>
                          {/* View Button */}
                          <Link href={`/admin/reports/event-registrations/view/${registration._id}`}>
                            <button
                              className='text-blue-400 hover:text-blue-300'
                              title='View Registration'
                            >
                              <Eye size={18} />
                            </button>
                          </Link>
                          
                          {/* Verification Toggle */}
                          <div className='flex items-center gap-1'>
                            <button
                              onClick={() => handleToggleVerification(registration, 'Verified')}
                              className={`p-1 rounded-full ${
                                registration.status === 'Verified' 
                                  ? 'bg-green-500 text-white' 
                                  : 'text-green-400 hover:text-green-300'
                              }`}
                              title='Mark as Verified'
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleToggleVerification(registration, 'Rejected')}
                              className={`p-1 rounded-full ${
                                registration.status === 'Rejected' 
                                  ? 'bg-red-500 text-white' 
                                  : 'text-red-400 hover:text-red-300'
                              }`}
                              title='Mark as Rejected'
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className='text-center bg-[#0A1330]'>
                    <td colSpan='12' className='px-4 py-8 text-gray-400'>
                      No registrations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
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