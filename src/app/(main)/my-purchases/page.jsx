'use client'
import React, { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Download, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Loader from '../../_components/Loader'
import useStore from '../../../stores/useStore'
import axios from 'axios'
import { API_BASE_URL } from '../../../constants'

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

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const getTransactions = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await axios.get(
          `${API_BASE_URL}/spectator-ticket/purchase/user`,
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
              productName: `${item.tier} Ticket x${item.quantity}`,
              eventDate: item.event?.startDate,
              amount: item.totalAmount,
              details: {
                transactionId: item.transactionId || item._id,
                paymentMethod:
                  item.paymentMethod === 'cash'
                    ? `Cash Payment (${item.cashCode})`
                    : 'Credit Card',
                itemName: `${item.tier} Tickets x${item.quantity}`,
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
                tickets: [
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
        } else {
          setTransactions([])
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
    getTransactions()
  }, [user, router])

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
    console.log('Searching for:', {
      searchKeyword,
      transactionType,
      dateRangeStart,
      dateRangeEnd,
      paymentStatus,
    })
  }

  const handleClearFilters = () => {
    setSearchKeyword('')
    setTransactionType('')
    setDateRangeStart('')
    setDateRangeEnd('')
    setPaymentStatus('')
  }

  const toggleExpanded = (transactionId) => {
    setExpandedTransaction(
      expandedTransaction === transactionId ? null : transactionId
    )
  }

  const handleDownloadInvoice = (transaction) => {
    // Generate and download invoice PDF
    const invoiceHTML = `
      <html>
      <head>
        <title>Invoice - ${transaction.details.transactionId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { text-align: center; border-bottom: 3px solid #8B5CF6; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 28px; font-weight: bold; color: #8B5CF6; margin-bottom: 5px; }
          .invoice-title { font-size: 24px; margin: 20px 0; }
          .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .invoice-details, .customer-details { width: 45%; }
          .invoice-details h3, .customer-details h3 { color: #8B5CF6; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .items-table th { background-color: #8B5CF6; color: white; }
          .total-section { text-align: right; margin-top: 30px; }
          .total-amount { font-size: 20px; font-weight: bold; color: #8B5CF6; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
          .status { display: inline-block; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; }
          .status.paid { background-color: #10B981; color: white; }
          .status.pending { background-color: #F59E0B; color: white; }
          .status.refunded { background-color: #EF4444; color: white; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">IKF FIGHTING CHAMPIONSHIPS</div>
          <div>Professional Martial Arts Organization</div>
          <h1 class="invoice-title">INVOICE</h1>
        </div>

        <div class="invoice-info">
          <div class="invoice-details">
            <h3>Invoice Details</h3>
            <p><strong>Invoice #:</strong> ${transaction.details.transactionId}</p>
            <p><strong>Date:</strong> ${formatDate(transaction.purchaseDateTime)}</p>
            <p><strong>Due Date:</strong> ${formatDate(transaction.purchaseDateTime)}</p>
            <p><strong>Status:</strong> <span class="status ${transaction.details.purchaseStatus.toLowerCase()}">${transaction.details.purchaseStatus}</span></p>
          </div>
          <div class="customer-details">
            <h3>Bill To</h3>
            <p><strong>${user?.firstName || ''} ${user?.lastName || ''}</strong></p>
            <p>${user?.email || ''}</p>
            <p>Customer ID: ${user?._id || 'N/A'}</p>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Event</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${transaction.details.itemName}</td>
              <td>${transaction.details.eventName}</td>
              <td>${transaction.details.tickets?.[0]?.quantity || 1}</td>
              <td>$${(transaction.details.tickets?.[0]?.price || transaction.amount).toFixed(2)}</td>
              <td>$${transaction.amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-section">
          <p><strong>Subtotal: $${transaction.amount.toFixed(2)}</strong></p>
          <p><strong>Tax: $0.00</strong></p>
          <p class="total-amount">Total: $${transaction.amount.toFixed(2)}</p>
        </div>

        <div style="margin-top: 30px;">
          <h3 style="color: #8B5CF6;">Payment Information</h3>
          <p><strong>Payment Method:</strong> ${transaction.details.paymentMethod}</p>
          <p><strong>Transaction Type:</strong> ${transaction.transactionType}</p>
          ${transaction.details.ticketCode ? `<p><strong>Ticket Code:</strong> ${transaction.details.ticketCode}</p>` : ''}
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>This invoice was automatically generated on ${new Date().toLocaleDateString()}</p>
          <p>IKF Fighting Championships • Visit our website for more information</p>
        </div>
      </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    printWindow.document.write(invoiceHTML)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 500)
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
                                          onClick={() => handleDownloadInvoice(transaction)}
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
                                                onClick={() => handleViewQRCode(transaction)}
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
              <div className='mb-6'>
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
              </div>

              <div className='mb-6 text-left'>
                <div className='text-sm text-gray-600 mb-2'>Receipt Details</div>
                <div className='bg-gray-50 p-4 rounded space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span>Transaction ID:</span>
                    <span className='font-mono'>{selectedTransaction.details.transactionId}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Item:</span>
                    <span>{selectedTransaction.details.itemName}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Amount:</span>
                    <span className='font-bold'>${selectedTransaction.amount.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Status:</span>
                    <span className={`font-medium ${
                      selectedTransaction.details.redemptionStatus === 'Redeemed'
                        ? 'text-green-600'
                        : 'text-blue-600'
                    }`}>
                      {selectedTransaction.details.redemptionStatus === 'Redeemed' ? 'Used' : 'Active'}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Purchase Date:</span>
                    <span>{formatDateTime(selectedTransaction.purchaseDateTime)}</span>
                  </div>
                  {selectedTransaction.details.redeemedAt && (
                    <div className='flex justify-between'>
                      <span>Used Date:</span>
                      <span>{formatDateTime(selectedTransaction.details.redeemedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className='flex gap-3 justify-center'>
                <button
                  onClick={() => {
                    // Print receipt functionality
                    const receiptHTML = `
                      <html>
                      <head>
                        <title>Receipt - ${selectedTransaction.details.ticketCode}</title>
                        <style>
                          body { font-family: Arial, sans-serif; margin: 20px; color: #333; text-align: center; }
                          .header { border-bottom: 2px solid #8B5CF6; padding-bottom: 15px; margin-bottom: 20px; }
                          .company-name { font-size: 20px; font-weight: bold; color: #8B5CF6; }
                          .ticket-code { font-family: monospace; font-size: 18px; font-weight: bold; background: #f5f5f5; padding: 10px; margin: 15px 0; border: 1px solid #ddd; }
                          .details { text-align: left; margin: 20px 0; }
                          .details table { width: 100%; border-collapse: collapse; }
                          .details td { padding: 8px; border-bottom: 1px solid #eee; }
                          .details td:first-child { font-weight: bold; }
                          .footer { margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <div class="company-name">IKF FIGHTING CHAMPIONSHIPS</div>
                          <div>Ticket Receipt</div>
                        </div>
                        
                        <h2>${selectedTransaction.details.eventName}</h2>
                        
                        <div class="ticket-code">
                          Ticket Code: ${selectedTransaction.details.ticketCode}
                        </div>
                        
                        <div class="details">
                          <table>
                            <tr><td>Transaction ID:</td><td>${selectedTransaction.details.transactionId}</td></tr>
                            <tr><td>Item:</td><td>${selectedTransaction.details.itemName}</td></tr>
                            <tr><td>Amount:</td><td>$${selectedTransaction.amount.toFixed(2)}</td></tr>
                            <tr><td>Payment Method:</td><td>${selectedTransaction.details.paymentMethod}</td></tr>
                            <tr><td>Purchase Date:</td><td>${formatDateTime(selectedTransaction.purchaseDateTime)}</td></tr>
                            <tr><td>Status:</td><td>${selectedTransaction.details.redemptionStatus === 'Redeemed' ? 'Used' : 'Active'}</td></tr>
                            ${selectedTransaction.details.redeemedAt ? `<tr><td>Used Date:</td><td>${formatDateTime(selectedTransaction.details.redeemedAt)}</td></tr>` : ''}
                          </table>
                        </div>
                        
                        <div class="footer">
                          <p>Present this ticket code at the event entrance</p>
                          <p>Receipt generated on ${new Date().toLocaleDateString()}</p>
                        </div>
                      </body>
                      </html>
                    `
                    const printWindow = window.open('', '_blank')
                    printWindow.document.write(receiptHTML)
                    printWindow.document.close()
                    setTimeout(() => {
                      printWindow.print()
                    }, 500)
                  }}
                  className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm transition-colors'
                >
                  Print Receipt
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className='bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors'
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyPurchases
