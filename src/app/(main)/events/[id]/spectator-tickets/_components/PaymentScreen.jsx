'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '../../../../../../../components/ui/button'
import { CreditCard, DollarSign } from 'lucide-react'
import { enqueueSnackbar } from 'notistack'
import axios from '../../../../../../shared/axios'
import useStore from '../../../../../../stores/useStore'
import Script from 'next/script'
import { submitPayment } from '../../../../../actions/actions'

const PaymentScreen = ({
  eventDetails,
  onNext,
  onBack,
  onCancel,
  purchaseData,
}) => {
  const user = useStore((state) => state.user)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardName: '',
  })
  const [cashCode, setCashCode] = useState('')
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState({})
  const [paymentCompleted, setPaymentCompleted] = useState(false)

  // Square payment integration
  const cardRef = useRef(null)
  const cardInstance = useRef(null)
  const [squareLoaded, setSquareLoaded] = useState(false)

  const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID

  // Validate Square configuration
  const squareConfigValid = appId && locationId

  console.log('Square configuration:', {
    appId: appId ? `${appId.substring(0, 10)}...` : 'NOT SET',
    locationId: locationId ? `${locationId.substring(0, 10)}...` : 'NOT SET',
    squareConfigValid,
  })

  // Square payment initialization
  useEffect(() => {
    console.log('🧪 Square effect triggered: ', {
      squareLoaded,
      paymentMethod,
      squareConfigValid,
      appId: !!appId,
      locationId: !!locationId,
    })

    if (!squareLoaded || paymentMethod !== 'card') return

    if (!squareConfigValid) {
      console.warn('⚠️ Square configuration invalid - card payments disabled')
      setErrors((prev) => ({
        ...prev,
        square: 'Payment system not configured. Please contact support.',
      }))
      return
    }

    const initCard = async () => {
      try {
        console.log('Initializing Square payments with:', { appId, locationId })

        if (!window.Square) {
          throw new Error('Square SDK not loaded')
        }

        const payments = window.Square.payments(appId, locationId)

        if (cardInstance.current) {
          await cardInstance.current.destroy()
          cardInstance.current = null
        }

        const card = await payments.card({
          style: {
            input: {
              backgroundColor: '#0A1330',
              color: '#ffffff',
              fontSize: '16px',
            },
            '.input-container': {
              borderRadius: '8px',
              borderColor: '#374151',
              borderWidth: '1px',
            },
            '.input-container.is-focus': {
              borderColor: '#8B5CF6',
            },
            '.input-container.is-error': {
              borderColor: '#EF4444',
            },
          },
        })

        const container = document.getElementById('square-card-container')
        if (!container) {
          console.error('❌ Square card container not found in DOM')
          return
        }

        await card.attach('#square-card-container')
        cardInstance.current = card
        console.log('✅ Square card initialized')

        // Clear any previous errors if successful
        setErrors((prev) => ({ ...prev, square: null }))
      } catch (error) {
        console.error('❌ Square card initialization error:', error)
        setErrors((prev) => ({
          ...prev,
          square: `Failed to initialize payment form: ${error.message}`,
        }))
      }
    }

    initCard()

    return () => {
      if (cardInstance.current) {
        cardInstance.current.destroy()
        cardInstance.current = null
      }
      const container = document.getElementById('square-card-container')
      if (container) container.innerHTML = ''
    }
  }, [squareLoaded, paymentMethod, squareConfigValid, appId, locationId])

  const getTotalPrice = () => {
    return purchaseData.tickets.reduce(
      (sum, ticket) => sum + ticket.price * ticket.quantity,
      0
    )
  }

  const getTotalQuantity = () => {
    return purchaseData.tickets.reduce(
      (sum, ticket) => sum + ticket.quantity,
      0
    )
  }

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const handleCardInputChange = (e) => {
    const { name, value } = e.target

    let formattedValue = value
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value)
    } else if (name === 'expiryMonth' || name === 'expiryYear') {
      formattedValue = value.replace(/\D/g, '')
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4)
    }

    setCardDetails((prev) => ({
      ...prev,
      [name]: formattedValue,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateCardDetails = () => {
    const newErrors = {}

    if (!cardDetails.cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = 'Card number is required'
    } else if (cardDetails.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Invalid card number'
    }

    if (!cardDetails.expiryMonth) {
      newErrors.expiryMonth = 'Month is required'
    } else if (
      parseInt(cardDetails.expiryMonth) < 1 ||
      parseInt(cardDetails.expiryMonth) > 12
    ) {
      newErrors.expiryMonth = 'Invalid month'
    }

    if (!cardDetails.expiryYear) {
      newErrors.expiryYear = 'Year is required'
    } else if (cardDetails.expiryYear.length < 2) {
      newErrors.expiryYear = 'Invalid year'
    }

    if (!cardDetails.cvv) {
      newErrors.cvv = 'CVV is required'
    } else if (cardDetails.cvv.length < 3) {
      newErrors.cvv = 'Invalid CVV'
    }

    if (!cardDetails.cardName.trim()) {
      newErrors.cardName = 'Cardholder name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateCashCode = () => {
    if (!cashCode.trim()) {
      setErrors({ cashCode: 'Cash code is required' })
      return false
    }
    return true
  }

  const processSquarePayment = async () => {
    if (!cardInstance.current) {
      throw new Error('Payment form not ready. Please wait and try again.')
    }

    console.log('Processing Square payment...')
    const result = await cardInstance.current.tokenize()

    if (result.status !== 'OK') {
      console.error('❌ Square tokenization failed:', result)
      throw new Error(
        result.errors?.[0]?.detail ||
          'Card payment failed. Please check your card details.'
      )
    }

    console.log('✅ Square tokenization successful')

    // Calculate amount in cents for Square
    const amountInCents = Math.round(getTotalPrice() * 100)

    // Submit payment to Square
    const paymentData = {
      note: `Spectator ticket purchase - Event: ${
        eventDetails?.name || 'Unknown Event'
      }`,
      // Note: orderId removed as it requires a valid Square Order to be created first
    }

    console.log('Submitting payment to Square...', {
      amountInCents,
      paymentData,
    })
    const squareResult = await submitPayment(
      result.token,
      amountInCents,
      paymentData
    )

    if (!squareResult.success) {
      console.error('❌ Square payment failed:', squareResult)
      throw new Error(squareResult.error || 'Payment processing failed')
    }

    console.log('✅ Square payment successful:', squareResult)
    return {
      transactionId: squareResult.transactionId || squareResult.data?.transactionId,
      orderId: squareResult.orderId || squareResult.data?.orderId,
      receiptNumber: squareResult.receiptNumber || squareResult.data?.receiptNumber,
      last4: squareResult.last4 || squareResult.data?.last4,
      receiptUrl: squareResult.receiptUrl || squareResult.data?.receiptUrl,
    }
  }

  const processPurchase = async () => {
    setProcessing(true)

    try {
      console.log('Starting processPurchase with purchaseData:', purchaseData)
      console.log('Payment method:', paymentMethod)
      console.log('Cash code:', cashCode)

      // Validate required data before proceeding
      if (!purchaseData.eventId) {
        console.error('Missing eventId in purchaseData')
        throw new Error('Event ID is required')
      }

      if (!purchaseData.tickets || purchaseData.tickets.length === 0) {
        console.error('Missing or empty tickets in purchaseData')
        throw new Error('At least one ticket must be selected')
      }

      console.log('Tickets to process:', purchaseData.tickets)

      // Get the first ticket (assuming single ticket type purchase for now)
      const firstTicket = purchaseData.tickets[0]

      // Prepare the purchase data according to the backend API
      const purchasePayload = {
        eventId: purchaseData.eventId,
        tierName: firstTicket.tierName || firstTicket.name,
        quantity: firstTicket.quantity,
        buyerType: purchaseData.isGuest ? 'guest' : 'user',
        paymentMethod: paymentMethod,
        paymentStatus: 'Paid', // Set as paid since we're processing payment
      }

      // Add buyer details - ensure all required fields are present
      console.log('Buyer type check - isGuest:', purchaseData.isGuest)

      if (purchaseData.isGuest) {
        console.log('Guest details:', purchaseData.guestDetails)

        if (!purchaseData.guestDetails) {
          console.error('guestDetails is missing from purchaseData')
          throw new Error('Guest details are required')
        }

        purchasePayload.guestDetails = {
          firstName: purchaseData.guestDetails.firstName,
          lastName: purchaseData.guestDetails.lastName,
          email: purchaseData.guestDetails.email,
          phoneNumber: purchaseData.guestDetails.phone, // Note: backend expects 'phoneNumber'
        }

        console.log('Mapped guest details:', purchasePayload.guestDetails)

        // Validate guest details
        if (!purchasePayload.guestDetails.firstName) {
          console.error('firstName is missing from guest details')
          throw new Error('First name is required')
        }
        if (!purchasePayload.guestDetails.lastName) {
          console.error('lastName is missing from guest details')
          throw new Error('Last name is required')
        }
        if (!purchasePayload.guestDetails.email) {
          console.error('email is missing from guest details')
          throw new Error('Email is required')
        }
      } else {
        console.log('User email:', purchaseData.email)
        console.log('User ID from purchaseData:', purchaseData.userId)
        console.log('User from store:', user)

        // For logged-in users, we need to get the user ID
        // Try purchaseData first, then fallback to user store
        const userId = purchaseData.userId || user?._id
        purchasePayload.user = userId

        console.log('Final user ID being used:', userId)

        // For logged-in users, ensure user ID is available
        if (!purchasePayload.user) {
          console.error('user ID is missing for logged-in user', {
            purchaseData,
            purchaseDataUserId: purchaseData.userId,
            userFromStore: user,
            userIdFromStore: user?._id,
            isGuest: purchaseData.isGuest,
          })
          throw new Error('User ID is required for logged-in users')
        }
      }

      // Add payment details
      if (paymentMethod === 'cash') {
        if (!cashCode || !cashCode.trim()) {
          throw new Error('Cash code is required')
        }
        purchasePayload.cashCode = cashCode.trim()
      } else {
        // For card payments, process Square payment first
        console.log('Processing Square card payment...')
        const { transactionId, orderId, receiptNumber, last4, receiptUrl } =
          await processSquarePayment()
        purchasePayload.squareDetails = {
          transactionId,
          orderId,
          receiptNumber,
          last4,
          receiptUrl,
        }
      }

      console.log(
        'Final purchase payload before API call:',
        JSON.stringify(purchasePayload, null, 2)
      )

      // Double check all required fields are present for the backend API
      const requiredFields = [
        'eventId',
        'tierName',
        'quantity',
        'buyerType',
        'paymentMethod',
      ]
      const missingFields = requiredFields.filter(
        (field) => !purchasePayload[field]
      )

      if (missingFields.length > 0) {
        console.error('Missing required fields in payload:', missingFields)
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }

      // Check buyer-specific required fields
      if (purchasePayload.buyerType === 'user' && !purchasePayload.user) {
        console.error('User ID is required for user buyer type')
        throw new Error('User ID is required for logged-in users')
      }

      if (
        purchasePayload.buyerType === 'guest' &&
        (!purchasePayload.guestDetails || !purchasePayload.guestDetails.email)
      ) {
        console.error(
          'Guest details with email are required for guest buyer type'
        )
        throw new Error('Guest email is required for guest purchases')
      }

      const response = await axios.post(
        `/spectator-ticket/purchase`,
        purchasePayload
      )
      const data = response.data
      console.log('API Response:', data)

      if (data.success) {
        console.log('Payment successful, response data:', data)
        setPaymentCompleted(true)
        // enqueueSnackbar('Payment successful!', { variant: 'success' })
        
        // Small delay to show payment completed state before navigating
        setTimeout(() => {
          const confirmationData = {
            purchaseResult: data.data,
            qrCode: data.data?.qrCode,
            ticketCode: data.data?.ticketCode,
          }
          console.log('Sending to confirmation screen:', confirmationData)
          console.log('QR Code data type and content:', typeof data.data?.qrCode, data.data?.qrCode)
          onNext('confirmation', confirmationData)
        }, 1000)
      } else {
        throw new Error(data.message || data.error || 'Payment failed')
      }
    } catch (error) {
      console.error('Payment error:', error)

      // Handle axios errors
      let errorMessage = 'Payment failed'

      if (error.response) {
        // Server responded with error status
        const { data, status } = error.response
        console.log('Error response data:', data)

        if (data.message) {
          errorMessage = data.message
        } else if (data.error) {
          errorMessage = data.error
        } else if (data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors.join(', ')
        } else if (data.errors && typeof data.errors === 'object') {
          errorMessage = Object.values(data.errors).join(', ')
        } else if (status === 400) {
          errorMessage =
            'Invalid request data. Please check your information and try again.'
        } else if (status === 404) {
          errorMessage = 'Payment service not found. Please contact support.'
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.'
        }
      } else if (error.request) {
        // Network error
        errorMessage =
          'Network error. Please check your connection and try again.'
      } else {
        // Other error
        errorMessage = error.message
      }

      enqueueSnackbar(errorMessage, { variant: 'error' })
    } finally {
      setProcessing(false)
    }
  }

  const handlePay = () => {
    let isValid = false

    if (paymentMethod === 'card') {
      // Check Square configuration
      if (!squareConfigValid) {
        enqueueSnackbar(
          'Payment system not configured. Please try cash payment or contact support.',
          { variant: 'error' }
        )
        return
      }

      // For Square payments, we don't need to validate card details manually
      // Square will handle validation during tokenization
      if (!squareLoaded) {
        enqueueSnackbar('Payment system is still loading. Please wait.', {
          variant: 'warning',
        })
        return
      }

      if (!cardInstance.current) {
        enqueueSnackbar('Payment form not ready. Please wait and try again.', {
          variant: 'warning',
        })
        return
      }

      isValid = true
    } else {
      isValid = validateCashCode()
    }

    if (isValid) {
      processPurchase()
    }
  }

  return (
    <>
      {/* Square SDK Script */}
      <Script
        src='https://sandbox.web.squarecdn.com/v1/square.js'
        strategy='afterInteractive'
        onLoad={() => {
          console.log('✅ Square script loaded')
          setSquareLoaded(true)
        }}
        onError={(error) => {
          console.error('❌ Square script failed to load:', error)
          setErrors((prev) => ({
            ...prev,
            square: 'Payment system failed to load',
          }))
        }}
      />

      <div className='bg-[#1b0c2e] rounded-lg p-8'>
        <div className='text-center mb-8'>
          <h2 className='text-2xl font-bold mb-2'>Payment</h2>
          <p className='text-gray-400'>Complete your ticket purchase</p>
        </div>

        {/* Order Summary */}
        <div className='bg-[#0A1330] rounded-lg p-6 mb-8'>
          <h3 className='text-lg font-bold mb-4'>Order Summary</h3>

          {purchaseData.tickets.map((ticket, index) => (
            <div key={index} className='flex justify-between items-center mb-2'>
              <div>
                <span className='font-medium'>{ticket.tierName}</span>
                <span className='text-gray-400 ml-2'>x{ticket.quantity}</span>
              </div>
              <span className='font-bold'>
                ${(ticket.price * ticket.quantity).toFixed(2)}
              </span>
            </div>
          ))}

          <div className='border-t border-gray-600 pt-4 mt-4'>
            <div className='flex justify-between items-center text-xl font-bold'>
              <span>
                Total ({getTotalQuantity()} ticket
                {getTotalQuantity() !== 1 ? 's' : ''})
              </span>
              <span className='text-green-400'>
                ${getTotalPrice().toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className='mb-8'>
          <h3 className='text-lg font-bold mb-4'>Payment Method</h3>
          <div className='grid grid-cols-2 gap-4'>
            <button
              onClick={() => !processing && !paymentCompleted && setPaymentMethod('card')}
              disabled={processing || paymentCompleted}
              className={`p-4 rounded-lg border-2 transition-colors ${
                paymentMethod === 'card'
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-600 hover:border-gray-500'
              } ${(processing || paymentCompleted) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <CreditCard className='mx-auto mb-2' size={24} />
              <div className='text-sm font-medium'>Credit/Debit Card</div>
            </button>

            <button
              onClick={() => !processing && !paymentCompleted && setPaymentMethod('cash')}
              disabled={processing || paymentCompleted}
              className={`p-4 rounded-lg border-2 transition-colors ${
                paymentMethod === 'cash'
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-600 hover:border-gray-500'
              } ${(processing || paymentCompleted) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <DollarSign className='mx-auto mb-2' size={24} />
              <div className='text-sm font-medium'>Cash Code</div>
            </button>
          </div>
        </div>

        {/* Payment Details */}
        {paymentMethod === 'card' && (
          <div className='mb-8'>
            <h3 className='text-lg font-bold mb-4'>Card Details</h3>

            {!squareConfigValid && (
              <div className='bg-red-900/20 border border-red-500 rounded-lg p-6 text-center'>
                <p className='text-red-400 mb-2'>
                  Card payments are currently unavailable
                </p>
                <p className='text-gray-400 text-sm'>
                  Please use cash payment or contact support
                </p>
              </div>
            )}

            {squareConfigValid && !squareLoaded && (
              <div className='bg-[#0A1330] rounded-lg p-6 text-center'>
                <p className='text-gray-400'>Loading payment form...</p>
              </div>
            )}

            {squareConfigValid && squareLoaded && (
              <div className={`bg-[#0A1330] rounded-lg p-6 ${
                processing || paymentCompleted ? 'opacity-50 pointer-events-none' : ''
              }`}>
                <div
                  id='square-card-container'
                  ref={cardRef}
                  className='mb-4'
                />
                {errors.square && (
                  <p className='text-red-500 text-sm mt-2'>{errors.square}</p>
                )}
                {paymentCompleted && (
                  <div className='mt-4 p-3 bg-green-900/20 border border-green-500 rounded-lg'>
                    <p className='text-green-400 text-sm font-medium'>
                      ✓ Payment completed successfully
                    </p>
                  </div>
                )}
                {!paymentCompleted && (
                  <div className='mt-4 p-3 bg-blue-900/20 border border-blue-500 rounded-lg'>
                    <p className='text-blue-400 text-sm font-medium mb-1'>
                      Test Card Information:
                    </p>
                    <p className='text-blue-300 text-xs'>
                      For testing: Use card number 4111 1111 1111 1111, any future
                      expiry date, and CVV 111
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {paymentMethod === 'cash' && (
          <div className='mb-8'>
            <label className='block text-sm font-medium mb-2'>
              Cash Payment Code
            </label>
            <input
              type='text'
              value={cashCode}
              onChange={(e) => {
                if (!processing && !paymentCompleted) {
                  setCashCode(e.target.value.toUpperCase())
                  if (errors.cashCode) {
                    setErrors((prev) => ({ ...prev, cashCode: '' }))
                  }
                }
              }}
              disabled={processing || paymentCompleted}
              className={`w-full bg-[#0A1330] border ${
                errors.cashCode ? 'border-red-500' : 'border-gray-600'
              } rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 ${
                processing || paymentCompleted ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              placeholder='Enter your cash code'
            />
            {errors.cashCode && (
              <p className='text-red-500 text-sm mt-1'>{errors.cashCode}</p>
            )}
            <p className='text-gray-400 text-sm mt-2'>
              Enter the cash payment code provided to you
            </p>
          </div>
        )}

        <div className='flex flex-col sm:flex-row gap-4'>
          <Button
            onClick={handlePay}
            disabled={processing || paymentCompleted}
            className={`flex-1 ${
              paymentCompleted 
                ? 'bg-green-500 cursor-default' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white px-6 py-3 rounded font-medium disabled:opacity-50`}
          >
            {paymentCompleted
              ? '✓ Payment Completed'
              : processing
              ? 'Processing...'
              : `Pay $${getTotalPrice().toFixed(2)}`}
          </Button>
        </div>

        <div className='flex justify-center space-x-6 mt-4'>
          <button
            onClick={() => {
              if (!processing && !paymentCompleted) {
                console.log('Back button clicked in PaymentScreen')
                onBack()
              }
            }}
            disabled={processing || paymentCompleted}
            className='text-gray-400 hover:text-white underline disabled:opacity-50'
          >
            Back
          </button>
          <button
            onClick={() => {
              if (!processing && !paymentCompleted) {
                onCancel()
              }
            }}
            disabled={processing || paymentCompleted}
            className='text-gray-400 hover:text-white underline disabled:opacity-50'
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}

export default PaymentScreen
