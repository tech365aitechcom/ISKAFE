'use client'
import React, { useState, useEffect } from 'react'
import {
  Search,
  Camera,
  X,
  Download,
  User,
  Ticket,
  Clock,
  AlertCircle,
  Calendar,
  RefreshCw,
} from 'lucide-react'
import useStore from '../../../../stores/useStore'
import axiosInstance from '../../../../shared/axios'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { getEventStatus } from '../../../../utils/eventUtils'
import PaginationHeader from '../../../_components/PaginationHeader'
import Pagination from '../../../_components/Pagination'

export default function SpectatorTicketRedemption() {
  const user = useStore((state) => state.user)

  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [redeemCode, setRedeemCode] = useState('')
  const [quantityToRedeem, setQuantityToRedeem] = useState(1)
  const [tickets, setTickets] = useState([])
  const [events, setEvents] = useState([])
  const [activeTab, setActiveTab] = useState('redeem')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(false)
  const [eventsLoading, setEventsLoading] = useState(true)
  const [redemptions, setRedemptions] = useState([])
  const [error, setError] = useState(null)
  const [showRedemptionPanel, setShowRedemptionPanel] = useState(false)

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
      console.error('Error fetching events:', err)
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
          price: item.amountPaid / 100, // Convert cents to dollars
          redeemedAt: item.redeemedAt,
          redeemedBy: item.redeemedBy,
          redeemedByEmail: item.redeemedByEmail,
          status: 'checked-in',
          entryMode: item.entryMode || 'Manual',
          quantity: item.quantity,
          eventName: item.eventName,
          buyerEmail: item.buyerEmail,
        }))

        setRedemptions(redemptionsData)
      }
    } catch (err) {
      console.error('Error fetching redemptions:', err)
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

  // Handle QR code scan (using the same implementation as in event view)
  const handleScan = () => {
    // Create modal container
    const modal = document.createElement('div')
    modal.id = 'qr-scanner-modal'
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.9); z-index: 9999; 
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 20px;
    `

    // Create scanner container
    const scannerContainer = document.createElement('div')
    scannerContainer.id = 'qr-reader'
    scannerContainer.style.cssText = `
      width: 100%; max-width: 500px; height: 400px;
      border: 3px solid #CB3CFF; border-radius: 10px; 
      background: #000; position: relative;
    `

    // Create instructions
    const instructions = document.createElement('div')
    instructions.style.cssText =
      'color: white; text-align: center; margin: 20px 0; font-size: 16px;'
    instructions.innerHTML = '<p>Position QR code within the camera view</p>'

    // Create buttons
    const buttons = document.createElement('div')
    buttons.style.cssText = 'display: flex; gap: 15px; margin-top: 20px;'

    const manualButton = document.createElement('button')
    manualButton.textContent = 'Manual Entry'
    manualButton.style.cssText = `
      background: linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%);
      color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;
    `

    const cancelButton = document.createElement('button')
    cancelButton.textContent = 'Cancel'
    cancelButton.style.cssText = `
      background: #666; color: white; padding: 10px 20px; 
      border: none; border-radius: 5px; cursor: pointer;
    `

    let html5QrcodeScanner = null

    // Handle successful scan
    const onScanSuccess = (decodedText, decodedResult) => {
      console.log(`QR Code scanned: ${decodedText}`)

      // Try to extract ticket code and event info from QR data
      let ticketCode = decodedText
      let eventInfo = null

      // If QR contains JSON, try to parse it
      try {
        const qrData = JSON.parse(decodedText)
        if (qrData.ticketCode) {
          ticketCode = qrData.ticketCode
        }
        if (qrData.eventId) {
          eventInfo = qrData.eventId
        }
      } catch (e) {
        // If not JSON, use the raw text as ticket code
      }

      // Set the ticket code and clean up
      setRedeemCode(ticketCode)
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(console.error)
      }
      document.body.removeChild(modal)

      // If event info is available, try to find and select the event
      if (eventInfo) {
        const foundEvent = events.find(
          (event) => event.id === eventInfo || event.eventId === eventInfo
        )
        if (foundEvent) {
          setSelectedEvent(foundEvent)
          setShowRedemptionPanel(true)
          setActiveTab('redeem')
        }
      }

      // Show success message
      alert(`QR code scanned successfully! Ticket code: ${ticketCode}`)
    }

    // Handle scan error
    const onScanError = (errorMessage) => {
      // Ignore frequent scan errors, they're normal when no QR code is visible
    }

    // Button event handlers
    const cleanup = () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(console.error)
      }
      if (modal.styleElement) {
        document.head.removeChild(modal.styleElement)
      }
      document.body.removeChild(modal)
    }

    manualButton.onclick = cleanup
    cancelButton.onclick = cleanup

    // Assemble modal
    buttons.appendChild(manualButton)
    buttons.appendChild(cancelButton)
    modal.appendChild(instructions)
    modal.appendChild(scannerContainer)
    modal.appendChild(buttons)
    document.body.appendChild(modal)

    // Start scanning after DOM is updated
    setTimeout(() => {
      // Add custom styles for the scanner
      const style = document.createElement('style')
      style.textContent = `
        #qr-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
        }
        #qr-reader__dashboard_section_csr {
          background: rgba(0,0,0,0.8) !important;
          color: white !important;
          border-radius: 0 0 10px 10px !important;
        }
        #qr-reader__dashboard_section_csr > div {
          color: white !important;
        }
      `
      document.head.appendChild(style)

      html5QrcodeScanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          rememberLastUsedCamera: true,
          supportedScanTypes: [0], // Only QR codes
        },
        false
      )
      html5QrcodeScanner.render(onScanSuccess, onScanError)

      // Store style element for cleanup
      modal.styleElement = style
    }, 200)
  }

  // Redeem ticket via API
  const handleRedeem = async () => {
    if (!redeemCode || !selectedEvent) return

    if (quantityToRedeem <= 0) {
      alert('Invalid quantity. Please enter a value greater than 0.')
      return
    }

    const confirmMessage = `Redeem ${quantityToRedeem} ticket(s) for code ${redeemCode.trim()}?`

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setLoading(true)
      const response = await axiosInstance.post('/spectator-ticket/redeem', {
        ticketCode: redeemCode.trim(),
        quantityToRedeem: quantityToRedeem,
        entryMode: 'Manual',
        eventId: selectedEvent.id,
      })

      if (response.data.success) {
        const newRedemption = {
          id: Date.now().toString(),
          code: redeemCode,
          name: response.data.data?.spectatorName || 'Spectator',
          type: response.data.data?.tierName || 'General',
          price: response.data.data?.price || 0,
          redeemedAt: new Date().toISOString(),
          redeemedBy: user.firstName
            ? `${user.firstName} ${user.lastName}`
            : 'Current Staff',
          status: 'checked-in',
          entryMode: 'manual',
          quantity: quantityToRedeem,
          remainingQuantity: response.data.data?.remainingQuantity || 0,
        }

        setRedemptions([...redemptions, newRedemption])
        setRedeemCode('')
        setQuantityToRedeem(1)

        const successMessage = `✓ Successfully redeemed ${quantityToRedeem} ticket(s) for code ${redeemCode.trim()}!`
        alert(successMessage)

        // Switch to redemption list tab to show the new entry
        setActiveTab('list')
      } else {
        alert(response.data.message || 'Failed to redeem ticket')
      }
    } catch (error) {
      console.error('Error redeeming ticket:', error)
      alert(
        error.response?.data?.message ||
          'Error redeeming ticket. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Export data
  const handleExport = async (format) => {
    if (filteredRedemptions.length === 0) {
      alert('No redemptions to export')
      return
    }

    if (format === 'csv') {
      const headers =
        'Ticket Code,Buyer Name,Ticket Type,Price,Redeemed At,Redeemed By,Entry Mode,Status,Event Name\n'
      const csvData = filteredRedemptions
        .map(
          (redemption) =>
            `${redemption.code},"${redemption.name}",${redemption.type},$${
              redemption.price?.toFixed(2) || '0.00'
            },"${
              redemption.redeemedAt
                ? new Date(redemption.redeemedAt).toLocaleString()
                : '-'
            }","${redemption.redeemedBy || '-'}","${
              redemption.entryMode || 'Manual'
            }","${redemption.status}","${
              redemption.eventName || selectedEvent?.name || ''
            }"`
        )
        .join('\n')

      const blob = new Blob([headers + csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `spectator-redemptions-${
        selectedEvent?.name || 'all-events'
      }-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } else if (format === 'pdf') {
      try {
        // Dynamic import for jsPDF and autoTable to work with Next.js
        const jsPDF = (await import('jspdf')).default
        const autoTable = (await import('jspdf-autotable')).default

        const doc = new jsPDF()

        // Add title
        doc.setFontSize(18)
        doc.text('Spectator Ticket Redemptions', 20, 20)

        // Add event info if selected
        if (selectedEvent) {
          doc.setFontSize(12)
          doc.text(`Event: ${selectedEvent.name}`, 20, 35)
          doc.text(
            `Date: ${new Date(selectedEvent.date).toLocaleDateString()}`,
            20,
            45
          )
          doc.text(`Location: ${selectedEvent.location}`, 20, 55)
        }

        // Prepare table data
        const tableColumns = [
          'Ticket Code',
          'Buyer Name',
          'Type',
          'Price',
          'Redeemed At',
          'Redeemed By',
          'Entry Mode',
          'Status',
        ]
        const tableData = filteredRedemptions.map((redemption) => [
          redemption.code,
          redemption.name,
          redemption.type,
          `$${redemption.price?.toFixed(2) || '0.00'}`,
          redemption.redeemedAt
            ? new Date(redemption.redeemedAt).toLocaleDateString()
            : '-',
          redemption.redeemedBy || '-',
          redemption.entryMode || 'Manual',
          redemption.status,
        ])

        // Add table using autoTable
        autoTable(doc, {
          head: [tableColumns],
          body: tableData,
          startY: selectedEvent ? 65 : 35,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [203, 60, 255] },
        })

        // Save the PDF
        doc.save(
          `spectator-redemptions-${
            selectedEvent?.name || 'all-events'
          }-${new Date().toISOString().slice(0, 10)}.pdf`
        )
      } catch (error) {
        console.error('Error generating PDF:', error)
        alert('Error generating PDF. Please try again.')
      }
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
              {filteredRedemptions.length > 0 && (
                <>
                  <button
                    className='text-sm bg-[#0A1330] hover:bg-[#0A1330]/80 text-white px-4 py-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed'
                    onClick={() => handleExport('pdf')}
                    disabled={filteredRedemptions.length === 0}
                  >
                    <Download size={16} className='mr-2' />
                    Export PDF
                  </button>
                  <button
                    className='text-sm bg-[#0A1330] hover:bg-[#0A1330]/80 text-white px-4 py-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed'
                    onClick={() => handleExport('csv')}
                    disabled={filteredRedemptions.length === 0}
                  >
                    <Download size={16} className='mr-2' />
                    Export CSV
                  </button>
                </>
              )}

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

          {/* Main Content */}
          {/* {!selectedEvent && activeTab === 'redeem' && (
            <div className='bg-transparent border border-gray-700 rounded-lg p-6 mb-6'>
              <div className='mb-8'>
                <h2 className='text-lg font-medium mb-3'>Scan QR Code</h2>
                <p className='text-gray-300 mb-4'>
                  Use your device camera to scan the spectator's ticket QR code
                </p>
                <button
                  style={{
                    background:
                      'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
                  }}
                  className='text-white py-2 px-4 rounded flex items-center hover:opacity-90'
                  onClick={handleScan}
                >
                  <Camera size={18} className='mr-2' />
                  Scan with Device Camera
                </button>
              </div>

              <div className='border-t border-gray-700 my-6'></div>

              <h2 className='text-lg font-medium mb-6'>Manual Ticket Entry</h2>

              <div className='mb-8'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                  <div className='bg-[#00000061] p-4 rounded-lg'>
                    <label className='block text-sm text-gray-400 mb-2'>
                      Ticket Code:
                    </label>
                    <div className='flex items-center'>
                      <input
                        type='text'
                        className='bg-transparent text-white text-lg font-medium focus:outline-none w-full'
                        placeholder='Enter 4-6 digit code'
                        value={redeemCode}
                        onChange={(e) => setRedeemCode(e.target.value)}
                        maxLength={6}
                      />
                      {redeemCode && (
                        <button
                          onClick={() => setRedeemCode('')}
                          className='text-gray-400 hover:text-white ml-2'
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className='bg-[#00000061] p-4 rounded-lg'>
                    <label className='block text-sm text-gray-400 mb-2'>
                      Quantity to Redeem:
                    </label>
                    <input
                      type='number'
                      min='1'
                      className='bg-transparent text-white text-lg font-medium focus:outline-none w-full'
                      placeholder='1'
                      value={quantityToRedeem}
                      onChange={(e) =>
                        setQuantityToRedeem(
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                    />
                  </div>
                </div>

                <button
                  style={{
                    background:
                      'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
                  }}
                  className='text-white py-2 px-4 rounded w-full md:w-auto flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
                  onClick={handleRedeem}
                  disabled={!redeemCode || loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className='animate-spin mr-2' />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Ticket size={16} className='mr-2' />
                      Redeem {quantityToRedeem} Ticket
                      {quantityToRedeem > 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          )} */}
          <div className='bg-transparent border border-gray-700 rounded-lg p-6 mb-6'>
            {!showRedemptionPanel ? (
              /* Event Listing Table View */
              <>
                <h2 className='text-lg font-medium mb-3'>
                  Manually select an event
                </h2>
                {/* Filters Row */}
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                      <Search size={18} className='text-gray-400' />
                    </div>
                    <input
                      type='text'
                      className='bg-transparent border border-gray-700 text-white rounded-md pl-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-600'
                      placeholder='Search events...'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <input
                    type='date'
                    className='bg-transparent border border-gray-700 text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-600'
                    value={eventDateFilter}
                    onChange={(e) => setEventDateFilter(e.target.value)}
                    placeholder='Filter by date'
                  />

                  <select
                    className='bg-[#0A1330] border border-gray-700 text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-600'
                    value={eventLocationFilter}
                    onChange={(e) => setEventLocationFilter(e.target.value)}
                  >
                    <option value=''>All Locations</option>
                    {uniqueLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>

                  <select
                    className='bg-[#0A1330] border border-gray-700 text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-600'
                    value={eventStatusFilter}
                    onChange={(e) => setEventStatusFilter(e.target.value)}
                  >
                    <option value='all'>All</option>
                    <option value='upcoming'>Upcoming</option>
                    <option value='closed'>Closed</option>
                  </select>
                </div>

                {eventsLoading ? (
                  <div className='flex items-center justify-center py-8'>
                    <RefreshCw
                      size={24}
                      className='animate-spin text-purple-400 mr-2'
                    />
                    <span className='text-gray-300'>Loading events...</span>
                  </div>
                ) : error ? (
                  <div className='text-center py-8'>
                    <AlertCircle
                      size={32}
                      className='text-red-400 mx-auto mb-2'
                    />
                    <p className='text-red-400 mb-4'>{error}</p>
                    <button
                      onClick={fetchEvents}
                      className='text-purple-400 hover:text-white transition-colors'
                    >
                      Try Again
                    </button>
                  </div>
                ) : paginatedEvents.length === 0 ? (
                  <div className='text-center py-8'>
                    <Calendar
                      size={32}
                      className='text-gray-400 mx-auto mb-2'
                    />
                    <p className='text-gray-400'>
                      No events found matching your criteria
                    </p>
                  </div>
                ) : (
                  /* Events Table */
                  <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
                    <PaginationHeader
                      limit={eventsPagination.pageSize}
                      setLimit={(newSize) =>
                        setEventsPagination((prev) => ({
                          ...prev,
                          pageSize: newSize,
                          currentPage: 1,
                        }))
                      }
                      currentPage={eventsPagination.currentPage}
                      totalItems={eventsPagination.totalItems}
                      label='events'
                    />
                    <div className='overflow-x-auto custom-scrollbar'>
                      <table className='w-full text-sm text-left'>
                        <thead>
                          <tr className='text-gray-400 text-sm'>
                            <th className='px-4 pb-3 whitespace-nowrap'>
                              Event ID
                            </th>
                            <th className='px-4 pb-3 whitespace-nowrap'>
                              Event Name
                            </th>
                            <th className='px-4 pb-3 whitespace-nowrap'>
                              Event Date
                            </th>
                            <th className='px-4 pb-3 whitespace-nowrap'>
                              Event Location
                            </th>
                            <th className='px-4 pb-3 whitespace-nowrap'>
                              Event Status
                            </th>
                            <th className='px-4 pb-3 whitespace-nowrap'>
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedEvents.length > 0 ? (
                            paginatedEvents.map((event, index) => (
                              <tr
                                key={event.id}
                                className={`cursor-pointer ${
                                  index % 2 === 0
                                    ? 'bg-[#0A1330]'
                                    : 'bg-[#0B1739]'
                                }`}
                              >
                                <td className='p-4 whitespace-nowrap font-mono text-sm'>
                                  {event.eventId}
                                </td>
                                <td className='p-4 whitespace-nowrap font-medium'>
                                  {event.name}
                                </td>
                                <td className='p-4 whitespace-nowrap'>
                                  {new Date(event.date).toLocaleDateString()}
                                </td>
                                <td className='p-4 whitespace-nowrap'>
                                  {event.location}
                                </td>
                                <td className='p-4 whitespace-nowrap'>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      event.status.toLowerCase() === 'live'
                                        ? 'bg-green-900/50 text-green-400'
                                        : event.status.toLowerCase() ===
                                          'upcoming'
                                        ? 'bg-blue-900/50 text-blue-400'
                                        : event.status.toLowerCase() === 'draft'
                                        ? 'bg-gray-900/50 text-gray-400'
                                        : 'bg-red-900/50 text-red-400'
                                    }`}
                                  >
                                    {event.status}
                                  </span>
                                </td>
                                <td className='p-4 whitespace-nowrap'>
                                  <button
                                    onClick={() => {
                                      setSelectedEvent(event)
                                      setShowRedemptionPanel(true)
                                    }}
                                    className={`px-3 py-1 rounded text-sm font-medium ${
                                      !['draft'].includes(
                                        event.status.toLowerCase()
                                      )
                                        ? 'bg-gradient-to-r from-[#CB3CFF] to-[#7F25FB] text-white hover:opacity-90'
                                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    }`}
                                  >
                                    Open Redemption Panel
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr className='text-center bg-[#0A1330]'>
                              <td colSpan='6' className='p-4'>
                                No events found matching your criteria.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      currentPage={eventsPagination.currentPage}
                      totalPages={eventsPagination.totalPages}
                      onPageChange={(page) =>
                        setEventsPagination((prev) => ({
                          ...prev,
                          currentPage: page,
                        }))
                      }
                    />
                  </div>
                )}
              </>
            ) : (
              <>
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
                {/* QR Scan Section */}
                <div className='mb-8'>
                  <h2 className='text-lg font-medium mb-3'>Scan QR Code</h2>
                  <p className='text-gray-300 mb-4'>
                    Use your device camera to scan the spectator's ticket QR
                    code
                  </p>
                  <button
                    style={{
                      background:
                        'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
                    }}
                    className='text-white py-2 px-4 rounded flex items-center hover:opacity-90'
                    onClick={handleScan}
                  >
                    <Camera size={18} className='mr-2' />
                    Scan with Device Camera
                  </button>
                </div>

                <div className='border-t border-gray-700 my-6'></div>

                {/* Manual Entry Section */}
                <h2 className='text-lg font-medium mb-6'>
                  Manual Ticket Entry
                </h2>

                <div className='mb-8'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                    <div className='bg-[#00000061] p-4 rounded-lg'>
                      <label className='block text-sm text-gray-400 mb-2'>
                        Ticket Code:
                      </label>
                      <div className='flex items-center'>
                        <input
                          type='text'
                          className='bg-transparent text-white text-lg font-medium focus:outline-none w-full'
                          placeholder='Enter 4-6 digit code'
                          value={redeemCode}
                          onChange={(e) => setRedeemCode(e.target.value)}
                          maxLength={6}
                        />
                        {redeemCode && (
                          <button
                            onClick={() => setRedeemCode('')}
                            className='text-gray-400 hover:text-white ml-2'
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className='bg-[#00000061] p-4 rounded-lg'>
                      <label className='block text-sm text-gray-400 mb-2'>
                        Quantity to Redeem:
                      </label>
                      <input
                        type='number'
                        min='1'
                        className='bg-transparent text-white text-lg font-medium focus:outline-none w-full'
                        placeholder='1'
                        value={quantityToRedeem}
                        onChange={(e) =>
                          setQuantityToRedeem(
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                      />
                    </div>
                  </div>

                  <button
                    style={{
                      background:
                        'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
                    }}
                    className='text-white py-2 px-4 rounded w-full md:w-auto flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
                    onClick={handleRedeem}
                    disabled={!redeemCode || loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={16} className='animate-spin mr-2' />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Ticket size={16} className='mr-2' />
                        Redeem {quantityToRedeem} Ticket
                        {quantityToRedeem > 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : selectedEvent && activeTab === 'list' ? (
              /* Redemption List View */
              <div>
                <div className='flex flex-col mb-6'>
                  <h2 className='text-lg font-medium mb-4'>
                    Redemption List ({filteredRedemptions.length})
                  </h2>

                  {/* Filters Row */}
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4'>
                    <input
                      type='text'
                      className='bg-[#0A1330] border border-gray-700 text-white rounded px-3 py-2'
                      placeholder='Search redemptions...'
                      value={redemptionSearchQuery}
                      onChange={(e) => setRedemptionSearchQuery(e.target.value)}
                    />

                    <input
                      type='date'
                      className='bg-[#0A1330] border border-gray-700 text-white rounded px-3 py-2'
                      value={redemptionDateFilter}
                      onChange={(e) => setRedemptionDateFilter(e.target.value)}
                      placeholder='Filter by date'
                    />

                    <input
                      type='text'
                      className='bg-[#0A1330] border border-gray-700 text-white rounded px-3 py-2'
                      placeholder='Filter by location'
                      value={redemptionLocationFilter}
                      onChange={(e) =>
                        setRedemptionLocationFilter(e.target.value)
                      }
                    />

                    <select
                      className='bg-[#0A1330] border border-gray-700 text-white rounded px-3 py-2'
                      value={redemptionStatusFilter}
                      onChange={(e) =>
                        setRedemptionStatusFilter(e.target.value)
                      }
                    >
                      <option value='all'>All Statuses</option>
                      <option value='checked-in'>Checked-In</option>
                      <option value='not-checked-in'>Not Checked-In</option>
                      <option value='already-used'>Already Used</option>
                    </select>
                  </div>
                </div>

                <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
                  <PaginationHeader
                    limit={redemptionPagination.pageSize}
                    setLimit={(newSize) =>
                      setRedemptionPagination((prev) => ({
                        ...prev,
                        pageSize: newSize,
                        currentPage: 1,
                      }))
                    }
                    currentPage={redemptionPagination.currentPage}
                    totalItems={redemptionPagination.totalItems}
                    label='redemptions'
                  />
                  {paginatedRedemptions.length > 0 ? (
                    <div className='overflow-x-auto custom-scrollbar'>
                      <table className='w-full text-sm text-left'>
                        <thead>
                          <tr className='text-gray-400 text-sm'>
                            <th className='px-4 pb-3 whitespace-nowrap'>
                              Ticket Code
                            </th>
                            <th className='px-4 pb-3 whitespace-nowrap'>
                              Buyer Name
                            </th>
                            <th className='px-4 pb-3 whitespace-nowrap'>
                              Type
                            </th>
                            <th className='px-4 pb-3 whitespace-nowrap text-right'>
                              Price
                            </th>
                            <th className='px-4 pb-3 whitespace-nowrap'>
                              Redeemed At
                            </th>
                            <th className='px-4 pb-3 whitespace-nowrap'>
                              Redeemed By
                            </th>
                            <th className='px-4 pb-3 whitespace-nowrap'>
                              Entry Mode
                            </th>
                            <th className='px-4 pb-3 whitespace-nowrap'>
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedRedemptions.map((redemption, index) => (
                            <tr
                              key={redemption.id}
                              className={`cursor-pointer ${
                                index % 2 === 0
                                  ? 'bg-[#0A1330]'
                                  : 'bg-[#0B1739]'
                              }`}
                            >
                              <td className='p-4 whitespace-nowrap font-mono'>
                                {redemption.code}
                              </td>
                              <td className='p-4 whitespace-nowrap'>
                                <div className='flex items-center'>
                                  <User
                                    size={16}
                                    className='mr-2 text-gray-400'
                                  />
                                  {redemption.name}
                                </div>
                              </td>
                              <td className='p-4 whitespace-nowrap'>
                                <div className='flex items-center'>
                                  <Ticket
                                    size={16}
                                    className='mr-2 text-gray-400'
                                  />
                                  {redemption.type}
                                </div>
                              </td>
                              <td className='p-4 whitespace-nowrap text-right'>
                                ${redemption.price?.toFixed(2) || '0.00'}
                              </td>
                              <td className='p-4 whitespace-nowrap'>
                                {redemption.redeemedAt ? (
                                  <div className='flex items-center'>
                                    <Clock
                                      size={16}
                                      className='mr-2 text-gray-400'
                                    />
                                    {new Date(
                                      redemption.redeemedAt
                                    ).toLocaleString()}
                                  </div>
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td className='p-4 whitespace-nowrap'>
                                {redemption.redeemedBy || '-'}
                              </td>
                              <td className='p-4 whitespace-nowrap capitalize'>
                                {redemption.entryMode || 'Manual'}
                              </td>
                              <td className='p-4 whitespace-nowrap'>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    redemption.status === 'checked-in'
                                      ? 'bg-green-900/50 text-green-400'
                                      : redemption.status === 'not-checked-in'
                                      ? 'bg-yellow-900/50 text-yellow-400'
                                      : redemption.status === 'already-used'
                                      ? 'bg-red-900/50 text-red-400'
                                      : 'bg-gray-900/50 text-gray-400'
                                  }`}
                                >
                                  {redemption.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className='text-center py-12 text-gray-400 bg-[#0A1330]'>
                      <p>No ticket redemptions yet</p>
                    </div>
                  )}
                  <Pagination
                    currentPage={redemptionPagination.currentPage}
                    totalPages={redemptionPagination.totalPages}
                    onPageChange={(page) =>
                      setRedemptionPagination((prev) => ({
                        ...prev,
                        currentPage: page,
                      }))
                    }
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
