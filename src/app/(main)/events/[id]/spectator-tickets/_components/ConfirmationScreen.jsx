'use client'

import React from 'react'
import { Button } from '../../../../../../../components/ui/button'
import { CheckCircle, Download, Mail, QrCode, Ticket } from 'lucide-react'
import { useState, useEffect } from 'react'

const ConfirmationScreen = ({
  eventDetails,
  purchaseData,
  onReturnToEvent,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')

  const processQRCode = (purchaseData) => {
    const qrCodeValue =
      purchaseData?.qrCode || purchaseData?.purchaseResult?.qrCode

    if (!qrCodeValue) {
      setQrCodeDataUrl(null)
      return
    }

    // Convert binary data to base64 and create data URL
    try {
      // If it's already a data URL, use it directly
      if (qrCodeValue.startsWith('data:')) {
        setQrCodeDataUrl(qrCodeValue)
        return
      }

      // Convert binary string to base64 properly
      const bytes = new Uint8Array(qrCodeValue.length)
      for (let i = 0; i < qrCodeValue.length; i++) {
        bytes[i] = qrCodeValue.charCodeAt(i)
      }

      // Convert to base64
      let base64String = ''
      const chunkSize = 0x8000 // 32KB chunks to avoid call stack issues
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize)
        base64String += btoa(String.fromCharCode.apply(null, chunk))
      }

      setQrCodeDataUrl(`data:image/png;base64,${base64String}`)
    } catch (error) {
      console.error('Error processing QR code:', error)
      setQrCodeDataUrl(null)
    }
  }

  useEffect(() => {
    if (purchaseData) {
      processQRCode(purchaseData)
    }
  }, [purchaseData])

  const ticketCode =
    purchaseData.ticketCode ||
    purchaseData.purchaseResult?.ticketCode ||
    'NO-CODE'

  const purchaseId =
    purchaseData.purchaseResult?.id ||
    purchaseData.purchaseResult?._id ||
    'NO-ID'

  const downloadQRCode = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a')
      link.download = `ticket-qr-${ticketCode}.png`
      link.href = qrCodeDataUrl
      link.click()
    }
  }

  return (
    <div className='bg-[#1b0c2e] rounded-lg p-8 text-center'>
      {/* Success Header */}
      <div className='mb-8'>
        <CheckCircle className='w-16 h-16 text-green-500 mx-auto mb-4' />
        <h2 className='text-3xl font-bold text-green-400 mb-2'>
          Payment Successful!
        </h2>
        <p className='text-gray-300'>
          Your spectator tickets have been purchased successfully.
        </p>
      </div>

      {/* Ticket Code */}
      <div className='bg-[#0A1330] rounded-lg p-6 mb-8'>
        <div className='flex items-center justify-center mb-4'>
          <Ticket className='mr-2' size={24} />
          <h3 className='text-xl font-bold'>Ticket Code</h3>
        </div>
        <div className='text-4xl font-mono font-bold text-green-400 mb-2'>
          {ticketCode}
        </div>
        <p className='text-gray-400 text-sm'>
          Use this code as backup if QR code cannot be scanned
        </p>
      </div>

      {/* Purchase Details */}
      <div className='bg-[#0A1330] rounded-lg p-6 mb-8 text-left'>
        <h3 className='text-xl font-bold mb-4 text-center'>Purchase Summary</h3>

        <div className='space-y-3'>
          <div className='flex justify-between'>
            <span className='text-gray-400'>Event:</span>
            <span className='font-medium'>{eventDetails.name}</span>
          </div>

          <div className='flex justify-between'>
            <span className='text-gray-400'>Date:</span>
            <span className='font-medium'>
              {new Date(eventDetails.startDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className='flex justify-between'>
            <span className='text-gray-400'>Purchase ID:</span>
            <span className='font-mono text-sm'>{purchaseId}</span>
          </div>

          <div className='flex justify-between'>
            <span className='text-gray-400'>Purchase Date:</span>
            <span className='font-medium'>
              {new Date(
                purchaseData.purchaseResult?.createdAt || new Date()
              ).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        <div className='border-t border-gray-600 pt-4 mt-4'>
          <h4 className='font-bold mb-3'>Tickets:</h4>
          {purchaseData.purchaseResult?.tiers && purchaseData.purchaseResult.tiers.length > 0 ? (
            // Display multiple tiers
            purchaseData.purchaseResult.tiers.map((tier, index) => (
              <div key={index} className='flex justify-between mb-2'>
                <span>
                  {tier.tierName} x{tier.quantity}
                </span>
                <span>
                  ${(tier.price * tier.quantity).toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            // Fallback to single tier display for backward compatibility
            <div className='flex justify-between mb-2'>
              <span>
                {purchaseData.purchaseResult?.tier || 'General Admission'} x
                {purchaseData.purchaseResult?.quantity || 1}
              </span>
              <span>
                ${(purchaseData.purchaseResult?.totalAmount || 0).toFixed(2)}
              </span>
            </div>
          )}

          <div className='border-t border-gray-600 pt-3 mt-3'>
            <div className='flex justify-between text-xl font-bold'>
              <span>
                Total ({purchaseData.purchaseResult?.quantity || 1} ticket
                {purchaseData.purchaseResult?.quantity !== 1 ? 's' : ''})
              </span>
              <span className='text-green-400'>
                ${(purchaseData.purchaseResult?.totalAmount || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Fighters */}
        {purchaseData.selectedFighters &&
          purchaseData.selectedFighters.length > 0 && (
            <div className='border-t border-gray-600 pt-4 mt-4'>
              <h4 className='font-bold mb-3'>Supporting Fighters:</h4>
              <div className='space-y-1'>
                {purchaseData.selectedFighters.map((fighter, index) => (
                  <div key={index} className='text-sm text-gray-300'>
                    {fighter.firstName} {fighter.lastName} (
                    {fighter.weightClass})
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Important Information */}
      <div className='bg-yellow-900/30 border border-yellow-600 rounded-lg p-6 mb-8'>
        <h3 className='text-lg font-bold text-yellow-400 mb-3'>
          Important Information
        </h3>
        <ul className='text-left text-sm space-y-2 text-yellow-200'>
          <li>• Present this QR code at the event gate for entry</li>
          <li>• This ticket is valid only for the named event</li>
          <li>• Ticket is non-transferable and can only be used once</li>
          <li>• Keep this confirmation safe - you'll need it for entry</li>
          <li>• A receipt has been sent to your email address</li>
        </ul>
      </div>

      {/* Email Confirmation */}
      <div className='flex items-center justify-center text-green-400 mb-6'>
        <Mail className='mr-2' size={20} />
        <span>
          Confirmation email sent to{' '}
          {purchaseData.guestDetails?.email ||
            purchaseData.email ||
            'your email'}
        </span>
      </div>

      {/* Return Button */}
      <Button
        onClick={onReturnToEvent}
        className='w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-medium'
      >
        Return to Event Details
      </Button>
    </div>
  )
}

export default ConfirmationScreen
