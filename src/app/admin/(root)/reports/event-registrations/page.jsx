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
} from 'lucide-react'
import { useState } from 'react'
import PaginationHeader from '../../../../_components/PaginationHeader'
import Pagination from '../../../../_components/Pagination'

export default function EventRegistrationListing() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegistrationType, setSelectedRegistrationType] =
    useState('All')
  const [regStartDate, setRegStartDate] = useState('')
  const [regEndDate, setRegEndDate] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [selectedEvent, setSelectedEvent] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(3)
  const [limit, setLimit] = useState(10)
  const [sortField, setSortField] = useState('regDate')
  const [sortDirection, setSortDirection] = useState('desc')
  const eventNames = ['Championship 2025', 'Qualifier 1', 'Summer Slam']

  // Mock data for demonstration
  const [registrations, setRegistrations] = useState([
    {
      id: 1,
      regDate: '2025/05/11 17:12:39',
      eventDate: '06/08/2025',
      eventName: 'Ft. Wayne Point Sparring Tournament',
      fighterName: 'Don A Stevens Chavez',
      registrationType: 'Fighter',
      email: 'don.stevens@example.com',
      mobile: '123-456-7890',
      ageOrDOB: '17',
      weightClass: 'Lightweight',
      discipline: 'Muay Thai',
      verified: true,
    },
    {
      id: 2,
      regDate: '2025/05/10 09:45:21',
      eventDate: '06/08/2025',
      eventName: 'Ft. Wayne Point Sparring Tournament',
      fighterName: 'Maria Rodriguez',
      registrationType: 'Fighter',
      email: 'maria.r@example.com',
      mobile: '234-567-8901',
      ageOrDOB: '03-01-2007',
      weightClass: 'Featherweight',
      discipline: 'Kickboxing',
      verified: false,
    },
    {
      id: 3,
      regDate: '2025/05/09 14:30:05',
      eventDate: '06/08/2025',
      eventName: 'Ft. Wayne Point Sparring Tournament',
      fighterName: 'John Williams',
      registrationType: 'Trainer',
      email: 'j.williams@example.com',
      mobile: '345-678-9012',
      ageOrDOB: '32',
      weightClass: 'N/A',
      discipline: 'Muay Thai, Boxing',
      verified: true,
    },
  ])

  const formatISODateTime = (dateTimeString) => {
    try {
      // For string in format "2025/05/11 17:12:39"
      const [datePart, timePart] = dateTimeString.split(' ')
      const [year, month, day] = datePart.split('/')
      const [hour, minute, second] = timePart.split(':')

      const date = new Date(year, month - 1, day, hour, minute, second)

      return date.toISOString()
    } catch (error) {
      return dateTimeString
    }
  }

  // Filter registrations based on search criteria
  const filteredRegistrations = registrations.filter((registration) => {
    const matchesSearch =
      registration.fighterName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      registration.eventName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType =
      selectedRegistrationType === 'All' ||
      registration.registrationType === selectedRegistrationType

    const matchesEvent =
      !selectedEvent || registration.eventName === selectedEvent

    const matchesEventDate = !eventDate || registration.eventDate === eventDate

    const matchesRegStartDate =
      !regStartDate ||
      formatISODateTime(registration.regDate) >=
        new Date(regStartDate).toISOString()

    const matchesRegEndDate =
      !regEndDate ||
      formatISODateTime(registration.regDate) <=
        new Date(regEndDate).toISOString()

    return (
      matchesSearch &&
      matchesType &&
      matchesEvent &&
      matchesEventDate &&
      matchesRegStartDate &&
      matchesRegEndDate
    )
  })

  // Sort registrations based on sortField and sortDirection
  const sortedRegistrations = [...filteredRegistrations].sort((a, b) => {
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

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedRegistrationType('All')
    setSelectedEvent('')
    setEventDate('')
    setRegStartDate('')
    setRegEndDate('')
  }

  const handleGetForms = () => {
    console.log('Fetching latest registration forms...')
    // Implement API call to refresh data
  }

  const handleViewRegistration = (registration) => {
    console.log('Viewing registration:', registration.id)
    // Navigate to registration detail view
  }

  const handleEditRegistration = (registration) => {
    console.log('Editing registration:', registration.id)
    // Open edit form
  }

  const handleDeleteRegistration = (registrationId) => {
    if (confirm('Are you sure you want to delete this registration?')) {
      setRegistrations((prev) =>
        prev.filter((registration) => registration.id !== registrationId)
      )
    }
  }

  const handleToggleVerification = (registrationId) => {
    setRegistrations((prev) =>
      prev.map((registration) =>
        registration.id === registrationId
          ? { ...registration, verified: !registration.verified }
          : registration
      )
    )
  }

  const getVerificationBadge = (verified) => {
    const baseClasses =
      'px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap'
    return verified
      ? `${baseClasses} bg-green-100 text-green-800`
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
                {eventNames.map((event) => (
                  <option key={event} value={event} className='text-black'>
                    {event}
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
                <option value='All' className='text-black'>
                  All Types
                </option>
                <option value='Fighter' className='text-black'>
                  Fighter
                </option>
                <option value='Trainer' className='text-black'>
                  Trainer
                </option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end mb-6'>
            {/* Reset Filters Button */}
            {(searchQuery ||
              selectedRegistrationType !== 'All' ||
              regStartDate ||
              regEndDate ||
              eventDate ||
              selectedEvent) && (
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
                      key={registration.id}
                      className={`${
                        index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                      }`}
                    >
                      <td
                        className='px-4 py-3 whitespace-nowrap'
                        title={formatISODateTime(registration.regDate)}
                      >
                        {registration.regDate}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        {registration.eventDate}
                      </td>
                      <td
                        className='px-4 py-3 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis'
                        title={registration.eventName}
                      >
                        {registration.eventName}
                      </td>
                      <td
                        className='px-4 py-3 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis'
                        title={registration.fighterName}
                      >
                        <button
                          onClick={() => handleViewRegistration(registration)}
                          className='text-blue-400 hover:text-blue-300 underline'
                        >
                          {registration.fighterName}
                        </button>
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        {registration.registrationType}
                      </td>
                      <td
                        className='px-4 py-3 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis'
                        title={registration.email}
                      >
                        <a
                          href={`mailto:${registration.email}`}
                          className='text-blue-400 hover:text-blue-300 flex items-center gap-1'
                        >
                          <Mail size={14} />
                          <span className='truncate'>{registration.email}</span>
                        </a>
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        {registration.mobile ? (
                          <a
                            href={`tel:${registration.mobile}`}
                            className='text-blue-400 hover:text-blue-300 flex items-center gap-1'
                          >
                            <Phone size={14} /> {registration.mobile}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        {registration.ageOrDOB}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        {registration.weightClass || 'N/A'}
                      </td>
                      <td
                        className='px-4 py-3 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis'
                        title={registration.discipline}
                      >
                        {registration.discipline}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        <span
                          className={getVerificationBadge(
                            registration.verified
                          )}
                        >
                          {registration.verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleViewRegistration(registration)}
                            className='text-blue-400 hover:text-blue-300'
                            title='View Registration'
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEditRegistration(registration)}
                            className='text-green-400 hover:text-green-300'
                            title='Edit Registration'
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleVerification(registration.id)
                            }
                            className={`${
                              registration.verified
                                ? 'text-yellow-400 hover:text-yellow-300'
                                : 'text-green-400 hover:text-green-300'
                            }`}
                            title={
                              registration.verified ? 'Unverify' : 'Verify'
                            }
                          >
                            {registration.verified ? (
                              <X size={18} />
                            ) : (
                              <Check size={18} />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteRegistration(registration.id)
                            }
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
