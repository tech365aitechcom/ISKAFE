import React, { useState } from 'react'
import { RefreshCw, Download, ChevronDown, Mail } from 'lucide-react'
import { exportToCSV, exportToPDF, sendEmailReport } from '../utils/dashboardUtils'

export default function ExportControls({ onRefresh, loading, dashboardData }) {
  const [showExportMenu, setShowExportMenu] = useState(false)

  return (
    <div className='fixed top-4 right-6 z-50'>
      <div className='bg-slate-900 border border-slate-700 rounded-lg shadow-lg p-3'>
        <div className='flex items-center gap-3'>
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`flex items-center gap-2 text-slate-300 hover:text-white text-sm px-3 py-1.5 bg-slate-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <div className='relative'>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className='flex items-center gap-2 text-slate-300 hover:text-white text-sm px-3 py-1.5 bg-slate-800 rounded-md'
            >
              <Download size={16} />
              <span>Export</span>
              <ChevronDown
                size={16}
                className={showExportMenu ? 'rotate-180' : ''}
              />
            </button>
            {showExportMenu && (
              <div className='absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-10'>
                <button
                  onClick={() => {
                    exportToCSV(dashboardData)
                    setShowExportMenu(false)
                  }}
                  className='w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2'
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => {
                    exportToPDF(dashboardData)
                    setShowExportMenu(false)
                  }}
                  className='w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2'
                >
                  <Download size={14} />
                  <span>Export PDF</span>
                </button>
                <button
                  onClick={() => {
                    sendEmailReport(dashboardData)
                    setShowExportMenu(false)
                  }}
                  className='w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2'
                >
                  <Mail size={14} />
                  <span>Email Report</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}