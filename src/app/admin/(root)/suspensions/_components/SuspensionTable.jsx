'use client'

import { Search, Check, X } from 'lucide-react'
import { useState } from 'react'
import PaginationHeader from '../../../../_components/PaginationHeader'
import Pagination from '../../../../_components/Pagination'
import moment from 'moment'
import { API_BASE_URL, apiConstants } from '../../../../../constants'
import { enqueueSnackbar } from 'notistack'
import axios from 'axios'
import ActionButtons from '../../../../_components/ActionButtons'
import ConfirmationModal from '../../../../_components/ConfirmationModal'

export function SuspensionTable({
  suspensions,
  limit,
  setLimit,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
  onSuccess,
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  selectedType,
  setSelectedType,
}) {
  const [isDelete, setIsDelete] = useState(false)
  const [selectedSuspension, setSelectedSuspension] = useState(null)

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/suspensions/${id}`)

      if (res.status == apiConstants.success) {
        enqueueSnackbar(res.data.message, {
          variant: 'success',
        })
        setIsDelete(false)
        onSuccess()
      }
    } catch (error) {
      enqueueSnackbar('Failed to delete news,try again', {
        variant: 'error',
      })
      console.log('Failed to delete news:', error)
    }
  }

  const handleSearch = () => {
    onSuccess()
  }

  const handleResetFilter = () => {
    setSelectedStatus('')
    setSelectedType('')
    setSearchQuery('')
    onSuccess()
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
              <option value='Pending' className='text-black'>
                Pending
              </option>
              <option value='Closed' className='text-black'>
                Closed
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
      {(selectedStatus || selectedType || searchQuery) && (
        <div className='flex gap-2 justify-end mb-6'>
          <button
            className='bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition'
            onClick={handleSearch}
          >
            Search
          </button>
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
        <div className='overflow-x-auto custom-scrollbar'>
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
              {suspensions && suspensions.length > 0 ? (
                suspensions.map((suspension, index) => (
                  <tr
                    key={suspension._id}
                    className={`${
                      index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                    }`}
                  >
                    <td className='p-4'>{suspension._id}</td>
                    <td className='p-4'>{suspension.status}</td>
                    <td className='p-4'>{suspension.type}</td>
                    <td className='p-4'>
                      {moment(suspension.incidentDate).format('MM/DD/YYYY')}
                    </td>
                    <td className='p-4'>
                      {moment(suspension.incidentDate)
                        .add(suspension.daysWithoutTraining, 'days')
                        .format('MM/DD/YYYY')}
                    </td>
                    <td className='p-4'>
                      {moment(suspension.incidentDate)
                        .add(suspension.daysBeforeCompeting, 'days')
                        .format('MM/DD/YYYY')}
                    </td>
                    <td className='p-4'>
                      {suspension.indefinite ? <Check /> : <X />}
                    </td>
                    <td className='p-4'>
                      {suspension.person ? (
                        <a href={`#`} className=''>
                          {[
                            suspension.person?.firstName,
                            suspension.person?.middleName,
                            suspension.person?.lastName,
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className='p-4 align-middle'>
                      <ActionButtons
                        viewUrl={`/admin/suspensions/view/${suspension._id}`}
                        editUrl={`/admin/suspensions/edit/${suspension._id}`}
                        onDelete={() => {
                          setIsDelete(true)
                          setSelectedSuspension(suspension._id)
                        }}
                      />
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

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDelete}
          onClose={() => setIsDelete(false)}
          onConfirm={() => handleDelete(selectedSuspension)}
          title='Delete Suspension'
          message='Are you sure you want to delete suspension?'
        />
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  )
}
