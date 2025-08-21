'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '../../../../../../../components/ui/button'
import { Plus, Minus, Loader2 } from 'lucide-react'
import axios from '../../../../../../shared/axios'
import { API_BASE_URL } from '../../../../../../constants'
import { enqueueSnackbar } from 'notistack'

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
  const [purchaseLimits, setPurchaseLimits] = useState(null)

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
          const allTiers = response.data.data.tiers.map((tier, index) => ({
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

          // Filter tiers for online purchases - only show 'Online' and 'Both' availability modes
          const onlineAvailableTiers = allTiers.filter(tier => 
            tier.availabilityMode === 'Online' || tier.availabilityMode === 'Both'
          )

          // Sort by order
          onlineAvailableTiers.sort((a, b) => a.order - b.order)

          setTicketTypes(onlineAvailableTiers)

          // Initialize selected tickets if not already set
          if (!purchaseData.tickets || purchaseData.tickets.length === 0) {
            setSelectedTickets(onlineAvailableTiers.map((type) => ({ ...type, quantity: 0 })))
          } else {
            // Merge existing purchase data with new tier data (only for online available tiers)
            const mergedTickets = onlineAvailableTiers.map((tier) => {
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

          // Check if there are any online available tickets
          if (onlineAvailableTiers.length === 0) {
            setError('No tickets are currently available for online purchase. All tickets are set to "On-Site" only.')
          } else {
            // Fetch purchase limits if user data is available
            await fetchPurchaseLimits()
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

    const fetchPurchaseLimits = async () => {
      // Only fetch limits if we have buyer information
      if (!purchaseData.isGuest && !purchaseData.userId) return
      if (
        purchaseData.isGuest &&
        !purchaseData.guestDetails?.email &&
        !purchaseData.email
      )
        return

      try {
        const checkLimitPayload = {
          eventId: params.id,
          buyerType: purchaseData.isGuest ? 'guest' : 'user',
          userId: purchaseData.userId || null,
          guestEmail: purchaseData.isGuest
            ? purchaseData.guestDetails?.email || purchaseData.email
            : null,
        }

        const response = await axios.post(
          `${API_BASE_URL}/spectator-ticket/check-limit`,
          checkLimitPayload
        )

        if (response.data.success) {
          setPurchaseLimits(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching purchase limits:', error)
        // Don't show error for this, it's just for user information
      }
    }

    fetchSpectatorTickets()
  }, [
    params.id,
    purchaseData.tickets,
    retryCount,
    purchaseData.userId,
    purchaseData.email,
    purchaseData.guestDetails?.email,
  ])

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
      enqueueSnackbar(
        `Only ${ticketType.remaining} tickets remaining for ${ticketType.tierName}`,
        {
          variant: 'warning',
        }
      )
      return
    }

    // Check if the new quantity exceeds per-user limit
    if (ticketType.limitPerUser && newQuantity > ticketType.limitPerUser) {
      enqueueSnackbar(
        `Maximum ${ticketType.limitPerUser} tickets allowed per user for ${ticketType.tierName}`,
        {
          variant: 'warning',
        }
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

  const handleNext = async () => {
    const ticketsWithQuantity = selectedTickets.filter(
      (ticket) => ticket.quantity > 0
    )

    if (ticketsWithQuantity.length === 0) {
      enqueueSnackbar('Please select at least one ticket', {
        variant: 'warning',
      })
      return
    }

    // Check ticket limits before proceeding
    try {
      setLoading(true)

      const checkLimitPayload = {
        eventId: params.id,
        buyerType: purchaseData.isGuest ? 'guest' : 'user',
        userId: purchaseData.userId || null,
        guestEmail: purchaseData.isGuest
          ? purchaseData.guestDetails?.email || purchaseData.email
          : null,
      }

      const response = await axios.post(
        `${API_BASE_URL}/spectator-ticket/check-limit`,
        checkLimitPayload
      )

      if (response.data.success) {
        const { hasReachedMaxLimit, limitExceededTiers, tierLimits } =
          response.data.data

        // Check if user is trying to purchase tickets for tiers they've already maxed out
        const attemptingToExceedLimit = ticketsWithQuantity.some((ticket) => {
          const tierLimit = tierLimits[ticket.tierName]
          return tierLimit && !tierLimit.canPurchaseMore
        })

        if (attemptingToExceedLimit) {
          const exceededTierNames = ticketsWithQuantity
            .filter((ticket) => {
              const tierLimit = tierLimits[ticket.tierName]
              return tierLimit && !tierLimit.canPurchaseMore
            })
            .map((ticket) => ticket.tierName)
            .join(', ')

          enqueueSnackbar(
            `You have already purchased the maximum number of tickets allowed for: ${exceededTierNames}!`,
            {
              variant: 'warning',
            }
          )
          setLoading(false)
          return
        }

        // Check if the current selection would exceed any limits
        const wouldExceedLimit = ticketsWithQuantity.some((ticket) => {
          const tierLimit = tierLimits[ticket.tierName]
          if (!tierLimit || !tierLimit.limitPerUser) return false

          const totalAfterPurchase = tierLimit.purchased + ticket.quantity
          return totalAfterPurchase > tierLimit.limitPerUser
        })

        if (wouldExceedLimit) {
          const problematicTiers = ticketsWithQuantity
            .filter((ticket) => {
              const tierLimit = tierLimits[ticket.tierName]
              if (!tierLimit || !tierLimit.limitPerUser) return false

              const totalAfterPurchase = tierLimit.purchased + ticket.quantity
              return totalAfterPurchase > tierLimit.limitPerUser
            })
            .map((ticket) => {
              const tierLimit = tierLimits[ticket.tierName]
              const remaining = tierLimit.limitPerUser - tierLimit.purchased
              return `${ticket.tierName} (you can only purchase ${remaining} more)`
            })
            .join(', ')

          enqueueSnackbar(
            `Your selection would exceed the maximum ticket limits for: ${problematicTiers}`,
            {
              variant: 'warning',
            }
          )
          setLoading(false)
          return
        }

        // If all checks pass, proceed to next step
        onNext('fighters', {
          tickets: ticketsWithQuantity,
        })
        setLoading(false)
      }
    } catch (error) {
      console.error('Error checking ticket limits:', error)
      enqueueSnackbar('Unable to verify ticket limits. Please try again.')
      setLoading(false)
    }
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
                      {purchaseLimits &&
                        purchaseLimits.tierLimits[ticketType.tierName] && (
                          <p className='text-blue-400'>
                            You've purchased:{' '}
                            {
                              purchaseLimits.tierLimits[ticketType.tierName]
                                .purchased
                            }
                            {purchaseLimits.tierLimits[ticketType.tierName]
                              .remaining !== null &&
                              ` (${
                                purchaseLimits.tierLimits[ticketType.tierName]
                                  .remaining
                              } remaining)`}
                          </p>
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
          disabled={getTotalQuantity() === 0 || loading}
          className='flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? (
            <>
              <Loader2 className='h-5 w-5 animate-spin mr-2' />
              Checking Limits...
            </>
          ) : (
            'Next'
          )}
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
