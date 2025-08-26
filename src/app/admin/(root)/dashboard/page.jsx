'use client'
import React, { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { API_BASE_URL } from '../../../../constants'
import Loader from '../../../_components/Loader'
import DashboardStats from './_components/DashboardStats'
import DashboardGraphs from './_components/DashboardGraphs'
import DashboardTables from './_components/DashboardTables'
import ExportControls from './_components/ExportControls'

// Main Dashboard Page
export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [activeFilter, setActiveFilter] = useState('monthly')

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const currentDate = new Date()
      const endDate = currentDate.toISOString().split('T')[0]

      let startDateObj = new Date()

      if (activeFilter === 'monthly') {
        // First day of current month
        startDateObj = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        )
      } else if (activeFilter === 'weekly') {
        // Last 7 days (including today)
        startDateObj.setDate(currentDate.getDate() - 6)
      } else if (activeFilter === 'daily') {
        // Today only
        startDateObj = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        )
      }

      const startDate = startDateObj.toISOString().split('T')[0]

      const response = await fetch(
        `${API_BASE_URL}/dashboard?startDate=${startDate}&endDate=${endDate}`
      )
      const result = await response.json()

      if (result.success) {
        setDashboardData(result.data)
        setLastUpdated(new Date())
        setError(null)
      } else {
        setError(result.message || 'Failed to fetch dashboard data')
      }
    } catch (err) {
      setError('Error connecting to server')
      console.error('Dashboard API Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [activeFilter])

  const handleRefresh = () => {
    fetchDashboardData()
  }

  if (error) {
    return (
      <div className='bg-slate-950 min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-red-400 text-lg mb-4'>
            Error loading dashboard
          </div>
          <div className='text-slate-400 mb-4'>{error}</div>
          <button
            onClick={handleRefresh}
            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded'
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className='bg-slate-950 min-h-screen flex items-center justify-center'>
        <Loader />
      </div>
    )
  }

  return (
    <div className='bg-slate-950 min-h-screen'>
      <div className='container mx-auto'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6'>
          <h1 className='text-xl sm:text-2xl font-bold text-white'>
            Dashboard
          </h1>
          <div className='flex items-center gap-4'>
            {loading && (
              <div className='flex items-center gap-2 text-slate-400'>
                <RefreshCw size={16} className='animate-spin' />
                <span className='text-sm'>Loading...</span>
              </div>
            )}
            <div className='text-sm text-slate-400'>
              Last updated: {lastUpdated.toLocaleDateString()} at{' '}
              {lastUpdated.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>

        <ExportControls
          onRefresh={handleRefresh}
          loading={loading}
          dashboardData={dashboardData}
        />
        <DashboardStats dashboardData={dashboardData} />
        <DashboardGraphs
          dashboardData={dashboardData}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
        <DashboardTables
          dashboardData={dashboardData}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  )
}