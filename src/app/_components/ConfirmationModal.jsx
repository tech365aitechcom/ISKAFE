import React from 'react'

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'Do you really want to proceed?',
}) => {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-800/30'>
      <div className='bg-[#0B1739] bg-opacity-80 p-8 rounded-lg text-white w-full max-w-md'>
        <h2 className='text-lg font-semibold mb-4'>{title}</h2>
        <p>{message}</p>
        <div className='flex justify-end mt-6 space-x-4'>
          <button
            onClick={onClose}
            className='px-5 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 font-medium transition'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className='px-5 py-2 rounded-md text-white font-medium transition bg-red-600 hover:bg-red-700'
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
