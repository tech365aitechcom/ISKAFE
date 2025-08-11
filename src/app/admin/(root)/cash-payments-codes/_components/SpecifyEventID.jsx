import { CodesTable } from './CodesTable'
import { Search } from 'lucide-react'

export default function SpecifyEventID({
  eventId,
  setEventId,
  loading,
  error,
  foundEvent,
  cashCodes,
  currentPage,
  limit,
  setLimit,
  setCurrentPage,
  totalPages,
  totalItems,
  searchEvent,
}) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchEvent()
    }
  }

  return (
    <div className='text-white mt-5 w-full'>
      <h1 className='font-semibold mb-4'>Event ID</h1>
      <div className='flex gap-4 mb-4'>
        <div className='flex-1'>
          <input
            type='text'
            name='eventId'
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Enter Event ID (e.g., 688a0723494f69efd3e8470c)'
            className='w-full border border-[#343B4F] rounded p-3 text-white text-sm bg-transparent'
          />
        </div>
        <button
          onClick={searchEvent}
          disabled={loading || !eventId.trim()}
          className='bg-violet-500 hover:bg-violet-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded text-sm font-medium flex items-center gap-2'
        >
          <Search size={16} />
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className='mb-4 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg'>
          <p className='text-red-400'>{error}</p>
        </div>
      )}

      {foundEvent && (
        <div>
          <div className='bg-[#AEBFFF33] flex items-center gap-4 px-3 py-2 w-fit rounded mb-4'>
            <div>
              <div className='font-medium'>{foundEvent.name}</div>
            </div>
          </div>
          <CodesTable
            cashCodes={cashCodes}
            limit={limit}
            setLimit={setLimit}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalItems={totalItems}
          />
        </div>
      )}
    </div>
  )
}
