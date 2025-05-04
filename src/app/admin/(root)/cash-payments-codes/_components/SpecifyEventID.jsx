import { useState } from 'react'

export default function SpecifyEventID() {
  const [eventId, setEventId] = useState('')
  return (
    <div className='text-white mt-5 w-full'>
      <h1 className='font-semibold mb-4'>Event ID</h1>
      <div className='grid grid-cols-1 md:grid-cols-5 gap-4 mb-4'>
        <div>
          <input
            type='text'
            name='eventId'
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder='Enter ID'
            className='w-full border border-[#343B4F] rounded p-3 text-white text-sm'
          />
        </div>
      </div>
    </div>
  )
}
