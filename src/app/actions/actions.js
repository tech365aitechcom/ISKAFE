'use server'

import { randomUUID } from 'crypto'
import { Client, Environment } from 'square'

BigInt.prototype.toJSON = function () {
  return this.toString()
}

export async function submitPayment(sourceId, amountInCents, paymentData = {}) {
  console.log(
    'Square Access Token:',
    process.env.NEXT_PUBLIC_SQUARE_ACCESS_TOKEN
  )

  const client = new Client({
    accessToken: process.env.NEXT_PUBLIC_SQUARE_ACCESS_TOKEN,
    environment: Environment.Sandbox,
  })

  try {
    const paymentRequest = {
      idempotencyKey: randomUUID(),
      sourceId,
      amountMoney: {
        currency: 'USD',
        amount: BigInt(Math.round(amountInCents)), // Convert to BigInt for Square API
      },
    }

    // Add optional payment data
    if (paymentData.note) {
      paymentRequest.note = paymentData.note
    }

    // Note: orderId removed as it requires a valid Square Order to be created first
    // For simple payments, we don't need to specify an orderId

    console.log('Payment request:', paymentRequest)

    const { result } = await client.paymentsApi.createPayment(paymentRequest)

    return {
      success: true,
      payment: JSON.parse(JSON.stringify(result.payment)), // Convert to plain object
      transactionId: result.payment?.id?.toString(),
      orderId: result.payment?.orderId?.toString(),
      receiptNumber: result.payment?.receiptNumber,
      last4: result.payment?.cardDetails?.card.last4,
      receiptUrl: result.payment?.receiptUrl,
    }
  } catch (error) {
    console.error('❌ Square payment error', error)

    // Convert error objects to plain objects
    const plainErrors = error.errors
      ? error.errors.map((err) => ({
          code: err.code || 'UNKNOWN',
          detail: err.detail || 'Unknown error',
          field: err.field || null,
          category: err.category || 'API_ERROR',
        }))
      : []

    // Provide specific error messages for common Square errors
    let errorMessage = 'Payment failed'

    if (plainErrors.length > 0) {
      const firstError = plainErrors[0]

      switch (firstError.code) {
        case 'CARD_DECLINED_VERIFICATION_REQUIRED':
          errorMessage =
            'Card verification required. Please use a different card or try again.'
          break
        case 'CARD_DECLINED':
          errorMessage =
            'Card was declined. Please check your card details or use a different card.'
          break
        case 'INSUFFICIENT_FUNDS':
          errorMessage = 'Insufficient funds. Please use a different card.'
          break
        case 'INVALID_CARD':
          errorMessage =
            'Invalid card information. Please check your card details.'
          break
        case 'GENERIC_DECLINE':
          errorMessage = 'Payment was declined. Please try a different card.'
          break
        case 'CVV_FAILURE':
          errorMessage = 'Invalid CVV. Please check your card security code.'
          break
        case 'ADDRESS_VERIFICATION_FAILURE':
          errorMessage =
            'Address verification failed. Please check your billing address.'
          break
        default:
          errorMessage = firstError.detail || 'Payment processing failed'
      }
    } else if (error.statusCode === 402) {
      errorMessage = 'Payment was declined. Please try a different card.'
    }

    return {
      success: false,
      error: errorMessage,
      details: error.message || 'Unknown error',
      errors: plainErrors,
    }
  }
}
