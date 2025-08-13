import React from 'react'
import { User, Ticket, Clock } from 'lucide-react'
import PaginationHeader from '../../../../_components/PaginationHeader'
import Pagination from '../../../../_components/Pagination'

export default function RedemptionList({
  filteredRedemptions,
  redemptionSearchQuery,
  setRedemptionSearchQuery,
  redemptionDateFilter,
  setRedemptionDateFilter,
  redemptionLocationFilter,
  setRedemptionLocationFilter,
  redemptionStatusFilter,
  setRedemptionStatusFilter,
  paginatedRedemptions,
  redemptionPagination,
  setRedemptionPagination,
}) {
  return (
    <div>
      <div className='flex flex-col mb-6'>
        <h2 className='text-lg font-medium mb-4'>
          Redemption List ({filteredRedemptions.length})
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4'>
          <input
            type='text'
            className='bg-[#0A1330] border border-gray-700 text-white rounded px-3 py-2'
            placeholder='Search redemptions...'
            value={redemptionSearchQuery}
            onChange={(e) => setRedemptionSearchQuery(e.target.value)}
          />

          <input
            type='date'
            className='bg-[#0A1330] border border-gray-700 text-white rounded px-3 py-2'
            value={redemptionDateFilter}
            onChange={(e) => setRedemptionDateFilter(e.target.value)}
            placeholder='Filter by date'
          />

          <input
            type='text'
            className='bg-[#0A1330] border border-gray-700 text-white rounded px-3 py-2'
            placeholder='Filter by location'
            value={redemptionLocationFilter}
            onChange={(e) => setRedemptionLocationFilter(e.target.value)}
          />

          <select
            className='bg-[#0A1330] border border-gray-700 text-white rounded px-3 py-2'
            value={redemptionStatusFilter}
            onChange={(e) => setRedemptionStatusFilter(e.target.value)}
          >
            <option value='all'>All Statuses</option>
            <option value='checked-in'>Checked-In</option>
            <option value='not-checked-in'>Not Checked-In</option>
            <option value='already-used'>Already Used</option>
          </select>
        </div>
      </div>

      <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
        <PaginationHeader
          limit={redemptionPagination.pageSize}
          setLimit={(newSize) =>
            setRedemptionPagination((prev) => ({
              ...prev,
              pageSize: newSize,
              currentPage: 1,
            }))
          }
          currentPage={redemptionPagination.currentPage}
          totalItems={redemptionPagination.totalItems}
          label='redemptions'
        />
        {paginatedRedemptions.length > 0 ? (
          <div className='overflow-x-auto custom-scrollbar'>
            <table className='w-full text-sm text-left'>
              <thead>
                <tr className='text-gray-400 text-sm'>
                  <th className='px-4 pb-3 whitespace-nowrap'>Ticket Code</th>
                  <th className='px-4 pb-3 whitespace-nowrap'>Buyer Name</th>
                  <th className='px-4 pb-3 whitespace-nowrap'>Type</th>
                  <th className='px-4 pb-3 whitespace-nowrap text-right'>
                    Price
                  </th>
                  <th className='px-4 pb-3 whitespace-nowrap'>Redeemed At</th>
                  <th className='px-4 pb-3 whitespace-nowrap'>Redeemed By</th>
                  <th className='px-4 pb-3 whitespace-nowrap'>Entry Mode</th>
                  <th className='px-4 pb-3 whitespace-nowrap'>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRedemptions.map((redemption, index) => (
                  <tr
                    key={redemption.id}
                    className={`cursor-pointer ${
                      index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                    }`}
                  >
                    <td className='p-4 whitespace-nowrap font-mono'>
                      {redemption.code}
                    </td>
                    <td className='p-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <User size={16} className='mr-2 text-gray-400' />
                        {redemption.name}
                      </div>
                    </td>
                    <td className='p-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <Ticket size={16} className='mr-2 text-gray-400' />
                        {redemption.type}
                      </div>
                    </td>
                    <td className='p-4 whitespace-nowrap text-right'>
                      ${redemption.price?.toFixed(2) || '0.00'}
                    </td>
                    <td className='p-4 whitespace-nowrap'>
                      {redemption.redeemedAt ? (
                        <div className='flex items-center'>
                          <Clock size={16} className='mr-2 text-gray-400' />
                          {new Date(redemption.redeemedAt).toLocaleString()}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className='p-4 whitespace-nowrap'>
                      {redemption.redeemedBy || '-'}
                    </td>
                    <td className='p-4 whitespace-nowrap capitalize'>
                      {redemption.entryMode}
                    </td>
                    <td className='p-4 whitespace-nowrap'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          redemption.status === 'checked-in'
                            ? 'bg-green-900/50 text-green-400'
                            : redemption.status === 'not-checked-in'
                            ? 'bg-yellow-900/50 text-yellow-400'
                            : redemption.status === 'already-used'
                            ? 'bg-red-900/50 text-red-400'
                            : 'bg-gray-900/50 text-gray-400'
                        }`}
                      >
                        {redemption.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className='text-center py-12 text-gray-400 bg-[#0A1330]'>
            <p>No ticket redemptions yet</p>
          </div>
        )}
        <Pagination
          currentPage={redemptionPagination.currentPage}
          totalPages={redemptionPagination.totalPages}
          onPageChange={(page) =>
            setRedemptionPagination((prev) => ({
              ...prev,
              currentPage: page,
            }))
          }
        />
      </div>
    </div>
  )
}
