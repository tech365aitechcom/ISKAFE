'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { submitPayment } from '../../../actions/actions'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

function PaymentForm({ formData }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)

  const handlePayment = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const cardElement = elements.getElement(CardElement)

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (stripeError) {
        setError(stripeError.message)
        setProcessing(false)
        return
      }

      const response = await submitPayment(paymentMethod.id, formData.amount || 100, {
        note: formData.note || 'Payment',
      })

      if (response.success) {
        console.log('✅ Payment successful:', response)
        alert('Payment successful!')
      } else {
        setError(response.error)
      }
    } catch (err) {
      console.error('❌ Payment error:', err)
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handlePayment}>
      {formData.paymentMethod === 'card' && (
        <div>
          <div className='mb-4 p-4 bg-white rounded'>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
          {error && <div className='text-red-500 mb-4'>{error}</div>}
          <button
            type='submit'
            disabled={!stripe || processing}
            className='btn btn-primary w-full'
          >
            {processing ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      )}
    </form>
  )
}

export default function StripeComponent({ formData }) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm formData={formData} />
    </Elements>
  )
}
