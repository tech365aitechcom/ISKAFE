'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { API_BASE_URL } from '../../../../../constants'
import Loader from '../../../../_components/Loader'
import EmailEntryScreen from './_components/EmailEntryScreen'
import GuestDetailsForm from './_components/GuestDetailsForm'
import TicketSelectionScreen from './_components/TicketSelectionScreen'
import FighterSelectionScreen from './_components/FighterSelectionScreen'
import PaymentScreen from './_components/PaymentScreen'
import ConfirmationScreen from './_components/ConfirmationScreen'
import useStore from '../../../../../stores/useStore'

const SpectatorTicketPurchasePage = () => {
  const params = useParams()
  const router = useRouter()
  const user = useStore((state) => state.user)
  
  const [eventDetails, setEventDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState('email') // email, guest-details, tickets, fighters, payment, confirmation
  const [purchaseData, setPurchaseData] = useState({
    eventId: params.id,
    email: '',
    isGuest: true,
    guestDetails: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    },
    tickets: [],
    selectedFighters: [],
    paymentMethod: 'card',
    cashCode: ''
  })

  useEffect(() => {
    fetchEventDetails()
    
    // If user is already logged in, skip email entry
    if (user) {
      setCurrentStep('tickets')
      setPurchaseData(prev => ({
        ...prev,
        email: user.email,
        userId: user._id, // Add user ID for backend API
        isGuest: false
      }))
    }
  }, [params.id, user])

  const fetchEventDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/events/${params.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch event details')
      }
      const data = await response.json()
      if (data.success) {
        setEventDetails(data.data)
      }
    } catch (error) {
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStepChange = (step, data = {}) => {
    setPurchaseData(prev => {
      const updated = { ...prev, ...data }
      
      // Ensure user data is preserved for logged-in users
      if (user && !updated.isGuest) {
        updated.userId = user._id
        updated.email = user.email
        updated.isGuest = false
      }
      
      return updated
    })
    setCurrentStep(step)
  }

  const handleCancel = () => {
    router.push(`/events/${params.id}`)
  }

  const handleBack = () => {
    switch (currentStep) {
      case 'guest-details':
        setCurrentStep('email')
        break
      case 'tickets':
        if (user) {
          router.push(`/events/${params.id}`)
        } else {
          setCurrentStep(purchaseData.isGuest ? 'guest-details' : 'email')
        }
        break
      case 'fighters':
        setCurrentStep('tickets')
        break
      case 'payment':
        setCurrentStep('fighters')
        break
      default:
        router.push(`/events/${params.id}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07091D] flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!eventDetails) {
    return (
      <div className="min-h-screen bg-[#07091D] flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <button 
            onClick={() => router.push('/events')}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded"
          >
            Back to Events
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#07091D] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Buy Spectator Tickets</h1>
          <h2 className="text-xl text-gray-300">{eventDetails.name}</h2>
          <p className="text-gray-400">
            {new Date(eventDetails.startDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {['Email', 'Details', 'Tickets', 'Fighters', 'Payment', 'Confirmation'].map((step, index) => {
              const stepKeys = ['email', 'guest-details', 'tickets', 'fighters', 'payment', 'confirmation']
              const currentIndex = stepKeys.indexOf(currentStep)
              const isActive = index === currentIndex
              const isCompleted = index < currentIndex
              
              return (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isActive ? 'bg-purple-600 text-white' : 
                    isCompleted ? 'bg-green-600 text-white' : 
                    'bg-gray-600 text-gray-300'
                  }`}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <span className={`ml-2 text-sm ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {step}
                  </span>
                  {index < 5 && <div className="w-8 h-0.5 bg-gray-600 mx-4" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          {currentStep === 'email' && (
            <EmailEntryScreen
              onNext={handleStepChange}
              onCancel={handleCancel}
              purchaseData={purchaseData}
            />
          )}
          
          {currentStep === 'guest-details' && (
            <GuestDetailsForm
              onNext={handleStepChange}
              onBack={handleBack}
              onCancel={handleCancel}
              purchaseData={purchaseData}
            />
          )}
          
          {currentStep === 'tickets' && (
            <TicketSelectionScreen
              eventDetails={eventDetails}
              onNext={handleStepChange}
              onBack={handleBack}
              onCancel={handleCancel}
              purchaseData={purchaseData}
            />
          )}
          
          {currentStep === 'fighters' && (
            <FighterSelectionScreen
              eventDetails={eventDetails}
              onNext={handleStepChange}
              onBack={handleBack}
              onCancel={handleCancel}
              purchaseData={purchaseData}
            />
          )}
          
          {currentStep === 'payment' && (
            <PaymentScreen
              eventDetails={eventDetails}
              onNext={handleStepChange}
              onBack={handleBack}
              onCancel={handleCancel}
              purchaseData={purchaseData}
            />
          )}
          
          {currentStep === 'confirmation' && (
            <ConfirmationScreen
              eventDetails={eventDetails}
              purchaseData={purchaseData}
              onReturnToEvent={() => router.push(`/events/${params.id}`)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default SpectatorTicketPurchasePage