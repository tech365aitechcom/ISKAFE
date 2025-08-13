import Pagination from '../../../../_components/Pagination'
import PaginationHeader from '../../../../_components/PaginationHeader'

export function CodesTable({
  cashCodes,
  limit,
  setLimit,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
}) {
  const renderHeader = (label, key) => (
    <th className='px-4 pb-3 whitespace-nowrap'>
      <div className='flex items-center gap-1'>{label}</div>
    </th>
  )

  return (
    <div className='border border-[#343B4F] rounded-lg overflow-hidden mt-6'>
      <PaginationHeader
        limit={limit}
        setLimit={setLimit}
        currentPage={currentPage}
        totalItems={totalItems}
        label='cash codes'
      />
      <div className='overflow-x-auto'>
        <table className='w-full text-sm text-left'>
          <thead>
            <tr className='text-gray-400 text-sm'>
              {renderHeader('Ticket Code', 'code')}
              {renderHeader('Name', 'name')}
              {renderHeader('Event Name', 'eventName')}
              {renderHeader('Payment Type', 'paymentType')}
              {renderHeader('Amount Paid', 'amount')}
              {renderHeader('Issued At', 'issuedAt')}
              {renderHeader('Issued By', 'issuedBy')}
              {renderHeader('Redemption Status', 'status')}
              {renderHeader('Redeemed At', 'redeemed')}
              {renderHeader('Notes', 'notes')}
            </tr>
          </thead>
          <tbody>
            {cashCodes.map((user, index) => (
              <tr
                key={index}
                className={`cursor-pointer ${
                  index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                }`}
              >
                <td className='p-4 font-mono'>{user.code}</td>
                <td className='p-4'>{user.name}</td>
                <td className='p-4'>{user.event.name}</td>
                <td className='p-4 capitalize'>{user.paymentType}</td>
                <td className='p-4'>${user.amountPaid}</td>
                <td className='p-4'>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleString()
                    : 'N/A'}
                </td>
                <td className='p-4'>
                  {user.createdBy.firstName + ' ' + user.createdBy.lastName}
                </td>
                <td className='p-4'>{user.redemptionStatus}</td>
                <td className='p-4'>
                  {user.redeemedAt
                    ? new Date(user.redeemedAt).toLocaleString()
                    : '-'}
                </td>
                <td className='p-4'>{user.paymentNotes}</td>
              </tr>
            ))}
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
