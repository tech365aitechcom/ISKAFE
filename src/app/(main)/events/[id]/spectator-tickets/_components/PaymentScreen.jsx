'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../../../../../../../components/ui/button'
import { CreditCard, DollarSign } from 'lucide-react'
import { enqueueSnackbar } from 'notistack'
import axios from '../../../../../../shared/axios'
import useStore from '../../../../../../stores/useStore'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { submitPayment } from '../../../../../actions/actions'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

const PaymentScreen = ({
  eventDetails,
  onNext,
  onBack,
  onCancel,
  purchaseData,
}) => {
  const user = useStore((state) => state.user)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cashCode, setCashCode] = useState('')
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState({})
  const [paymentCompleted, setPaymentCompleted] = useState(false)

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

  const validateCashCode = () => {
    if (!cashCode.trim()) {
      setErrors({ cashCode: 'Cash code is required' })
      return false
    }
    return true
  }

  const handlePay = () => {
    if (paymentMethod === 'cash') {
      if (validateCashCode()) {
        processPurchase()
      }
    }
    // For card payments, the form will be handled by CheckoutForm
  }

  const processPurchase = async (stripePaymentMethodId = null) => {
    setProcessing(true)

    try {
      console.log('Starting processPurchase with purchaseData:', purchaseData)
      console.log('Payment method:', paymentMethod)
      console.log('Cash code:', cashCode)

      if (!purchaseData.eventId) {
        console.error('Missing eventId in purchaseData')
        throw new Error('Event ID is required')
      }

      if (!purchaseData.tickets || purchaseData.tickets.length === 0) {
        console.error('Missing or empty tickets in purchaseData')
        throw new Error('At least one ticket must be selected')
      }

      console.log('Tickets to process:', purchaseData.tickets)

      const ticketsWithQuantity = purchaseData.tickets.filter(
        (ticket) => ticket.quantity > 0
      )

      if (ticketsWithQuantity.length === 0) {
        throw new Error('No tickets selected for purchase')
      }

      const purchasePayload = {
        eventId: purchaseData.eventId,
        tickets: ticketsWithQuantity.map((ticket) => ({
          tierName: ticket.tierName || ticket.name,
          quantity: ticket.quantity,
          price: ticket.price,
        })),
        buyerType: purchaseData.isGuest ? 'guest' : 'user',
        paymentMethod: paymentMethod,
        paymentStatus: 'Paid',
        role: 'spectator',
      }

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
          phoneNumber: purchaseData.guestDetails.phone,
        }

        console.log('Mapped guest details:', purchasePayload.guestDetails)

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

        const userId = purchaseData.userId || user?._id
        purchasePayload.user = userId

        console.log('Final user ID being used:', userId)

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

      if (paymentMethod === 'cash') {
        if (!cashCode || !cashCode.trim()) {
          throw new Error('Cash code is required')
        }
        purchasePayload.cashCode = cashCode.trim()
      } else {
        console.log('Processing Stripe card payment...')
        const amount = getTotalPrice()
        const { transactionId, last4, cardBrand, currency } =
          await submitPayment(stripePaymentMethodId, amount, {
            note: `Spectator ticket purchase - Event: ${
              eventDetails?.name || 'Unknown Event'
            }`,
          })
        purchasePayload.stripeDetails = {
          transactionId,
          last4,
          cardBrand,
          currency,
        }
      }

      console.log(
        'Final purchase payload before API call:',
        JSON.stringify(purchasePayload, null, 2)
      )

      const requiredFields = [
        'eventId',
        'tickets',
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

      if (
        !Array.isArray(purchasePayload.tickets) ||
        purchasePayload.tickets.length === 0
      ) {
        console.error('Tickets must be a non-empty array')
        throw new Error('At least one ticket must be selected')
      }

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

        setTimeout(() => {
          const confirmationData = {
            purchaseResult: data.data,
            qrCode: data.data?.qrCode,
            ticketCode: data.data?.ticketCode,
          }
          console.log('Sending to confirmation screen:', confirmationData)
          console.log(
            'QR Code data type and content:',
            typeof data.data?.qrCode,
            data.data?.qrCode
          )
          onNext('confirmation', confirmationData)
        }, 1000)
      } else {
        throw new Error(data.message || data.error || 'Payment failed')
      }
    } catch (error) {
      console.error('Payment error:', error)

      let errorMessage = 'Payment failed'

      if (error.response) {
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
        errorMessage =
          'Network error. Please check your connection and try again.'
      } else {
        errorMessage = error.message
      }

      enqueueSnackbar(errorMessage, { variant: 'error' })
    } finally {
      setProcessing(false)
    }
  }

  return (
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
            onClick={() =>
              !processing && !paymentCompleted && setPaymentMethod('card')
            }
            disabled={processing || paymentCompleted}
            className={`p-4 rounded-lg border-2 transition-colors ${
              paymentMethod === 'card'
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-gray-600 hover:border-gray-500'
            } ${
              processing || paymentCompleted
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            <CreditCard className='mx-auto mb-2' size={24} />
            <div className='text-sm font-medium'>Credit/Debit Card</div>
          </button>

          <button
            onClick={() =>
              !processing && !paymentCompleted && setPaymentMethod('cash')
            }
            disabled={processing || paymentCompleted}
            className={`p-4 rounded-lg border-2 transition-colors ${
              paymentMethod === 'cash'
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-gray-600 hover:border-gray-500'
            } ${
              processing || paymentCompleted
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            <DollarSign className='mx-auto mb-2' size={24} />
            <div className='text-sm font-medium'>Cash Code</div>
          </button>
        </div>
      </div>

      {/* Payment Details */}
      {paymentMethod === 'card' && (
        <Elements stripe={stripePromise}>
          <CheckoutForm
            processPurchase={processPurchase}
            processing={processing}
            paymentCompleted={paymentCompleted}
            errors={errors}
            setErrors={setErrors}
          />
        </Elements>
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
              processing || paymentCompleted
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            placeholder='Enter your cash code'
          />
          {errors.cashCode && (
            <p className='text-red-500 text-sm mt-1'>{errors.cashCode}</p>
          )}
          <p className='text-gray-400 text-sm mt-2'>
            Enter the cash payment code provided to you
          </p>

          <Button
            onClick={handlePay}
            disabled={processing || paymentCompleted}
            className={`w-full mt-4 ${
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
      )}

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
  )
}

const CheckoutForm = ({
  processPurchase,
  processing,
  paymentCompleted,
  errors,
  setErrors,
}) => {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (event) => {
    event.preventDefault()
    event.stopPropagation() // Prevent bubbling to parent form

    if (!stripe || !elements) {
      return
    }

    const cardElement = elements.getElement(CardElement)

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    })

    if (error) {
      console.error('Stripe error:', error)
      setErrors({ stripe: error.message })
    } else {
      console.log('Payment method created:', paymentMethod.id)
      await processPurchase(paymentMethod.id)
    }
  }

  return (
    <div className='mb-8'>
      <h3 className='text-lg font-bold mb-4'>Card Details</h3>
      <div
        className={`bg-[#0A1330] rounded-lg p-6 ${
          processing || paymentCompleted ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        <CardElement
          options={{
            style: {
              base: {
                backgroundColor: '#0A1330',
                color: '#ffffff',
                fontSize: '16px',
                '::placeholder': {
                  color: '#9CA3AF',
                },
              },
              invalid: {
                color: '#EF4444',
              },
            },
          }}
        />
        {errors.stripe && (
          <p className='text-red-500 text-sm mt-2'>{errors.stripe}</p>
        )}
        {paymentCompleted && (
          <div className='mt-4 p-3 bg-green-900/20 border border-green-500 rounded-lg'>
            <p className='text-green-400 text-sm font-medium'>
              ✓ Payment completed successfully
            </p>
          </div>
        )}
      </div>

      <Button
        type='button'
        onClick={handleSubmit}
        disabled={!stripe || processing || paymentCompleted}
        className={`w-full mt-4 ${
          paymentCompleted
            ? 'bg-green-500 cursor-default'
            : 'bg-green-600 hover:bg-green-700'
        } text-white px-6 py-3 rounded font-medium disabled:opacity-50`}
      >
        {paymentCompleted
          ? '✓ Payment Completed'
          : processing
          ? 'Processing...'
          : 'Pay Now'}
      </Button>
    </div>
  )
}

export default PaymentScreen
