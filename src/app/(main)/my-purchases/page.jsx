'use client'
import React, { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Download, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Loader from '../../_components/Loader'
import useStore from '../../../stores/useStore'
import axios from 'axios'
import { API_BASE_URL } from '../../../constants'
import Pagination from '../../_components/Pagination'
import PaginationHeader from '../../_components/PaginationHeader'

const MyPurchases = () => {
  const router = useRouter()
  const user = useStore((state) => state.user)

  const [searchKeyword, setSearchKeyword] = useState('')
  const [transactionType, setTransactionType] = useState('')
  const [dateRangeStart, setDateRangeStart] = useState('')
  const [dateRangeEnd, setDateRangeEnd] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')

  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedTransaction, setExpandedTransaction] = useState(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const getTransactions = async (page = currentPage, pageLimit = limit) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(
        `${API_BASE_URL}/spectator-ticket/purchase/user?page=${page}&limit=${pageLimit}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      )
      console.log('API Response:', response.data)

      if (response.data.success && response.data.data.items) {
        // Transform API data to match component structure
        const transformedTransactions = response.data.data.items.map(
          (item) => ({
            _id: item._id,
            pageTitle: `Spectator Ticket Purchase - ${
              item.event?.name || 'Unknown Event'
            }`,
            instructionText:
              'Purchase spectator tickets for the upcoming event',
            purchaseDateTime: item.createdAt,
            transactionType: 'Spectator Tickets',
            productName:
              item.tiers && item.tiers.length > 1
                ? `Multiple Tiers (${item.quantity} total tickets)`
                : `${item.tier} Ticket x${item.quantity}`,
            eventDate: item.event?.startDate,
            amount: item.totalAmount,
            details: {
              transactionId: item.transactionId || item._id,
              paymentMethod:
                item.paymentMethod === 'cash'
                  ? `Cash Payment (${item.cashCode})`
                  : 'Credit Card',
              itemName:
                item.tiers && item.tiers.length > 1
                  ? item.tiers
                      .map((t) => `${t.tierName} (${t.quantity})`)
                      .join(' + ')
                  : `${item.tier} Tickets x${item.quantity}`,
              eventName: item.event?.name || 'Unknown Event',
              entryType: 'Spectator',
              purchaseStatus: item.paymentStatus,
              invoiceLink: true,
              notes:
                item.redemptionStatus === 'Redeemed'
                  ? 'Ticket has been used for entry'
                  : 'Active ticket - ready to use',
              qrCode: true,
              ticketCode: item.ticketCode,
              redemptionStatus: item.redemptionStatus,
              redeemedAt: item.redeemedAt,
              tickets:
                item.tiers && item.tiers.length > 0
                  ? item.tiers.map((tier) => ({
                      tierName: tier.tierName,
                      quantity: tier.quantity,
                      price: tier.price,
                    }))
                  : [
                      {
                        tierName: item.tier,
                        quantity: item.quantity,
                        price: item.totalAmount / item.quantity,
                      },
                    ],
            },
          })
        )

        setTransactions(transformedTransactions)

        // Set pagination data
        const paginationData = response.data.data.pagination
        setTotalItems(paginationData.totalItems)
        setTotalPages(paginationData.totalPages)
        setCurrentPage(paginationData.currentPage)
      } else {
        setTransactions([])
        setTotalItems(0)
        setTotalPages(0)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setError(
        error.response?.data?.message || 'Failed to load purchase history'
      )

      // Set empty array if API fails
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    getTransactions()
  }, [user, router, currentPage, limit])

  console.log('Transactions:', transactions)

  function formatDateTime(dateString) {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const handleSearch = () => {
    setCurrentPage(1)
    getTransactions(1, limit)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    getTransactions(page, limit)
  }

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit)
    setCurrentPage(1)
    getTransactions(1, newLimit)
  }

  const handleClearFilters = () => {
    setSearchKeyword('')
    setTransactionType('')
    setDateRangeStart('')
    setDateRangeEnd('')
    setPaymentStatus('')
    setCurrentPage(1)
    getTransactions(1, limit)
  }

  const toggleExpanded = (transactionId) => {
    setExpandedTransaction(
      expandedTransaction === transactionId ? null : transactionId
    )
  }

  const handleDownloadInvoice = async (transaction) => {
    try {
      // Use jsPDF like the dashboard export
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF('p', 'mm', 'a4')

      // Colors matching the application theme
      const colors = {
        primary: '#8B5CF6', // Purple
        secondary: '#6B46C1',
        dark: '#4C1D95',
        text: '#374151',
        lightText: '#6B7280',
        white: '#FFFFFF',
        light: '#F3F4F6',
      }

      // Helper function to add text with word wrap
      const addWrappedText = (text, x, y, maxWidth, fontSize = 10) => {
        pdf.setFontSize(fontSize)
        const textLines = pdf.splitTextToSize(text, maxWidth)
        pdf.text(textLines, x, y)
        return y + textLines.length * (fontSize * 0.4)
      }

      let yPos = 20

      // Header with company branding
      pdf.setFillColor(colors.primary)
      pdf.rect(0, 0, 210, 50, 'F')

      // Add company logo
      try {
        const logoResponse = await fetch('/logo1.png')
        const logoBlob = await logoResponse.blob()
        const logoDataUrl = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(logoBlob)
        })
        pdf.addImage(logoDataUrl, 'PNG', 15, 10, 30, 30)
      } catch (error) {
        console.log('Logo not found, using text placeholder')
        // Fallback to text if logo fails to load
        pdf.setFillColor(colors.white)
        pdf.rect(15, 10, 30, 30, 'F')
        pdf.setTextColor(colors.primary)
        pdf.setFontSize(12)
        pdf.text('ISKA', 25, 28)
      }

      // Company name and details
      pdf.setTextColor(colors.white)
      pdf.setFontSize(20)
      pdf.text('ISKA FIGHTING CHAMPIONSHIPS', 50, 25)
      pdf.setFontSize(10)
      pdf.text('Professional Martial Arts Organization', 50, 32)
      pdf.text('Invoice', 50, 39)

      yPos = 60

      // Invoice title
      pdf.setTextColor(colors.text)
      pdf.setFontSize(24)
      pdf.text('INVOICE', 15, yPos)
      yPos += 15

      // Invoice and customer info section
      pdf.setFillColor(colors.light)
      pdf.rect(15, yPos, 180, 40, 'F')

      // Invoice details (left side)
      pdf.setTextColor(colors.text)
      pdf.setFontSize(12)
      pdf.text('Invoice Details', 20, yPos + 8)
      pdf.setFontSize(10)
      pdf.text(`Invoice #: ${transaction.details.transactionId}`, 20, yPos + 16)
      pdf.text(
        `Date: ${formatDate(transaction.purchaseDateTime)}`,
        20,
        yPos + 22
      )
      pdf.text(
        `Due Date: ${formatDate(transaction.purchaseDateTime)}`,
        20,
        yPos + 28
      )

      // Status with color coding
      const status = transaction.details.purchaseStatus
      let statusColor = colors.primary
      if (status === 'Paid') statusColor = '#10B981'
      else if (status === 'Pending') statusColor = '#F59E0B'
      else if (status === 'Refunded') statusColor = '#EF4444'

      pdf.setTextColor(statusColor)
      pdf.text(`Status: ${status}`, 20, yPos + 34)

      // Customer details (right side)
      pdf.setTextColor(colors.text)
      pdf.setFontSize(12)
      pdf.text('Bill To', 115, yPos + 8)
      pdf.setFontSize(10)
      pdf.text(
        `${user?.firstName || ''} ${user?.lastName || ''}`,
        115,
        yPos + 16
      )
      pdf.text(`${user?.email || ''}`, 115, yPos + 22)
      pdf.text(
        `Customer ID: ${user?._id?.substring(0, 8) || 'N/A'}...`,
        115,
        yPos + 28
      )

      yPos += 50

      // Items table header
      pdf.setFillColor(colors.primary)
      pdf.rect(15, yPos, 180, 12, 'F')
      pdf.setTextColor(colors.white)
      pdf.setFontSize(10)
      pdf.text('Description', 20, yPos + 8)
      pdf.text('Event', 80, yPos + 8)
      pdf.text('Qty', 130, yPos + 8)
      pdf.text('Price', 150, yPos + 8)
      pdf.text('Total', 170, yPos + 8)
      yPos += 12

      // Items table content
      pdf.setFillColor(colors.white)
      pdf.rect(15, yPos, 180, 20, 'F')
      pdf.setDrawColor(colors.lightText)
      pdf.rect(15, yPos, 180, 20, 'S')

      pdf.setTextColor(colors.text)
      pdf.setFontSize(9)

      // Handle long text for description
      const description = transaction.details.itemName
      const wrappedDesc = pdf.splitTextToSize(description, 55)
      pdf.text(wrappedDesc, 20, yPos + 6)

      // Event name (truncated if too long)
      const eventName =
        transaction.details.eventName.length > 20
          ? transaction.details.eventName.substring(0, 17) + '...'
          : transaction.details.eventName
      pdf.text(eventName, 80, yPos + 6)

      // Quantity, unit price, and total
      const quantity = transaction.details.tickets?.[0]?.quantity || 1
      const unitPrice =
        transaction.details.tickets?.[0]?.price || transaction.amount

      pdf.text(quantity.toString(), 130, yPos + 6)
      pdf.text(`$${unitPrice.toFixed(2)}`, 150, yPos + 6)
      pdf.text(`$${transaction.amount.toFixed(2)}`, 170, yPos + 6)
      yPos += 25

      // Totals section
      pdf.setFillColor(colors.light)
      pdf.rect(120, yPos, 75, 25, 'F')

      pdf.setTextColor(colors.text)
      pdf.setFontSize(10)
      pdf.text('Subtotal:', 125, yPos + 8)
      pdf.text(`$${transaction.amount.toFixed(2)}`, 170, yPos + 8)
      pdf.text('Tax:', 125, yPos + 14)
      pdf.text('$0.00', 170, yPos + 14)

      // Total amount (highlighted)
      pdf.setFontSize(12)
      pdf.setTextColor(colors.primary)
      pdf.text('Total:', 125, yPos + 22)
      pdf.text(`$${transaction.amount.toFixed(2)}`, 170, yPos + 22)

      yPos += 35

      // Payment information section
      pdf.setFillColor(colors.light)
      pdf.rect(15, yPos, 180, 35, 'F')

      pdf.setTextColor(colors.text)
      pdf.setFontSize(12)
      pdf.text('Payment Information', 20, yPos + 8)

      pdf.setFontSize(10)
      pdf.text(
        `Payment Method: ${transaction.details.paymentMethod}`,
        20,
        yPos + 16
      )
      pdf.text(
        `Transaction Type: ${transaction.transactionType}`,
        20,
        yPos + 22
      )

      if (transaction.details.ticketCode) {
        pdf.text(
          `Ticket Code: ${transaction.details.ticketCode}`,
          20,
          yPos + 28
        )
      }

      yPos += 45

      // Footer
      pdf.setDrawColor(colors.lightText)
      pdf.line(15, yPos, 195, yPos)
      yPos += 10

      pdf.setTextColor(colors.lightText)
      pdf.setFontSize(9)
      pdf.text('Thank you for your business!', 15, yPos)
      pdf.text(
        `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        15,
        yPos + 6
      )
      pdf.text(
        'ISKA Fighting Championships • Professional Martial Arts Organization',
        15,
        yPos + 12
      )

      // Terms and conditions (small print)
      yPos += 20
      pdf.setFontSize(8)
      pdf.text(
        'Terms: This invoice represents a completed transaction. For questions or concerns, please contact our support team.',
        15,
        yPos
      )
      pdf.text(
        'Refund Policy: Refunds are subject to event terms and conditions. Processing may take 3-5 business days.',
        15,
        yPos + 5
      )

      // Save the PDF
      const fileName = `invoice-${transaction.details.transactionId}-${
        new Date().toISOString().split('T')[0]
      }.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Error generating invoice PDF:', error)
      alert('Failed to generate invoice PDF. Please try again.')
    }
  }

  const handleViewQRCode = (transaction) => {
    setSelectedTransaction(transaction)
    setShowQRModal(true)
  }

  // Filter transactions based on search criteria
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesKeyword =
      searchKeyword === '' ||
      transaction.pageTitle
        .toLowerCase()
        .includes(searchKeyword.toLowerCase()) ||
      transaction.productName
        .toLowerCase()
        .includes(searchKeyword.toLowerCase()) ||
      transaction.details.eventName
        .toLowerCase()
        .includes(searchKeyword.toLowerCase())

    const matchesType =
      transactionType === '' || transaction.transactionType === transactionType

    const transactionDate = new Date(transaction.purchaseDateTime)
    const matchesDateRange =
      (dateRangeStart === '' || transactionDate >= new Date(dateRangeStart)) &&
      (dateRangeEnd === '' || transactionDate <= new Date(dateRangeEnd))

    const matchesStatus =
      paymentStatus === '' ||
      transaction.details.purchaseStatus === paymentStatus

    return matchesKeyword && matchesType && matchesDateRange && matchesStatus
  })

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className='flex justify-center items-center h-screen bg-black'>
        <div className='text-center'>
          <h2 className='text-white text-xl mb-4'>Authentication Required</h2>
          <p className='text-gray-400'>
            Please log in to view your purchase history
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='relative w-full bg-purple-900'>
      <div className='absolute inset-0 bg-transparent opacity-90 pointer-events-none'></div>
      <div className='relative w-full max-w-6xl mx-auto px-4 pt-16 pb-32'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl md:text-5xl font-bold text-white'>
            MY PURCHASES AND
          </h1>
          <h1 className='text-4xl md:text-5xl font-bold text-red-500'>
            TRANSACTION HISTORY
          </h1>
          <p className='text-lg text-gray-300 mt-4 max-w-2xl mx-auto'>
            Track your purchase history for competitions, training sessions, and
            event attendance.
          </p>
        </div>

        {/* Search & Filter Card */}
        <div
          className='absolute left-0 right-0 mx-auto px-4 w-full max-w-5xl'
          style={{ top: '75%' }}
        >
          <div className='bg-purple-950 rounded-xl p-8 shadow-xl'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              <div className='flex flex-col items-start'>
                <label className='text-white text-sm mb-2'>
                  Search by Keyword
                </label>
                <input
                  type='text'
                  placeholder='Event Name, Product, etc.'
                  className='w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500'
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>

              <div className='flex flex-col items-start'>
                <label className='text-white text-sm mb-2'>
                  Transaction Type
                </label>
                <div className='relative w-full'>
                  <select
                    className='appearance-none w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500'
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                  >
                    <option value='' className='bg-purple-900'>
                      All Types
                    </option>
                    <option
                      value='Event Registration'
                      className='bg-purple-900'
                    >
                      Event Registration
                    </option>
                    <option value='Training' className='bg-purple-900'>
                      Training
                    </option>
                    <option value='Event Attendance' className='bg-purple-900'>
                      Event Attendance
                    </option>
                    <option value='Spectator Tickets' className='bg-purple-900'>
                      Spectator Tickets
                    </option>
                    <option value='Product Purchase' className='bg-purple-900'>
                      Product Purchase
                    </option>
                  </select>
                  <div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
                    <ChevronDown className='h-5 w-5 text-white' />
                  </div>
                </div>
              </div>

              <div className='flex flex-col items-start'>
                <label className='text-white text-sm mb-2'>Date From</label>
                <input
                  type='date'
                  className='w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500'
                  value={dateRangeStart}
                  onChange={(e) => setDateRangeStart(e.target.value)}
                />
              </div>

              <div className='flex flex-col items-start'>
                <label className='text-white text-sm mb-2'>Date To</label>
                <input
                  type='date'
                  className='w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500'
                  value={dateRangeEnd}
                  onChange={(e) => setDateRangeEnd(e.target.value)}
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
              <div className='flex flex-col items-start'>
                <label className='text-white text-sm mb-2'>
                  Payment Status
                </label>
                <div className='relative w-full'>
                  <select
                    className='appearance-none w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500'
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                  >
                    <option value='' className='bg-purple-900'>
                      All Status
                    </option>
                    <option value='Paid' className='bg-purple-900'>
                      Paid
                    </option>
                    <option value='Refunded' className='bg-purple-900'>
                      Refunded
                    </option>
                    <option value='Pending' className='bg-purple-900'>
                      Pending
                    </option>
                  </select>
                  <div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
                    <ChevronDown className='h-5 w-5 text-white' />
                  </div>
                </div>
              </div>
            </div>

            <div className='mt-8 flex justify-center gap-4'>
              <button
                onClick={handleSearch}
                className='bg-red-500 text-white px-12 py-3 rounded font-medium hover:bg-red-600 transition-colors'
              >
                Search
              </button>
              {(searchKeyword ||
                paymentStatus ||
                dateRangeStart ||
                dateRangeEnd ||
                transactionType) && (
                <button
                  onClick={handleClearFilters}
                  className='bg-gray-600 text-white px-8 py-3 rounded font-medium hover:bg-gray-700 transition-colors flex items-center'
                >
                  <X className='mr-2' size={16} />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='w-full h-32 bg-black'></div>

      {loading ? (
        <div className='flex justify-center items-center h-72 bg-black'>
          <Loader />
        </div>
      ) : error ? (
        <div className='bg-black w-full mx-auto px-4 py-16'>
          <div className='max-w-6xl mx-auto text-center py-16'>
            <div className='bg-red-900/20 border border-red-600 rounded-lg p-8'>
              <h3 className='text-red-400 text-xl font-bold mb-4'>
                Unable to Load Purchases
              </h3>
              <p className='text-white mb-6'>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded transition-colors'
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className='bg-black w-full mx-auto px-4 md:py-16 py-80'>
          {filteredTransactions.length === 0 ? (
            <div className='text-center py-16'>
              <img
                src='/receipt.png'
                alt='No receipts'
                className='w-64 h-64 mx-auto mb-4 opacity-50'
              />
              <p className='text-white text-xl font-bold uppercase'>
                NO RECEIPTS FOUND
              </p>
              <p className='text-gray-400 mt-2'>
                Try adjusting your search filters to find transactions.
              </p>
            </div>
          ) : (
            <div className='max-w-6xl mx-auto py-16'>
              <div className='bg-purple-900 rounded-lg overflow-hidden'>
                {/* Table Header */}
                <div className='bg-purple-800 px-6 py-4'>
                  <h3 className='text-white text-xl font-bold'>
                    Your Purchases - Transaction History
                  </h3>
                </div>

                {/* Pagination Header */}
                <div className='bg-purple-900 text-white'>
                  <PaginationHeader
                    limit={limit}
                    setLimit={handleLimitChange}
                    currentPage={currentPage}
                    totalItems={totalItems}
                    label='transactions'
                  />
                </div>

                {/* Table Content */}
                <div className='overflow-x-auto custom-scrollbar'>
                  <table className='w-full text-white'>
                    <thead className='bg-purple-700'>
                      <tr>
                        <th className='px-6 py-3 text-left text-sm font-medium uppercase tracking-wider'>
                          Purchase Date & Time
                        </th>
                        <th className='px-6 py-3 text-left text-sm font-medium uppercase tracking-wider'>
                          Transaction Type
                        </th>
                        <th className='px-6 py-3 text-left text-sm font-medium uppercase tracking-wider'>
                          Product/Event Name
                        </th>
                        <th className='px-6 py-3 text-left text-sm font-medium uppercase tracking-wider'>
                          Event Date
                        </th>
                        <th className='px-6 py-3 text-left text-sm font-medium uppercase tracking-wider'>
                          Amount
                        </th>
                        <th className='px-6 py-3 text-left text-sm font-medium uppercase tracking-wider'>
                          Expand
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-purple-600'>
                      {filteredTransactions.map((transaction) => (
                        <React.Fragment key={transaction._id}>
                          <tr className='hover:bg-purple-800 transition-colors'>
                            <td className='px-6 py-4 text-sm'>
                              {formatDateTime(transaction.purchaseDateTime)}
                            </td>
                            <td className='px-6 py-4 text-sm'>
                              {transaction.transactionType}
                            </td>
                            <td className='px-6 py-4 text-sm'>
                              {transaction.productName}
                            </td>
                            <td className='px-6 py-4 text-sm'>
                              {formatDate(transaction.eventDate)}
                            </td>
                            <td className='px-6 py-4 text-sm font-medium'>
                              ${transaction.amount.toFixed(2)}
                            </td>
                            <td className='px-6 py-4'>
                              <button
                                onClick={() => toggleExpanded(transaction._id)}
                                className='text-purple-300 hover:text-white transition-colors'
                              >
                                {expandedTransaction === transaction._id ? (
                                  <ChevronUp size={20} />
                                ) : (
                                  <ChevronDown size={20} />
                                )}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Detail Section */}
                          {expandedTransaction === transaction._id && (
                            <tr>
                              <td
                                colSpan='7'
                                className='px-6 py-6 bg-purple-950'
                              >
                                <div className='space-y-4'>
                                  <h4 className='text-lg font-semibold text-white mb-4'>
                                    Transaction Detail Section
                                  </h4>
                                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div className='space-y-3'>
                                      <div>
                                        <span className='text-gray-300 text-sm'>
                                          Transaction ID:
                                        </span>
                                        <p className='text-white font-mono'>
                                          {transaction.details.transactionId}
                                        </p>
                                      </div>
                                      <div>
                                        <span className='text-gray-300 text-sm'>
                                          Payment Method:
                                        </span>
                                        <p className='text-white'>
                                          {transaction.details.paymentMethod}
                                        </p>
                                      </div>
                                      <div>
                                        <span className='text-gray-300 text-sm'>
                                          Item Name / SKU:
                                        </span>
                                        <p className='text-white'>
                                          {transaction.details.itemName}
                                        </p>
                                      </div>
                                      <div>
                                        <span className='text-gray-300 text-sm'>
                                          Event Name:
                                        </span>
                                        <p className='text-white'>
                                          {transaction.details.eventName}
                                        </p>
                                      </div>
                                    </div>
                                    <div className='space-y-3'>
                                      <div>
                                        <span className='text-gray-300 text-sm'>
                                          Entry Type:
                                        </span>
                                        <p className='text-white'>
                                          {transaction.details.entryType}
                                        </p>
                                      </div>
                                      <div>
                                        <span className='text-gray-300 text-sm'>
                                          Purchase Status:
                                        </span>
                                        <p
                                          className={`font-medium ${
                                            transaction.details
                                              .purchaseStatus === 'Paid'
                                              ? 'text-green-400'
                                              : transaction.details
                                                  .purchaseStatus === 'Refunded'
                                              ? 'text-red-400'
                                              : 'text-yellow-400'
                                          }`}
                                        >
                                          {transaction.details.purchaseStatus}
                                        </p>
                                      </div>
                                      <div>
                                        <span className='text-gray-300 text-sm'>
                                          Invoice Download:
                                        </span>
                                        <button
                                          onClick={() =>
                                            handleDownloadInvoice(transaction)
                                          }
                                          className='ml-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm flex items-center transition-colors'
                                        >
                                          <Download
                                            size={14}
                                            className='mr-1'
                                          />
                                          Download Invoice (PDF)
                                        </button>
                                      </div>
                                      <div>
                                        <span className='text-gray-300 text-sm'>
                                          Notes:
                                        </span>
                                        <p className='text-white'>
                                          {transaction.details.notes}
                                        </p>
                                      </div>

                                      {/* Show QR Code and Ticket Code for Spectator Tickets */}
                                      {transaction.transactionType ===
                                        'Spectator Tickets' &&
                                        transaction.details.qrCode && (
                                          <div className='mt-4 pt-4 border-t border-gray-600'>
                                            <div className='space-y-3'>
                                              <div className='flex flex-col sm:flex-row gap-4'>
                                                <div>
                                                  <span className='text-gray-300 text-sm'>
                                                    Ticket Code:
                                                  </span>
                                                  <p className='text-white font-mono text-lg font-bold'>
                                                    {
                                                      transaction.details
                                                        .ticketCode
                                                    }
                                                  </p>
                                                </div>
                                                <div>
                                                  <span className='text-gray-300 text-sm'>
                                                    Ticket Status:
                                                  </span>
                                                  <p
                                                    className={`font-medium ${
                                                      transaction.details
                                                        .redemptionStatus ===
                                                      'Redeemed'
                                                        ? 'text-green-400'
                                                        : 'text-blue-400'
                                                    }`}
                                                  >
                                                    {transaction.details
                                                      .redemptionStatus ===
                                                    'Redeemed'
                                                      ? 'Used'
                                                      : 'Active'}
                                                  </p>
                                                </div>
                                              </div>
                                              {transaction.details
                                                .redeemedAt && (
                                                <div>
                                                  <span className='text-gray-300 text-sm'>
                                                    Used Date:
                                                  </span>
                                                  <p className='text-white text-sm'>
                                                    {formatDateTime(
                                                      transaction.details
                                                        .redeemedAt
                                                    )}
                                                  </p>
                                                </div>
                                              )}
                                              <button
                                                onClick={() =>
                                                  handleViewQRCode(transaction)
                                                }
                                                className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm flex items-center transition-colors w-fit'
                                              >
                                                View QR Code & Receipt
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className='bg-purple-900 px-6 py-4'>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedTransaction && (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl w-full max-w-md p-6 relative'>
            <button
              onClick={() => setShowQRModal(false)}
              className='absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl'
            >
              <X size={24} />
            </button>

            <div className='text-center'>
              <h3 className='text-xl font-bold text-gray-800 mb-4'>
                QR Code & Receipt
              </h3>

              <div className='mb-6'>
                <div className='text-sm text-gray-600 mb-2'>Event</div>
                <div className='font-medium text-gray-800'>
                  {selectedTransaction.details.eventName}
                </div>
              </div>

              <div className='mb-6'>
                <div className='text-sm text-gray-600 mb-2'>Ticket Code</div>
                <div className='font-mono text-lg font-bold text-gray-800 bg-gray-100 p-3 rounded'>
                  {selectedTransaction.details.ticketCode}
                </div>
              </div>

              {/* QR Code Placeholder - You can replace this with an actual QR code generator */}
              {/* <div className='mb-6'>
                <div className='text-sm text-gray-600 mb-2'>QR Code</div>
                <div className='flex justify-center'>
                  <div className='w-48 h-48 bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-600'>
                    <div className='text-center'>
                      <div className='text-xs mb-2'>QR Code for:</div>
                      <div className='font-mono text-xs break-all px-2'>
                        {selectedTransaction.details.ticketCode}
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}

              <div className='mb-6 text-left'>
                <div className='text-sm text-gray-600 mb-2'>
                  Receipt Details
                </div>
                <div className='bg-gray-50 p-4 rounded space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span>Transaction ID:</span>
                    <span className='font-mono'>
                      {selectedTransaction.details.transactionId}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Item:</span>
                    <span>{selectedTransaction.details.itemName}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Amount:</span>
                    <span className='font-bold'>
                      ${selectedTransaction.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Status:</span>
                    <span
                      className={`font-medium ${
                        selectedTransaction.details.redemptionStatus ===
                        'Redeemed'
                          ? 'text-green-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {selectedTransaction.details.redemptionStatus ===
                      'Redeemed'
                        ? 'Used'
                        : 'Active'}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Purchase Date:</span>
                    <span>
                      {formatDateTime(selectedTransaction.purchaseDateTime)}
                    </span>
                  </div>
                  {selectedTransaction.details.redeemedAt && (
                    <div className='flex justify-between'>
                      <span>Used Date:</span>
                      <span>
                        {formatDateTime(selectedTransaction.details.redeemedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyPurchases
