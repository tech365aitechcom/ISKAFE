'use server'

export async function submitPayment(paymentMethodId, amount, paymentData = {}) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'

  try {
    const response = await fetch(`${apiBaseUrl}/payment/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethodId,
        amount,
        paymentData,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Payment failed')
    }

    console.log('Payment details:', data)

    return data
  } catch (error) {
    console.error('❌ Payment error:', error)

    return {
      success: false,
      error: error.message || 'Payment processing failed',
      details: error.message || 'Unknown error',
    }
  }
}
