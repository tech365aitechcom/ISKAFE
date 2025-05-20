'use client'

import { Search, Trash, Plus, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import PaginationHeader from '../../../../_components/PaginationHeader'
import Pagination from '../../../../_components/Pagination'

export function SuspensionTable({
  suspensions,
  limit,
  setLimit,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
  onSuccess,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedType, setSelectedType] = useState('')

  const filteredSuspensions = suspensions.filter((suspension) => {
    const matchesSearch = suspension.person
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus
      ? suspension.status === selectedStatus
      : true
    const matchesType = selectedType ? suspension.type === selectedType : true
    return matchesSearch && matchesStatus && matchesType
  })

  const handleDelete = (id) => {
    console.log('Deleting suspension with ID:', id)
  }

  const handleUpdate = (suspension) => {
    console.log('Editing suspension:', suspension)
  }

  const handleResetFilter = () => {
    setSelectedStatus('')
    setSelectedType('')
    setSearchQuery('')
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const renderHeader = (label) => (
    <th className='px-4 pb-3 whitespace-nowrap cursor-pointer'>
      <div className='flex items-center gap-1'>{label}</div>
    </th>
  )

  return (
    <>
      {/* Search */}
      <div className='relative mb-6'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
          <Search size={18} className='text-gray-400' />
        </div>
        <input
          type='text'
          className='bg-transparent border border-gray-700 text-white rounded-md pl-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600'
          placeholder='Search by Person Name...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
        <div className='relative'>
          <label className='block mb-2 text-sm font-medium text-white'>
            Status
          </label>
          <div className='relative'>
            <select
              className='w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-white appearance-none outline-none'
              value={selectedStatus || ''}
              onChange={(e) => setSelectedStatus(e.target.value || null)}
            >
              <option value='' className='text-black'>
                All
              </option>
              <option value='Active' className='text-black'>
                Active
              </option>
              <option value='Inactive' className='text-black'>
                Inactive
              </option>
            </select>
          </div>
        </div>
        <div className='relative'>
          <label className='block mb-2 text-sm font-medium text-white'>
            Type
          </label>
          <div className='relative'>
            <select
              className='w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-white appearance-none outline-none'
              value={selectedType || ''}
              onChange={(e) => setSelectedType(e.target.value || null)}
            >
              <option value='' className='text-black'>
                All
              </option>
              <option value='Disciplinary' className='text-black'>
                Disciplinary
              </option>
              <option value='Medical' className='text-black'>
                Medical
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Reset Filters */}
      {(selectedStatus || selectedType) && (
        <div className='flex justify-end mb-6'>
          <button
            className='border border-gray-700 text-white rounded-lg px-4 py-2 hover:bg-gray-700 transition'
            onClick={handleResetFilter}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Table */}
      <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
        <PaginationHeader
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          totalItems={totalItems}
          label='suspensions'
        />
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left'>
            <thead>
              <tr className='text-gray-400 text-sm'>
                {renderHeader('ID')}
                {renderHeader('Status')}
                {renderHeader('Type')}
                {renderHeader('Occurred')}
                {renderHeader('OK to Train')}
                {renderHeader('OK to Compete')}
                {renderHeader('Indefinite')}
                {renderHeader('Person')}
                {renderHeader('Actions')}
              </tr>
            </thead>
            <tbody>
              {filteredSuspensions && filteredSuspensions.length > 0 ? (
                filteredSuspensions.map((suspension, index) => (
                  <tr
                    key={suspension.id || index}
                    className={`${
                      index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                    }`}
                  >
                    <td className='p-4'>
                      {suspension.id || `SUS-${index + 1}`}
                    </td>
                    <td className='p-4'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          suspension.status === 'Active'
                            ? 'bg-green-800 text-green-200'
                            : 'bg-red-800 text-red-200'
                        }`}
                      >
                        {suspension.status}
                      </span>
                    </td>
                    <td className='p-4'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          suspension.type === 'Disciplinary'
                            ? 'bg-orange-800 text-orange-200'
                            : 'bg-blue-800 text-blue-200'
                        }`}
                      >
                        {suspension.type}
                      </span>
                    </td>
                    <td className='p-4'>{formatDate(suspension.occurred)}</td>
                    <td className='p-4'>{formatDate(suspension.okToTrain)}</td>
                    <td className='p-4'>
                      {formatDate(suspension.okToCompete)}
                    </td>
                    <td className='p-4'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          suspension.indefinite
                            ? 'bg-red-800 text-red-200'
                            : 'bg-gray-800 text-gray-200'
                        }`}
                      >
                        {suspension.indefinite ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className='p-4'>
                      {suspension.person ? (
                        <a
                          href={`#`}
                          className='text-blue-400 hover:text-blue-300 underline'
                        >
                          {suspension.person}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className='p-4 py-8 flex items-center space-x-2'>
                      <button
                        onClick={() => handleUpdate(suspension)}
                        className='bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs'
                      >
                        Save/Update
                      </button>
                      <button
                        onClick={() => handleDelete(suspension.id)}
                        className='text-red-600 hover:text-red-400'
                      >
                        <Trash size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className='text-center bg-[#0A1330]'>
                  <td colSpan='9' className='p-4'>
                    No suspensions found.
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
    </>
  )
}
