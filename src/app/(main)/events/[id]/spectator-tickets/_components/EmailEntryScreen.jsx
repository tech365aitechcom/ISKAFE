'use client'

import React, { useState } from 'react'
import { Button } from '../../../../../../../components/ui/button'
import { API_BASE_URL } from '../../../../../../constants'

const EmailEntryScreen = ({ onNext, onCancel, purchaseData }) => {
  const [email, setEmail] = useState(purchaseData.email || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const checkUserExists = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      return data.exists || false
    } catch (error) {
      console.error('Error checking email:', error)
      return false
    }
  }

  const handleNext = async () => {
    if (!email) {
      setError('Email address is required')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const userExists = await checkUserExists(email)
      
      if (userExists) {
        // Redirect to login screen
        onNext('login', { email, isGuest: false })
      } else {
        // Continue as guest
        onNext('guest-details', { 
          email, 
          isGuest: true,
          guestDetails: { ...purchaseData.guestDetails, email }
        })
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleContinueAsGuest = () => {
    if (!email) {
      setError('Email address is required')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    onNext('guest-details', { 
      email, 
      isGuest: true,
      guestDetails: { ...purchaseData.guestDetails, email }
    })
  }

  return (
    <div className="bg-[#1b0c2e] rounded-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Enter Your Email</h2>
        <p className="text-gray-400">
          If you already have an IKF Fight Platform or Fight Sports Insider account, use that email address.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            className="w-full bg-[#0A1330] border border-gray-600 rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            placeholder="your@email.com"
            disabled={loading}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleNext}
            disabled={loading || !email}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-medium"
          >
            {loading ? 'Checking...' : 'Next'}
          </Button>
          
          <Button
            onClick={handleContinueAsGuest}
            disabled={loading || !email}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded font-medium"
          >
            Continue as Guest
          </Button>
        </div>

        <div className="text-center">
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailEntryScreen