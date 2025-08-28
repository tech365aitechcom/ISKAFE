import React, { useState } from 'react'
import CompetitorDetailModal from '../CompetitorDetailModal'
import BoutResultModal from '../BoutResultModal'
import TicketDetailsModal from '../TicketDetailsModal'
import {
  Download,
  Mail,
  Calendar,
  User,
  Clock,
  ShieldAlert,
  CreditCard,
} from 'lucide-react'
import {
  formatDate,
  formatDateTime,
  calculateAge,
  sendEmailReport,
} from '../utils/dashboardUtils'

export default function DashboardTables({ dashboardData, onRefresh }) {
  const [selectedAction, setSelectedAction] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showBoutResultModal, setShowBoutResultModal] = useState(false)
  const [showTicketModal, setShowTicketModal] = useState(false)

  const handleAddResult = (bout) => {
    setSelectedItem(bout)
    setSelectedAction('addResult')
    // Show bout result modal
    setShowBoutResultModal(true)
  }

  const handleFixFighter = (fighter) => {
    setSelectedItem(fighter)
    setSelectedAction('fix')
    // Navigate to fighter profile edit
    window.location.href = `/admin/people/edit/${fighter.id || fighter._id}`
  }

  const handleSuspendFighter = (fighter) => {
    setSelectedItem(fighter)
    setSelectedAction('suspend')
    // Navigate to suspensions page
    window.location.href = `/admin/suspensions?fighterId=${
      fighter.id || fighter._id
    }`
  }

  const handleViewProfile = (fighter) => {
    setSelectedItem(fighter)
    setSelectedAction('viewProfile')
    // Show fighter profile modal
    setShowDetailModal(true)
  }

  const handleManageBrackets = (event) => {
    setSelectedItem(event)
    setSelectedAction('manageBrackets')
    // Navigate to tournament brackets
    window.location.href = `/admin/events/${event._id}/tournament-brackets`
  }

  const handleViewDetails = (ticket) => {
    setSelectedItem(ticket)
    setSelectedAction('viewDetails')
    // Show ticket details modal
    setShowTicketModal(true)
  }

  const handleExportTicketPDF = async (ticket) => {
    try {
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF('p', 'mm', 'a4')

      const colors = {
        primary: '#020617',
        secondary: '#0f172a',
        accent: '#1e293b',
        border: '#334155',
        text: '#94a3b8',
        white: '#ffffff',
        blue: '#3b82f6',
      }

      // Add header
      pdf.setFillColor(colors.primary)
      pdf.rect(0, 0, 210, 40, 'F')

      pdf.setTextColor(colors.white)
      pdf.setFontSize(20)
      pdf.text('ISKA Spectator Ticket Report', 20, 25)

      pdf.setFontSize(10)
      pdf.text(
        `Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        20,
        32
      )

      let yPos = 55

      // Ticket Information Section
      pdf.setTextColor(colors.text)
      pdf.setFontSize(16)
      pdf.text('Ticket Information', 20, yPos)
      yPos += 15

      // Render sections like in TicketDetailsModal

      // Ticket Information Section
      const ticketSectionData = [
        ['Ticket Type:', ticket.tier || 'N/A'],
        ['Quantity:', ticket.quantity || 0],
        [
          'Unit Price:',
          ticket.unitPrice
            ? `$${ticket.unitPrice}`
            : ticket.totalAmount && ticket.quantity
            ? `$${(ticket.totalAmount / ticket.quantity).toFixed(2)}`
            : 'N/A',
        ],
        ['Total Amount:', `$${ticket.totalAmount || 0}`],
        ['Transaction ID:', ticket._id || ticket.id || 'N/A'],
        [
          'Purchase Date:',
          formatDateTime(ticket.createdAt || ticket.purchaseDate),
        ],
      ]

      ticketSectionData.forEach(([label, value]) => {
        if (yPos > 270) {
          pdf.addPage()
          yPos = 30
        }
        pdf.setTextColor(colors.text)
        pdf.setFontSize(10)
        pdf.text(label, 20, yPos)
        pdf.setTextColor('#000000')
        pdf.setFontSize(10)
        pdf.text(String(value), 90, yPos)
        yPos += 8
      })

      // Event Information Section
      if (ticket.event) {
        yPos += 5
        if (yPos > 260) {
          pdf.addPage()
          yPos = 30
        }
        pdf.setTextColor(colors.text)
        pdf.setFontSize(12)
        pdf.text('Event Information', 20, yPos)
        yPos += 10

        const eventData = [
          ['Event Name:', ticket.event.name || 'N/A'],
          [
            'Event Date:',
            ticket.event.startDate ? formatDate(ticket.event.startDate) : 'N/A',
          ],
          [
            'Event Time:',
            ticket.event.startDate
              ? new Date(ticket.event.startDate).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
              : 'N/A',
          ],
          [
            'Venue:',
            ticket.event.venueName ||
              ticket.event.venue?.name ||
              ticket.event.venue ||
              'N/A',
          ],
        ]

        eventData.forEach(([label, value]) => {
          if (yPos > 270) {
            pdf.addPage()
            yPos = 30
          }
          pdf.setTextColor(colors.text)
          pdf.setFontSize(10)
          pdf.text(label, 20, yPos)
          pdf.setTextColor('#000000')
          pdf.setFontSize(10)
          pdf.text(String(value), 90, yPos)
          yPos += 8
        })
      }

      // Purchaser Information Section
      if (
        ticket.purchaserName ||
        ticket.purchaserEmail ||
        ticket.customerInfo
      ) {
        yPos += 5
        if (yPos > 260) {
          pdf.addPage()
          yPos = 30
        }
        pdf.setTextColor(colors.text)
        pdf.setFontSize(12)
        pdf.text('Purchaser Information', 20, yPos)
        yPos += 10

        const purchaserData = []
        const purchaserName =
          ticket.purchaserName ||
          ticket.customerInfo?.name ||
          `${ticket.customerInfo?.firstName || ''} ${
            ticket.customerInfo?.lastName || ''
          }`.trim() ||
          'N/A'
        purchaserData.push(['Name:', purchaserName])
        purchaserData.push([
          'Email:',
          ticket.purchaserEmail || ticket.customerInfo?.email || 'N/A',
        ])
        if (ticket.customerInfo?.phone) {
          purchaserData.push(['Phone:', ticket.customerInfo.phone])
        }
        if (ticket.customerInfo?.address) {
          purchaserData.push(['Address:', ticket.customerInfo.address])
        }

        purchaserData.forEach(([label, value]) => {
          if (yPos > 270) {
            pdf.addPage()
            yPos = 30
          }
          pdf.setTextColor(colors.text)
          pdf.setFontSize(10)
          pdf.text(label, 20, yPos)
          pdf.setTextColor('#000000')
          pdf.setFontSize(10)
          pdf.text(String(value), 90, yPos)
          yPos += 8
        })
      }

      // Payment Information Section
      yPos += 5
      if (yPos > 260) {
        pdf.addPage()
        yPos = 30
      }
      pdf.setTextColor(colors.text)
      pdf.setFontSize(12)
      pdf.text('Payment Information', 20, yPos)
      yPos += 10

      const paymentStatus =
        ticket.paymentStatus === 'completed' || ticket.status === 'paid'
          ? 'Completed'
          : ticket.paymentStatus === 'pending'
          ? 'Pending'
          : ticket.paymentStatus || ticket.status || 'N/A'
      const paymentData = [
        ['Payment Status:', paymentStatus],
        ['Payment Method:', ticket.paymentMethod || 'N/A'],
        [
          'Transaction Reference:',
          ticket.transactionRef || ticket.paymentId || 'N/A',
        ],
        ['Currency:', ticket.currency || 'USD'],
        ['Processing Fee:', `$${ticket.processingFee || '0.00'}`],
        [
          'Net Amount:',
          `$${((ticket.totalAmount || 0) - (ticket.processingFee || 0)).toFixed(
            2
          )}`,
        ],
      ]

      paymentData.forEach(([label, value]) => {
        if (yPos > 270) {
          pdf.addPage()
          yPos = 30
        }
        pdf.setTextColor(colors.text)
        pdf.setFontSize(10)
        pdf.text(label, 20, yPos)
        pdf.setTextColor('#000000')
        pdf.setFontSize(10)
        pdf.text(String(value), 90, yPos)
        yPos += 8
      })

      // Additional Details Section
      yPos += 5
      if (yPos > 260) {
        pdf.addPage()
        yPos = 30
      }
      pdf.setTextColor(colors.text)
      pdf.setFontSize(12)
      pdf.text('Additional Details', 20, yPos)
      yPos += 10

      const ticketStatus =
        ticket.ticketStatus === 'valid' || ticket.ticketStatus === 'active'
          ? 'Active'
          : ticket.ticketStatus === 'used' || ticket.ticketStatus === 'redeemed'
          ? 'Used'
          : ticket.ticketStatus === 'cancelled' ||
            ticket.ticketStatus === 'refunded'
          ? 'Cancelled'
          : ticket.ticketStatus || 'Active'
      const additionalData = [
        ['Ticket Status:', ticketStatus],
        ['Source:', ticket.source || 'Online'],
        [
          'Discount Applied:',
          ticket.discountAmount ? `$${ticket.discountAmount}` : 'None',
        ],
        ['Notes:', ticket.notes || 'None'],
      ]

      additionalData.forEach(([label, value]) => {
        if (yPos > 270) {
          pdf.addPage()
          yPos = 30
        }
        pdf.setTextColor(colors.text)
        pdf.setFontSize(10)
        pdf.text(label, 20, yPos)
        pdf.setTextColor('#000000')
        pdf.setFontSize(10)
        pdf.text(String(value), 90, yPos)
        yPos += 8
      })

      yPos += 10

      // QR Code or Ticket Code section
      if (ticket.ticketCode || ticket.qrCode) {
        if (yPos > 240) {
          pdf.addPage()
          yPos = 30
        }

        pdf.setTextColor(colors.text)
        pdf.setFontSize(14)
        pdf.text('Ticket Code', 20, yPos)
        yPos += 12

        pdf.setFillColor(colors.secondary)
        pdf.rect(20, yPos, 170, 20, 'F')

        pdf.setTextColor('#FFFF00') // Yellow color for the code
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text(ticket.ticketCode || ticket.qrCode, 25, yPos + 12)

        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(colors.text)
        pdf.setFontSize(8)
        pdf.text('Present this code at the event entrance', 25, yPos + 16)

        yPos += 30
      }

      // Event description if available
      if (ticket.event && ticket.event.description) {
        if (yPos > 240) {
          pdf.addPage()
          yPos = 20
        }

        pdf.setTextColor(colors.text)
        pdf.setFontSize(12)
        pdf.text('Event Description', 20, yPos)
        yPos += 8

        pdf.setTextColor('#000000') // Black text for visibility
        pdf.setFontSize(9)
        const description = ticket.event.description
        const lines = pdf.splitTextToSize(description, 170)
        pdf.text(lines, 20, yPos)
        yPos += lines.length * 4
      }

      // Footer
      yPos = Math.max(yPos + 40, 270)
      pdf.setTextColor(colors.text)
      pdf.setFontSize(8)
      pdf.text(
        'Generated by ISKA Admin Dashboard System - Spectator Ticket Report',
        20,
        yPos
      )

      const fileName = `spectator-ticket-${
        ticket.event?.name
          ? ticket.event.name.replace(/[^a-zA-Z0-9]/g, '-') + '-'
          : ''
      }${ticket._id || ticket.id || 'unknown'}-${
        new Date().toISOString().split('T')[0]
      }.pdf`

      pdf.save(fileName)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('PDF generation failed. Please try again.')
    }
  }

  // Use API data or show loading state
  if (!dashboardData) {
    return (
      <div className='bg-slate-900 p-6 rounded-xl m-6'>
        <div className='animate-pulse'>
          <div className='h-6 bg-slate-800 rounded mb-6 w-48'></div>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='bg-slate-800 p-4 rounded-lg'>
                <div className='h-4 bg-slate-700 rounded mb-4 w-32'></div>
                <div className='h-32 bg-slate-700 rounded'></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Extract data from API response
  const upcomingEvents = dashboardData.upcomingEvents || []
  const fighterRegistrations = dashboardData.recentFighterRegistrations || []
  const missingResults = dashboardData.boutsMissingResults || []
  const fighterAlerts = dashboardData.fightersWithAlerts || []
  const ticketLogs = dashboardData.spectatorTicketLogs || []

  return (
    <div className='bg-slate-900 p-6 rounded-xl m-6'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold text-slate-400'>
          Operational Data
        </h2>
        <div className='flex gap-4'>
          <button
            onClick={() => {
              // Export table data to CSV
              const csvData = [
                ['Table', 'Count'],
                ['Upcoming Events', upcomingEvents.length],
                ['Recent Registrations', fighterRegistrations.length],
                ['Missing Results', missingResults.length],
                ['Fighter Alerts', fighterAlerts.length],
                ['Ticket Logs', ticketLogs.length],
              ]
              const csvContent = csvData.map((row) => row.join(',')).join('\n')
              const blob = new Blob([csvContent], { type: 'text/csv' })
              const url = window.URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `dashboard-tables-${
                new Date().toISOString().split('T')[0]
              }.csv`
              a.click()
              window.URL.revokeObjectURL(url)
            }}
            className='flex items-center gap-2 text-slate-400 hover:text-white text-sm'
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={async () => {
              // Export Operational Data as PDF using jsPDF
              try {
                const { jsPDF } = await import('jspdf')
                const pdf = new jsPDF('p', 'mm', 'a4')

                const colors = {
                  primary: '#020617',
                  secondary: '#0f172a',
                  accent: '#1e293b',
                  border: '#334155',
                  text: '#94a3b8',
                  white: '#ffffff',
                  blue: '#3b82f6',
                  green: '#10b981',
                  red: '#ef4444',
                }

                let yPos = 20

                // Add header
                pdf.setFillColor(colors.primary)
                pdf.rect(0, 0, 210, 40, 'F')

                pdf.setTextColor(colors.white)
                pdf.setFontSize(24)
                pdf.text('ISKA Dashboard - Operational Data', 20, 25)

                pdf.setFontSize(10)
                pdf.text(
                  `Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
                  20,
                  32
                )

                yPos = 50

                // Summary Statistics Section
                pdf.setTextColor(colors.text)
                pdf.setFontSize(16)
                pdf.text('Summary Statistics', 20, yPos)
                yPos += 10

                const operationalStats = [
                  {
                    label: 'Upcoming Events',
                    value: upcomingEvents.length.toString(),
                  },
                  {
                    label: 'Recent Fighter Registrations',
                    value: fighterRegistrations.length.toString(),
                  },
                  {
                    label: 'Bouts Missing Results',
                    value: missingResults.length.toString(),
                  },
                  {
                    label: 'Fighter Alerts',
                    value: fighterAlerts.length.toString(),
                  },
                  {
                    label: 'Spectator Ticket Logs',
                    value: ticketLogs.length.toString(),
                  },
                ]

                // Stats in a grid layout
                const colWidth = 80
                let col = 0
                const maxCols = 2

                operationalStats.forEach((stat, index) => {
                  const xPos = 20 + col * colWidth

                  // Draw stat box
                  pdf.setFillColor(colors.secondary)
                  pdf.rect(xPos, yPos, colWidth - 5, 25, 'F')

                  pdf.setTextColor(colors.text)
                  pdf.setFontSize(9)
                  pdf.text(stat.label, xPos + 3, yPos + 8)

                  pdf.setTextColor(colors.white)
                  pdf.setFontSize(14)
                  pdf.text(stat.value, xPos + 3, yPos + 18)

                  col++
                  if (col >= maxCols) {
                    col = 0
                    yPos += 30
                  }
                })

                if (col !== 0) yPos += 30
                yPos += 10

                // Upcoming Events Section
                pdf.setTextColor(colors.text)
                pdf.setFontSize(14)
                pdf.text('Upcoming Events', 20, yPos)
                yPos += 10

                if (upcomingEvents.length > 0) {
                  // Table header
                  pdf.setFillColor(colors.accent)
                  pdf.rect(20, yPos, 170, 8, 'F')

                  pdf.setTextColor(colors.white)
                  pdf.setFontSize(9)
                  pdf.text('Event', 22, yPos + 5)
                  pdf.text('Date', 90, yPos + 5)
                  pdf.text('Venue', 130, yPos + 5)
                  pdf.text('Fighters', 170, yPos + 5)
                  yPos += 8

                  // Table rows
                  upcomingEvents.slice(0, 10).forEach((event, index) => {
                    const rowColor =
                      index % 2 === 0 ? colors.secondary : colors.primary
                    pdf.setFillColor(rowColor)
                    pdf.rect(20, yPos, 170, 6, 'F')

                    pdf.setTextColor(colors.white)
                    pdf.setFontSize(8)
                    pdf.text(event.name.substring(0, 25), 22, yPos + 4)
                    pdf.text(formatDate(event.startDate), 90, yPos + 4)
                    const venueName =
                      event.venueName ||
                      event.venue?.name ||
                      event.venue ||
                      'N/A'
                    pdf.text(venueName.substring(0, 15), 130, yPos + 4)
                    pdf.text(event.registeredFighters.toString(), 170, yPos + 4)
                    yPos += 6
                  })
                } else {
                  pdf.setFontSize(10)
                  pdf.text('No upcoming events found', 20, yPos)
                  yPos += 10
                }

                yPos += 10

                // Recent Fighter Registrations Section
                if (yPos > 250) {
                  pdf.addPage()
                  yPos = 20
                }

                pdf.setTextColor(colors.text)
                pdf.setFontSize(14)
                pdf.text('Recent Fighter Registrations', 20, yPos)
                yPos += 10

                if (fighterRegistrations.length > 0) {
                  // Table header
                  pdf.setFillColor(colors.accent)
                  pdf.rect(20, yPos, 170, 8, 'F')

                  pdf.setTextColor(colors.white)
                  pdf.setFontSize(9)
                  pdf.text('Name', 22, yPos + 5)
                  pdf.text('Class', 80, yPos + 5)
                  pdf.text('Gym', 120, yPos + 5)
                  pdf.text('Date', 160, yPos + 5)
                  yPos += 8

                  // Table rows
                  fighterRegistrations
                    .slice(0, 15)
                    .forEach((fighter, index) => {
                      if (yPos > 280) {
                        pdf.addPage()
                        yPos = 20
                      }

                      const rowColor =
                        index % 2 === 0 ? colors.secondary : colors.primary
                      pdf.setFillColor(rowColor)
                      pdf.rect(20, yPos, 170, 6, 'F')

                      pdf.setTextColor(colors.white)
                      pdf.setFontSize(8)
                      const name = `${fighter.firstName} ${fighter.lastName}`
                      pdf.text(name.substring(0, 20), 22, yPos + 4)
                      pdf.text(
                        (
                          fighter.weightClass ||
                          fighter.class ||
                          'N/A'
                        ).substring(0, 12),
                        80,
                        yPos + 4
                      )
                      const gym =
                        fighter.gymName ||
                        fighter.gym?.name ||
                        fighter.gym ||
                        'N/A'
                      pdf.text(gym.substring(0, 12), 120, yPos + 4)
                      pdf.text(formatDate(fighter.createdAt), 160, yPos + 4)
                      yPos += 6
                    })
                } else {
                  pdf.setFontSize(10)
                  pdf.text('No recent registrations found', 20, yPos)
                  yPos += 10
                }

                yPos += 10

                // Bouts Missing Results Section
                if (yPos > 240) {
                  pdf.addPage()
                  yPos = 20
                }

                pdf.setTextColor(colors.text)
                pdf.setFontSize(14)
                pdf.text('Bouts Missing Results', 20, yPos)
                yPos += 10

                if (missingResults.length > 0) {
                  // Table header
                  pdf.setFillColor(colors.accent)
                  pdf.rect(20, yPos, 170, 8, 'F')

                  pdf.setTextColor(colors.white)
                  pdf.setFontSize(9)
                  pdf.text('Bracket', 22, yPos + 5)
                  pdf.text('Event', 80, yPos + 5)
                  pdf.text('Fighter 1', 120, yPos + 5)
                  pdf.text('Fighter 2', 155, yPos + 5)
                  yPos += 8

                  // Table rows
                  missingResults.slice(0, 10).forEach((bout, index) => {
                    if (yPos > 280) {
                      pdf.addPage()
                      yPos = 20
                    }

                    const rowColor =
                      index % 2 === 0 ? colors.secondary : colors.primary
                    pdf.setFillColor(rowColor)
                    pdf.rect(20, yPos, 170, 6, 'F')

                    pdf.setTextColor(colors.white)
                    pdf.setFontSize(7)
                    const bracketName = `${bout.bracket.title}-${bout.bracket.divisionTitle}`
                    pdf.text(bracketName.substring(0, 15), 22, yPos + 4)
                    pdf.text(
                      bout.bracket.event.name.substring(0, 12),
                      80,
                      yPos + 4
                    )
                    const fighter1 = bout.redCorner
                      ? `${bout.redCorner.firstName} ${bout.redCorner.lastName}`
                      : 'N/A'
                    pdf.text(fighter1.substring(0, 12), 120, yPos + 4)
                    const fighter2 = bout.blueCorner
                      ? `${bout.blueCorner.firstName} ${bout.blueCorner.lastName}`
                      : 'N/A'
                    pdf.text(fighter2.substring(0, 12), 155, yPos + 4)
                    yPos += 6
                  })
                } else {
                  pdf.setFontSize(10)
                  pdf.text('No missing results found', 20, yPos)
                  yPos += 10
                }

                yPos += 10

                // Fighters with Alerts Section
                if (yPos > 240) {
                  pdf.addPage()
                  yPos = 20
                }

                pdf.setTextColor(colors.text)
                pdf.setFontSize(14)
                pdf.text('Fighters with Alerts', 20, yPos)
                yPos += 10

                if (fighterAlerts.length > 0) {
                  // Table header
                  pdf.setFillColor(colors.accent)
                  pdf.rect(20, yPos, 170, 8, 'F')

                  pdf.setTextColor(colors.white)
                  pdf.setFontSize(9)
                  pdf.text('Fighter Name', 22, yPos + 5)
                  pdf.text('Issue Type', 90, yPos + 5)
                  pdf.text('Status', 140, yPos + 5)
                  yPos += 8

                  // Table rows
                  fighterAlerts.slice(0, 12).forEach((fighter, index) => {
                    if (yPos > 280) {
                      pdf.addPage()
                      yPos = 20
                    }

                    const rowColor =
                      index % 2 === 0 ? colors.secondary : colors.primary
                    pdf.setFillColor(rowColor)
                    pdf.rect(20, yPos, 170, 6, 'F')

                    pdf.setTextColor(colors.white)
                    pdf.setFontSize(8)
                    const fighterName =
                      fighter.fighterName || fighter.name || 'N/A'
                    pdf.text(fighterName.substring(0, 25), 22, yPos + 4)
                    pdf.text(
                      (fighter.issueType || 'N/A').substring(0, 20),
                      90,
                      yPos + 4
                    )

                    // Color code status
                    const status = fighter.status || 'N/A'
                    if (status === 'Critical') {
                      pdf.setTextColor(colors.red)
                    } else if (status === 'Warning') {
                      pdf.setTextColor('#f59e0b')
                    } else {
                      pdf.setTextColor(colors.white)
                    }
                    pdf.text(status, 140, yPos + 4)
                    pdf.setTextColor(colors.white) // Reset color
                    yPos += 6
                  })
                } else {
                  pdf.setFontSize(10)
                  pdf.text('No fighter alerts found', 20, yPos)
                  yPos += 10
                }

                yPos += 10

                // Spectator Ticket Logs Section
                if (yPos > 230) {
                  pdf.addPage()
                  yPos = 20
                }

                pdf.setTextColor(colors.text)
                pdf.setFontSize(14)
                pdf.text('Spectator Ticket Logs', 20, yPos)
                yPos += 10

                if (ticketLogs.length > 0) {
                  // Table header
                  pdf.setFillColor(colors.accent)
                  pdf.rect(20, yPos, 170, 8, 'F')

                  pdf.setTextColor(colors.white)
                  pdf.setFontSize(9)
                  pdf.text('Type', 22, yPos + 5)
                  pdf.text('Qty', 70, yPos + 5)
                  pdf.text('Revenue', 100, yPos + 5)
                  pdf.text('Event', 140, yPos + 5)
                  yPos += 8

                  // Table rows
                  ticketLogs.slice(0, 15).forEach((ticket, index) => {
                    if (yPos > 280) {
                      pdf.addPage()
                      yPos = 20
                    }

                    const rowColor =
                      index % 2 === 0 ? colors.secondary : colors.primary
                    pdf.setFillColor(rowColor)
                    pdf.rect(20, yPos, 170, 6, 'F')

                    pdf.setTextColor(colors.white)
                    pdf.setFontSize(8)
                    const ticketType =
                      ticket.tiers && ticket.tiers.length > 1
                        ? ticket.tiers.map((t) => t.tierName).join(', ')
                        : ticket.tier

                    pdf.text(ticketType.substring(0, 15), 22, yPos + 4)
                    pdf.text(ticket.quantity.toString(), 70, yPos + 4)
                    pdf.text(`$${ticket.totalAmount}`, 100, yPos + 4)
                    pdf.text(
                      (ticket.event?.name || 'N/A').substring(0, 20),
                      140,
                      yPos + 4
                    )
                    yPos += 6
                  })
                } else {
                  pdf.setFontSize(10)
                  pdf.text('No ticket logs found', 20, yPos)
                  yPos += 10
                }

                // Footer
                yPos = Math.max(yPos + 20, 285)
                pdf.setTextColor(colors.text)
                pdf.setFontSize(8)
                pdf.text(
                  'Generated by ISKA Admin Dashboard System - Operational Data Report',
                  20,
                  yPos
                )

                pdf.save(
                  `operational-data-report-${
                    new Date().toISOString().split('T')[0]
                  }.pdf`
                )
              } catch (error) {
                console.error('Error generating PDF:', error)
                alert('PDF generation failed. Please try again.')
              }
            }}
            className='flex items-center gap-2 text-slate-400 hover:text-white text-sm'
          >
            <Download size={16} />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => {
              sendEmailReport(dashboardData)
            }}
            className='flex items-center gap-2 text-slate-400 hover:text-white text-sm'
          >
            <Mail size={16} />
            <span>Email Report</span>
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Upcoming Events */}
        <div className='bg-slate-800 p-4 rounded-lg flex flex-col h-96'>
          <div className='flex items-center gap-2 mb-4 text-slate-300'>
            <Calendar size={16} />
            <h3 className='font-medium'>Upcoming Events</h3>
          </div>
          <div className='overflow-x-auto overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700 custom-scrollbar'>
            <table className='w-full text-sm text-left text-slate-400'>
              <thead className='text-xs uppercase bg-slate-700 text-slate-400'>
                <tr>
                  <th scope='col' className='px-4 py-3'>
                    Event
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Date
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Venue
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Fighters
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {upcomingEvents.map((event) => (
                  <tr
                    key={event._id}
                    className='border-b border-slate-700 hover:bg-slate-750'
                  >
                    <td className='px-4 py-3 font-medium text-white'>
                      {event.name}
                    </td>
                    <td className='px-4 py-3'>{formatDate(event.startDate)}</td>
                    <td className='px-4 py-3'>
                      {event.venueName || event.venue?.name || event.venue}
                    </td>
                    <td className='px-4 py-3'>{event.registeredFighters}</td>
                    <td className='px-4 py-3'>
                      <button
                        onClick={() => handleManageBrackets(event)}
                        className='text-blue-500 hover:text-blue-400 text-sm'
                      >
                        Manage Brackets
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Fighter Registrations */}
        <div className='bg-slate-800 p-4 rounded-lg flex flex-col h-96'>
          <div className='flex items-center gap-2 mb-4 text-slate-300'>
            <User size={16} />
            <h3 className='font-medium'>Recent Fighter Registrations</h3>
          </div>
          <div className='overflow-x-auto overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700 custom-scrollbar'>
            <table className='w-full text-sm text-left text-slate-400'>
              <thead className='text-xs uppercase bg-slate-700 text-slate-400'>
                <tr>
                  <th scope='col' className='px-4 py-3'>
                    Name
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    DOB
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Class
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Gym
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Date
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {fighterRegistrations.map((fighter, index) => (
                  <tr
                    key={fighter.id || fighter._id || `fighter-${index}`}
                    className='border-b border-slate-700 hover:bg-slate-750'
                  >
                    <td className='px-4 py-3 font-medium text-white'>
                      {fighter.firstName + ' ' + fighter.lastName}
                    </td>
                    <td className='px-4 py-3'>
                      {fighter.dateOfBirth
                        ? formatDate(fighter.dateOfBirth)
                        : ''}
                    </td>
                    <td className='px-4 py-3'>
                      {fighter.weightClass || fighter.class || 'N/A'}
                    </td>
                    <td className='px-4 py-3'>
                      {fighter.gymName ||
                        fighter.gym?.name ||
                        fighter.gym ||
                        'N/A'}
                    </td>
                    <td className='px-4 py-3'>
                      {formatDate(fighter.createdAt)}
                    </td>
                    <td className='px-4 py-3'>
                      <button
                        onClick={() => handleViewProfile(fighter)}
                        className='text-blue-500 hover:text-blue-400 text-sm'
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bouts Missing Results */}
        <div className='bg-slate-800 p-4 rounded-lg flex flex-col h-96'>
          <div className='flex items-center gap-2 mb-4 text-slate-300'>
            <Clock size={16} />
            <h3 className='font-medium'>Bouts Missing Results</h3>
          </div>
          <div className='overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700 custom-scrollbar'>
            <table className='w-full text-sm text-left text-slate-400'>
              <thead className='text-xs uppercase bg-slate-700 text-slate-400'>
                <tr>
                  <th scope='col' className='px-4 py-3'>
                    Bracket
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Event
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Fighter 1
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Fighter 2
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Scheduled
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {missingResults.map((bout, index) => (
                  <tr
                    key={index}
                    className='border-b border-slate-700 hover:bg-slate-750'
                  >
                    <td className='px-4 py-3'>
                      {bout.bracket.title + '-' + bout.bracket.divisionTitle}
                    </td>
                    <td className='px-4 py-3'>{bout.bracket.event.name}</td>
                    <td className='px-4 py-3'>
                      {bout.redCorner
                        ? bout.redCorner.firstName +
                          ' ' +
                          bout.redCorner.lastName
                        : 'N/A'}
                    </td>
                    <td className='px-4 py-3'>
                      {bout.blueCorner
                        ? bout.blueCorner.firstName +
                          ' ' +
                          bout.blueCorner.lastName
                        : 'N/A'}
                    </td>
                    <td className='px-4 py-3'>
                      {bout.startDate ? formatDate(bout.startDate) : 'N/A'}
                    </td>
                    <td className='px-4 py-3'>
                      <button
                        onClick={() => handleAddResult(bout)}
                        className='text-blue-500 hover:text-blue-400 text-sm'
                      >
                        Add Result
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fighters with Alerts */}
        <div className='bg-slate-800 p-4 rounded-lg flex flex-col h-96'>
          <div className='flex items-center gap-2 mb-4 text-slate-300'>
            <ShieldAlert size={16} />
            <h3 className='font-medium'>Fighters with Alerts</h3>
          </div>
          <div className='overflow-x-auto overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700 custom-scrollbar'>
            <table className='w-full text-sm text-left text-slate-400'>
              <thead className='text-xs uppercase bg-slate-700 text-slate-400'>
                <tr>
                  <th scope='col' className='px-4 py-3'>
                    Name
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Issue Type
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Status
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {fighterAlerts.map((fighter, index) => (
                  <tr
                    key={fighter.id || fighter._id || `alert-${index}`}
                    className='border-b border-slate-700 hover:bg-slate-750'
                  >
                    <td className='px-4 py-3 font-medium text-white'>
                      {fighter.fighterName || fighter.name}
                    </td>
                    <td className='px-4 py-3'>{fighter.issueType}</td>
                    <td className='px-4 py-3'>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          fighter.status === 'Critical'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {fighter.status}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => handleFixFighter(fighter)}
                          className='text-blue-500 hover:text-blue-400 text-sm'
                        >
                          Fix
                        </button>
                        <button
                          onClick={() => handleSuspendFighter(fighter)}
                          className='text-red-500 hover:text-red-400 text-sm'
                        >
                          Suspend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Spectator Ticket Logs */}
        <div className='lg:col-span-2 bg-slate-800 p-4 rounded-lg'>
          <div className='flex items-center gap-2 mb-4 text-slate-300'>
            <CreditCard size={16} />
            <h3 className='font-medium'>Spectator Ticket Logs</h3>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm text-left text-slate-400'>
              <thead className='text-xs uppercase bg-slate-700 text-slate-400'>
                <tr>
                  <th scope='col' className='px-4 py-3'>
                    Type
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Qty
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Revenue
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Event
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Event Date
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {ticketLogs.map((ticket, index) => (
                  <tr
                    key={index}
                    className='border-b border-slate-700 hover:bg-slate-750'
                  >
                    <td className='px-4 py-3 font-medium text-white'>
                      {ticket.tiers && ticket.tiers.length > 1
                        ? ticket.tiers.map((t) => t.tierName).join(', ')
                        : ticket.tier}
                    </td>
                    <td className='px-4 py-3'>{ticket.quantity}</td>
                    <td className='px-4 py-3'>{`$${ticket.totalAmount}`}</td>
                    <td className='px-4 py-3'>{ticket.event?.name}</td>
                    <td className='px-4 py-3'>
                      {formatDateTime(ticket.event?.startDate)}
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => handleViewDetails(ticket)}
                          className='text-blue-500 hover:text-blue-400 text-sm'
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleExportTicketPDF(ticket)}
                          className='text-green-500 hover:text-green-400 text-sm flex items-center gap-1'
                          title='Download PDF report for this ticket'
                        >
                          <Download size={12} />
                          Export
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fighter Profile Modal */}
        {showDetailModal &&
          selectedItem &&
          selectedAction === 'viewProfile' && (
            <CompetitorDetailModal
              competitor={selectedItem}
              onClose={() => {
                setShowDetailModal(false)
                setSelectedItem(null)
                setSelectedAction(null)
              }}
              calculateAge={calculateAge}
            />
          )}

        {/* Bout Result Modal */}
        {showBoutResultModal &&
          selectedItem &&
          selectedAction === 'addResult' && (
            <BoutResultModal
              bout={selectedItem}
              eventId={selectedItem.bracket?.event?._id || selectedItem.eventId}
              onClose={() => {
                setShowBoutResultModal(false)
                setSelectedItem(null)
                setSelectedAction(null)
              }}
              onUpdate={() => {
                if (onRefresh) {
                  onRefresh()
                }
              }}
            />
          )}

        {/* Ticket Details Modal */}
        {showTicketModal &&
          selectedItem &&
          selectedAction === 'viewDetails' && (
            <TicketDetailsModal
              ticket={selectedItem}
              onClose={() => {
                setShowTicketModal(false)
                setSelectedItem(null)
                setSelectedAction(null)
              }}
            />
          )}
      </div>
    </div>
  )
}
