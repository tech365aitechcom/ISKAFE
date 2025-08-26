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
import { formatDate, formatDateTime, calculateAge } from '../utils/dashboardUtils'

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
            onClick={() => {
              // Enhanced PDF export for table data
              const printContent = `
                <html>
                <head>
                  <title>ISKA Dashboard - Operational Data Report</title>
                  <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ccc; padding-bottom: 20px; }
                    .section { margin-bottom: 30px; }
                    .section h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 12px; }
                    th { background-color: #f5f5f5; font-weight: bold; }
                    .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                    .footer { text-align: center; margin-top: 40px; font-size: 10px; color: #666; }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <h1>ISKA Admin Dashboard - Operational Data Report</h1>
                    <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                  </div>
                  
                  <div class="summary">
                    <h3>Summary Statistics</h3>
                    <p><strong>Upcoming Events:</strong> ${
                      upcomingEvents.length
                    }</p>
                    <p><strong>Recent Fighter Registrations:</strong> ${
                      fighterRegistrations.length
                    }</p>
                    <p><strong>Bouts Missing Results:</strong> ${
                      missingResults.length
                    }</p>
                    <p><strong>Fighter Alerts:</strong> ${
                      fighterAlerts.length
                    }</p>
                    <p><strong>Spectator Ticket Logs:</strong> ${
                      ticketLogs.length
                    }</p>
                  </div>

                  <div class="section">
                    <h2>Upcoming Events</h2>
                    <table>
                      <thead>
                        <tr><th>Event</th><th>Date</th><th>Venue</th><th>Fighters</th></tr>
                      </thead>
                      <tbody>
                        ${upcomingEvents
                          .map(
                            (event) => `
                          <tr>
                            <td>${event.name}</td>
                            <td>${formatDate(event.startDate)}</td>
                            <td>${
                              event.venueName ||
                              event.venue?.name ||
                              event.venue
                            }</td>
                            <td>${event.registeredFighters}</td>
                          </tr>
                        `
                          )
                          .join('')}
                      </tbody>
                    </table>
                  </div>

                  <div class="section">
                    <h2>Spectator Ticket Logs</h2>
                    <table>
                      <thead>
                        <tr><th>Type</th><th>Quantity</th><th>Revenue</th><th>Event</th><th>Event Date</th></tr>
                      </thead>
                      <tbody>
                        ${ticketLogs
                          .map(
                            (ticket) => `
                          <tr>
                            <td>${
                              ticket.tiers && ticket.tiers.length > 1
                                ? ticket.tiers.map((t) => t.tierName).join(', ')
                                : ticket.tier
                            }</td>
                            <td>${ticket.quantity}</td>
                            <td>$${ticket.totalAmount}</td>
                            <td>${ticket.event?.name}</td>
                            <td>${formatDateTime(ticket.event?.startDate)}</td>
                          </tr>
                        `
                          )
                          .join('')}
                      </tbody>
                    </table>
                  </div>

                  <div class="footer">
                    <p>This report was automatically generated by the ISKA Admin Dashboard System.</p>
                  </div>
                </body>
                </html>
              `

              // Create a blob with the HTML content and trigger download
              const blob = new Blob([printContent], { type: 'text/html' })
              const url = window.URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `dashboard-detailed-report-${new Date().toISOString().split('T')[0]}.html`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              window.URL.revokeObjectURL(url)
            }}
            className='flex items-center gap-2 text-slate-400 hover:text-white text-sm'
          >
            <Download size={16} />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => {
              // Enhanced email report with detailed operational data
              const emailSubject = `ISKA Dashboard Report - ${new Date().toLocaleDateString()}`
              const emailBody = `ISKA Admin Dashboard - Operational Data Report
Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

=== SUMMARY STATISTICS ===
• Upcoming Events: ${upcomingEvents.length}
• Recent Fighter Registrations: ${fighterRegistrations.length}
• Bouts Missing Results: ${missingResults.length}
• Fighter Alerts: ${fighterAlerts.length}
• Spectator Ticket Logs: ${ticketLogs.length}

=== UPCOMING EVENTS ===
${upcomingEvents
  .map(
    (event, index) =>
      `${index + 1}. ${event.name} - ${formatDate(event.startDate)} at ${
        event.venueName || event.venue?.name || event.venue
      } (${event.registeredFighters} fighters)`
  )
  .join('\n')}

=== RECENT FIGHTER REGISTRATIONS ===
${fighterRegistrations
  .map(
    (fighter, index) =>
      `${index + 1}. ${fighter.firstName} ${fighter.lastName} - ${
        fighter.weightClass || fighter.class
      } - ${formatDate(fighter.createdAt)}`
  )
  .join('\n')}

=== SPECTATOR TICKET LOGS ===
${ticketLogs
  .map(
    (ticket, index) =>
      `${index + 1}. ${
        ticket.tiers && ticket.tiers.length > 1
          ? ticket.tiers.map((t) => t.tierName).join(', ')
          : ticket.tier
      } - Qty: ${ticket.quantity} - Revenue: $${ticket.totalAmount} - Event: ${
        ticket.event?.name
      } - ${formatDateTime(ticket.event?.startDate)}`
  )
  .join('\n')}

=== BOUTS MISSING RESULTS ===
${missingResults
  .map(
    (bout, index) =>
      `${index + 1}. Bout #${bout.boutNumber} - ${bout.bracket.title}-${
        bout.bracket.divisionTitle
      } - ${bout.bracket.event.name} - Scheduled: ${
        bout.startDate ? formatDate(bout.startDate) : 'N/A'
      }`
  )
  .join('\n')}

=== FIGHTER ALERTS ===
${fighterAlerts
  .map(
    (fighter, index) =>
      `${index + 1}. ${fighter.fighterName || fighter.name} - ${
        fighter.alertType || fighter.issue
      } - Status: ${fighter.alertLevel || fighter.status}`
  )
  .join('\n')}

---
This report was automatically generated by the ISKA Admin Dashboard System.
For detailed analysis, please access the full dashboard at your admin portal.

Best regards,
ISKA Admin System`

              const mailtoLink = `mailto:?subject=${encodeURIComponent(
                emailSubject
              )}&body=${encodeURIComponent(emailBody)}`
              window.location.href = mailtoLink
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
                      <button
                        onClick={() => handleViewDetails(ticket)}
                        className='text-blue-500 hover:text-blue-400 text-sm'
                      >
                        Details
                      </button>
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