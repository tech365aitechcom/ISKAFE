'use client'

import React, { useEffect, useState } from 'react'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf'

// ✅ Point to the locally served worker file
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

const PdfViewer = ({ pdfUrl }) => {
  const [textContent, setTextContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const loadingTask = getDocument(pdfUrl)
        const pdf = await loadingTask.promise

        let fullText = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          const text = content.items.map((item) => item.str).join(' ')
          fullText += `\n\n${text}`
        }

        setTextContent(fullText)
      } catch (err) {
        console.error(err)
        setError('Failed to load PDF')
      } finally {
        setLoading(false)
      }
    }

    if (pdfUrl) loadPdf()
  }, [pdfUrl])

  if (loading) return <p className='text-gray-300'>Loading PDF...</p>
  if (error) return <p className='text-red-500'>{error}</p>

  return (
    <div className='text-gray-200 leading-relaxed text-lg flex flex-col'>
      {textContent}
      <a
        href={pdfUrl}
        target='_blank'
        rel='noopener noreferrer'
        className='mt-4 text-base text-blue-500 underline w-fit'
      >
        Click to View Rules
      </a>
    </div>
  )
}

export default PdfViewer
