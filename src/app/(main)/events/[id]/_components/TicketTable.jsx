'use client'

import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import axios from '../../../../../shared/axios'
import { API_BASE_URL } from '../../../../../constants'

const TicketTable = ({ eventId }) => {
  const [ticketData, setTicketData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSpectatorTickets = async () => {
      if (!eventId) {
        setError('Event ID is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await axios.get(
          `${API_BASE_URL}/spectator-ticket/${eventId}`
        )

        if (response.data.success && response.data.data) {
          setTicketData(response.data.data)
        } else {
          setError('No spectator tickets found for this event')
        }
      } catch (err) {
        console.error('Error fetching spectator tickets:', err)
        setError('Failed to load spectator tickets')
      } finally {
        setLoading(false)
      }
    }

    fetchSpectatorTickets()
  }, [eventId])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className='bg-[#1b0c2e] rounded-lg p-6'>
        <div className='flex items-center justify-center py-8'>
          <Loader2 className='h-6 w-6 animate-spin text-purple-500 mr-3' />
          <span className='text-gray-400'>Loading ticket information...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='bg-[#1b0c2e] rounded-lg p-6'>
        <div className='text-center py-8'>
          <p className='text-red-400 mb-2'>Error</p>
          <p className='text-gray-400'>{error}</p>
        </div>
      </div>
    )
  }

  if (!ticketData || !ticketData.tiers || ticketData.tiers.length === 0) {
    return (
      <div className='bg-[#1b0c2e] rounded-lg p-6'>
        <div className='text-center py-8'>
          <p className='text-gray-400'>No ticket types available</p>
        </div>
      </div>
    )
  }

  const sortedTiers = [...ticketData.tiers].sort((a, b) => a.order - b.order)

  return (
    <div className='bg-[#1b0c2e] rounded-lg p-6'>
      <div className='mb-6'>
        <h3 className='text-xl font-bold text-white mb-2'>Ticket Price List</h3>
        <p className='text-gray-400 text-sm'>
          Available ticket types and pricing
        </p>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-gray-600'>
              <th className='text-left py-3 px-4 text-gray-300 font-medium'>
                Ticket Type
              </th>
              <th className='text-left py-3 px-4 text-gray-300 font-medium'>
                Description
              </th>
              <th className='text-right py-3 px-4 text-gray-300 font-medium'>
                Price
              </th>
              <th className='text-right py-3 px-4 text-gray-300 font-medium'>
                Available
              </th>
              <th className='text-center py-3 px-4 text-gray-300 font-medium'>
                Limit Per User
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTiers.map((tier, index) => (
              <tr
                key={index}
                className='border-b border-gray-700 last:border-b-0 hover:bg-gray-800/30 transition-colors'
              >
                <td className='py-4 px-4'>
                  <div className='font-semibold text-white'>{tier.name}</div>
                  {tier.availabilityMode && (
                    <div className='text-xs text-gray-400 mt-1'>
                      {tier.availabilityMode === 'Both'
                        ? 'Online & At Door'
                        : tier.availabilityMode}
                    </div>
                  )}
                </td>
                <td className='py-4 px-4 text-gray-300'>
                  {tier.description}
                  {tier.refundPolicyNotes && (
                    <div className='text-xs text-gray-500 mt-1'>
                      {tier.refundPolicyNotes}
                    </div>
                  )}
                </td>
                <td className='py-4 px-4 text-right'>
                  <span className='text-green-400 font-bold text-lg'>
                    {formatCurrency(tier.price)}
                  </span>
                </td>
                <td className='py-4 px-4 text-right'>
                  <div className='text-white'>
                    {tier.remaining} / {tier.capacity}
                  </div>
                  <div className='text-xs text-gray-400 mt-1'>
                    {Math.round((tier.remaining / tier.capacity) * 100)}%
                    available
                  </div>
                </td>
                <td className='py-4 px-4 text-center text-gray-300'>
                  {tier.limitPerUser || 'No limit'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TicketTable
