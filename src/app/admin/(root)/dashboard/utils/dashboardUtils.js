// Helper function for consistent date formatting
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return 'Invalid Date'
  }
}

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Invalid Date'
  }
}

// Calculate age helper function
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 'N/A'
  const birth = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

// Export functionality
export const exportToCSV = (dashboardData) => {
  if (!dashboardData) return

  const csvData = [
    ['Metric', 'Value'],
    ['Total Fighters', dashboardData.totalFightersData.total],
    ['Male Fighters', dashboardData.totalFightersData.genderSplit.male],
    ['Female Fighters', dashboardData.totalFightersData.genderSplit.female],
    ['Other Fighters', dashboardData.totalFightersData.genderSplit.other],
    ['Total Events', dashboardData.totalEvents],
    ['Bouts Today', dashboardData.todaysBoutCount],
    ['Total Revenue', dashboardData.totalRevenue],
    ['Tickets Sold', dashboardData.totalTickets],
    ['Total Venues', dashboardData.totalVenues],
    ['Bout Progress - Completed', dashboardData.boutProgress.completed + '%'],
    ['Bout Progress - Pending', dashboardData.boutProgress.pending + '%'],
  ]

  const csvContent = csvData.map((row) => row.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

export const exportToPDF = async (dashboardData) => {
  if (!dashboardData) return

  try {
    // Skip html2canvas entirely and use pure jsPDF to avoid oklch issues
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    // Helper functions to match UI formatting
    const formatValue = (value) => {
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`
      }
      return value.toString()
    }
    
    const formatCurrency = (value) => {
      if (value >= 1000) {
        return `$${(value / 1000).toFixed(1)}K`
      }
      return `$${value}`
    }

    // Set up PDF styling
    const colors = {
      primary: '#020617',
      secondary: '#0f172a',
      accent: '#1e293b',
      border: '#334155',
      text: '#94a3b8',
      white: '#ffffff',
      blue: '#3b82f6',
      green: '#10b981',
      red: '#ef4444'
    }

    let yPos = 20

    // Add header
    pdf.setFillColor(colors.primary)
    pdf.rect(0, 0, 210, 40, 'F')
    
    pdf.setTextColor(colors.white)
    pdf.setFontSize(24)
    pdf.text('ISKA Dashboard Report', 20, 25)
    
    pdf.setFontSize(10)
    pdf.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 32)
    
    yPos = 50

    // Dashboard Stats Section
    pdf.setTextColor(colors.text)
    pdf.setFontSize(16)
    pdf.text('Key Statistics', 20, yPos)
    yPos += 10

    const stats = [
      { label: 'Total Fighters', value: formatValue(dashboardData.totalFightersData.total) },
      { label: 'Total Events', value: dashboardData.totalEvents.toString() },
      { label: 'Bouts Today', value: dashboardData.todaysBoutCount.toString() },
      { label: 'Total Revenue', value: formatCurrency(dashboardData.totalRevenue) },
      { label: 'Tickets Sold', value: dashboardData.totalTickets.toString() },
      { label: 'Total Venues', value: dashboardData.totalVenues.toString() }
    ]

    // Stats in a grid layout
    const colWidth = 60
    let col = 0
    const maxCols = 3

    stats.forEach((stat, index) => {
      const xPos = 20 + (col * colWidth)
      
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

    // Bout Progress Section
    pdf.setTextColor(colors.text)
    pdf.setFontSize(14)
    pdf.text('Bout Result Progress', 20, yPos)
    yPos += 10

    const completedPercent = parseFloat(dashboardData.boutProgress.completed)
    const pendingPercent = parseFloat(dashboardData.boutProgress.pending)

    pdf.setFontSize(10)
    pdf.text(`Completed: ${completedPercent}%`, 20, yPos)
    pdf.text(`Pending: ${pendingPercent}%`, 80, yPos)
    yPos += 15

    // Upcoming Events Section
    pdf.setTextColor(colors.text)
    pdf.setFontSize(14)
    pdf.text('Upcoming Events', 20, yPos)
    yPos += 10

    const upcomingEvents = dashboardData.upcomingEvents || []
    if (upcomingEvents.length > 0) {
      // Table header
      pdf.setFillColor(colors.accent)
      pdf.rect(20, yPos, 170, 8, 'F')
      
      pdf.setTextColor(colors.white)
      pdf.setFontSize(9)
      pdf.text('Event', 22, yPos + 5)
      pdf.text('Date', 90, yPos + 5)
      pdf.text('Fighters', 140, yPos + 5)
      yPos += 8

      // Table rows
      upcomingEvents.slice(0, 10).forEach((event, index) => {
        const rowColor = index % 2 === 0 ? colors.secondary : colors.primary
        pdf.setFillColor(rowColor)
        pdf.rect(20, yPos, 170, 6, 'F')
        
        pdf.setTextColor(colors.white)
        pdf.setFontSize(8)
        pdf.text(event.name.substring(0, 35), 22, yPos + 4)
        pdf.text(formatDate(event.startDate), 90, yPos + 4)
        pdf.text(event.registeredFighters.toString(), 140, yPos + 4)
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

    const fighterRegistrations = dashboardData.recentFighterRegistrations || []
    if (fighterRegistrations.length > 0) {
      // Table header
      pdf.setFillColor(colors.accent)
      pdf.rect(20, yPos, 170, 8, 'F')
      
      pdf.setTextColor(colors.white)
      pdf.setFontSize(9)
      pdf.text('Name', 22, yPos + 5)
      pdf.text('Class', 90, yPos + 5)
      pdf.text('Date', 140, yPos + 5)
      yPos += 8

      // Table rows
      fighterRegistrations.slice(0, 15).forEach((fighter, index) => {
        if (yPos > 280) {
          pdf.addPage()
          yPos = 20
        }
        
        const rowColor = index % 2 === 0 ? colors.secondary : colors.primary
        pdf.setFillColor(rowColor)
        pdf.rect(20, yPos, 170, 6, 'F')
        
        pdf.setTextColor(colors.white)
        pdf.setFontSize(8)
        const name = `${fighter.firstName} ${fighter.lastName}`
        pdf.text(name.substring(0, 25), 22, yPos + 4)
        pdf.text((fighter.weightClass || fighter.class || 'N/A').substring(0, 20), 90, yPos + 4)
        pdf.text(formatDate(fighter.createdAt), 140, yPos + 4)
        yPos += 6
      })
    } else {
      pdf.setFontSize(10)
      pdf.text('No recent registrations found', 20, yPos)
      yPos += 10
    }

    yPos += 10

    // Event Participation Trend Section
    if (yPos > 240) {
      pdf.addPage()
      yPos = 20
    }

    pdf.setTextColor(colors.text)
    pdf.setFontSize(14)
    pdf.text('Event Participation Trend', 20, yPos)
    yPos += 10

    const participationData = dashboardData.eventParticipationTrend || []
    if (participationData.length > 0) {
      // Table header
      pdf.setFillColor(colors.accent)
      pdf.rect(20, yPos, 170, 8, 'F')
      
      pdf.setTextColor(colors.white)
      pdf.setFontSize(9)
      pdf.text('Date', 22, yPos + 5)
      pdf.text('Participation Count', 90, yPos + 5)
      yPos += 8

      // Table rows
      participationData.slice(0, 8).forEach((item, index) => {
        const rowColor = index % 2 === 0 ? colors.secondary : colors.primary
        pdf.setFillColor(rowColor)
        pdf.rect(20, yPos, 170, 6, 'F')
        
        pdf.setTextColor(colors.white)
        pdf.setFontSize(8)
        const date = new Date(item.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
        pdf.text(date, 22, yPos + 4)
        pdf.text(item.count.toString(), 90, yPos + 4)
        yPos += 6
      })
    } else {
      pdf.setFontSize(10)
      pdf.text('No participation data available', 20, yPos)
      yPos += 10
    }

    yPos += 10

    // Ticket Type Breakdown Section
    if (yPos > 250) {
      pdf.addPage()
      yPos = 20
    }

    pdf.setTextColor(colors.text)
    pdf.setFontSize(14)
    pdf.text('Ticket Types Breakdown', 20, yPos)
    yPos += 10

    const ticketTypes = dashboardData.ticketTypeBreakdown || []
    if (ticketTypes.length > 0) {
      const sortedTickets = ticketTypes.sort((a, b) => b.count - a.count)
      
      // Table header
      pdf.setFillColor(colors.accent)
      pdf.rect(20, yPos, 170, 8, 'F')
      
      pdf.setTextColor(colors.white)
      pdf.setFontSize(9)
      pdf.text('Ticket Type', 22, yPos + 5)
      pdf.text('Count', 90, yPos + 5)
      pdf.text('Percentage', 140, yPos + 5)
      yPos += 8

      const totalTickets = sortedTickets.reduce((sum, t) => sum + t.count, 0)
      
      sortedTickets.slice(0, 8).forEach((ticket, index) => {
        const rowColor = index % 2 === 0 ? colors.secondary : colors.primary
        pdf.setFillColor(rowColor)
        pdf.rect(20, yPos, 170, 6, 'F')
        
        pdf.setTextColor(colors.white)
        pdf.setFontSize(8)
        const percentage = totalTickets > 0 ? ((ticket.count / totalTickets) * 100).toFixed(1) : '0'
        pdf.text(ticket.type.substring(0, 25), 22, yPos + 4)
        pdf.text(ticket.count.toString(), 90, yPos + 4)
        pdf.text(`${percentage}%`, 140, yPos + 4)
        yPos += 6
      })
    } else {
      pdf.setFontSize(10)
      pdf.text('No ticket type data available', 20, yPos)
      yPos += 10
    }

    yPos += 10

    // Daily Ticket Sales Section
    if (yPos > 240) {
      pdf.addPage()
      yPos = 20
    }

    pdf.setTextColor(colors.text)
    pdf.setFontSize(14)
    pdf.text('Daily Ticket Sales', 20, yPos)
    yPos += 10

    const dailySales = dashboardData.dailyTicketSales || []
    if (dailySales.length > 0) {
      // Table header
      pdf.setFillColor(colors.accent)
      pdf.rect(20, yPos, 170, 8, 'F')
      
      pdf.setTextColor(colors.white)
      pdf.setFontSize(9)
      pdf.text('Date', 22, yPos + 5)
      pdf.text('Sales Count', 90, yPos + 5)
      yPos += 8

      // Table rows
      dailySales.slice(0, 10).forEach((item, index) => {
        const rowColor = index % 2 === 0 ? colors.secondary : colors.primary
        pdf.setFillColor(rowColor)
        pdf.rect(20, yPos, 170, 6, 'F')
        
        pdf.setTextColor(colors.white)
        pdf.setFontSize(8)
        const date = new Date(item.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
        pdf.text(date, 22, yPos + 4)
        pdf.text(item.count.toString(), 90, yPos + 4)
        yPos += 6
      })
    } else {
      pdf.setFontSize(10)
      pdf.text('No daily sales data available', 20, yPos)
      yPos += 10
    }

    yPos += 10

    // Revenue vs Redemption Section
    if (yPos > 240) {
      pdf.addPage()
      yPos = 20
    }

    pdf.setTextColor(colors.text)
    pdf.setFontSize(14)
    pdf.text('Revenue vs Redemption', 20, yPos)
    yPos += 10

    const revenueData = dashboardData.redemptionStats || []
    if (revenueData.length > 0) {
      // Table header
      pdf.setFillColor(colors.accent)
      pdf.rect(20, yPos, 170, 8, 'F')
      
      pdf.setTextColor(colors.white)
      pdf.setFontSize(9)
      pdf.text('Date', 22, yPos + 5)
      pdf.text('Revenue', 70, yPos + 5)
      pdf.text('Redeemed', 120, yPos + 5)
      pdf.text('Rate', 160, yPos + 5)
      yPos += 8

      // Table rows
      revenueData.slice(0, 10).forEach((item, index) => {
        const rowColor = index % 2 === 0 ? colors.secondary : colors.primary
        pdf.setFillColor(rowColor)
        pdf.rect(20, yPos, 170, 6, 'F')
        
        pdf.setTextColor(colors.white)
        pdf.setFontSize(8)
        const date = new Date(item.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
        const redemptionRate = item.totalRevenue > 0 ? 
          ((item.redeemedRevenue / item.totalRevenue) * 100).toFixed(1) : '0'
        
        pdf.text(date, 22, yPos + 4)
        pdf.text(`$${item.totalRevenue}`, 70, yPos + 4)
        pdf.text(`$${item.redeemedRevenue}`, 120, yPos + 4)
        pdf.text(`${redemptionRate}%`, 160, yPos + 4)
        yPos += 6
      })
    } else {
      pdf.setFontSize(10)
      pdf.text('No redemption data available', 20, yPos)
      yPos += 10
    }

    yPos += 10

    // Weight Class Distribution Section
    if (yPos > 240) {
      pdf.addPage()
      yPos = 20
    }

    pdf.setTextColor(colors.text)
    pdf.setFontSize(14)
    pdf.text('Weight Class Distribution', 20, yPos)
    yPos += 10

    const weightClasses = dashboardData.weightClassDistribution || []
    if (weightClasses.length > 0) {
      // Table header
      pdf.setFillColor(colors.accent)
      pdf.rect(20, yPos, 170, 8, 'F')
      
      pdf.setTextColor(colors.white)
      pdf.setFontSize(9)
      pdf.text('Weight Class', 22, yPos + 5)
      pdf.text('Male', 90, yPos + 5)
      pdf.text('Female', 120, yPos + 5)
      pdf.text('Other', 150, yPos + 5)
      yPos += 8

      // Table rows
      weightClasses.slice(0, 12).forEach((item, index) => {
        if (yPos > 280) {
          pdf.addPage()
          yPos = 20
        }
        
        const rowColor = index % 2 === 0 ? colors.secondary : colors.primary
        pdf.setFillColor(rowColor)
        pdf.rect(20, yPos, 170, 6, 'F')
        
        pdf.setTextColor(colors.white)
        pdf.setFontSize(8)
        const weightClass = item.weightClass.split(' (')[0] // Remove weight details
        pdf.text(weightClass.substring(0, 20), 22, yPos + 4)
        pdf.text(item.male.toString(), 90, yPos + 4)
        pdf.text(item.female.toString(), 120, yPos + 4)
        pdf.text(item.other.toString(), 150, yPos + 4)
        yPos += 6
      })
    } else {
      pdf.setFontSize(10)
      pdf.text('No weight class data available', 20, yPos)
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

    const missingResults = dashboardData.boutsMissingResults || []
    if (missingResults.length > 0) {
      // Table header
      pdf.setFillColor(colors.accent)
      pdf.rect(20, yPos, 170, 8, 'F')
      
      pdf.setTextColor(colors.white)
      pdf.setFontSize(9)
      pdf.text('Bracket', 22, yPos + 5)
      pdf.text('Event', 90, yPos + 5)
      pdf.text('Scheduled', 140, yPos + 5)
      yPos += 8

      // Table rows
      missingResults.slice(0, 10).forEach((bout, index) => {
        if (yPos > 280) {
          pdf.addPage()
          yPos = 20
        }
        
        const rowColor = index % 2 === 0 ? colors.secondary : colors.primary
        pdf.setFillColor(rowColor)
        pdf.rect(20, yPos, 170, 6, 'F')
        
        pdf.setTextColor(colors.white)
        pdf.setFontSize(8)
        const bracketName = `${bout.bracket.title}-${bout.bracket.divisionTitle}`
        pdf.text(bracketName.substring(0, 25), 22, yPos + 4)
        pdf.text(bout.bracket.event.name.substring(0, 20), 90, yPos + 4)
        pdf.text(bout.startDate ? formatDate(bout.startDate) : 'N/A', 140, yPos + 4)
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

    const fighterAlerts = dashboardData.fightersWithAlerts || []
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
        
        const rowColor = index % 2 === 0 ? colors.secondary : colors.primary
        pdf.setFillColor(rowColor)
        pdf.rect(20, yPos, 170, 6, 'F')
        
        pdf.setTextColor(colors.white)
        pdf.setFontSize(8)
        const fighterName = fighter.fighterName || fighter.name || 'N/A'
        pdf.text(fighterName.substring(0, 25), 22, yPos + 4)
        pdf.text((fighter.issueType || 'N/A').substring(0, 20), 90, yPos + 4)
        
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
    if (yPos > 240) {
      pdf.addPage()
      yPos = 20
    }

    pdf.setTextColor(colors.text)
    pdf.setFontSize(14)
    pdf.text('Spectator Ticket Logs', 20, yPos)
    yPos += 10

    const ticketLogs = dashboardData.spectatorTicketLogs || []
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
        
        const rowColor = index % 2 === 0 ? colors.secondary : colors.primary
        pdf.setFillColor(rowColor)
        pdf.rect(20, yPos, 170, 6, 'F')
        
        pdf.setTextColor(colors.white)
        pdf.setFontSize(8)
        const ticketType = ticket.tiers && ticket.tiers.length > 1
          ? ticket.tiers.map((t) => t.tierName).join(', ')
          : ticket.tier
        
        pdf.text(ticketType.substring(0, 15), 22, yPos + 4)
        pdf.text(ticket.quantity.toString(), 70, yPos + 4)
        pdf.text(`$${ticket.totalAmount}`, 100, yPos + 4)
        pdf.text((ticket.event?.name || 'N/A').substring(0, 15), 140, yPos + 4)
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
    pdf.text('Generated by ISKA Admin Dashboard System', 20, yPos)
    
    pdf.save(`dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`)
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('PDF generation failed. Downloading CSV instead.')
    exportToCSV(dashboardData)
  }
}

export const sendEmailReport = (dashboardData) => {
  if (!dashboardData) return

  // Create email body with dashboard summary
  const emailBody = `Dashboard Report - ${new Date().toLocaleDateString()}

Key Statistics:
- Total Fighters: ${dashboardData.totalFightersData.total}
- Total Events: ${dashboardData.totalEvents}
- Bouts Today: ${dashboardData.todaysBoutCount}
- Total Revenue: $${dashboardData.totalRevenue}
- Tickets Sold: ${dashboardData.totalTickets}
- Total Venues: ${dashboardData.totalVenues}

Generated from ISKA Admin Dashboard`

  const mailtoLink = `mailto:?subject=ISKA Dashboard Report - ${new Date().toLocaleDateString()}&body=${encodeURIComponent(
    emailBody
  )}`
  window.location.href = mailtoLink
}