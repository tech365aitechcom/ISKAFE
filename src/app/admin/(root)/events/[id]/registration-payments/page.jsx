'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Download, Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Loader from '../../../../../_components/Loader'
import { API_BASE_URL } from '../../../../../../constants'
import PaginationHeader from '../../../../../_components/PaginationHeader'
import Pagination from '../../../../../_components/Pagination'
import moment from 'moment'
import useStore from '../../../../../../stores/useStore'

const RegistrationPaymentsPage = () => {
  const params = useParams()
  const user = useStore((state) => state.user)
  const eventId = params.id
  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(1)
  const [limit, setLimit] = useState(10)
  const [payments, setPayments] = useState([])
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    startDate: '',
    endDate: '',
    paymentType: 'all',
    minAmount: '',
    maxAmount: '',
    transactionId: '',
    last4: '',
  })
  const [totalCollected, setTotalCollected] = useState(0)

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

  // Fetch registration data from API
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `${API_BASE_URL}/registrations/event/${eventId}/paid`
        )
        3
        const data = await response.json()

        if (data.success) {
          const registrations = data.data.items
          const pagination = data.data.pagination
          const totalCollected = data.data.totalCollection

          const paymentsData = registrations.map((reg, index) => ({
            id: reg._id,
            eventId: reg.event,
            date: reg.createdAt,
            description: `Event registration fee - ${reg.registrationType}`,
            type: reg.paymentMethod,
            total: reg.amount,
            payer: `${reg.firstName} ${reg.lastName}`,
            email: reg.email,
            transactionId: reg.squareDetails?.transactionId || null,
            receiptNumber: reg.squareDetails?.receiptNumber || null,
            orderId: reg.squareDetails?.orderId || null,
            last4: reg.squareDetails?.last4 || null,
          }))

          setPayments(paymentsData)
          setTotalPages(pagination.totalPages)
          setTotalItems(pagination.totalItems)
          setTotalCollected(totalCollected)
        }
      } catch (error) {
        console.error('Error fetching registrations:', error)
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchRegistrations()
      fetchEvent()
    }
  }, [eventId, limit, currentPage])

  // Apply filters
  const filteredPayments = payments.filter((payment) => {
    const paymentDate = new Date(payment.date)
    const startDate = filters.startDate ? new Date(filters.startDate) : null
    const endDate = filters.endDate ? new Date(filters.endDate) : null
    const minAmount = filters.minAmount ? parseFloat(filters.minAmount) : null
    const maxAmount = filters.maxAmount ? parseFloat(filters.maxAmount) : null

    return (
      (!filters.name ||
        payment.payer.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.email ||
        payment.email.toLowerCase().includes(filters.email.toLowerCase())) &&
      (!filters.paymentType ||
        filters.paymentType === 'all' ||
        payment.type.toLowerCase() === filters.paymentType.toLowerCase()) &&
      (!startDate || paymentDate >= startDate) &&
      (!endDate || paymentDate <= endDate) &&
      (!minAmount || payment.total >= minAmount) &&
      (!maxAmount || payment.total <= maxAmount) &&
      (!filters.transactionId ||
        (payment.transactionId &&
          payment.transactionId
            .toLowerCase()
            .includes(filters.transactionId.toLowerCase()))) &&
      (!filters.last4 ||
        (payment.last4 && payment.last4.includes(filters.last4)))
    )
  })

  // Export to Excel function
  const exportToExcel = () => {
    if (filteredPayments.length === 0) {
      alert('No data to export')
      return
    }

    const headers = [
      'Sr No',
      'Reg Date',
      'Description',
      'Event ID',
      'Type',
      'Total',
      'Payer',
      'Email',
      'Square Transaction ID',
      'Square Receipt Number',
      'Square Order ID',
      'Last4',
    ]

    // Helper function to escape CSV values
    const escapeCSVValue = (value) => {
      if (value == null) return ''
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }

    const data = filteredPayments.map((payment, index) => [
      index + 1,
      `${new Date(payment.date).toLocaleDateString()} ${new Date(payment.date).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      payment.description,
      payment.eventId,
      payment.type,
      payment.total.toFixed(2), // Remove $ for Excel compatibility
      payment.payer,
      payment.email,
      payment.transactionId || 'N/A',
      payment.receiptNumber || 'N/A',
      payment.orderId || 'N/A',
      payment.last4 || 'N/A',
    ])

    // Add BOM for proper Excel UTF-8 handling
    const BOM = '\uFEFF'
    const csvContent = BOM + 
      headers.map(escapeCSVValue).join(',') + 
      '\n' + 
      data.map(row => row.map(escapeCSVValue).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `registration_payments_${(event?.name || 'event').replace(/[^a-z0-9]/gi, '_')}_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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
            <Link href={`/admin/events/view/${eventId}`}>
              <button className='flex items-center mr-4'>
                <ArrowLeft size={24} />
              </button>
            </Link>
            <div>
              <h1 className='text-2xl font-bold'>Registration Payments</h1>
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
              onClick={exportToExcel}
              className='flex items-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors'
            >
              <Download size={16} className='mr-2' />
              Export
            </button>
          </div>
        </div>

        {/* Summary Panel */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className='bg-[#122046] rounded-lg p-6 text-center'>
            <p className='text-[#AEB9E1] text-sm'>Total Participants</p>
            <p className='text-2xl font-bold mt-2'>{totalItems}</p>
          </div>
          <div className='bg-[#122046] rounded-lg p-6 text-center'>
            <p className='text-[#AEB9E1] text-sm'>Total Amount Collected</p>
            <p className='text-2xl font-bold mt-2'>${totalCollected}</p>
          </div>
          <div className='bg-[#122046] rounded-lg p-6 text-center'>
            <p className='text-[#AEB9E1] text-sm'>Payment Cut-off Date</p>
            <p className='text-2xl font-bold mt-2'>
              {moment().format('YYYY-MM-DD HH:mm')}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className='bg-[#122046] rounded-lg p-6 mb-8'>
          <h2 className='text-lg font-bold mb-4'>Filters</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {/* Name Filter */}
            <div>
              <label className='block text-sm text-[#AEB9E1] mb-1'>
                Search by Name
              </label>
              <div className='relative'>
                <input
                  type='text'
                  className='w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2 pl-10'
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
                  className='w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2 pl-10'
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

            {/* Payment Type Filter */}
            <div>
              <label className='block text-sm text-[#AEB9E1] mb-1'>
                Payment Type
              </label>
              <select
                className='w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2'
                value={filters.paymentType}
                onChange={(e) =>
                  setFilters({ ...filters, paymentType: e.target.value })
                }
              >
                <option value='all'>All Types</option>
                <option value='card'>Card</option>
                <option value='cash'>Cash</option>
              </select>
            </div>

            {/* Transaction ID Filter */}
            <div>
              <label className='block text-sm text-[#AEB9E1] mb-1'>
                Transaction ID
              </label>
              <div className='relative'>
                <input
                  type='text'
                  className='w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2 pl-10'
                  placeholder='Search by transaction ID'
                  value={filters.transactionId}
                  onChange={(e) =>
                    setFilters({ ...filters, transactionId: e.target.value })
                  }
                />
                <Search
                  size={16}
                  className='absolute left-3 top-3 text-[#AEB9E1]'
                />
              </div>
            </div>
          </div>

          {/* Second Row of Filters */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
            {/* Date Range Filter */}
            <div>
              <label className='block text-sm text-[#AEB9E1] mb-2'>
                Date Range
              </label>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <input
                    type='date'
                    className='w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-3 py-2 text-sm'
                    value={filters.startDate}
                    onChange={(e) =>
                      setFilters({ ...filters, startDate: e.target.value })
                    }
                  />
                  <span className='text-xs text-[#AEB9E1] mt-1 block'>
                    From
                  </span>
                </div>
                <div>
                  <input
                    type='date'
                    className='w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-3 py-2 text-sm'
                    value={filters.endDate}
                    onChange={(e) =>
                      setFilters({ ...filters, endDate: e.target.value })
                    }
                  />
                  <span className='text-xs text-[#AEB9E1] mt-1 block'>To</span>
                </div>
              </div>
            </div>

            {/* Amount Range Filter */}
            <div>
              <label className='block text-sm text-[#AEB9E1] mb-2'>
                Amount Range ($)
              </label>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <input
                    type='number'
                    className='w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-3 py-2'
                    placeholder='0.00'
                    min='0'
                    step='0.01'
                    value={filters.minAmount}
                    onChange={(e) =>
                      setFilters({ ...filters, minAmount: e.target.value })
                    }
                  />
                  <span className='text-xs text-[#AEB9E1] mt-1 block'>Min</span>
                </div>
                <div>
                  <input
                    type='number'
                    className='w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-3 py-2'
                    placeholder='0.00'
                    min='0'
                    step='0.01'
                    value={filters.maxAmount}
                    onChange={(e) =>
                      setFilters({ ...filters, maxAmount: e.target.value })
                    }
                  />
                  <span className='text-xs text-[#AEB9E1] mt-1 block'>Max</span>
                </div>
              </div>
            </div>
          </div>

          {/* Third Row of Filters */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-6'>
            {/* Last 4 Filter */}
            <div>
              <label className='block text-sm text-[#AEB9E1] mb-2'>
                Card Last 4
              </label>
              <div className='relative'>
                <input
                  type='text'
                  className='w-full bg-[#0A1330] border border-[#343B4F] rounded-lg px-4 py-2 pl-10'
                  placeholder='Last 4 digits'
                  maxLength='4'
                  value={filters.last4}
                  onChange={(e) =>
                    setFilters({ ...filters, last4: e.target.value })
                  }
                />
                <Search
                  size={16}
                  className='absolute left-3 top-3 text-[#AEB9E1]'
                />
              </div>
            </div>

            {/* Empty space for alignment */}
            <div></div>

            {/* Clear Filters Button */}
            <div className='flex items-end'>
              <button
                onClick={() =>
                  setFilters({
                    name: '',
                    email: '',
                    startDate: '',
                    endDate: '',
                    paymentType: 'all',
                    minAmount: '',
                    maxAmount: '',
                    transactionId: '',
                    last4: '',
                  })
                }
                className='w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors'
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
          <PaginationHeader
            limit={limit}
            setLimit={setLimit}
            currentPage={currentPage}
            totalItems={totalItems}
            label='Registration Payments'
          />
          <div className='overflow-x-auto custom-scrollbar'>
            <table className='w-full text-sm text-left'>
              <thead>
                <tr className='text-gray-400 text-sm'>
                  <th className='p-4 text-left whitespace-nowrap'>Sr No</th>
                  <th className='p-4 text-left whitespace-nowrap'>Reg Date</th>
                  <th className='p-4 text-left whitespace-nowrap'>
                    Description
                  </th>
                  <th className='p-4 text-left whitespace-nowrap'>Event ID</th>
                  <th className='p-4 text-left whitespace-nowrap'>Type</th>
                  <th className='p-4 text-left whitespace-nowrap'>Total</th>
                  <th className='p-4 text-left whitespace-nowrap'>Payer</th>
                  <th className='p-4 text-left whitespace-nowrap'>Email</th>
                  <th className='p-4 text-left whitespace-nowrap'>
                    Square Transaction ID
                  </th>
                  <th className='p-4 text-left whitespace-nowrap'>
                    Square Receipt Number
                  </th>
                  <th className='p-4 text-left whitespace-nowrap'>
                    Square Order ID
                  </th>
                  <th className='p-4 text-left whitespace-nowrap'>Last4</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan='12' className='text-center p-8'>
                      No registration payments found
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment, index) => (
                    <tr
                      key={payment.id}
                      className={`cursor-pointer ${
                        index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                      }`}
                    >
                      <td className='p-4 whitespace-nowrap'>{index + 1}</td>
                      <td className='p-4 whitespace-nowrap'>
                        {new Date(payment.date).toLocaleDateString()}{' '}
                        {new Date(payment.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className='p-4 whitespace-nowrap'>
                        {payment.description}
                      </td>
                      <td className='p-4 whitespace-nowrap'>
                        {payment.eventId}
                      </td>
                      <td className='p-4 whitespace-nowrap capitalize'>
                        {payment.type}
                      </td>
                      <td className='p-4 whitespace-nowrap'>
                        ${payment.total.toFixed(2)}
                      </td>
                      <td className='p-4 whitespace-nowrap'>{payment.payer}</td>
                      <td className='p-4 whitespace-nowrap'>{payment.email}</td>
                      <td className='p-4 whitespace-nowrap'>
                        {payment.transactionId || 'N/A'}
                      </td>
                      <td className='p-4 whitespace-nowrap'>
                        {payment.receiptNumber || 'N/A'}
                      </td>
                      <td className='p-4 whitespace-nowrap'>
                        {payment.orderId || 'N/A'}
                      </td>
                      <td className='p-4 whitespace-nowrap'>
                        {payment.last4 || 'N/A'}
                      </td>
                    </tr>
                  ))
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

export default RegistrationPaymentsPage
