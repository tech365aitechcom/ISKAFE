'use client'
import React from 'react'
import {
  X,
  Ticket,
  Calendar,
  DollarSign,
  User,
  MapPin,
  Clock,
  CreditCard,
} from 'lucide-react'

function TicketDetailsModal({ ticket, onClose }) {
  if (!ticket) return null

  console.log('Ticket details:', ticket)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return 'Invalid Date'
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    } catch {
      return 'Invalid Time'
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    } catch {
      return 'Invalid Date'
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4'>
      <div className='bg-slate-900 rounded-xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-slate-700'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-blue-600 rounded-lg'>
              <Ticket size={20} className='text-white' />
            </div>
            <div>
              <h2 className='text-xl font-semibold text-white'>
                Ticket Details
              </h2>
              <p className='text-slate-400 text-sm'>
                {ticket.tier} • {ticket.event?.name || 'Unknown Event'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-slate-800 rounded-lg transition-colors'
          >
            <X size={20} className='text-slate-400 hover:text-white' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 space-y-6'>
          {/* Ticket Information */}
          <div className='bg-slate-800 rounded-lg p-4'>
            <h3 className='text-lg font-medium text-white mb-4 flex items-center gap-2'>
              <Ticket size={18} />
              Ticket Information
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              <div>
                <label className='text-slate-400 text-sm'>Ticket Type</label>
                <p className='text-white font-medium'>{ticket.tier || 'N/A'}</p>
              </div>
              <div>
                <label className='text-slate-400 text-sm'>Quantity</label>
                <p className='text-white font-medium'>{ticket.quantity || 0}</p>
              </div>
              <div>
                <label className='text-slate-400 text-sm'>Unit Price</label>
                <p className='text-white font-medium'>
                  $
                  {ticket.unitPrice ||
                    (ticket.totalAmount / ticket.quantity || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <label className='text-slate-400 text-sm'>Total Amount</label>
                <p className='text-green-400 font-semibold text-lg'>
                  ${ticket.totalAmount || 0}
                </p>
              </div>
              <div>
                <label className='text-slate-400 text-sm'>Transaction ID</label>
                <p className='text-white font-mono text-sm'>
                  {ticket._id || ticket.id || 'N/A'}
                </p>
              </div>
              <div>
                <label className='text-slate-400 text-sm'>Purchase Date</label>
                <p className='text-white'>
                  {formatDateTime(ticket.createdAt || ticket.purchaseDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Event Information */}
          {ticket.event && (
            <div className='bg-slate-800 rounded-lg p-4'>
              <h3 className='text-lg font-medium text-white mb-4 flex items-center gap-2'>
                <Calendar size={18} />
                Event Information
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-slate-400 text-sm'>Event Name</label>
                  <p className='text-white font-medium'>
                    {ticket.event.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className='text-slate-400 text-sm'>Event Date</label>
                  <p className='text-white'>
                    {formatDate(ticket.event.startDate)}
                  </p>
                </div>
                <div>
                  <label className='text-slate-400 text-sm'>Event Time</label>
                  <p className='text-white'>
                    {formatTime(ticket.event.startDate)}
                  </p>
                </div>
                <div>
                  <label className='text-slate-400 text-sm'>Venue</label>
                  <p className='text-white'>
                    {ticket.event.venueName ||
                      ticket.event.venue?.name ||
                      ticket.event.venue ||
                      'N/A'}
                  </p>
                </div>
                {ticket.event.description && (
                  <div className='md:col-span-2'>
                    <label className='text-slate-400 text-sm'>
                      Event Description
                    </label>
                    <p className='text-white'>{ticket.event.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Purchaser Information */}
          {(ticket.purchaserName ||
            ticket.purchaserEmail ||
            ticket.customerInfo) && (
            <div className='bg-slate-800 rounded-lg p-4'>
              <h3 className='text-lg font-medium text-white mb-4 flex items-center gap-2'>
                <User size={18} />
                Purchaser Information
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-slate-400 text-sm'>Name</label>
                  <p className='text-white'>
                    {ticket.purchaserName ||
                      ticket.customerInfo?.name ||
                      `${ticket.customerInfo?.firstName || ''} ${
                        ticket.customerInfo?.lastName || ''
                      }`.trim() ||
                      'N/A'}
                  </p>
                </div>
                <div>
                  <label className='text-slate-400 text-sm'>Email</label>
                  <p className='text-white'>
                    {ticket.purchaserEmail ||
                      ticket.customerInfo?.email ||
                      'N/A'}
                  </p>
                </div>
                <div>
                  <label className='text-slate-400 text-sm'>Phone</label>
                  <p className='text-white'>
                    {ticket.customerInfo?.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className='text-slate-400 text-sm'>Address</label>
                  <p className='text-white'>
                    {ticket.customerInfo?.address || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className='bg-slate-800 rounded-lg p-4'>
            <h3 className='text-lg font-medium text-white mb-4 flex items-center gap-2'>
              <CreditCard size={18} />
              Payment Information
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              <div>
                <label className='text-slate-400 text-sm'>Payment Status</label>
                <p
                  className={`font-medium ${
                    ticket.paymentStatus === 'completed' ||
                    ticket.status === 'paid'
                      ? 'text-green-400'
                      : ticket.paymentStatus === 'pending'
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}
                >
                  {ticket.paymentStatus || ticket.status || 'N/A'}
                </p>
              </div>
              <div>
                <label className='text-slate-400 text-sm'>Payment Method</label>
                <p className='text-white'>{ticket.paymentMethod || 'N/A'}</p>
              </div>
              <div>
                <label className='text-slate-400 text-sm'>
                  Transaction Reference
                </label>
                <p className='text-white font-mono text-sm'>
                  {ticket.transactionRef || ticket.paymentId || 'N/A'}
                </p>
              </div>
              <div>
                <label className='text-slate-400 text-sm'>Currency</label>
                <p className='text-white'>{ticket.currency || 'USD'}</p>
              </div>
              <div>
                <label className='text-slate-400 text-sm'>Processing Fee</label>
                <p className='text-white'>${ticket.processingFee || '0.00'}</p>
              </div>
              <div>
                <label className='text-slate-400 text-sm'>Net Amount</label>
                <p className='text-white font-medium'>
                  $
                  {(
                    (ticket.totalAmount || 0) - (ticket.processingFee || 0)
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className='bg-slate-800 rounded-lg p-4'>
            <h3 className='text-lg font-medium text-white mb-4 flex items-center gap-2'>
              <Clock size={18} />
              Additional Details
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='text-slate-400 text-sm'>Ticket Status</label>
                <p
                  className={`font-medium ${
                    ticket.ticketStatus === 'valid' ||
                    ticket.ticketStatus === 'active'
                      ? 'text-green-400'
                      : ticket.ticketStatus === 'used' ||
                        ticket.ticketStatus === 'redeemed'
                      ? 'text-blue-400'
                      : ticket.ticketStatus === 'cancelled' ||
                        ticket.ticketStatus === 'refunded'
                      ? 'text-red-400'
                      : 'text-yellow-400'
                  }`}
                >
                  {ticket.ticketStatus || 'Active'}
                </p>
              </div>
              <div>
                <label className='text-slate-400 text-sm'>Source</label>
                <p className='text-white'>{ticket.source || 'Online'}</p>
              </div>
              <div>
                <label className='text-slate-400 text-sm'>
                  Discount Applied
                </label>
                <p className='text-white'>
                  {ticket.discountAmount ? `$${ticket.discountAmount}` : 'None'}
                </p>
              </div>
              <div>
                <label className='text-slate-400 text-sm'>Notes</label>
                <p className='text-white'>{ticket.notes || 'None'}</p>
              </div>
            </div>
          </div>

          {/* QR Code or Ticket Code */}
          {(ticket.ticketCode || ticket.qrCode) && (
            <div className='bg-slate-800 rounded-lg p-4'>
              <h3 className='text-lg font-medium text-white mb-4'>
                Ticket Code
              </h3>
              <div className='bg-slate-700 p-4 rounded-lg'>
                <p className='text-center font-mono text-lg text-yellow-400'>
                  {ticket.ticketCode || ticket.qrCode}
                </p>
                <p className='text-center text-slate-400 text-sm mt-2'>
                  Present this code at the event entrance
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='border-t border-slate-700 p-6'>
          <div className='flex justify-between items-center'>
            <div className='text-slate-400 text-sm'>
              Last Updated:{' '}
              {formatDateTime(ticket.updatedAt || ticket.createdAt)}
            </div>
            <div className='flex gap-3'>
              <button
                onClick={() => {
                  // Print ticket functionality
                  const printContent = `
                    <html>
                    <head>
                      <title>Ticket Details - ${ticket.tier}</title>
                      <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; border-bottom: 2px solid #ccc; padding-bottom: 20px; margin-bottom: 20px; }
                        .section { margin-bottom: 20px; }
                        .section h3 { border-bottom: 1px solid #ddd; padding-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                        th { background-color: #f5f5f5; }
                        .ticket-code { background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 18px; font-family: monospace; margin: 20px 0; }
                      </style>
                    </head>
                    <body>
                      <div class="header">
                        <h1>Ticket Details</h1>
                        <p>${ticket.tier} - ${ticket.event?.name || 'Event'}</p>
                      </div>
                      <div class="section">
                        <h3>Ticket Information</h3>
                        <table>
                          <tr><td><strong>Type:</strong></td><td>${
                            ticket.tier
                          }</td></tr>
                          <tr><td><strong>Quantity:</strong></td><td>${
                            ticket.quantity
                          }</td></tr>
                          <tr><td><strong>Total Amount:</strong></td><td>$${
                            ticket.totalAmount
                          }</td></tr>
                          <tr><td><strong>Purchase Date:</strong></td><td>${formatDateTime(
                            ticket.createdAt || ticket.purchaseDate
                          )}</td></tr>
                        </table>
                      </div>
                      ${
                        ticket.event
                          ? `
                      <div class="section">
                        <h3>Event Information</h3>
                        <table>
                          <tr><td><strong>Event:</strong></td><td>${
                            ticket.event.name
                          }</td></tr>
                          <tr><td><strong>Date:</strong></td><td>${formatDate(
                            ticket.event.startDate
                          )}</td></tr>
                          <tr><td><strong>Time:</strong></td><td>${formatTime(
                            ticket.event.startDate
                          )}</td></tr>
                          <tr><td><strong>Venue:</strong></td><td>${
                            ticket.event.venueName ||
                            ticket.event.venue?.name ||
                            ticket.event.venue ||
                            'N/A'
                          }</td></tr>
                        </table>
                      </div>
                      `
                          : ''
                      }
                      ${
                        ticket.ticketCode || ticket.qrCode
                          ? `
                      <div class="ticket-code">
                        <p><strong>Ticket Code:</strong></p>
                        <p>${ticket.ticketCode || ticket.qrCode}</p>
                      </div>
                      `
                          : ''
                      }
                    </body>
                    </html>
                  `
                  const printWindow = window.open('', '_blank')
                  printWindow.document.write(printContent)
                  printWindow.document.close()
                  setTimeout(() => {
                    printWindow.print()
                  }, 500)
                }}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
              >
                Print Ticket
              </button>
              <button
                onClick={onClose}
                className='px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketDetailsModal
