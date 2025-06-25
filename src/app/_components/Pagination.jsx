import React from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  return (
    <div className='flex justify-center my-4 space-x-2'>
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className='px-4 py-2 rounded text-white bg-[#0A1330]'
        >
          <ArrowLeft size={16} />
        </button>
      )}

      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`px-4 py-2 rounded text-white ${
            currentPage === i + 1 ? 'bg-[#2E133A]' : 'bg-[#0A1330]'
          }`}
        >
          {i + 1}
        </button>
      ))}

      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className='px-4 py-2 rounded text-white bg-[#0A1330]'
        >
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  )
}

export default Pagination
