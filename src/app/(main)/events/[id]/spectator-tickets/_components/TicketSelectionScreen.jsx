'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '../../../../../../../components/ui/button'
import { Plus, Minus, Loader2 } from 'lucide-react'
import axios from '../../../../../../shared/axios'
import { API_BASE_URL } from '../../../../../../constants'

const TicketSelectionScreen = ({
  eventDetails,
  onNext,
  onBack,
  onCancel,
  purchaseData,
}) => {
  const params = useParams()
  const [ticketTypes, setTicketTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  const [selectedTickets, setSelectedTickets] = useState(
    purchaseData.tickets || []
  )

  useEffect(() => {
    const fetchSpectatorTickets = async () => {
      if (!params.id) {
        setError('Event ID is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await axios.get(
          `${API_BASE_URL}/spectator-ticket/${params.id}`
        )

        if (response.data.success && response.data.data.tiers) {
          const tiers = response.data.data.tiers.map((tier, index) => ({
            id: `tier-${index}`,
            tierName: tier.name,
            price: tier.price,
            description: tier.description,
            capacity: tier.capacity,
            remaining: tier.remaining,
            availabilityMode: tier.availabilityMode,
            salesStartDate: tier.salesStartDate,
            salesEndDate: tier.salesEndDate,
            limitPerUser: tier.limitPerUser,
            refundPolicyNotes: tier.refundPolicyNotes,
            order: tier.order,
          }))

          // Sort by order
          tiers.sort((a, b) => a.order - b.order)

          setTicketTypes(tiers)

          // Initialize selected tickets if not already set
          if (!purchaseData.tickets || purchaseData.tickets.length === 0) {
            setSelectedTickets(tiers.map((type) => ({ ...type, quantity: 0 })))
          } else {
            // Merge existing purchase data with new tier data
            const mergedTickets = tiers.map((tier) => {
              const existingTicket = purchaseData.tickets.find(
                (t) => t.id === tier.id
              )
              return {
                ...tier,
                quantity: existingTicket?.quantity || 0,
              }
            })
            setSelectedTickets(mergedTickets)
          }
        } else {
          setError('No spectator tickets found for this event')
        }
      } catch (err) {
        console.error('Error fetching spectator tickets:', err)

        let errorMessage = 'Failed to load spectator tickets. Please try again.'

        if (err.response?.status === 404) {
          errorMessage =
            err.response.data?.message ||
            'No spectator tickets found for this event.'
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message
        } else if (err.message) {
          errorMessage = `Error: ${err.message}`
        }

        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchSpectatorTickets()
  }, [params.id, purchaseData.tickets, retryCount])

  const updateQuantity = (ticketId, newQuantity) => {
    console.log('updateQuantity called:', {
      ticketId,
      newQuantity,
      selectedTickets,
      ticketTypes,
    })

    if (newQuantity < 0) return

    const ticketType = ticketTypes.find((t) => t.id === ticketId)
    if (!ticketType) {
      console.log('Ticket type not found:', ticketId)
      return
    }

    // Check if the new quantity exceeds available tickets
    if (newQuantity > ticketType.remaining) {
      alert(
        `Only ${ticketType.remaining} tickets remaining for ${ticketType.tierName}`
      )
      return
    }

    // Check if the new quantity exceeds per-user limit
    if (ticketType.limitPerUser && newQuantity > ticketType.limitPerUser) {
      alert(
        `Maximum ${ticketType.limitPerUser} tickets allowed per user for ${ticketType.tierName}`
      )
      return
    }

    setSelectedTickets((prev) => {
      const updated = prev.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, quantity: newQuantity } : ticket
      )
      console.log('Updated selectedTickets:', updated)
      return updated
    })
  }

  const getTotalQuantity = () => {
    return selectedTickets.reduce((sum, ticket) => sum + ticket.quantity, 0)
  }

  const getTotalPrice = () => {
    return selectedTickets.reduce(
      (sum, ticket) => sum + ticket.price * ticket.quantity,
      0
    )
  }

  const handleNext = () => {
    const ticketsWithQuantity = selectedTickets.filter(
      (ticket) => ticket.quantity > 0
    )

    if (ticketsWithQuantity.length === 0) {
      alert('Please select at least one ticket')
      return
    }

    onNext('fighters', {
      tickets: ticketsWithQuantity,
    })
  }

  if (loading) {
    return (
      <div className='bg-[#1b0c2e] rounded-lg p-8'>
        <div className='flex flex-col items-center justify-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin text-purple-500 mb-4' />
          <p className='text-gray-400'>Loading spectator tickets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='bg-[#1b0c2e] rounded-lg p-8'>
        <div className='text-center py-12'>
          <div className='mb-6'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-red-500'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>
            <h3 className='text-xl font-semibold text-white mb-2'>
              Unable to Load Tickets
            </h3>
            <p className='text-red-400 mb-6'>{error}</p>
          </div>

          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            <Button
              onClick={() => {
                setError(null)
                setRetryCount((prev) => prev + 1)
              }}
              className='bg-purple-600 hover:bg-purple-700 text-white'
            >
              Try Again
            </Button>
            <Button
              onClick={onBack}
              variant='outline'
              className='border-gray-600 text-gray-300 hover:bg-gray-700'
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  console.log('Rendering TicketSelectionScreen:', {
    ticketTypes,
    selectedTickets,
    loading,
    error,
  })

  return (
    <div className='bg-[#1b0c2e] rounded-lg p-8'>
      <div className='text-center mb-8'>
        <h2 className='text-2xl font-bold mb-2'>Select Your Tickets</h2>
        <p className='text-gray-400'>Choose your ticket type and quantity</p>
      </div>

      {/* Total Summary */}
      <div className='bg-[#0A1330] rounded-lg p-4 mb-6'>
        <div className='flex justify-between items-center'>
          <div className='text-lg font-medium'>
            Total: {getTotalQuantity()} ticket
            {getTotalQuantity() !== 1 ? 's' : ''}
          </div>
          <div className='text-2xl font-bold text-green-400'>
            ${getTotalPrice().toFixed(2)}
          </div>
        </div>
      </div>

      {/* Ticket Types */}
      <div className='space-y-4 mb-8'>
        {ticketTypes.map((ticketType) => {
          const selectedTicket = selectedTickets.find(
            (t) => t.id === ticketType.id
          )
          const quantity = selectedTicket?.quantity || 0

          return (
            <div key={ticketType.id} className='bg-[#0A1330] rounded-lg p-6'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex-1'>
                  <h3 className='text-xl font-bold text-white'>
                    {ticketType.tierName}
                  </h3>
                  <p className='text-gray-400 text-sm mt-1'>
                    {ticketType.description}
                  </p>
                  <div className='flex items-center gap-4 mt-2'>
                    <p className='text-2xl font-bold text-green-400'>
                      ${ticketType.price.toFixed(2)}
                    </p>
                    <div className='text-sm text-gray-400'>
                      <p>
                        {ticketType.remaining} / {ticketType.capacity} available
                      </p>
                      {ticketType.limitPerUser && (
                        <p>Max {ticketType.limitPerUser} per person</p>
                      )}
                    </div>
                  </div>
                  {ticketType.refundPolicyNotes && (
                    <p className='text-xs text-gray-500 mt-1'>
                      {ticketType.refundPolicyNotes}
                    </p>
                  )}
                </div>

                <div className='flex items-center space-x-4'>
                  <div className='flex items-center bg-[#1b0c2e] rounded-lg'>
                    <button
                      onClick={() =>
                        updateQuantity(ticketType.id, quantity - 1)
                      }
                      disabled={quantity === 0}
                      className='p-2 hover:bg-gray-700 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <Minus size={20} />
                    </button>

                    <div className='px-4 py-2 min-w-[3rem] text-center font-bold'>
                      {quantity}
                    </div>

                    <button
                      onClick={() =>
                        updateQuantity(ticketType.id, quantity + 1)
                      }
                      disabled={
                        quantity >= ticketType.remaining ||
                        (ticketType.limitPerUser &&
                          quantity >= ticketType.limitPerUser)
                      }
                      className='p-2 hover:bg-gray-700 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  {quantity > 0 && (
                    <div className='text-right'>
                      <p className='text-white font-bold'>
                        ${(ticketType.price * quantity).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className='flex flex-col sm:flex-row gap-4'>
        <Button
          onClick={handleNext}
          disabled={getTotalQuantity() === 0}
          className='flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Next
        </Button>
      </div>

      <div className='flex justify-center space-x-6 mt-4'>
        <button
          onClick={onBack}
          className='text-gray-400 hover:text-white underline'
        >
          Back
        </button>
        <button
          onClick={onCancel}
          className='text-gray-400 hover:text-white underline'
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default TicketSelectionScreen
