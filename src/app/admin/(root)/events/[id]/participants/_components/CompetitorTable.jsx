'use client'

import Pagination from '../../../../../../_components/Pagination'
import PaginationHeader from '../../../../../../_components/PaginationHeader'
import { Phone, Mail, FileText, User, CheckCircle, XCircle } from 'lucide-react'

export default function CompetitorTable({
  competitors,
  calculateAge,
  onViewRegistration,
  loading,
  limit,
  setLimit,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
}) {
  const formatType = (registrationType) => {
    return (
      registrationType?.charAt(0).toUpperCase() + registrationType?.slice(1) ||
      'N/A'
    )
  }

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A'
    // Format as (XXX) XXX-XXXX if possible
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`
    }
    return phone
  }

  return (
    <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
      <PaginationHeader
        limit={limit}
        setLimit={setLimit}
        currentPage={currentPage}
        totalItems={totalItems}
        label='competitors'
      />
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse'>
          <thead>
            <tr className='bg-[#0A1330] text-left border-b border-gray-700'>
              <th className='p-4 text-sm font-medium text-gray-300'>Type</th>
              <th className='p-4 text-sm font-medium text-gray-300'>
                First Name
              </th>
              <th className='p-4 text-sm font-medium text-gray-300'>
                Last Name
              </th>
              <th className='p-4 text-sm font-medium text-gray-300'>Age</th>
              <th className='p-4 text-sm font-medium text-gray-300'>Email</th>
              <th className='p-4 text-sm font-medium text-gray-300'>Phone</th>
              <th className='p-4 text-sm font-medium text-gray-300'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className='p-8 text-center'>
                  <div className='flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500'></div>
                    <span className='ml-3'>Loading participants...</span>
                  </div>
                </td>
              </tr>
            ) : competitors.length === 0 ? (
              <tr>
                <td colSpan={8} className='p-8 text-center text-gray-400'>
                  No participants found
                </td>
              </tr>
            ) : (
              competitors.map((competitor, index) => {
                return (
                  <tr
                    key={competitor._id || index}
                    className='border-b border-gray-700 hover:bg-[#0A1330]/50 transition-colors'
                  >
                    <td className='p-4'>
                      <div className='flex items-center gap-2'>
                        <User size={16} className='text-gray-400' />
                        <span className='font-medium'>
                          {formatType(competitor.registrationType)}
                        </span>
                      </div>
                    </td>
                    <td className='p-4 whitespace-nowrap'>
                      {competitor.firstName}
                    </td>
                    <td className='p-4 whitespace-nowrap'>
                      {competitor.lastName}
                    </td>
                    <td className='p-4 whitespace-nowrap'>
                      {calculateAge(competitor.dateOfBirth)}
                    </td>
                    <td className='p-4 whitespace-nowrap'>
                      <div className='flex items-center gap-2'>
                        <Mail size={14} className='text-gray-400' />
                        <span className='text-sm break-all'>
                          {competitor.email || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className='p-4 whitespace-nowrap'>
                      <div className='flex items-center gap-2'>
                        <Phone size={14} className='text-gray-400' />
                        <span className='text-sm'>
                          {formatPhoneNumber(competitor.phoneNumber)}
                        </span>
                      </div>
                    </td>

                    <td className='p-4'>
                      <button
                        onClick={() => onViewRegistration(competitor)}
                        className='flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors'
                      >
                        <FileText size={14} />
                        View Details
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
