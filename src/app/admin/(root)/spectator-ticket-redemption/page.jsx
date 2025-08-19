'use client'
import React, { useState, useEffect } from 'react'
import { X, ArrowLeft } from 'lucide-react'
import useStore from '../../../../stores/useStore'
import axiosInstance from '../../../../shared/axios'
import { getEventStatus } from '../../../../utils/eventUtils'
import { enqueueSnackbar } from 'notistack'
import EventFilters from './_components/EventFilters'
import EventListTable from './_components/EventListTable'
import ExportButtons from './_components/ExportButtons'
import QRScanner from './_components/QRScanner'
import RedemptionForm from './_components/RedemptionForm'
import RedemptionList from './_components/RedemptionList'
import axios from 'axios'
import { API_BASE_URL } from '../../../../constants'

export default function SpectatorTicketRedemption() {
  const user = useStore((state) => state.user)

  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [redeemCode, setRedeemCode] = useState('')
  const [quantityToRedeem, setQuantityToRedeem] = useState(1)
  const [events, setEvents] = useState([])
  const [activeTab, setActiveTab] = useState('redeem')
  const [loading, setLoading] = useState(false)
  const [eventsLoading, setEventsLoading] = useState(true)
  const [redemptions, setRedemptions] = useState([])
  const [error, setError] = useState(null)
  const [showRedemptionPanel, setShowRedemptionPanel] = useState(false)
  const [redeemedByScan, setRedeemedByScan] = useState(false)

  // Event filters
  const [eventDateFilter, setEventDateFilter] = useState('')
  const [eventLocationFilter, setEventLocationFilter] = useState('')
  const [eventStatusFilter, setEventStatusFilter] = useState('all')

  // Redemption list filters
  const [redemptionDateFilter, setRedemptionDateFilter] = useState('')
  const [redemptionLocationFilter, setRedemptionLocationFilter] = useState('')
  const [redemptionStatusFilter, setRedemptionStatusFilter] = useState('all')
  const [redemptionSearchQuery, setRedemptionSearchQuery] = useState('')

  // Pagination states
  const [eventsPagination, setEventsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  })

  const [redemptionPagination, setRedemptionPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  })

  // Load events on component mount
  useEffect(() => {
    fetchEvents()
  }, [])

  // Load redemptions when event is selected and reset to redemption tab
  useEffect(() => {
    if (selectedEvent && showRedemptionPanel) {
      fetchRedemptions()
      setActiveTab('redeem') // Reset to redemption tab when event is selected
      setRedeemCode('') // Clear any existing redeem code
      setQuantityToRedeem(1) // Reset quantity
    }
  }, [selectedEvent, showRedemptionPanel])

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setEventsLoading(true)
      const response = await axiosInstance.get('/events?isPublished=true')

      if (response.data.success) {
        // Handle both array and object responses
        const eventsArray = Array.isArray(response.data.data)
          ? response.data.data
          : response.data.data.items || response.data.data.events || []

        const eventsData = eventsArray.map((event) => ({
          id: event._id,
          eventId: event.eventId || event._id,
          name: event.name,
          date: event.startDate,
          location: event.venue?.name || 'Location not set',
          registeredParticipants: event.registeredParticipants || 0,
          format: event.format,
          sportType: event.sportType,
          status: event.isDraft
            ? 'Draft'
            : getEventStatus(event.startDate, event.endDate),
        }))
        setEvents(eventsData)
      }
    } catch (err) {
      setError('Failed to load events')
    } finally {
      setEventsLoading(false)
    }
  }

  // Fetch redemptions for selected event
  const fetchRedemptions = async () => {
    if (!selectedEvent) return

    try {
      setLoading(true)
      const response = await axiosInstance.get(
        `/spectator-ticket/purchase/event/${selectedEvent.id}/redemption-logs`
      )

      if (response.data.success) {
        const redemptionsData = response.data.data.items.map((item) => ({
          id: `${item.ticketCode}-${item.redeemedAt}`, // Create unique ID from code and timestamp
          code: item.ticketCode,
          name: item.buyerName,
          type: item.tier,
          price: item.amountPaid,
          redeemedAt: item.redeemedAt,
          redeemedBy: item.redeemedBy,
          redeemedByEmail: item.redeemedByEmail,
          status: 'checked-in',
          entryMode: item.entryMode,
          quantity: item.quantity,
          eventName: item.eventName,
          buyerEmail: item.buyerEmail,
        }))

        setRedemptions(redemptionsData)
      }
    } catch (err) {
      console.log('Error fetching redemptions:', err)
    } finally {
      setLoading(false)
    }
  }

  // Get unique locations for dropdown
  const uniqueLocations = [
    ...new Set(events.map((event) => event.location)),
  ].filter(Boolean)

  // Filter events based on search query and filters
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.eventId.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDate =
      !eventDateFilter ||
      new Date(event.date).toISOString().slice(0, 10) === eventDateFilter

    const matchesLocation =
      !eventLocationFilter || event.location === eventLocationFilter

    const matchesStatus =
      eventStatusFilter === 'all' ||
      event.status.toLowerCase() === eventStatusFilter.toLowerCase()

    return matchesSearch && matchesDate && matchesLocation && matchesStatus
  })

  // Paginated events
  const paginatedEvents = filteredEvents.slice(
    (eventsPagination.currentPage - 1) * eventsPagination.pageSize,
    eventsPagination.currentPage * eventsPagination.pageSize
  )

  // Update events pagination when filtered events change
  useEffect(() => {
    const totalPages = Math.ceil(
      filteredEvents.length / eventsPagination.pageSize
    )
    setEventsPagination((prev) => ({
      ...prev,
      totalPages,
      totalItems: filteredEvents.length,
    }))
  }, [filteredEvents.length, eventsPagination.pageSize])

  // Reset pagination when filters change
  useEffect(() => {
    setEventsPagination((prev) => ({ ...prev, currentPage: 1 }))
  }, [searchQuery, eventDateFilter, eventLocationFilter, eventStatusFilter])

  useEffect(() => {
    setRedemptionPagination((prev) => ({ ...prev, currentPage: 1 }))
  }, [
    redemptionSearchQuery,
    redemptionDateFilter,
    redemptionLocationFilter,
    redemptionStatusFilter,
  ])

  // Filter redemptions based on multiple criteria
  const filteredRedemptions = redemptions.filter((redemption) => {
    const matchesStatus =
      redemptionStatusFilter === 'all' ||
      redemption.status === redemptionStatusFilter

    const matchesDate =
      !redemptionDateFilter ||
      new Date(redemption.redeemedAt).toISOString().slice(0, 10) ===
        redemptionDateFilter

    const matchesLocation =
      !redemptionLocationFilter ||
      (selectedEvent &&
        selectedEvent.location
          .toLowerCase()
          .includes(redemptionLocationFilter.toLowerCase()))

    const matchesSearch =
      !redemptionSearchQuery ||
      redemption.code
        .toLowerCase()
        .includes(redemptionSearchQuery.toLowerCase()) ||
      redemption.name
        .toLowerCase()
        .includes(redemptionSearchQuery.toLowerCase()) ||
      (redemption.buyerEmail &&
        redemption.buyerEmail
          .toLowerCase()
          .includes(redemptionSearchQuery.toLowerCase()))

    return matchesStatus && matchesDate && matchesLocation && matchesSearch
  })

  // Paginated redemptions
  const paginatedRedemptions = filteredRedemptions.slice(
    (redemptionPagination.currentPage - 1) * redemptionPagination.pageSize,
    redemptionPagination.currentPage * redemptionPagination.pageSize
  )

  // Update redemptions pagination when filtered redemptions change
  useEffect(() => {
    const totalPages = Math.ceil(
      filteredRedemptions.length / redemptionPagination.pageSize
    )
    setRedemptionPagination((prev) => ({
      ...prev,
      totalPages,
      totalItems: filteredRedemptions.length,
    }))
  }, [filteredRedemptions.length, redemptionPagination.pageSize])

  // Redeem ticket via API
  const handleRedeem = async () => {
    if (!redeemCode || !selectedEvent) return

    if (quantityToRedeem <= 0) {
      enqueueSnackbar(
        'Invalid quantity. Please enter a value greater than 0.',
        {
          variant: 'warning',
        }
      )
      return
    }

    const confirmMessage = `Redeem ${quantityToRedeem} ticket(s) for code ${redeemCode.trim()}?`

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setLoading(true)
      const response = await axios.post(
        `${API_BASE_URL}/spectator-ticket/redeem`,
        {
          ticketCode: redeemCode.trim(),
          quantityToRedeem: quantityToRedeem,
          entryMode: 'Manual',
          eventId: selectedEvent.id,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )

      if (response.data.success) {
        setRedeemCode('')
        setQuantityToRedeem(1)
        const successMessage = `Successfully redeemed ${quantityToRedeem} ticket(s) for code ${redeemCode.trim()}!`
        enqueueSnackbar(successMessage, {
          variant: 'success',
        })
        fetchRedemptions()

        // Switch to redemption list tab to show the new entry
        setActiveTab('list')
      } else {
        enqueueSnackbar(response.data.message || 'Failed to redeem ticket', {
          variant: 'error',
        })
      }
    } catch (error) {
      console.log('Error redeeming ticket:', error)
      enqueueSnackbar(
        error.response?.data?.message ||
          'Error redeeming ticket. Please try again.',
        {
          variant: 'error',
        }
      )
    } finally {
      setLoading(false)
      setRedeemedByScan(false)
    }
  }

  return (
    <div className=' text-white p-8 flex justify-center relative overflow-hidden'>
      <div
        className='absolute -left-10 top-1/2 transform -translate-y-1/2 w-60 h-96 rounded-full opacity-70 blur-xl'
        style={{
          background:
            'linear-gradient(317.9deg, #6F113E 13.43%, rgba(111, 17, 62, 0) 93.61%)',
        }}
      ></div>
      <div className='bg-[#0B1739]  bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50 '>
        <div className='mx-auto'>
          {/* Header */}
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
            <div>
              <h1 className='text-2xl font-semibold'>
                Spectator Ticket Redemption
              </h1>
              <p className='text-gray-300 mt-4'>
                Verify or redeem spectator tickets via QR scan or manual entry
              </p>
            </div>
            <div className='flex space-x-3 mt-4 md:mt-0'>
              <ExportButtons
                filteredRedemptions={filteredRedemptions}
                selectedEvent={selectedEvent}
              />

              {/* Instructions PDF */}
              {/* <a
                href='/spectator-redemption-instructions.pdf'
                target='_blank'
                rel='noopener noreferrer'
                className='text-sm bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center'
              >
                <Download size={16} className='mr-2' />
                Instructions PDF
              </a> */}
            </div>
          </div>

          <div className='bg-transparent border border-gray-700 rounded-lg p-6 mb-6'>
            {!showRedemptionPanel ? (
              /* Event Listing Table View */
              <>
                <h2 className='text-lg font-medium mb-3'>Select an event</h2>
                <EventFilters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  eventDateFilter={eventDateFilter}
                  setEventDateFilter={setEventDateFilter}
                  eventLocationFilter={eventLocationFilter}
                  setEventLocationFilter={setEventLocationFilter}
                  eventStatusFilter={eventStatusFilter}
                  setEventStatusFilter={setEventStatusFilter}
                  uniqueLocations={uniqueLocations}
                />

                <EventListTable
                  eventsLoading={eventsLoading}
                  error={error}
                  fetchEvents={fetchEvents}
                  paginatedEvents={paginatedEvents}
                  eventsPagination={eventsPagination}
                  setEventsPagination={setEventsPagination}
                  setSelectedEvent={setSelectedEvent}
                  setShowRedemptionPanel={setShowRedemptionPanel}
                />
              </>
            ) : (
              <>
                {/* Back Navigation */}
                <div className='flex items-center mb-4'>
                  <button
                    onClick={() => {
                      setShowRedemptionPanel(false)
                      setSelectedEvent(null)
                    }}
                    className='flex items-center text-gray-400 hover:text-white transition-colors'
                  >
                    <ArrowLeft size={18} className='mr-2' />
                    <span>Back to Event List</span>
                  </button>
                </div>

                {/* Redemption Panel */}
                <div className='flex items-center justify-between bg-[#AEBFFF33] p-3 rounded-md mb-6'>
                  <div>
                    <h3 className='font-medium'>
                      {selectedEvent.name} - Redemption Panel
                    </h3>
                    <p className='text-sm text-gray-300'>
                      {new Date(selectedEvent.date).toLocaleDateString()} •{' '}
                      {selectedEvent.location}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowRedemptionPanel(false)
                      setSelectedEvent(null)
                    }}
                    className='text-gray-400 hover:text-white'
                    title='Close panel'
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Tabs */}
                <div className='flex border-b border-gray-700 mb-6'>
                  <button
                    className={`pb-2 px-4 ${
                      activeTab === 'redeem'
                        ? 'text-purple-400 border-b-2 border-purple-400'
                        : 'text-gray-400'
                    }`}
                    onClick={() => setActiveTab('redeem')}
                  >
                    Ticket Redemption
                  </button>
                  <button
                    className={`pb-2 px-4 ${
                      activeTab === 'list'
                        ? 'text-purple-400 border-b-2 border-purple-400'
                        : 'text-gray-400'
                    }`}
                    onClick={() => setActiveTab('list')}
                  >
                    Redemption List
                  </button>
                </div>
              </>
            )}

            {selectedEvent && activeTab === 'redeem' ? (
              <>
                <QRScanner
                  setRedeemCode={setRedeemCode}
                  events={events}
                  setSelectedEvent={setSelectedEvent}
                  setShowRedemptionPanel={setShowRedemptionPanel}
                  setActiveTab={setActiveTab}
                  setRedeemedByScan={setRedeemedByScan}
                />

                <div className='border-t border-gray-700 my-6'></div>

                <RedemptionForm
                  redeemedByScan={redeemedByScan}
                  redeemCode={redeemCode}
                  setRedeemCode={setRedeemCode}
                  quantityToRedeem={quantityToRedeem}
                  setQuantityToRedeem={setQuantityToRedeem}
                  loading={loading}
                  handleRedeem={handleRedeem}
                />
              </>
            ) : selectedEvent && activeTab === 'list' ? (
              <RedemptionList
                filteredRedemptions={filteredRedemptions}
                redemptionSearchQuery={redemptionSearchQuery}
                setRedemptionSearchQuery={setRedemptionSearchQuery}
                redemptionDateFilter={redemptionDateFilter}
                setRedemptionDateFilter={setRedemptionDateFilter}
                redemptionLocationFilter={redemptionLocationFilter}
                setRedemptionLocationFilter={setRedemptionLocationFilter}
                redemptionStatusFilter={redemptionStatusFilter}
                setRedemptionStatusFilter={setRedemptionStatusFilter}
                paginatedRedemptions={paginatedRedemptions}
                redemptionPagination={redemptionPagination}
                setRedemptionPagination={setRedemptionPagination}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
