import React from 'react'

const PaginationHeader = ({
  limit,
  setLimit,
  currentPage,
  totalItems,
  label = 'items',
}) => {
  console.log(currentPage, 'currentPage')
  console.log(totalItems, 'totalItems')

  const startItem = (currentPage - 1) * limit + 1
  const endItem = Math.min(currentPage * limit, totalItems)

  return (
    <div className='mb-4 pb-4 p-4 flex justify-between items-center border-b border-[#343B4F]'>
      <div className='flex items-center space-x-2'>
        <label htmlFor='limit' className='text-sm'>
          Show
        </label>
        <select
          id='limit'
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className='text-sm py-1 outline-none'
        >
          {[10, 25, 50, 100].map((val) => (
            <option key={val} value={val} className='bg-[#0A1330]'>
              {val}
            </option>
          ))}
        </select>
        <label htmlFor='limit' className='text-sm'>
          Entries Per Page
        </label>
      </div>
      <p className='text-sm'>
        {totalItems === 0
          ? `Showing 0 to 0 of 0 ${label}`
          : `Showing ${startItem} to ${endItem} of ${totalItems} ${label}`}
      </p>
    </div>
  )
}

export default PaginationHeader
