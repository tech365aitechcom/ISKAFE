import { useState } from 'react'
import { API_BASE_URL } from '../../../../../constants'
import useStore from '../../../../../stores/useStore'
import { CodesTable } from './CodesTable'
import { Search } from 'lucide-react'

export default function SpecifyEventID({ handleFighterClick, onRedeemCode }) {
  const [eventId, setEventId] = useState('')
  const [foundEvent, setFoundEvent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const user = useStore((state) => state.user)

  const searchEvent = async () => {
    if (!eventId.trim()) {
      setError('Please enter an event ID')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      // First get the event details
      const eventResponse = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })

      if (!eventResponse.ok) {
        throw new Error('Event not found')
      }

      const eventData = await eventResponse.json()
      
      // Then get the cash codes for this event
      const codesResponse = await fetch(`${API_BASE_URL}/cash-code?eventId=${eventId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })

      let codes = []
      if (codesResponse.ok) {
        const codesData = await codesResponse.json()
        if (codesData.success && Array.isArray(codesData.data)) {
          codes = codesData.data
        }
      }

      const event = {
        ...eventData.data,
        id: eventData.data._id,
        users: codes,
        date: eventData.data.startDate ? new Date(eventData.data.startDate).toLocaleDateString() : 'Date not set'
      }

      setFoundEvent(event)
    } catch (err) {
      console.error('Error searching event:', err)
      setError('Event not found or error occurred while searching')
      setFoundEvent(null)
    } finally {
      setLoading(false)
    }
  }

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
              <div className='text-xs text-gray-400'>
                {foundEvent.date} • ID: {foundEvent.id}
              </div>
            </div>
          </div>
          <CodesTable
            users={foundEvent.users}
            handleFighterClick={handleFighterClick}
            onRedeemCode={onRedeemCode}
          />
        </div>
      )}
    </div>
  )
}