'use client'

import { useState, useEffect } from 'react'
import SelectFromList from './_components/SelectFromList'
import SpecifyEventID from './_components/SpecifyEventID'
import RequestCode from './_components/RequestCode'
import { API_BASE_URL } from '../../../../constants'
import useStore from '../../../../stores/useStore'
import Loader from '../../../_components/Loader'
import { enqueueSnackbar } from 'notistack'
import axios from 'axios'

export default function CashPaymentAndCodesPage() {
  const [activeButton, setActiveButton] = useState('select')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showRequestDemo, setShowRequestDemo] = useState(false)
  const [events, setEvents] = useState([])
  const [foundEvent, setFoundEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cashCodes, setCashCodes] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(1)
  const [limit, setLimit] = useState(10)
  const [eventId, setEventId] = useState('')

  const user = useStore((state) => state.user)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/events`)
      console.log('Response for events:', response.data.data.items) // Debug log
      setEvents(response.data.data.items || [])
    } catch (err) {
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  const searchEvent = async () => {
    if (!eventId.trim()) {
      setError('Please enter an event ID')
      return
    }

    setLoading(true)
    setError('')
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/events/${eventId}`)
      setFoundEvent(response.data.data)
    } catch (err) {
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCashCodes = async (eventId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/cash-code?eventId=${eventId}&page=${currentPage}&limit=${limit}`
      )
      setCashCodes(response.data.data || [])
      setTotalPages(response.data.pagination.totalPages)
      setTotalItems(response.data.pagination.totalItems)
    } catch (err) {
      console.error('Error fetching cash codes:', err)
    }
  }

  useEffect(() => {
    if (selectedEvent) {
      fetchCashCodes(selectedEvent._id)
    }
  }, [selectedEvent, currentPage, limit])

  useEffect(() => {
    if (foundEvent) {
      fetchCashCodes(foundEvent._id)
    }
  }, [foundEvent, currentPage, limit])

  const handleToggle = (button) => {
    setActiveButton(button)
  }

  const handleAddCode = async (codeData) => {
    try {
      const payload = {
        name: codeData.name,
        email: codeData.email,
        phoneNumber: codeData.phoneNumber,
        role: codeData.role,
        eventId: codeData.eventId,
        eventDate: codeData.eventDate,
        amountPaid: codeData.amountPaid,
        paymentType: codeData.paymentType,
        paymentNotes: codeData.paymentNotes,
      }
      if (codeData.userId) {
        payload.userId = codeData.userId
      }

      const response = await fetch(`${API_BASE_URL}/cash-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      })
      console.log('Response for code creation:', response)
      if (response.ok) {
        const data = await response.json()
        console.log('data for code creation:', data)
        if (data.success) {
          await fetchCashCodes(codeData.eventId)
          setShowRequestDemo(false)
          enqueueSnackbar(data.message || 'Code generated successfully', {
            variant: 'success',
          })
        } else {
          enqueueSnackbar('Error generating code: ' + data.message, {
            variant: 'error',
          })
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        enqueueSnackbar(
          'Error generating code: ' +
            (errorData.message || 'Server error', { variant: 'error' })
        )
      }
    } catch (err) {
      console.error('Error generating code:', err)
      enqueueSnackbar('Error generating code: ' + err.message, {
        variant: 'error',
      })
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen w-full bg-[#07091D]'>
        <Loader />
      </div>
    )
  }

  return (
    <div className='text-white p-8 flex justify-center relative overflow-hidden'>
      <div
        className='absolute -left-10 top-1/2 transform -translate-y-1/2 w-60 h-96 rounded-full opacity-70 blur-xl'
        style={{
          background:
            'linear-gradient(317.9deg, #6F113E 13.43%, rgba(111, 17, 62, 0) 93.61%)',
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
              {selectedEvent && (
                <button
                  className='text-white px-4 py-2 rounded-md disabled:opacity-50'
                  style={{
                    background:
                      'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
                  }}
                  onClick={() => setShowRequestDemo(true)}
                  disabled={!selectedEvent}
                >
                  Request Code
                </button>
              )}
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
                loading={loading}
                error={error}
                cashCodes={cashCodes}
                limit={limit}
                setLimit={setLimit}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                totalItems={totalItems}
              />
            ) : (
              <SpecifyEventID
                eventId={eventId}
                setEventId={setEventId}
                loading={loading}
                error={error}
                cashCodes={cashCodes}
                limit={limit}
                setLimit={setLimit}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                foundEvent={foundEvent}
                totalPages={totalPages}
                totalItems={totalItems}
                searchEvent={searchEvent}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
