'use client'

import Link from 'next/link'
import { Eye, SquarePen, Trash } from 'lucide-react'

const ActionButtons = ({ viewUrl, editUrl, onDelete }) => {
  return (
    <div className='flex items-center justify-start space-x-4'>
      {/* View */}
      <Link href={viewUrl}>
        <button className='text-gray-400 hover:text-gray-200 transition flex items-center justify-center'>
          <Eye size={20} />
        </button>
      </Link>

      {/* Edit */}
      <Link href={editUrl}>
        <button className='text-blue-500 hover:underline flex items-center justify-center'>
          <SquarePen size={20} />
        </button>
      </Link>

      {/* Delete */}
      <button
        onClick={onDelete}
        className='text-red-600 hover:text-red-400 transition flex items-center justify-center'
      >
        <Trash size={20} />
      </button>
    </div>
  )
}

export default ActionButtons
