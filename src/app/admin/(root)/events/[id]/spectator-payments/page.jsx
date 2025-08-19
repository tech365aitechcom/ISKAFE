// File: app/admin/events/[id]/spectator-payments/page.jsx
'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ChevronLeft, Download, Search } from 'lucide-react'
import Loader from '../../../../../_components/Loader'
import PaginationHeader from '../../../../../_components/PaginationHeader'
import Pagination from '../../../../../_components/Pagination'
import axios from '../../../../../../shared/axios'
import { jsPDF } from 'jspdf'
import { API_BASE_URL } from '../../../../../../constants'
import useStore from '../../../../../../stores/useStore'

const SpectatorPaymentsPage = () => {
  const params = useParams()
  const router = useRouter()
  const user = useStore((state) => state.user)
  const eventId = params.id
  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState(null)
  const [payments, setPayments] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    startDate: '',
    endDate: '',
    ticketType: 'all',
    minTotal: '',
    maxTotal: '',
    minNet: '',
    maxNet: '',
  })

  // Summary stats
  const [stats, setStats] = useState({
    totalFee: 0,
    totalCollected: 0,
    netRevenue: 0,
  })

  // Fetch event data
  const fetchEvent = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setEvent(data.data)
        }
      }
    } catch (err) {
      console.error('Error fetching event:', err)
    }
  }

  // Fetch spectator payments data
  const fetchSpectatorPayments = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `/spectator-ticket/purchase/event/${eventId}?page=${currentPage}&limit=${limit}`
      )
      console.log('API Response:', response.data)
      if (response.data.success) {
        const rawData = response.data.data.items || []

        // Transform API data to match UI requirements
        const transformedData = rawData.map((item, index) => ({
          id: item._id,
          serialNumber: (currentPage - 1) * limit + index + 1,
          date: item.createdAt,
          payer: item.user
            ? `${item.user.firstName} ${item.user.lastName}`
            : item.guestDetails
            ? `${item.guestDetails.firstName} ${item.guestDetails.lastName}`
            : 'Guest',
          email: item.user
            ? item.user.email
            : item.guestDetails
            ? item.guestDetails.email
            : '',
          ticketDescription: `${item.tier} - Event Ticket`,
          quantity: item.quantity,
          unitPrice: item.totalAmount / item.quantity,
          fee: item.fee || 0,
          total: item.totalAmount,
          net: item.netRevenue,
          paymentStatus: item.paymentStatus,
          paymentMethod: item.paymentMethod,
          ticketCode: item.ticketCode,
          redemptionStatus: item.redemptionStatus,
          cashCode: item.cashCode,
          transactionId: item.transactionId,
          qrCode: item.qrCode,
        }))

        setPayments(transformedData)
        setTotalItems(response.data.data.pagination.totalItems)
        setTotalPages(response.data.data.pagination.totalPages)

        // Use backend totals instead of calculating from client data
        const backendStats = {
          totalFee: response.data.data.totals.totalFee,
          totalCollected: response.data.data.totals.totalCollected,
          netRevenue: response.data.data.totals.netRevenue,
        }
        setStats(backendStats)
      }
    } catch (error) {
      console.error('Error fetching spectator payments:', error)
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (eventId) {
      fetchEvent()
      fetchSpectatorPayments()
    }
  }, [eventId, currentPage, limit])

  // Export to CSV function
  const exportToCSV = () => {
    const headers = [
      'S. No.',
      'Date',
      'Payer',
      'Email',
      'Ticket Description',
      'Ticket(s)',
      'Fee',
      'Total',
      'Net',
    ]

    const data = payments.map((payment, index) => [
      index + 1,
      new Date(payment.date).toLocaleString(),
      payment.payer,
      payment.email,
      payment.ticketDescription,
      `${payment.quantity} @ $${payment.unitPrice.toFixed(2)}`,
      `$${payment.fee.toFixed(2)}`,
      `$${payment.total.toFixed(2)}`,
      `$${payment.net.toFixed(2)}`,
    ])

    let csvContent =
      'data:text/csv;charset=utf-8,' +
      headers.join(',') +
      '\n' +
      data.map((row) => row.join(',')).join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `spectator_payments_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export to PDF function
  const exportToPDF = async () => {
    try {
      // Dynamically import both jsPDF and jspdf-autotable
      const [{ jsPDF }, autoTableModule] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ])

      const doc = new jsPDF()
      const title = 'Spectator Payments Report'
      const headers = [
        [
          'S. No.',
          'Date',
          'Payer',
          'Email',
          'Ticket Description',
          'Ticket(s)',
          'Fee',
          'Total',
          'Net',
        ],
      ]

      const data = payments.map((payment, index) => [
        index + 1,
        new Date(payment.date).toLocaleString(),
        payment.payer,
        payment.email,
        payment.ticketDescription,
        `${payment.quantity} @ $${payment.unitPrice.toFixed(2)}`,
        `$${payment.fee.toFixed(2)}`,
        `$${payment.total.toFixed(2)}`,
        `$${payment.net.toFixed(2)}`,
      ])

      doc.text(title, 14, 15)

      // Use the autoTable function from the module
      autoTableModule.default(doc, {
        head: headers,
        body: data,
        startY: 20,
        theme: 'grid',
        headStyles: {
          fillColor: [18, 32, 70], // #122046
          textColor: 255, // White text
          fontStyle: 'bold',
        },
        styles: {
          cellPadding: 4,
          fontSize: 10,
          textColor: [0, 0, 0], // Black text for body
        },
        margin: { top: 20 },
      })

      doc.save(
        `spectator_payments_${new Date().toISOString().slice(0, 10)}.pdf`
      )
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Error generating PDF. Please try again.')
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
      <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
        {/* Header */}
        <div className='flex justify-between items-center mb-8'>
          <div className='flex items-center'>
            <button
              onClick={() => router.back()}
              className='flex items-center mr-4'
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className='text-2xl font-bold'>Spectator Payments</h1>
              {event && (
                <p className='text-sm text-gray-300 mt-1'>
                  {event.name} -{' '}
                  {event.startDate
                    ? new Date(event.startDate).toLocaleDateString()
                    : 'Date not set'}
                </p>
              )}
            </div>
          </div>
          <div className='flex space-x-4'>
            <button
              onClick={exportToPDF}
              className='flex items-center px-4 py-2 bg-blue-600 rounded-lg mr-2 hover:bg-blue-700 transition-colors'
            >
              <Download size={16} className='mr-2' />
              PDF
            </button>
            <button
              onClick={exportToCSV}
              className='flex items-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors'
            >
              <Download size={16} className='mr-2' />
              CSV
            </button>
          </div>
        </div>

        {/* Summary Panel */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className='bg-[#122046] rounded-lg p-6 text-center'>
            <p className='text-[#AEB9E1] text-sm'>Total Spectator Fees</p>
            <p className='text-2xl font-bold mt-2'>
              ${stats.totalFee.toFixed(2)}
            </p>
          </div>
          <div className='bg-[#122046] rounded-lg p-6 text-center'>
            <p className='text-[#AEB9E1] text-sm'>Total Amount Collected</p>
            <p className='text-2xl font-bold mt-2'>
              ${stats.totalCollected.toFixed(2)}
            </p>
          </div>
          <div className='bg-[#122046] rounded-lg p-6 text-center'>
            <p className='text-[#AEB9E1] text-sm'>Total Net Revenue</p>
            <p className='text-2xl font-bold mt-2'>
              ${stats.netRevenue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className='bg-[#122046] rounded-lg p-6 mb-8'>
          <h2 className='text-lg font-bold mb-4'>Filters</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {/* Name Filter */}
            <div>
              <label className='block text-sm text-[#AEB9E1] mb-1'>
                Search by Name
              </label>
              <div className='relative'>
                <input
                  type='text'
                  className='w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2 pl-10 text-white'
                  placeholder='Search by name'
                  value={filters.name}
                  onChange={(e) =>
                    setFilters({ ...filters, name: e.target.value })
                  }
                />
                <Search
                  size={16}
                  className='absolute left-3 top-3 text-[#AEB9E1]'
                />
              </div>
            </div>

            {/* Email Filter */}
            <div>
              <label className='block text-sm text-[#AEB9E1] mb-1'>
                Search by Email
              </label>
              <div className='relative'>
                <input
                  type='email'
                  className='w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2 pl-10 text-white'
                  placeholder='Search by email'
                  value={filters.email}
                  onChange={(e) =>
                    setFilters({ ...filters, email: e.target.value })
                  }
                />
                <Search
                  size={16}
                  className='absolute left-3 top-3 text-[#AEB9E1]'
                />
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className='block text-sm text-[#AEB9E1] mb-1'>
                Date Range
              </label>
              <div className='flex space-x-2'>
                <input
                  type='date'
                  className='w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2 text-white'
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                />
                <span className='self-center text-xs'>to</span>
                <input
                  type='date'
                  className='w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2 text-white'
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Ticket Type Filter */}
            <div>
              <label className='block text-sm text-[#AEB9E1] mb-1'>
                Ticket Type
              </label>
              <select
                className='w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2 text-white'
                value={filters.ticketType}
                onChange={(e) =>
                  setFilters({ ...filters, ticketType: e.target.value })
                }
              >
                <option value='all'>All Types</option>
                <option value='general'>General Admission</option>
                <option value='vip'>VIP</option>
                <option value='adult'>Adult</option>
                <option value='child'>Child</option>
              </select>
            </div>

            {/* Total Amount Range Filter */}
            <div>
              <label className='block text-sm text-[#AEB9E1] mb-1'>
                Total Amount Range
              </label>
              <div className='flex space-x-2'>
                <input
                  type='number'
                  className='w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2 text-white'
                  placeholder='Min'
                  value={filters.minTotal}
                  onChange={(e) =>
                    setFilters({ ...filters, minTotal: e.target.value })
                  }
                />
                <span className='self-center text-xs'>to</span>
                <input
                  type='number'
                  className='w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2 text-white'
                  placeholder='Max'
                  value={filters.maxTotal}
                  onChange={(e) =>
                    setFilters({ ...filters, maxTotal: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Net Revenue Range Filter */}
            <div>
              <label className='block text-sm text-[#AEB9E1] mb-1'>
                Net Revenue Range
              </label>
              <div className='flex space-x-2'>
                <input
                  type='number'
                  className='w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2 text-white'
                  placeholder='Min'
                  value={filters.minNet}
                  onChange={(e) =>
                    setFilters({ ...filters, minNet: e.target.value })
                  }
                />
                <span className='self-center text-xs'>to</span>
                <input
                  type='number'
                  className='w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2 text-white'
                  placeholder='Max'
                  value={filters.maxNet}
                  onChange={(e) =>
                    setFilters({ ...filters, maxNet: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
          {/* Pagination Header */}
          <PaginationHeader
            limit={limit}
            setLimit={setLimit}
            currentPage={currentPage}
            totalItems={totalItems}
            label='payments'
          />

          <div className='overflow-x-auto'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='bg-[#122046]'>
                  <th className='p-4 text-left'>S. No.</th>
                  <th className='p-4 text-left'>Date</th>
                  <th className='p-4 text-left'>Payer</th>
                  <th className='p-4 text-left'>Email</th>
                  <th className='p-4 text-left'>Ticket Description</th>
                  <th className='p-4 text-left'>Ticket(s)</th>
                  <th className='p-4 text-left'>Fee</th>
                  <th className='p-4 text-left'>Total</th>
                  <th className='p-4 text-left'>Net</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan='9' className='text-center p-8'>
                      No spectator payments found
                    </td>
                  </tr>
                ) : (
                  payments.map((payment, index) => {
                    return (
                      <tr
                        key={payment.id}
                        className='border-b border-[#343B4F] hover:bg-[#122046]'
                      >
                        <td className='p-4'>{payment.serialNumber}</td>
                        <td className='p-4'>
                          {new Date(payment.date).toLocaleDateString()}{' '}
                          {new Date(payment.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className='p-4'>{payment.payer}</td>
                        <td className='p-4'>{payment.email}</td>
                        <td className='p-4'>{payment.ticketDescription}</td>
                        <td className='p-4'>
                          {payment.quantity} @ ${payment.unitPrice.toFixed(2)}
                        </td>
                        <td className='p-4'>${payment.fee.toFixed(2)}</td>
                        <td className='p-4'>${payment.total.toFixed(2)}</td>
                        <td className='p-4'>${payment.net.toFixed(2)}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  )
}

export default SpectatorPaymentsPage
