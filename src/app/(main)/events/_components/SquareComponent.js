'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { submitPayment } from '../../../actions/actions' // Adjust path

export default function SquareComponent({ formData }) {
  console.log('formData', formData)
  const cardRef = useRef(null)
  const cardInstance = useRef(null)
  const [squareLoaded, setSquareLoaded] = useState(false)

  const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID

  useEffect(() => {
    console.log('🧪 Effect triggered: ', {
      squareLoaded,
      method: formData.paymentMethod,
    })
    if (!squareLoaded || formData.paymentMethod !== 'card') return

    const initCard = async () => {
      const payments = window.Square.payments(appId, locationId)

      if (cardInstance.current) {
        await cardInstance.current.destroy()
        cardInstance.current = null
      }

      const card = await payments.card()
      const container = document.getElementById('card-container')
      if (!container) {
        console.error('❌ Card container not found in DOM')
        return
      }

      await card.attach('#card-container')
      cardInstance.current = card
    }

    initCard()

    return () => {
      if (cardInstance.current) {
        cardInstance.current.destroy()
        cardInstance.current = null
      }
      const container = document.getElementById('card-container')
      if (container) container.innerHTML = ''
    }
  }, [squareLoaded, formData.paymentMethod])

  const handlePayment = async () => {
    if (!cardInstance.current) return alert('Card not ready')
    const result = await cardInstance.current.tokenize()

    if (result.status === 'OK') {
      const response = await submitPayment(result.token)
      console.log('✅ Payment successful:', response)
    } else {
      console.error('❌ Tokenization failed:', result)
    }
  }

  return (
    <>
      <Script
        src='https://sandbox.web.squarecdn.com/v1/square.js'
        strategy='afterInteractive'
        onLoad={() => {
          console.log('✅ Square script loaded')
          setSquareLoaded(true)
        }}
      />

      {formData.paymentMethod === 'card' && (
        <div>
          <div id='card-container' ref={cardRef} className='mb-4' />
          <button onClick={handlePayment} className='btn btn-primary'>
            Pay Now
          </button>
        </div>
      )}
    </>
  )
}
