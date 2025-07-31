'use client'

import React from 'react'
import { Button } from '../../../../../../../components/ui/button'
import { CheckCircle, Download, Mail, QrCode, Ticket } from 'lucide-react'
import QRCodeGenerator from 'qrcode'
import { useState, useEffect } from 'react'

const ConfirmationScreen = ({ eventDetails, purchaseData, onReturnToEvent }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')

  useEffect(() => {
    generateQRCode()
  }, [purchaseData])

  const generateQRCode = async () => {
    try {
      // Generate QR code with ticket information
      const qrData = JSON.stringify({
        ticketCode: purchaseData.ticketCode || generateTicketCode(),
        eventId: purchaseData.eventId,
        purchaseId: purchaseData.purchaseResult?.id || generatePurchaseId(),
        purchaseDate: new Date().toISOString()
      })
      
      const qrCodeUrl = await QRCodeGenerator.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      setQrCodeDataUrl(qrCodeUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const generateTicketCode = () => {
    // Generate a 4-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const generatePurchaseId = () => {
    return 'PUR' + Date.now().toString(36).toUpperCase()
  }

  const getTotalPrice = () => {
    return purchaseData.tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0)
  }

  const getTotalQuantity = () => {
    return purchaseData.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0)
  }

  const ticketCode = purchaseData.ticketCode || generateTicketCode()
  const purchaseId = purchaseData.purchaseResult?.id || generatePurchaseId()

  const downloadQRCode = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a')
      link.download = `ticket-qr-${ticketCode}.png`
      link.href = qrCodeDataUrl
      link.click()
    }
  }

  return (
    <div className="bg-[#1b0c2e] rounded-lg p-8 text-center">
      {/* Success Header */}
      <div className="mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-green-400 mb-2">Payment Successful!</h2>
        <p className="text-gray-300">Your spectator tickets have been purchased successfully.</p>
      </div>

      {/* QR Code Section */}
      <div className="bg-white rounded-lg p-6 mb-8 inline-block">
        {qrCodeDataUrl ? (
          <img src={qrCodeDataUrl} alt="Ticket QR Code" className="mx-auto" />
        ) : (
          <div className="w-[300px] h-[300px] flex items-center justify-center bg-gray-100">
            <QrCode size={64} className="text-gray-400" />
          </div>
        )}
      </div>

      {/* Ticket Code */}
      <div className="bg-[#0A1330] rounded-lg p-6 mb-8">
        <div className="flex items-center justify-center mb-4">
          <Ticket className="mr-2" size={24} />
          <h3 className="text-xl font-bold">Ticket Code</h3>
        </div>
        <div className="text-4xl font-mono font-bold text-green-400 mb-2">
          {ticketCode}
        </div>
        <p className="text-gray-400 text-sm">
          Use this code as backup if QR code cannot be scanned
        </p>
      </div>

      {/* Purchase Details */}
      <div className="bg-[#0A1330] rounded-lg p-6 mb-8 text-left">
        <h3 className="text-xl font-bold mb-4 text-center">Purchase Summary</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Event:</span>
            <span className="font-medium">{eventDetails.name}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Date:</span>
            <span className="font-medium">
              {new Date(eventDetails.startDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Purchase ID:</span>
            <span className="font-mono text-sm">{purchaseId}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Purchase Date:</span>
            <span className="font-medium">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
        
        <div className="border-t border-gray-600 pt-4 mt-4">
          <h4 className="font-bold mb-3">Tickets:</h4>
          {purchaseData.tickets.map((ticket, index) => (
            <div key={index} className="flex justify-between mb-2">
              <span>{ticket.tierName} x{ticket.quantity}</span>
              <span>${(ticket.price * ticket.quantity).toFixed(2)}</span>
            </div>
          ))}
          
          <div className="border-t border-gray-600 pt-3 mt-3">
            <div className="flex justify-between text-xl font-bold">
              <span>Total ({getTotalQuantity()} ticket{getTotalQuantity() !== 1 ? 's' : ''})</span>
              <span className="text-green-400">${getTotalPrice().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Selected Fighters */}
        {purchaseData.selectedFighters && purchaseData.selectedFighters.length > 0 && (
          <div className="border-t border-gray-600 pt-4 mt-4">
            <h4 className="font-bold mb-3">Supporting Fighters:</h4>
            <div className="space-y-1">
              {purchaseData.selectedFighters.map((fighter, index) => (
                <div key={index} className="text-sm text-gray-300">
                  {fighter.firstName} {fighter.lastName} ({fighter.weightClass})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Important Information */}
      <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-bold text-yellow-400 mb-3">Important Information</h3>
        <ul className="text-left text-sm space-y-2 text-yellow-200">
          <li>• Present this QR code at the event gate for entry</li>
          <li>• This ticket is valid only for the named event</li>
          <li>• Ticket is non-transferable and can only be used once</li>
          <li>• Keep this confirmation safe - you'll need it for entry</li>
          <li>• A receipt has been sent to your email address</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Button
          onClick={downloadQRCode}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-medium"
        >
          <Download className="mr-2" size={20} />
          Download QR Code
        </Button>
        
        <Button
          onClick={() => window.print()}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded font-medium"
        >
          Print Ticket
        </Button>
      </div>

      {/* Email Confirmation */}
      <div className="flex items-center justify-center text-green-400 mb-6">
        <Mail className="mr-2" size={20} />
        <span>Confirmation email sent to {purchaseData.guestDetails?.email || purchaseData.email}</span>
      </div>

      {/* Return Button */}
      <Button
        onClick={onReturnToEvent}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-medium"
      >
        Return to Event Details
      </Button>
    </div>
  )
}

export default ConfirmationScreen