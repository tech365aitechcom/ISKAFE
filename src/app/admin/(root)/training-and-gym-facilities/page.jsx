'use client'

import { Search, Eye, Edit, Check, Trash, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import PaginationHeader from '../../../_components/PaginationHeader'
import Pagination from '../../../_components/Pagination'
import { City, Country, State } from 'country-state-city'
import axios from 'axios'
import { API_BASE_URL, apiConstants } from '../../../../constants'
import moment from 'moment'
import { enqueueSnackbar } from 'notistack'
import Loader from '../../../_components/Loader'
import useStore from '../../../../stores/useStore'
import ConfirmationModal from '../../../_components/ConfirmationModal'
import Link from 'next/link'

export default function TrainingAndGymFacilities() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedStyles, setSelectedStyles] = useState([])
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(3)
  const [limit, setLimit] = useState(10)
  const user = useStore((state) => state.user)

  const [loading, setLoading] = useState(false)
  const [facilities, setFacilities] = useState([])

  const [isDelete, setIsDelete] = useState(false)
  const [selectedFacility, setSelectedFacility] = useState(null)

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

  const getTrainingFacilities = async () => {
    setLoading(true)

    try {
      const queryParams = {
        status: 'adminApproved',
        page: currentPage,
        limit,
        search: searchQuery,
        country: selectedCountry,
        state: selectedState,
        city: selectedCity,
        facilityStatus: selectedStatus,
        approvalStatus: selectedApprovalStatus,
        martialArtsStyle: selectedStyles,
      }

      const filteredParams = Object.fromEntries(
        Object.entries(queryParams).filter(([key, value]) => {
          // Skip if value is:
          // - empty string
          // - null or undefined
          // - an empty array
          if (value === '' || value === null || value === undefined)
            return false
          if (Array.isArray(value) && value.length === 0) return false
          return true
        })
      )

      const queryString = new URLSearchParams(filteredParams).toString()
      const response = await axios.get(
        `${API_BASE_URL}/training-facilities?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )

      setFacilities(response.data.data.items)
      setTotalPages(response.data.data.pagination.totalPages)
      setTotalItems(response.data.data.pagination.totalItems)
    } catch (error) {
      console.error('Error fetching training facilities:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getTrainingFacilities()
  }, [
    currentPage,
    limit,
    searchQuery,
    selectedCountry,
    selectedState,
    selectedCity,
    selectedStyles,
    selectedStatus,
    selectedApprovalStatus,
  ])

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCountry('')
    setSelectedState('')
    setSelectedCity('')
    setSelectedStyles([])
    setSelectedStatus('')
    setSelectedApprovalStatus('')
  }

  const handleApprove = async (facilityId) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/training-facilities/${facilityId}`,
        {
          adminApproveStatus: 'Approved',
        }
      )
      console.log(response)
      if (response.status === apiConstants.success) {
        enqueueSnackbar('Approved successfully', { variant: 'success' })
        getTrainingFacilities()
      }
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || 'Something went wrong',
        { variant: 'error' }
      )
    }
  }

  const handleToggleStatus = async (facility) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/training-facilities/${facility._id}`,
        {
          facilityStatus:
            facility.facilityStatus === 'Active' ? 'Suspended' : 'Active',
        }
      )
      console.log(response)
      if (response.status === apiConstants.success) {
        enqueueSnackbar('Status updated successfully', { variant: 'success' })
        getTrainingFacilities()
      }
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || 'Something went wrong',
        { variant: 'error' }
      )
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/training-facilities/${id}`
      )

      if (res.status == apiConstants.success) {
        enqueueSnackbar(res.data.message, {
          variant: 'success',
        })
        setIsDelete(false)
        getTrainingFacilities()
      }
    } catch (error) {
      enqueueSnackbar('Failed to delete training facility,try again', {
        variant: 'error',
      })
      console.log('Failed to delete training facility:', error)
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
                <option value='' className='text-black'>
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
                <option value='' className='text-black'>
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
              selectedStatus ||
              selectedApprovalStatus ||
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
          {loading ? (
            <Loader />
          ) : (
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
                  {facilities && facilities.length > 0 ? (
                    facilities.map((facility, index) => (
                      <tr
                        key={facility._id}
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
                          {facility.name}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis'>
                          {facility.address}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis'>
                          {facility.martialArtsStyles?.join(', ')}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis'>
                          <span
                            className={getStatusBadge(facility.facilityStatus)}
                          >
                            {facility.facilityStatus}
                          </span>
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis'>
                          <span
                            className={getApprovalBadge(
                              facility.adminApproveStatus
                            )}
                          >
                            {facility.adminApproveStatus}
                          </span>
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap'>
                          {moment(facility.createdAt).format('DD-MM-YYYY')}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap'>
                          {facility.createdBy?.firstName}{' '}
                          {facility.createdBy?.middleName ?? ''}{' '}
                          {facility.createdBy?.lastName}
                        </td>
                        <td className='px-4 py-3 text-center'>
                          {facility.trainers?.length ?? 0}
                        </td>
                        <td className='px-4 py-3 text-center'>
                          {facility.fighters?.length ?? 0}
                        </td>
                        <td className='p-4 align-middle'>
                          <div className='flex items-center justify-start space-x-4'>
                            <Link
                              href={`/admin/training-and-gym-facilities/view/${facility._id}`}
                            >
                              <button
                                className='text-gray-400 hover:text-gray-200 transition flex items-center justify-center'
                                title='View Profile'
                              >
                                <Eye size={18} />
                              </button>
                            </Link>
                            <Link
                              href={`/admin/training-and-gym-facilities/edit/${facility._id}`}
                            >
                              <button
                                className='text-green-400 hover:text-green-300'
                                title='Edit'
                              >
                                <Edit size={18} />
                              </button>
                            </Link>
                            {facility.adminApproveStatus === 'Pending' && (
                              <button
                                onClick={() => handleApprove(facility._id)}
                                className='text-blue-400 hover:text-blue-300'
                                title='Approve'
                              >
                                <Check size={18} />
                              </button>
                            )}
                            {/* status toggle */}
                            <button
                              onClick={() => handleToggleStatus(facility)}
                              className='relative inline-flex h-4 w-8 rounded-full transition-colors
             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                              aria-label={
                                facility.facilityStatus === 'Active'
                                  ? 'Suspend'
                                  : 'Activate'
                              }
                            >
                              {/* track */}
                              <span
                                className={`absolute inset-0 rounded-full
                ${
                  facility.facilityStatus === 'Active'
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }
                transition-colors`}
                              />

                              {/* thumb */}
                              <span
                                className={`inline-block h-4 w-4 bg-white rounded-full shadow transform
                transition-transform duration-200
                ${
                  facility.facilityStatus === 'Active'
                    ? 'translate-x-5'
                    : 'translate-x-0'
                }`}
                              />
                            </button>
                            {facility.sendInvites && (
                              <a
                                href={`mailto:${facility.trainers
                                  ?.map((trainer) => trainer.email)
                                  .join(',')}?subject=${encodeURIComponent(
                                  'IKF Fight Platform – Complete Your Registration'
                                )}&body=${encodeURIComponent(
                                  `Dear Trainer,\n\nYou have been invited to join the IKF Fight Platform as a trainer for the facility ${facility.name}.\n\nPlease complete your registration by clicking the link sent to your email or contact us if you have any issues.\n\nThis is an automated reminder from the IKF Fight Platform to help complete pending registrations.\n\nThank you,\nIKF Fight Platform Team`
                                )}`}
                                className='text-purple-400 hover:text-purple-300'
                                title='Send Invite to Trainers'
                              >
                                <Mail size={18} />
                              </a>
                            )}
                            <button
                              onClick={() => {
                                setIsDelete(true)
                                setSelectedFacility(facility._id)
                              }}
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
          )}
          {/* Confirmation Modal */}
          <ConfirmationModal
            isOpen={isDelete}
            onClose={() => setIsDelete(false)}
            onConfirm={() => handleDelete(selectedFacility)}
            title='Delete Facility'
            message='Are you sure you want to delete this training facility?'
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
