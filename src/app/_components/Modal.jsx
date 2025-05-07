const Modal = ({ children, onClose }) => {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-800/30 overflow-y-auto'>
      <div className='relative bg-white dark:bg-gray-900 p-64 rounded-lg shadow-xl w-full max-w-6xl mx-auto'>
        <button
          onClick={onClose}
          className='absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl'
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  )
}

export default Modal
