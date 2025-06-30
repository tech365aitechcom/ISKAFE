'use client'

import axios from 'axios'
import { Search } from 'lucide-react'
import { enqueueSnackbar } from 'notistack'
import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../../../../constants'
import ConfirmationModal from '../../../../_components/ConfirmationModal'
import PaginationHeader from '../../../../_components/PaginationHeader'
import Pagination from '../../../../_components/Pagination'
import ActionButtons from '../../../../_components/ActionButtons'

export function OfficialTitleTable({
  officialTitles,
  limit,
  setLimit,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
  onSuccess,
  searchQuery,
  setSearchQuery,
}) {
  const [isDelete, setIsDelete] = useState(false)
  const [selectedTitle, setSelectedTitle] = useState(null)

  // New state for filters
  const [sports, setSports] = useState([])
  const [selectedSport, setSelectedSport] = useState('')
  const [selectedProClassification, setSelectedProClassification] = useState('')
  const [isLoadingSports, setIsLoadingSports] = useState(false)
  const [isLoadingTitleHolders, setIsLoadingTitleHolders] = useState(false)
  const [sportsLoadAttempted, setSportsLoadAttempted] = useState(false)
  const [filtersChanged, setFiltersChanged] = useState(false)

  // Pro Classification options
  const proClassificationOptions = [
    { value: '', label: 'All Classifications' },
    { value: 'professional', label: 'Professional' },
    { value: 'amateur', label: 'Amateur' },
    { value: 'semi-professional', label: 'Semi-Professional' },
  ]

  // Get Sports function
  const getSports = async () => {
    setIsLoadingSports(true)
    try {
      // Try different possible endpoints for sports
      let response
      try {
        response = await axios.get(`${API_BASE_URL}/sports`)
      } catch (error) {
        // Try alternative endpoint if first fails
        response = await axios.get(`${API_BASE_URL}/sport`)
      }

      const sportsData =
        response.data.data || response.data.sports || response.data || []
      setSports(Array.isArray(sportsData) ? sportsData : [])

      if (Array.isArray(sportsData) && sportsData.length > 0) {
        enqueueSnackbar('Sports loaded successfully', { variant: 'success' })
      } else {
        enqueueSnackbar('No sports data available', { variant: 'warning' })
      }
    } catch (error) {
      console.error('Error fetching sports:', error)
      // Only show warning if it's a manual refresh (not on component mount)
      if (sportsLoadAttempted) {
        enqueueSnackbar('Sports endpoint not available', { variant: 'warning' })
      }
    } finally {
      setIsLoadingSports(false)
      setSportsLoadAttempted(true)
    }
  }

  // Get Title Holders function
  const getTitleHolders = async () => {
    setIsLoadingTitleHolders(true)
    try {
      const params = new URLSearchParams()
      if (selectedSport) params.append('sport', selectedSport)
      if (selectedProClassification)
        params.append('proClassification', selectedProClassification)
      if (searchQuery) params.append('search', searchQuery)
      params.append('page', currentPage)
      params.append('limit', limit)

      const response = await axios.get(
        `${API_BASE_URL}/official-title-holders?${params.toString()}`
      )

      // Trigger onSuccess to refresh the data in parent component
      if (onSuccess) {
        onSuccess(response.data)
      }
      enqueueSnackbar('Title holders refreshed successfully', {
        variant: 'success',
      })
      setFiltersChanged(false)
    } catch (error) {
      enqueueSnackbar('Failed to refresh title holders', { variant: 'error' })
      console.error('Error fetching title holders:', error)
    } finally {
      setIsLoadingTitleHolders(false)
    }
  }

  // Load sports on component mount (only once)
  useEffect(() => {
    // Only try to load sports if we haven't attempted yet
    if (!sportsLoadAttempted) {
      getSports()
    }
  }, [sportsLoadAttempted]) // Depend on sportsLoadAttempted to prevent multiple calls

  // Track filter changes
  useEffect(() => {
    if (selectedSport || selectedProClassification) {
      setFiltersChanged(true)
    }
  }, [selectedSport, selectedProClassification])

  const handleDeleteTitle = async (titleId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/official-title-holders/${titleId}`
      )
      enqueueSnackbar(response.data.message, { variant: 'success' })
      setIsDelete(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      enqueueSnackbar('Failed to delete title', { variant: 'error' })
    }
  }

  const renderHeader = (label, key) => (
    <th className='px-4 pb-3 whitespace-nowrap cursor-pointer'>
      <div className='flex items-center gap-1'>{label}</div>
    </th>
  )

  // ✅ FILTERING LOGIC based on search query and filters
  const filteredTitles = officialTitles.filter((title) => {
    const fullName = `${title.fighter?.userId?.firstName ?? ''} ${
      title.fighter?.userId?.lastName ?? ''
    }`.toLowerCase()
    const titleName = title.title?.toLowerCase() ?? ''
    const weightClass = title.weightClass?.toLowerCase() ?? ''

    // Search filter
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      titleName.includes(searchQuery.toLowerCase()) ||
      weightClass.includes(searchQuery.toLowerCase())

    // Sport filter
    const matchesSport = !selectedSport || title.sport === selectedSport

    // Pro Classification filter
    const matchesProClassification =
      !selectedProClassification ||
      title.fighter?.proClassification === selectedProClassification

    return matchesSearch && matchesSport && matchesProClassification
  })

  return (
    <>
      {/* Filters Section */}
      <div className='mb-6 space-y-4'>
        {/* Filter Row 1: Pro Classification and Sport Dropdowns */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {/* Pro Classification Dropdown */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Pro Classification
            </label>
            <select
              value={selectedProClassification}
              onChange={(e) => setSelectedProClassification(e.target.value)}
              className='bg-transparent border border-gray-700 text-white rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600'
            >
              {proClassificationOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className='bg-gray-800'
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sport Dropdown */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Sport
            </label>
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className='bg-transparent border border-gray-700 text-white rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600'
            >
              <option value='' className='bg-gray-800'>
                All Sports
              </option>
              {sports.map((sport) => (
                <option
                  key={sport._id || sport.id || sport.name}
                  value={sport._id || sport.id || sport.name}
                  className='bg-gray-800'
                >
                  {sport.name || sport.title || sport}
                </option>
              ))}
            </select>
          </div>

          {/* Get Sports Button */}
          <div className='flex items-end'>
            <button
              onClick={getSports}
              disabled={isLoadingSports}
              className='bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition-colors duration-200 w-full text-sm'
            >
              {isLoadingSports ? 'Loading...' : 'Refresh Sports'}
            </button>
          </div>
        </div>

        {/* Second row with search and apply filters button */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Search Bar */}
          <div className='md:col-span-2 relative'>
            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
              <Search size={18} className='text-gray-400' />
            </div>
            <input
              type='text'
              className='bg-transparent border border-gray-700 text-white rounded-md pl-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600'
              placeholder='Search Titles...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Apply Filters Button - Only shown when filters have changed */}
          {filtersChanged && (
            <div className='flex items-end'>
              <button
                onClick={getTitleHolders}
                disabled={isLoadingTitleHolders}
                className='bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition-colors duration-200 w-full text-sm'
              >
                {isLoadingTitleHolders ? 'Applying...' : 'Apply Filters'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
        <PaginationHeader
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          totalItems={totalItems}
          label='Official Titles'
        />
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left'>
            <thead>
              <tr className='text-gray-400 text-sm'>
                {renderHeader('Fighter', 'fighter')}
                {renderHeader('Title', 'title')}
                {renderHeader('Weight Class', 'weightClass')}
                {renderHeader('Sport', 'sport')}
                {renderHeader('Pro Classification', 'proClassification')}
                {renderHeader('Record', 'record')}
                {renderHeader('Actions', 'actions')}
              </tr>
            </thead>
            <tbody>
              {filteredTitles && filteredTitles.length > 0 ? (
                filteredTitles.map((title, index) => {
                  return (
                    <tr
                      key={title._id}
                      className={`cursor-pointer ${
                        index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                      }`}
                    >
                      <td className='p-4 capitalize'>
                        {(() => {
                          const user = title?.user
                          const fullName = `${user?.firstName ?? ''} ${
                            user?.lastName ?? ''
                          }`
                          let age = ''

                          if (user?.dateOfBirth) {
                            const dob = new Date(user.dateOfBirth)
                            const today = new Date()
                            let calculatedAge =
                              today.getFullYear() - dob.getFullYear()
                            const monthDiff = today.getMonth() - dob.getMonth()

                            if (
                              monthDiff < 0 ||
                              (monthDiff === 0 &&
                                today.getDate() < dob.getDate())
                            ) {
                              calculatedAge--
                            }

                            age = ` (${calculatedAge})`
                          }

                          return fullName + age
                        })()}
                      </td>
                      <td className='p-4'>{title.title}</td>
                      <td className='p-4'>{title.weightClass}</td>
                      <td className='p-4'>
                        {sports.find(
                          (sport) =>
                            sport._id === title.sport ||
                            sport.id === title.sport
                        )?.name ||
                          title.sport ||
                          'N/A'}
                      </td>
                      <td className='p-4 capitalize'>
                        {title?.proClassification || 'N/A'}
                      </td>
                      <td className='p-4'>{title.record || 'TODO!'}</td>
                      <td className='p-4 align-middle'>
                        <ActionButtons
                          viewUrl={`/admin/official-title-holders/view/${title._id}`}
                          editUrl={`/admin/official-title-holders/edit/${title._id}`}
                          onDelete={() => {
                            setIsDelete(true)
                            setSelectedTitle(title._id)
                          }}
                        />
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr className='text-center bg-[#0A1330]'>
                  <td colSpan={7} className='p-4'>
                    No Official Titles found.
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
          onConfirm={() => handleDeleteTitle(selectedTitle)}
          title='Delete Title'
          message='Are you sure you want to delete this title?'
        />
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  )
}