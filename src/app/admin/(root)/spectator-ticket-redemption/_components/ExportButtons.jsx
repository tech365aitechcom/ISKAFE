import React from 'react'
import { Download } from 'lucide-react'
import { enqueueSnackbar } from 'notistack'

export default function ExportButtons({ filteredRedemptions, selectedEvent }) {
  const handleExport = async (format) => {
    if (filteredRedemptions.length === 0) {
      enqueueSnackbar('No redemptions to export', {
        variant: 'warning',
      })
      return
    }

    if (format === 'csv') {
      const headers =
        'Ticket Code,Buyer Name,Ticket Type,Price,Redeemed At,Redeemed By,Entry Mode,Status,Event Name\n'
      const csvData = filteredRedemptions
        .map(
          (redemption) =>
            `${redemption.code},"${redemption.name}",${redemption.type},$${
              redemption.price?.toFixed(2) || '0.00'
            },"${
              redemption.redeemedAt
                ? new Date(redemption.redeemedAt).toLocaleString()
                : '-'
            }","${redemption.redeemedBy || '-'}","${
              redemption.entryMode || 'Manual'
            }","${redemption.status}","${
              redemption.eventName || selectedEvent?.name || ''
            }"`
        )
        .join('\n')

      const blob = new Blob([headers + csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `spectator-redemptions-${
        selectedEvent?.name || 'all-events'
      }-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } else if (format === 'pdf') {
      try {
        const jsPDF = (await import('jspdf')).default
        const autoTable = (await import('jspdf-autotable')).default

        const doc = new jsPDF()

        doc.setFontSize(18)
        doc.text('Spectator Ticket Redemptions', 20, 20)

        if (selectedEvent) {
          doc.setFontSize(12)
          doc.text(`Event: ${selectedEvent.name}`, 20, 35)
          doc.text(
            `Date: ${new Date(selectedEvent.date).toLocaleDateString()}`,
            20,
            45
          )
          doc.text(`Location: ${selectedEvent.location}`, 20, 55)
        }

        const tableColumns = [
          'Ticket Code',
          'Buyer Name',
          'Type',
          'Price',
          'Redeemed At',
          'Redeemed By',
          'Entry Mode',
          'Status',
        ]
        const tableData = filteredRedemptions.map((redemption) => [
          redemption.code,
          redemption.name,
          redemption.type,
          `$${redemption.price?.toFixed(2) || '0.00'}`,
          redemption.redeemedAt
            ? new Date(redemption.redeemedAt).toLocaleDateString()
            : '-',
          redemption.redeemedBy || '-',
          redemption.entryMode || 'Manual',
          redemption.status,
        ])

        autoTable(doc, {
          head: [tableColumns],
          body: tableData,
          startY: selectedEvent ? 65 : 35,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [203, 60, 255] },
        })

        doc.save(
          `spectator-redemptions-${
            selectedEvent?.name || 'all-events'
          }-${new Date().toISOString().slice(0, 10)}.pdf`
        )
      } catch (error) {
        enqueueSnackbar('Error generating PDF. Please try again.', {
          variant: 'error',
        })
      }
    }
  }

  if (filteredRedemptions.length === 0) return null

  return (
    <div className='flex space-x-3'>
      <button
        className='text-sm bg-[#0A1330] hover:bg-[#0A1330]/80 text-white px-4 py-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed'
        onClick={() => handleExport('pdf')}
        disabled={filteredRedemptions.length === 0}
      >
        <Download size={16} className='mr-2' />
        Export PDF
      </button>
      <button
        className='text-sm bg-[#0A1330] hover:bg-[#0A1330]/80 text-white px-4 py-2 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed'
        onClick={() => handleExport('csv')}
        disabled={filteredRedemptions.length === 0}
      >
        <Download size={16} className='mr-2' />
        Export CSV
      </button>
    </div>
  )
}