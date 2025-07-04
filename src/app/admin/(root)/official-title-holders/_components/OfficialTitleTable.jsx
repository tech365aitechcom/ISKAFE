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
  selectedSport,
  setSelectedSport,
  selectedProClassification,
  setSelectedProClassification,
}) {
  const [isDelete, setIsDelete] = useState(false)
  const [selectedTitle, setSelectedTitle] = useState(null)

  const [sports, setSports] = useState([])
  const [isLoadingSports, setIsLoadingSports] = useState(false)

  const [proClassifications, setProClassifications] = useState([])

  const getSports = async () => {
    setIsLoadingSports(true)
    try {
      const response = await axios.get(
        `${API_BASE_URL}/master/proClassifications`
      )
      console.log('Sports response:', response.data)

      const selectedClassification = response.data.result.find(
        (classification) =>
          classification.label.toLowerCase() ===
          selectedProClassification.toLowerCase()
      )
      const sportsArray = selectedClassification?.sports || []
      setSports(sportsArray)
    } catch (error) {
      setSports([])
    } finally {
      setIsLoadingSports(false)
    }
  }

  const getProClassifications = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/master/proClassifications`
      )
      console.log('Sports response:', response.data)

      const proClassificationOptions = response.data.result.map(
        (classification) => classification.label
      )
      setProClassifications(proClassificationOptions)
    } catch (error) {
      setProClassifications([])
    }
  }

  useEffect(() => {
    getProClassifications()
  }, [])

  const handleDeleteTitle = async (titleId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/official-title-holders/${titleId}`
      )
      enqueueSnackbar(response.data.message, { variant: 'success' })
      setIsDelete(false)
      if (onSuccess)
        onSuccess({
          selectedProClassification: '',
          selectedSport: '',
        })
    } catch (error) {
      enqueueSnackbar('Failed to delete title', { variant: 'error' })
    }
  }

  const handleSearch = async () => {
    onSuccess({
      selectedProClassification,
      selectedSport,
    })
  }

  const handleResetFilter = () => {
    setSelectedProClassification('')
    setSelectedSport('')
    setSearchQuery('')
    onSuccess({
      selectedProClassification: '',
      selectedSport: '',
    })
  }

  const renderHeader = (label, key) => (
    <th className='px-4 pb-3 whitespace-nowrap cursor-pointer'>
      <div className='flex items-center gap-1'>{label}</div>
    </th>
  )

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
              <option value='' className='bg-gray-800'>
                All Classifications
              </option>
              {proClassifications.map((option) => (
                <option key={option} value={option} className='bg-gray-800'>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Sport Dropdown */}
          {sports.length > 0 && (
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
                {sports.map((sport, index) => (
                  <option
                    key={index}
                    value={sport.label}
                    className='bg-gray-800'
                  >
                    {sport.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Get Sports Button */}
          {selectedProClassification && selectedProClassification !== '' && (
            <div className='flex items-end'>
              <button
                onClick={getSports}
                disabled={isLoadingSports}
                className='bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition-colors duration-200 w-fit text-sm'
              >
                {isLoadingSports ? 'Getting Sports...' : 'Get Sports'}
              </button>
            </div>
          )}
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
          {selectedProClassification &&
            selectedProClassification !== '' &&
            selectedSport && (
              <div className='flex items-end gap-2'>
                <button
                  onClick={handleSearch}
                  className='bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition-colors duration-200 w-fit text-sm'
                >
                  Apply Filters
                </button>
                <button
                  className='border border-gray-700 text-white rounded-lg px-4 py-1.5 hover:bg-gray-700 transition'
                  onClick={handleResetFilter}
                >
                  Reset Filters
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
              {officialTitles && officialTitles.length > 0 ? (
                officialTitles.map((title, index) => {
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
