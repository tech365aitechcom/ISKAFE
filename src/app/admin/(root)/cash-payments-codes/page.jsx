'use client'

import { useState, useEffect } from 'react'
import SelectFromList from './_components/SelectFromList'
import SpecifyEventID from './_components/SpecifyEventID'
import FighterDetails from './_components/FighterDetails'
import RequestCode from './_components/RequestCode'
import { API_BASE_URL } from '../../../../constants'
import useStore from '../../../../stores/useStore'
import Loader from '../../../_components/Loader'

export default function CashPaymentAndCodesPage() {
  const [activeButton, setActiveButton] = useState('select')
  const [selectedFighter, setSelectedFighter] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showRequestDemo, setShowRequestDemo] = useState(false)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const user = useStore((state) => state.user)

  useEffect(() => {
    if (user?.token) {
      fetchEvents()
    } else {
      // If no token, use fallback or show login message
      setLoading(false)
      setError('Please log in to access cash payment codes')
    }
  }, [user?.token])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/events`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Events API response:', data) // Debug log
        
        if (data.success && Array.isArray(data.data?.items)) {
          const eventsWithCodes = await Promise.all(
            data.data.items.map(async (event) => {
              const codesResponse = await fetch(`${API_BASE_URL}/cash-code?eventId=${event._id}`, {
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
              return {
                ...event,
                id: event._id,
                name: event.name, // The API response already has 'name' field
                date: event.startDate ? new Date(event.startDate).toLocaleDateString() : 'Date not set',
                users: codes
              }
            })
          )
          setEvents(eventsWithCodes)
        } else if (data.success && !Array.isArray(data.data?.items)) {
          // Handle case where data.data.items is not an array but success is true
          console.warn('Events data is not an array:', data.data)
          setEvents([])
          setError('No events found')
        } else {
          setError(data.message || 'Failed to fetch events')
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.message || `Failed to fetch events (${response.status})`)
      }
    } catch (err) {
      console.error('Error fetching events:', err)
      
      // Fallback to mock data if API is not available
      console.log('Falling back to mock data...')
      try {
        const { cashPaymentAndCodesEvents } = await import('../../../../constants')
        setEvents(cashPaymentAndCodesEvents || [])
        setError(null) // Clear error since we have fallback data
      } catch (importErr) {
        console.error('Failed to load mock data:', importErr)
        setError('Unable to load events. Please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFighterClick = (fighter) => {
    setSelectedFighter(fighter)
  }

  const handleBackFromDetails = () => {
    setSelectedFighter(null)
  }

  const handleUpdateFighter = (updatedFighter) => {
    console.log('Updated fighter:', updatedFighter)
    setSelectedFighter(null)
  }

  const handleRemoveFighter = (fighter) => {
    console.log('Remove fighter:', fighter)
  }

  const handleToggle = (button) => {
    setActiveButton(button)
  }

  const handleAddCode = async (codeData) => {
    if (!user?.token) {
      alert('Please log in to create codes')
      return
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/cash-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name: codeData.participantName,
          email: codeData.participantEmail,
          phoneNumber: parseInt(codeData.participantMobile) || codeData.participantMobile,
          role: codeData.participantType === 'trainer' ? 'trainer' : 'spectator',
          eventId: selectedEvent.id,
          userId: codeData.userId || user?._id || user?.id,
          eventDate: codeData.eventDate,
          amountPaid: codeData.amount,
          paymentType: codeData.paymentType.toLowerCase(),
          paymentNotes: codeData.paymentNotes
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Refresh events to get updated code list
          await fetchEvents()
          // Update selected event with new code
          const updatedEvent = events.find(e => e.id === selectedEvent.id)
          if (updatedEvent) {
            setSelectedEvent(updatedEvent)
          }
          setShowRequestDemo(false)
          alert('Code created successfully!')
        } else {
          alert('Error creating code: ' + data.message)
        }
      } else {
        alert('Error creating code')
      }
    } catch (err) {
      alert('Error creating code: ' + err.message)
    }
  };

  const handleRedeemCode = async (code) => {
    if (!user?.token) {
      alert('Please log in to redeem codes')
      return
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/cash-code/${code._id || code.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name: code.name,
          email: code.email,
          phoneNumber: parseInt(code.phoneNumber) || code.phoneNumber,
          role: code.role,
          eventId: selectedEvent.id,
          userId: code.userId,
          eventDate: code.eventDate || new Date().toISOString().split('T')[0],
          amountPaid: code.amountPaid || code.amount,
          paymentType: (code.paymentType || 'cash').toLowerCase(),
          paymentNotes: code.paymentNotes || 'Redeemed by admin',
          redemptionStatus: 'Checked-In'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Refresh events to get updated code list
          await fetchEvents()
          // Update selected event with new code status
          const updatedEvent = events.find(e => e.id === selectedEvent.id)
          if (updatedEvent) {
            setSelectedEvent(updatedEvent)
          }
          alert('Code redeemed successfully!')
        } else {
          alert('Error redeeming code: ' + data.message)
        }
      } else {
        alert('Error redeeming code')
      }
    } catch (err) {
      alert('Error redeeming code: ' + err.message)
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[#07091D]">
        <Loader />
      </div>
    )
  }

  if (selectedFighter) {
    return (
      <FighterDetails
        fighter={selectedFighter}
        onBack={handleBackFromDetails}
        onUpdate={handleUpdateFighter}
        onRemove={handleRemoveFighter}
      />
    )
  }

  return (
    <div className='text-white p-8 flex justify-center relative overflow-hidden'>
      <div
        className='absolute -left-10 top-1/2 transform -translate-y-1/2 w-60 h-96 rounded-full opacity-70 blur-xl'
        style={{
          background: 'linear-gradient(317.9deg, #6F113E 13.43%, rgba(111, 17, 62, 0) 93.61%)',
        }}
      ></div>
      <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
        {showRequestDemo ? (
          <RequestCode 
            onBack={() => setShowRequestDemo(false)} 
            onAddCode={handleAddCode}
            selectedEvent={selectedEvent}
            currentUser={user}
          />
        ) : (
          <>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-2xl font-semibold leading-8'>
                Cash Payments & Codes
              </h2>
              <button
                className='text-white px-4 py-2 rounded-md disabled:opacity-50'
                style={{
                  background: 'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
                }}
                onClick={() => setShowRequestDemo(true)}
                disabled={!selectedEvent}
              >
                Request Code
              </button>
            </div>
            
            {error && (
              <div className='mb-4 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg'>
                <p className='text-red-400'>Error: {error}</p>
                <button 
                  onClick={() => {
                    setError(null)
                    fetchEvents()
                  }}
                  className='mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700'
                >
                  Retry
                </button>
              </div>
            )}
            <div className='flex bg-blue-950 p-1 rounded-md w-fit'>
              <button
                onClick={() => handleToggle('select')}
                className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${
                  activeButton === 'select' ? 'bg-[#2E3094] shadow-md' : ''
                }`}
              >
                Select From List
              </button>

              <button
                onClick={() => handleToggle('specify')}
                className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${
                  activeButton === 'specify' ? 'bg-[#2E3094] shadow-md' : ''
                }`}
              >
                Specify Event ID
              </button>
            </div>
            {activeButton === 'select' ? (
              <SelectFromList
                events={events}
                selectedEvent={selectedEvent}
                setSelectedEvent={setSelectedEvent}
                handleFighterClick={handleFighterClick}
                loading={loading}
                error={error}
                onRedeemCode={handleRedeemCode}
              />
            ) : (
              <SpecifyEventID 
                handleFighterClick={handleFighterClick}
                onRedeemCode={handleRedeemCode}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}