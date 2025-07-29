'use server'

import { randomUUID } from 'crypto'
import { Client, Environment } from 'square'

BigInt.prototype.toJSON = function () {
  return this.toString()
}

export async function submitPayment(sourceId) {
  console.log(
    'Square Access Token:',
    process.env.NEXT_PUBLIC_SQUARE_ACCESS_TOKEN
  )

  const client = new Client({
    accessToken: process.env.NEXT_PUBLIC_SQUARE_ACCESS_TOKEN,
    environment: Environment.Sandbox,
  })

  try {
    const { result } = await client.paymentsApi.createPayment({
      idempotencyKey: randomUUID(),
      sourceId,
      amountMoney: {
        currency: 'USD',
        amount: 100, // $1.00
      },
    })

    return result
  } catch (error) {
    console.error('❌ Square payment error', error)
    return { error: 'Payment failed', details: error }
  }
}
