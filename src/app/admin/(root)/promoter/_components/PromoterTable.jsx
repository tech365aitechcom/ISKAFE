'use client'

import axios from 'axios'
import { Search, ExternalLink, Mail, Phone } from 'lucide-react'
import { enqueueSnackbar } from 'notistack'
import { useState } from 'react'
import { API_BASE_URL } from '../../../../../constants'
import ConfirmationModal from '../../../../_components/ConfirmationModal'
import PaginationHeader from '../../../../_components/PaginationHeader'
import Pagination from '../../../../_components/Pagination'
import ActionButtons from '../../../../_components/ActionButtons'

export function PromoterTable({
  promoters,
  searchQuery,
  setSearchQuery,
  limit,
  setLimit,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
  onSuccess,
}) {
  const [isDelete, setIsDelete] = useState(false)
  const [selectedPromoter, setSelectedPromoter] = useState(null)

  const handleDeletePromoter = async (promoterId) => {
    try {
      await axios.delete(`${API_BASE_URL}/promoter/${promoterId}`)
      enqueueSnackbar('Promoter deleted successfully', { variant: 'success' })
      setIsDelete(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      enqueueSnackbar('Failed to delete promoter', { variant: 'error' })
    }
  }

  const renderHeader = (label, key) => (
    <th className='px-4 pb-3 whitespace-nowrap cursor-pointer'>
      <div className='flex items-center gap-1'>{label}</div>
    </th>
  )

  return (
    <>
      <div className='relative mb-6'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-news-none'>
          <Search size={18} className='text-gray-400' />
        </div>
        <input
          type='text'
          className='bg-transparent border border-gray-700 text-white rounded-md pl-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600'
          placeholder='Search name/email/abbr'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
        <PaginationHeader
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          totalItems={totalItems}
          label='promoters'
        />
        <div className='overflow-x-auto custom-scrollbar'>
          <table className='w-full text-sm text-left'>
            <thead>
              <tr className='text-gray-400 text-sm'>
                {renderHeader('ID', 'id')}
                {renderHeader('Promoter Name', 'name')}
                {renderHeader('Abbreviation', 'abbreviation')}
                {renderHeader('Website URL', 'website')}
                {renderHeader('Email Address', 'email')}
                {renderHeader('Contact Number', 'contactNumber')}
                {renderHeader('Sanctioning Body', 'sanctioningBody')}
                {renderHeader('Account Status', 'status')}
                {renderHeader('Actions', 'actions')}
              </tr>
            </thead>
            <tbody>
              {promoters && promoters.length > 0 ? (
                promoters.map((promoter, index) => {
                  return (
                    <tr
                      key={promoter._id}
                      className={`cursor-pointer ${
                        index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                      }`}
                    >
                      <td className='p-4'>{promoter._id}</td>
                      <td className='p-4'>
                        {promoter.user?.firstName} {promoter.user?.middleName}{' '}
                        {promoter.user?.lastName}
                      </td>
                      <td className='p-4'>{promoter.abbreviation}</td>
                      <td className='p-4'>
                        <a
                          href={promoter.websiteURL}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center'
                        >
                          {promoter.websiteURL}
                          <ExternalLink size={14} className='ml-1' />
                        </a>
                      </td>
                      <td className='p-4'>
                        <a
                          href={`mailto:${promoter.user.email}`}
                          className='flex items-center'
                        >
                          {promoter.user.email}
                          <Mail size={14} className='ml-1' />
                        </a>
                      </td>
                      <td className='p-4'>
                        <a
                          href={`tel:${promoter.user.phoneNumber}`}
                          className='flex items-center'
                        >
                          {promoter.user.phoneNumber}
                          <Phone size={14} className='ml-1' />
                        </a>
                      </td>
                      <td className='p-4'>{promoter.sanctioningBody}</td>
                      <td className='p-4'>
                        <span
                          className={`px-2 py-1 rounded ${
                            promoter.accountStatus === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {promoter.accountStatus}
                        </span>
                      </td>
                      <td className='p-4 align-middle'>
                        <ActionButtons
                          viewUrl={`/admin/promoter/view/${promoter._id}`}
                          editUrl={`/admin/promoter/edit/${promoter._id}`}
                          onDelete={() => {
                            setIsDelete(true)
                            setSelectedPromoter(promoter._id)
                          }}
                        />
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr className='text-center bg-[#0A1330]'>
                  <td colSpan={9} className='p-4'>
                    No promoters found.
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
          onConfirm={() => handleDeletePromoter(selectedPromoter)}
          title='Delete Promoter'
          message='Are you sure you want to delete this promoter?'
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
