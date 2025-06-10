'use client'

import {
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash,
  ArrowUp,
  ArrowDown,
  Check,
  X,
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
import ConfirmationModal from '../../../../_components/ConfirmationModal'
import { enqueueSnackbar } from 'notistack'
import Loader from '../../../../_components/Loader'
import Link from 'next/link'

export default function EventRegistrationListing() {
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
  const [loading, setLoading] = useState(false)

  const [registrations, setRegistrations] = useState([])
  const [isDelete, setIsDelete] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState(null)

  // Sort registrations based on sortField and sortDirection
  const sortedRegistrations = [...registrations].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortField] > b[sortField] ? 1 : -1
    } else {
      return a[sortField] < b[sortField] ? 1 : -1
    }
  })

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getEvents = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${API_BASE_URL}/events?page=1&limit=500`
      )
      console.log('Response:', response.data.data.items)
      setEvents(response.data.data.items)
    } catch (error) {
      console.log('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAllRegistrations = async ({
    searchQuery,
    selectedRegistrationType,
    regStartDate,
    regEndDate,
    selectedEvent,
    eventDate,
  }) => {
    setLoading(true)
    try {
      let queryParams = `?page=${currentPage}&limit=${limit}`
      if (searchQuery) queryParams += `&search=${searchQuery}`
      if (selectedRegistrationType)
        queryParams += `&registrationType=${selectedRegistrationType}`
      if (regStartDate) queryParams += `&regStartDate=${regStartDate}`
      if (regEndDate) queryParams += `&regEndDate=${regEndDate}`
      if (selectedEvent) queryParams += `&eventId=${selectedEvent}`
      if (eventDate) queryParams += `&eventDate=${eventDate}`

      const response = await axios.get(
        `${API_BASE_URL}/registrations${queryParams}`
      )
      setRegistrations(response.data.data.items)
      setTotalPages(response.data.data.pagination.totalPages)
      setTotalItems(response.data.data.pagination.totalItems)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAllRegistrations({
      searchQuery: '',
      selectedRegistrationType: '',
      regStartDate: '',
      regEndDate: '',
      selectedEvent: '',
      eventDate: '',
    })
  }, [currentPage, limit])

  useEffect(() => {
    getEvents()
  }, [])

  const handleGetForms = () => {
    getAllRegistrations({
      searchQuery,
      selectedRegistrationType,
      regStartDate,
      regEndDate,
      selectedEvent,
      eventDate,
    })
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedRegistrationType('')
    setSelectedEvent('')
    setEventDate('')
    setRegStartDate('')
    setRegEndDate('')
    getAllRegistrations({
      searchQuery: '',
      selectedRegistrationType: '',
      regStartDate: '',
      regEndDate: '',
      selectedEvent: '',
      eventDate: '',
    })
  }

  const handleDeleteRegistration = async () => {
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/registrations/${selectedRegistration}`
      )

      if (res.status == apiConstants.success) {
        enqueueSnackbar(res.data.message, {
          variant: 'success',
        })
        setIsDelete(false)
        getAllRegistrations({
          searchQuery: '',
          selectedRegistrationType: '',
          regStartDate: '',
          regEndDate: '',
          selectedEvent: '',
          eventDate: '',
        })
      }
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message ??
          'Failed to delete registrations,try again',
        {
          variant: 'error',
        }
      )
      console.log('Failed to delete training facility:', error)
    }
  }

  const handleToggleVerification = async (registration, status) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/registrations/${registration._id}`,
        {
          status: status,
        }
      )

      if (response.status === apiConstants.success) {
        enqueueSnackbar('Verification status updated successfully', {
          variant: 'success',
        })
        getAllRegistrations({
          searchQuery: '',
          selectedRegistrationType: '',
          regStartDate: '',
          regEndDate: '',
          selectedEvent: '',
          eventDate: '',
        })
      }
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || 'Something went wrong',
        { variant: 'error' }
      )
    }
  }

  const getVerificationBadge = (verified) => {
    const baseClasses =
      'px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap'
    return verified === 'Verified'
      ? `${baseClasses} bg-green-100 text-green-800`
      : verified === 'Rejected'
      ? `${baseClasses} bg-red-100 text-red-800`
      : `${baseClasses} bg-yellow-100 text-yellow-800`
  }

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

  if (loading) return <Loader />

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
          <h2 className='text-2xl font-semibold leading-8'>
            Fighter Registration Forms
          </h2>
          {/* Get Forms Button */}
          <div className='mb-6'>
            <button
              className='text-white px-4 py-2 rounded-md flex items-center gap-2 transition'
              style={{
                background:
                  'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
              onClick={handleGetForms}
            >
              <RefreshCw size={18} />
              Get Forms
            </button>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className='mb-6 space-y-4'>
          {/* Search Bar */}
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

          {/* Filter Grid */}
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
                <option value='' className='text-black'>
                  Select Event
                </option>
                {events.map((event) => (
                  <option
                    key={event._id}
                    value={event._id}
                    className='text-black'
                  >
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
                <option value='' className='text-black'>
                  All Types
                </option>
                <option value='fighter' className='text-black'>
                  Fighter
                </option>
                <option value='trainer' className='text-black'>
                  Trainer
                </option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end mb-6'>
            {/* Reset Filters Button */}
            {(searchQuery ||
              regStartDate ||
              regEndDate ||
              eventDate ||
              selectedEvent ||
              selectedRegistrationType) && (
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
                {sortedRegistrations.length > 0 ? (
                  sortedRegistrations.map((registration, index) => (
                    <tr
                      key={registration._id}
                      className={`${
                        index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                      }`}
                    >
                      <td className='px-4 py-3 whitespace-nowrap'>
                        {moment(
                          registration.event?.registrationStartDate
                        ).format('DD-MM-YYYY')}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        {moment(registration.event?.createdAt).format(
                          'DD-MM-YYYY'
                        )}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis'>
                        {registration.event?.name}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis'>
                        {registration.firstName + ' ' + registration.lastName}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap capitalize'>
                        {registration.registrationType}
                      </td>
                      <td
                        className='px-4 py-3 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis'
                        title={registration.email}
                      >
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
                        {registration.event?.sportType}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        <span
                          className={getVerificationBadge(registration.status)}
                        >
                          {registration.status}
                        </span>
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        <div className='flex items-center justify-center gap-2'>
                          <Link
                            href={`/admin/event-registrations/view/${registration._id}`}
                          >
                            <button
                              className='text-blue-400 hover:text-blue-300'
                              title='View Registration'
                            >
                              <Eye size={18} />
                            </button>
                          </Link>
                          <Link
                            href={`/admin/event-registrations/edit${registration._id}`}
                          >
                            <button
                              className='text-green-400 hover:text-green-300'
                              title='Edit Registration'
                            >
                              <Edit size={18} />
                            </button>
                          </Link>
                          <button
                            onClick={() =>
                              handleToggleVerification(registration, 'Verified')
                            }
                            className='text-green-400 hover:text-green-300'
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleVerification(registration, 'Rejected')
                            }
                            className='text-red-400 hover:text-red-300'
                          >
                            <XCircle size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setIsDelete(true)
                              setSelectedRegistration(registration._id)
                            }}
                            className='text-red-400 hover:text-red-300'
                            title='Delete Registration'
                          >
                            <Trash size={18} />
                          </button>
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

          {/* Confirmation Modal */}
          <ConfirmationModal
            isOpen={isDelete}
            onClose={() => setIsDelete(false)}
            onConfirm={() => handleDeleteRegistration(selectedRegistration)}
            title='Delete Registration'
            message='Are you sure you want to delete this registration?'
          />
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
