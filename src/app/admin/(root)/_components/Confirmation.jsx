
'use client'
import React from 'react'
import { X } from 'lucide-react'

const Confirmation = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center'>
      <div className='bg-white rounded-lg p-6 w-[90%] max-w-md text-black relative'>
        <button onClick={onCancel} className='absolute right-3 top-3 text-gray-500 hover:text-gray-700'>
          <X className='w-5 h-5' />
        </button>
        <h2 className='text-xl font-bold mb-4'>{title}</h2>
        <p className='mb-6'>{message}</p>
        <div className='flex justify-end gap-4'>
          <button
            onClick={onCancel}
            className='bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded'
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default Confirmation