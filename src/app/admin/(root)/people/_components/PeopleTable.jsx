'use client'

import axios from 'axios'
import { enqueueSnackbar } from 'notistack'
import { useState } from 'react'
import { API_BASE_URL } from '../../../../../constants'
import ConfirmationModal from '../../../../_components/ConfirmationModal'
import PaginationHeader from '../../../../_components/PaginationHeader'
import Pagination from '../../../../_components/Pagination'
import useStore from '../../../../../stores/useStore'
import { Country } from 'country-state-city'
import ActionButtons from '../../../../_components/ActionButtons'

export function PeopleTable({
  people,
  limit,
  setLimit,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
  onSuccess,
  id,
  setId,
  name,
  setName,
  gender,
  setGender,
  role,
  setRole,
}) {
  const { roles } = useStore()

  const [isDelete, setIsDelete] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState(null)

  const handleDeletePerson = async (personId) => {
    try {
      await axios.delete(`${API_BASE_URL}/people/${personId}`)
      enqueueSnackbar('Person deleted successfully', { variant: 'success' })
      setIsDelete(false)
      if (onSuccess)
        onSuccess({ limit, page: 1, id: '', name: '', gender: '', role: '' })
    } catch (error) {
      enqueueSnackbar('Failed to delete person', { variant: 'error' })
    }
  }

  const handleSearch = () => {
    onSuccess({
      id,
      name,
      gender,
      role,
    })
  }

  const handleResetFilter = () => {
    setId('')
    setName('')
    setGender('')
    setRole('')
    onSuccess({ page: 1, limit, id: '', name: '', gender: '', role: '' })
  }

  // Create column header
  const renderHeader = (label, key) => (
    <th className='px-4 pb-3 whitespace-nowrap cursor-pointer'>
      <div className='flex items-center gap-1'>{label}</div>
    </th>
  )

  return (
    <>
      {/* Search & Filter Controls */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
        {/* ID Filter */}
        <div className='relative'>
          <label className='block mb-2 text-sm font-medium text-white'>
            ID
          </label>
          <input
            type='text'
            className='bg-transparent border border-gray-700 text-white rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600'
            placeholder='e.g., 11358'
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </div>

        {/* Name Filter */}
        <div className='relative'>
          <label className='block mb-2 text-sm font-medium text-white'>
            Name
          </label>
          <input
            type='text'
            className='bg-transparent border border-gray-700 text-white rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600'
            placeholder='e.g., Barry'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Gender Filter */}
        <div className='relative'>
          <label className='block mb-2 text-sm font-medium text-white'>
            Gender
          </label>
          <div className='relative'>
            <select
              className='w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-white appearance-none outline-none'
              value={gender || ''}
              onChange={(e) => setGender(e.target.value || null)}
            >
              <option value='' className='text-black'>
                All
              </option>
              <option value='Male' className='text-black'>
                Male
              </option>
              <option value='Female' className='text-black'>
                Female
              </option>
              <option value='Unspecified' className='text-black'>
                Unspecified
              </option>
            </select>
          </div>
        </div>

        {/* User Type */}
        <div className='relative'>
          <label className='block mb-2 text-sm font-medium text-white'>
            User Type
          </label>
          <div className='relative'>
            <select
              className='w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-white appearance-none outline-none'
              value={role || ''}
              onChange={(e) => setRole(e.target.value || null)}
            >
              <option value='' className='text-black'>
                All
              </option>
              {roles.map((role) => (
                <option
                  key={role?._id}
                  value={role.value}
                  className='text-black'
                >
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reset Filters Button */}
      <div className='flex justify-end mb-6 gap-2'>
        <button
          onClick={handleSearch}
          className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium'
        >
          Get People
        </button>{' '}
        {(id || name || gender || role) && (
          <button
            className='border border-gray-700 text-white rounded-lg px-4 py-2 hover:bg-gray-700 transition'
            onClick={handleResetFilter}
          >
            Reset Filters
          </button>
        )}
      </div>

      <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
        <PaginationHeader
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          totalItems={totalItems}
          label='people'
        />
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left'>
            <thead>
              <tr className='text-gray-400 text-sm'>
                {renderHeader('Serial Number', 'serialNumber')}
                {renderHeader('ID', 'personId')}
                {renderHeader('Name', 'fullName')}
                {renderHeader('Age', 'age')}
                {renderHeader('Gender', 'gender')}
                {renderHeader('Address', 'address')}
                {renderHeader('User Type', 'userType')}
                {renderHeader('Actions', 'actions')}
              </tr>
            </thead>
            <tbody>
              {people && people.length > 0 ? (
                people.map((person, index) => (
                  <tr
                    key={person._id}
                    className={`cursor-pointer ${
                      index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                    }`}
                  >
                    <td className='p-4'>
                      {(currentPage - 1) * limit + index + 1}
                    </td>
                    <td className='p-4'>{person._id}</td>
                    <td className='p-4'>
                      {person.firstName + ' ' + person.lastName}
                    </td>
                    <td className='p-4'>
                      {(() => {
                        if (!person.dateOfBirth) return 'Unknown'

                        const dob = new Date(person.dateOfBirth)
                        if (isNaN(dob.getTime())) return 'Invalid Date'

                        const today = new Date()
                        let age = today.getFullYear() - dob.getFullYear()
                        const monthDiff = today.getMonth() - dob.getMonth()
                        const dayDiff = today.getDate() - dob.getDate()

                        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0))
                          age--

                        return age.toString()
                      })()}
                    </td>
                    <td className='p-4'>{person.gender || 'Unspecified'}</td>
                    <td className='p-4'>
                      {Country.getCountryByCode(person.country).name ||
                        'No Address On File'}
                    </td>
                    <td className='p-4 capitalize'>{person.role}</td>
                    <td className='p-4 align-middle'>
                      <ActionButtons
                        viewUrl={`/admin/people/view/${person._id}`}
                        editUrl={`/admin/people/edit/${person._id}`}
                        onDelete={() => {
                          setIsDelete(true)
                          setSelectedPerson(person._id)
                        }}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr className='text-center bg-[#0A1330]'>
                  <td colSpan={8} className='p-4'>
                    No people found.
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
          onConfirm={() => handleDeletePerson(selectedPerson)}
          title='Delete Person'
          message='Are you sure you want to delete this person?'
        />
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  )
}
