import React from 'react'
import { Camera } from 'lucide-react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { enqueueSnackbar } from 'notistack'

export default function QRScanner({
  setRedeemCode,
  events,
  setSelectedEvent,
  setShowRedemptionPanel,
  setActiveTab,
  setRedeemedByScan
}) {
  const handleScan = () => {
    const modal = document.createElement('div')
    modal.id = 'qr-scanner-modal'
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.9); z-index: 9999; 
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 20px;
    `

    const scannerContainer = document.createElement('div')
    scannerContainer.id = 'qr-reader'
    scannerContainer.style.cssText = `
      width: 100%; max-width: 500px; height: 400px;
      border: 3px solid #CB3CFF; border-radius: 10px; 
      background: #000; position: relative;
    `

    const instructions = document.createElement('div')
    instructions.style.cssText =
      'color: white; text-align: center; margin: 20px 0; font-size: 16px;'
    instructions.innerHTML = '<p>Position QR code within the camera view</p>'

    const buttons = document.createElement('div')
    buttons.style.cssText = 'display: flex; gap: 15px; margin-top: 20px;'

    const manualButton = document.createElement('button')
    manualButton.textContent = 'Manual Entry'
    manualButton.style.cssText = `
      background: linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%);
      color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;
    `

    const cancelButton = document.createElement('button')
    cancelButton.textContent = 'Cancel'
    cancelButton.style.cssText = `
      background: #666; color: white; padding: 10px 20px; 
      border: none; border-radius: 5px; cursor: pointer;
    `

    let html5QrcodeScanner = null

    const onScanSuccess = (decodedText, decodedResult) => {
      console.log(`QR Code scanned: ${decodedText}`)

      let ticketCode = decodedText
      let eventInfo = null

      try {
        const qrData = JSON.parse(decodedText)
        if (qrData.ticketCode) {
          ticketCode = qrData.ticketCode
        }
        if (qrData.eventId) {
          eventInfo = qrData.eventId
        }
      } catch (e) {
        // If not JSON, use the raw text as ticket code
      }

      setRedeemCode(ticketCode)
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(console.error)
      }
      document.body.removeChild(modal)

      if (eventInfo) {
        const foundEvent = events.find(
          (event) => event.id === eventInfo || event.eventId === eventInfo
        )
        if (foundEvent) {
          setSelectedEvent(foundEvent)
          setShowRedemptionPanel(true)
          setActiveTab('redeem')
        }
      }

      enqueueSnackbar(
        `QR code scanned successfully! Ticket code: ${ticketCode}`,
        {
          variant: 'success',
        }
      )
      setRedeemedByScan(true)
    }

    const onScanError = (errorMessage) => {
      // Ignore frequent scan errors, they're normal when no QR code is visible
    }

    const cleanup = () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(console.error)
      }
      if (modal.styleElement) {
        document.head.removeChild(modal.styleElement)
      }
      document.body.removeChild(modal)
    }

    manualButton.onclick = cleanup
    cancelButton.onclick = cleanup

    buttons.appendChild(manualButton)
    buttons.appendChild(cancelButton)
    modal.appendChild(instructions)
    modal.appendChild(scannerContainer)
    modal.appendChild(buttons)
    document.body.appendChild(modal)

    setTimeout(() => {
      const style = document.createElement('style')
      style.textContent = `
        #qr-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
        }
        #qr-reader__dashboard_section_csr {
          background: rgba(0,0,0,0.8) !important;
          color: white !important;
          border-radius: 0 0 10px 10px !important;
        }
        #qr-reader__dashboard_section_csr > div {
          color: white !important;
        }
      `
      document.head.appendChild(style)

      html5QrcodeScanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          rememberLastUsedCamera: true,
          supportedScanTypes: [0], // Only QR codes
        },
        false
      )
      html5QrcodeScanner.render(onScanSuccess, onScanError)

      modal.styleElement = style
    }, 200)
  }

  return (
    <div className='mb-8'>
      <h2 className='text-lg font-medium mb-3'>Scan QR Code</h2>
      <p className='text-gray-300 mb-4'>
        Use your device camera to scan the spectator's ticket QR code
      </p>
      <button
        style={{
          background:
            'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
        }}
        className='text-white py-2 px-4 rounded flex items-center hover:opacity-90'
        onClick={handleScan}
      >
        <Camera size={18} className='mr-2' />
        Scan with Device Camera
      </button>
    </div>
  )
}