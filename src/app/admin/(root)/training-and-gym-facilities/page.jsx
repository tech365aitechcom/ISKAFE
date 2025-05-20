'use client'

import {
  Search,
  Eye,
  Edit,
  Check,
  X,
  Trash,
  Mail,
  RotateCcw,
} from 'lucide-react'
import { useState } from 'react'
import PaginationHeader from '../../../_components/PaginationHeader'
import Pagination from '../../../_components/Pagination'
import { City, Country, State } from 'country-state-city'

export default function TrainingAndGymFacilities() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedStyles, setSelectedStyles] = useState([])
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(3)
  const [limit, setLimit] = useState(10)

  // Mock data for demonstration
  const [facilities, setFacilities] = useState([
    {
      id: 1,
      logo: '/api/placeholder/40/40',
      name: 'Arnett Sport Kung Fu Association',
      location: 'Jacksonville, FL, USA',
      country: 'USA',
      state: 'FL',
      city: 'Jacksonville',
      styles: ['Kung Fu', 'Kickboxing'],
      status: 'Active',
      approvalStatus: 'Pending',
      createdOn: '2025-05-02',
      addedBy: 'admin@ikfplatform.com',
      isRegistered: true,
      trainersCount: 2,
      fightersCount: 12,
    },
    {
      id: 2,
      logo: '/api/placeholder/40/40',
      name: 'Elite MMA Academy',
      location: 'Miami, FL, USA',
      country: 'USA',
      state: 'FL',
      city: 'Miami',
      styles: ['MMA', 'Brazilian Jiu-Jitsu'],
      status: 'Active',
      approvalStatus: 'Approved',
      createdOn: '2025-04-28',
      addedBy: 'john.doe@email.com',
      isRegistered: true,
      trainersCount: 5,
      fightersCount: 25,
    },
    {
      id: 3,
      logo: '/api/placeholder/40/40',
      name: 'Champions Boxing Club',
      location: 'Charlotte, NC, USA',
      country: 'USA',
      state: 'NC',
      city: 'Charlotte',
      styles: ['Boxing', 'Kickboxing'],
      status: 'Suspended',
      approvalStatus: 'Approved',
      createdOn: '2025-04-15',
      addedBy: 'trainer@champions.com',
      isRegistered: false,
      trainersCount: 3,
      fightersCount: 18,
    },
  ])

  const countries = Country.getAllCountries()
  const states = selectedCountry
    ? State.getStatesOfCountry(selectedCountry)
    : []
  const cities =
    selectedCountry && selectedState
      ? City.getCitiesOfState(selectedCountry, selectedState)
      : []

  const martialArtsStyles = [
    'Boxing',
    'Kickboxing',
    'MMA',
    'Brazilian Jiu-Jitsu',
    'Kung Fu',
    'Muay Thai',
    'Karate',
    'Taekwondo',
  ]

  // Filter facilities based on search criteria
  const filteredFacilities = facilities.filter((facility) => {
    const matchesSearch = facility.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesCountry = selectedCountry
      ? facility.country === selectedCountry
      : true
    const matchesState = selectedState ? facility.state === selectedState : true
    const matchesCity = selectedCity ? facility.city === selectedCity : true
    const matchesStyles =
      selectedStyles.length > 0
        ? selectedStyles.some((style) => facility.styles.includes(style))
        : true
    const matchesStatus =
      selectedStatus !== 'All' ? facility.status === selectedStatus : true
    const matchesApproval =
      selectedApprovalStatus !== 'All'
        ? facility.approvalStatus === selectedApprovalStatus
        : true

    return (
      matchesSearch &&
      matchesCountry &&
      matchesState &&
      matchesCity &&
      matchesStyles &&
      matchesStatus &&
      matchesApproval
    )
  })

  const handleSearch = () => {
    console.log('Searching with filters...')
    // Implement API call here
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCountry('')
    setSelectedState('')
    setSelectedCity('')
    setSelectedStyles([])
    setSelectedStatus('All')
    setSelectedApprovalStatus('All')
  }

  const handleViewProfile = (facility) => {
    console.log('Viewing profile for:', facility.name)
    // Route to public facility detail page
  }

  const handleEdit = (facility) => {
    console.log('Editing facility:', facility.name)
    // Open edit form with prefilled data
  }

  const handleApprove = (facilityId) => {
    setFacilities((prev) =>
      prev.map((facility) =>
        facility.id === facilityId
          ? { ...facility, approvalStatus: 'Approved' }
          : facility
      )
    )
  }

  const handleToggleStatus = (facilityId) => {
    setFacilities((prev) =>
      prev.map((facility) =>
        facility.id === facilityId
          ? {
              ...facility,
              status: facility.status === 'Active' ? 'Suspended' : 'Active',
            }
          : facility
      )
    )
  }

  const handleDelete = (facilityId) => {
    if (
      confirm(
        'Are you sure you want to delete this facility? This action cannot be undone.'
      )
    ) {
      setFacilities((prev) =>
        prev.filter((facility) => facility.id !== facilityId)
      )
    }
  }

  const handleSendInvites = (facility) => {
    console.log('Sending invites for facility:', facility.name)
    // Trigger email invitations
  }

  const handleStyleChange = (style) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    )
  }

  const getStatusBadge = (status) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'
    return status === 'Active'
      ? `${baseClasses} bg-green-100 text-green-800`
      : `${baseClasses} bg-red-100 text-red-800`
  }

  const getApprovalBadge = (status) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'
    return status === 'Approved'
      ? `${baseClasses} bg-blue-100 text-blue-800`
      : `${baseClasses} bg-yellow-100 text-yellow-800`
  }

  const renderHeader = (label) => (
    <th className='px-4 pb-3 whitespace-nowrap cursor-pointer'>
      <div className='flex items-center gap-1'>{label}</div>
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
            Training and Gym Facilities
          </h2>
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
              placeholder='Search by Facility Name...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Grid */}
          <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {/* Country Filter */}
            <div>
              <label className='block mb-2 text-sm font-medium text-white'>
                Country
              </label>
              <select
                className='w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-white appearance-none outline-none'
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value)
                  setSelectedState('')
                  setSelectedCity('')
                }}
              >
                <option value='' className='text-black'>
                  Select Country
                </option>
                {countries.map((country) => (
                  <option
                    key={country.isoCode}
                    value={country.isoCode}
                    className='text-black'
                  >
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* State Filter */}
            <div>
              <label className='block mb-2 text-sm font-medium text-white'>
                State
              </label>
              <select
                className='w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-white appearance-none outline-none'
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value)
                  setSelectedCity('')
                }}
                disabled={!selectedCountry}
              >
                <option value='' className='text-black'>
                  Select State
                </option>
                {states.map((state) => (
                  <option
                    key={state.isoCode}
                    value={state.isoCode}
                    className='text-black'
                  >
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className='block mb-2 text-sm font-medium text-white'>
                City
              </label>
              <select
                className='w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-white appearance-none outline-none'
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedState}
              >
                <option value='' className='text-black'>
                  Select City
                </option>
                {cities.map((city) => (
                  <option
                    key={city.name}
                    value={city.name}
                    className='text-black'
                  >
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className='block mb-2 text-sm font-medium text-white'>
                Status
              </label>
              <select
                className='w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-white appearance-none outline-none'
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value='All' className='text-black'>
                  All
                </option>
                <option value='Active' className='text-black'>
                  Active
                </option>
                <option value='Suspended' className='text-black'>
                  Suspended
                </option>
              </select>
            </div>

            {/* Approval Status Filter */}
            <div>
              <label className='block mb-2 text-sm font-medium text-white'>
                Approval Status
              </label>
              <select
                className='w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-white appearance-none outline-none'
                value={selectedApprovalStatus}
                onChange={(e) => setSelectedApprovalStatus(e.target.value)}
              >
                <option value='All' className='text-black'>
                  All
                </option>
                <option value='Approved' className='text-black'>
                  Approved
                </option>
                <option value='Pending' className='text-black'>
                  Pending
                </option>
              </select>
            </div>
          </div>

          {/* Styles Multi-select */}
          <div>
            <label className='block mb-2 text-sm font-medium text-white'>
              Discipline / Style
            </label>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
              {martialArtsStyles.map((style) => (
                <label
                  key={style}
                  className='flex items-center space-x-2 text-white'
                >
                  <input
                    type='checkbox'
                    checked={selectedStyles.includes(style)}
                    onChange={() => handleStyleChange(style)}
                    className='form-checkbox text-blue-600'
                  />
                  <span className='text-sm'>{style}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end mb-6'>
            {/* Reset Filters Button */}
            {(searchQuery ||
              selectedCountry ||
              selectedState ||
              selectedCity ||
              (selectedStatus && selectedStatus !== 'All') ||
              (selectedApprovalStatus && selectedApprovalStatus !== 'All') ||
              selectedStyles.length > 0) && (
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
            label='Training and Gym Facilities'
          />
          <div className='overflow-x-auto custom-scrollbar'>
            <table className='w-full text-sm text-left'>
              <thead>
                <tr className='text-gray-400 text-sm'>
                  {renderHeader('SR No', 'srno')}
                  {renderHeader('Logo', 'logo')}
                  {renderHeader('Facility Name', 'name')}
                  {renderHeader('Location', 'location')}
                  {renderHeader('Styles Taught', 'styles')}
                  {renderHeader('Status', 'status')}
                  {renderHeader('Approval', 'approval')}
                  {renderHeader('Created On', 'createdAt')}
                  {renderHeader('Added By', 'addedBy')}
                  {renderHeader('Trainers', 'trainers')}
                  {renderHeader('Fighters', 'fighters')}
                  {renderHeader('Actions', 'actions')}
                </tr>
              </thead>
              <tbody>
                {filteredFacilities && filteredFacilities.length > 0 ? (
                  filteredFacilities.map((facility, index) => (
                    <tr
                      key={facility.id}
                      className={`${
                        index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                      }`}
                    >
                      <td className='px-4 py-3'>
                        {(currentPage - 1) * limit + index + 1}
                      </td>
                      <td className='px-4 py-3'>
                        <img
                          src={facility.logo}
                          alt={`${facility.name} logo`}
                          className='h-10 w-10 object-cover rounded'
                        />
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis'>
                        <button
                          onClick={() => handleViewProfile(facility)}
                          className='text-blue-400 hover:text-blue-300 underline'
                        >
                          {facility.name}
                        </button>
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis'>
                        {facility.location}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis'>
                        {facility.styles.join(', ')}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis'>
                        <span className={getStatusBadge(facility.status)}>
                          {facility.status}
                        </span>
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis'>
                        <span
                          className={getApprovalBadge(facility.approvalStatus)}
                        >
                          {facility.approvalStatus}
                        </span>
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        {facility.createdOn}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        {facility.addedBy}
                      </td>
                      <td className='px-4 py-3 text-center'>
                        {facility.trainersCount}
                      </td>
                      <td className='px-4 py-3 text-center'>
                        {facility.fightersCount}
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleViewProfile(facility)}
                            className='text-blue-400 hover:text-blue-300'
                            title='View Profile'
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(facility)}
                            className='text-green-400 hover:text-green-300'
                            title='Edit'
                          >
                            <Edit size={18} />
                          </button>
                          {facility.approvalStatus === 'Pending' && (
                            <button
                              onClick={() => handleApprove(facility.id)}
                              className='text-blue-400 hover:text-blue-300'
                              title='Approve'
                            >
                              <Check size={18} />
                            </button>
                          )}
                          {/* status toggle */}
                          <button
                            onClick={() => handleToggleStatus(facility.id)}
                            className='relative inline-flex h-4 w-8 rounded-full transition-colors
             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            aria-label={
                              facility.status === 'Active'
                                ? 'Suspend'
                                : 'Activate'
                            }
                          >
                            {/* track */}
                            <span
                              className={`absolute inset-0 rounded-full
                ${facility.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}
                transition-colors`}
                            />

                            {/* thumb */}
                            <span
                              className={`inline-block h-4 w-4 bg-white rounded-full shadow transform
                transition-transform duration-200
                ${
                  facility.status === 'Active'
                    ? 'translate-x-5'
                    : 'translate-x-0'
                }`}
                            />
                          </button>
                          {!facility.isRegistered && (
                            <button
                              onClick={() => handleSendInvites(facility)}
                              className='text-purple-400 hover:text-purple-300'
                              title='Send Invites'
                            >
                              <Mail size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(facility.id)}
                            className='text-red-400 hover:text-red-300'
                            title='Delete'
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
                      No training facilities found.
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
