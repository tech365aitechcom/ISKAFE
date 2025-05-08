'use client'

import axios from 'axios'
import { Eye, SquarePen, Trash, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { enqueueSnackbar } from 'notistack'
import { useState } from 'react'
import { API_BASE_URL } from '../../../../../constants'
import ConfirmationModal from '../../../../_components/ConfirmationModal'
import PaginationHeader from '../../../../_components/PaginationHeader'
import Pagination from '../../../../_components/Pagination'

export function PeopleTable({
  people,
  limit,
  setLimit,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
  onSuccess,
}) {
  // Search and filter states
  const [idQuery, setIdQuery] = useState('')
  const [nameQuery, setNameQuery] = useState('')
  const [selectedGender, setSelectedGender] = useState(null)
  const [selectedUserType, setSelectedUserType] = useState(null)

  // Delete confirmation state
  const [isDelete, setIsDelete] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState(null)

  // Filter the people based on search criteria
  const filteredPeople = people?.filter((person) => {
    const matchesId = idQuery ? person._id === idQuery : true
    const matchesName = nameQuery
      ? person.fullName?.toLowerCase().includes(nameQuery.toLowerCase())
      : true
    const matchesGender = selectedGender
      ? person.gender === selectedGender
      : true
    const matchesUserType = selectedUserType
      ? person.role === selectedUserType
      : true
    console.log(matchesId, 'matchesId')

    return matchesId && matchesName && matchesGender && matchesUserType
  })

  // Handle deletion of a person
  const handleDeletePerson = async (personId) => {
    try {
      await axios.delete(`${API_BASE_URL}/people/${personId}`)
      enqueueSnackbar('Person deleted successfully', { variant: 'success' })
      setIsDelete(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      enqueueSnackbar('Failed to delete person', { variant: 'error' })
    }
  }

  // Reset all filters
  const handleResetFilter = () => {
    setIdQuery('')
    setNameQuery('')
    setSelectedGender(null)
    setSelectedUserType(null)
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
            value={idQuery}
            onChange={(e) => setIdQuery(e.target.value)}
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
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
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
              value={selectedGender || ''}
              onChange={(e) => setSelectedGender(e.target.value || null)}
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
              value={selectedUserType || ''}
              onChange={(e) => setSelectedUserType(e.target.value || null)}
            >
              <option value='' className='text-black'>
                All
              </option>
              <option value='Fighter' className='text-black'>
                Fighter
              </option>
              <option value='Trainer' className='text-black'>
                Trainer
              </option>
              <option value='Coach' className='text-black'>
                Coach
              </option>
              <option value='User' className='text-black'>
                User
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Reset Filters Button */}
      {(idQuery || nameQuery || selectedGender || selectedUserType) && (
        <div className='flex justify-end mb-6'>
          <button
            className='border border-gray-700 text-white rounded-lg px-4 py-2 hover:bg-gray-700 transition'
            onClick={handleResetFilter}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Search Button */}
      {/* <div className='flex justify-center mb-6'>
        <button
          className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium'

        >
          Get People
        </button>
      </div> */}

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
              {filteredPeople && filteredPeople.length > 0 ? (
                filteredPeople.map((person, index) => (
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
                    <td className='p-4'>{person.fullName}</td>
                    <td className='p-4'>
                      {(() => {
                        const dob = new Date(person.dateOfBirth)
                        const today = new Date()
                        let age = today.getFullYear() - dob.getFullYear()
                        const monthDiff = today.getMonth() - dob.getMonth()
                        const dayDiff = today.getDate() - dob.getDate()
                        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0))
                          age--
                        return age
                      })()}
                    </td>
                    <td className='p-4'>{person.gender}</td>
                    <td className='p-4'>
                      {person.address || 'No Address On File'}
                    </td>
                    <td className='p-4'>{person.role}</td>
                    <td className='p-4'>
                      <div className='flex space-x-4 items-center'>
                        <Link href={`/admin/people/view/${person._id}`}>
                          <button className='text-gray-400 hover:text-gray-200 transition'>
                            <Eye size={20} />
                          </button>
                        </Link>
                        <Link href={`/admin/people/edit/${person._id}`}>
                          <button className='text-blue-500 hover:underline'>
                            <SquarePen size={20} />
                          </button>
                        </Link>
                        <button
                          onClick={() => {
                            setIsDelete(true)
                            setSelectedPerson(person._id)
                          }}
                          className='text-red-600 hover:text-red-400 transition'
                        >
                          <Trash size={20} />
                        </button>
                      </div>
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
