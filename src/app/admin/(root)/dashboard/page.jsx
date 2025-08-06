// src/app/dashboard/page.jsx
'use client'
import React, { useState, useEffect } from 'react'
import {
  Users,
  Calendar,
  Sword,
  Ticket,
  MapPin,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Mail,
  RefreshCw,
  ChevronDown,
  Circle,
  BarChart2,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  ShieldAlert,
  Clock,
  Flag,
  User,
  GanttChart,
  CreditCard,
  MapIcon,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  PieChart,
  Bar,
  Line,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

// Top Cards Component
function DashboardStats({ dashboardData }) {
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

  if (!dashboardData) {
    return (
      <div className='flex flex-wrap gap-4 w-full bg-slate-950 p-6'>
        <div className='flex-1 min-w-64 bg-slate-900 rounded-xl border border-slate-800 p-5 animate-pulse'>
          <div className='h-4 bg-slate-800 rounded mb-2'></div>
          <div className='h-8 bg-slate-800 rounded'></div>
        </div>
      </div>
    )
  }

  const stats = [
    {
      id: 1,
      title: 'Total Fighters',
      value: formatValue(dashboardData.totalFightersData.total),
      icon: Users,
      breakdown: {
        male: dashboardData.totalFightersData.genderSplit.male,
        female: dashboardData.totalFightersData.genderSplit.female,
        other: dashboardData.totalFightersData.genderSplit.other,
      },
    },
    {
      id: 2,
      title: 'Total Events',
      value: dashboardData.totalEvents.toString(),
      icon: Calendar,
    },
    {
      id: 3,
      title: 'Bouts Today',
      value: dashboardData.todaysBoutCount.toString(),
      live: true,
      icon: Sword,
    },
    {
      id: 4,
      title: 'Total Revenue',
      value: formatCurrency(dashboardData.totalRevenue),
      icon: DollarSign,
    },
    {
      id: 5,
      title: 'Tickets Sold',
      value: dashboardData.totalTickets.toString(),
      icon: Ticket,
    },
    {
      id: 6,
      title: 'Total Venues',
      value: dashboardData.totalVenues.toString(),
      icon: MapPin,
      hasMap: true,
    },
  ]

  return (
    <div className='flex flex-wrap gap-4 w-full bg-slate-950 p-6'>
      {stats.map((stat) => (
        <div
          key={stat.id}
          className='flex-1 min-w-64 bg-slate-900 rounded-xl border border-slate-800 p-5 relative overflow-hidden'
        >
          <div className='flex justify-between items-center mb-2'>
            <div className='flex items-center gap-2 text-slate-400'>
              <stat.icon size={16} />
              <span className='text-sm'>{stat.title}</span>
            </div>
            {stat.live && (
              <span className='text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded flex items-center'>
                <div className='w-2 h-2 rounded-full bg-red-500 mr-1 animate-pulse'></div>
                LIVE
              </span>
            )}
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-3xl font-bold text-white'>{stat.value}</span>
            {stat.change && (
              <div
                className={`px-1 py-0.5 rounded flex items-center text-xs ${
                  stat.increase
                    ? 'text-emerald-500 border border-[#05C16833] bg-[#05C16833]'
                    : 'text-rose-500 border border-[#FF5A6533] bg-[#FF5A6533]'
                }`}
              >
                {stat.increase ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
                <span>{stat.change}%</span>
              </div>
            )}
          </div>

          {stat.breakdown && (
            <div className='mt-2 flex gap-2 text-xs text-slate-500'>
              {Object.entries(stat.breakdown).map(([key, value]) => (
                <span key={key}>
                  {key}: {value.toLocaleString()}
                </span>
              ))}
            </div>
          )}

          {stat.statuses && (
            <div className='flex gap-2 mt-3'>
              {Object.entries(stat.statuses).map(([status, count]) => (
                <div key={status} className='flex items-center gap-1'>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      status === 'upcoming'
                        ? 'bg-blue-500'
                        : status === 'ongoing'
                        ? 'bg-emerald-500'
                        : 'bg-slate-600'
                    }`}
                  ></div>
                  <span className='text-xs text-slate-400'>
                    {count} {status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {stat.hasMap && (
            <div className='mt-2 flex items-center gap-2 text-xs text-slate-500'>
              <MapIcon size={12} className='text-blue-400' />
              <span>View on map</span>
            </div>
          )}

          <div className='absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-xl bg-[#0B1739]' />
        </div>
      ))}
    </div>
  )
}

// Graphs Section
function DashboardGraphs({ dashboardData }) {
  const [activeFilter, setActiveFilter] = useState('monthly')

  if (!dashboardData) {
    return (
      <div className='bg-slate-900 p-6 rounded-xl m-6'>
        <div className='animate-pulse'>
          <div className='h-6 bg-slate-800 rounded mb-6 w-48'></div>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {[...Array(6)].map((_, i) => (
              <div key={i} className='bg-slate-800 p-4 rounded-lg'>
                <div className='h-4 bg-slate-700 rounded mb-4 w-32'></div>
                <div className='h-64 bg-slate-700 rounded'></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Event participation data - format API data
  const participationData = dashboardData.eventParticipationTrend.map(
    (item) => ({
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      count: item.count,
    })
  )

  // Ticket types data - format API data
  const ticketTypes = dashboardData.ticketTypeBreakdown.map((item, index) => {
    const colors = [
      '#3b82f6',
      '#8b5cf6',
      '#ec4899',
      '#f43f5e',
      '#10b981',
      '#f59e0b',
    ]
    return {
      name: item.type,
      value: item.count,
      color: colors[index % colors.length],
    }
  })

  // Daily ticket sales - format API data
  const dailySales = dashboardData.dailyTicketSales.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    sales: item.count,
  }))

  // Revenue vs redemption - format API data
  const revenueData = dashboardData.redemptionStats.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    revenue: item.totalRevenue,
    redemption: item.redeemedRevenue,
  }))

  // Weight class distribution - format API data
  const weightClasses = dashboardData.weightClassDistribution.map((item) => ({
    class: item.weightClass.split(' (')[0], // Remove weight details for display
    male: item.male,
    female: item.female,
    other: item.other,
  }))

  // Bout progress - format API data
  const completedPercent = parseFloat(dashboardData.boutProgress.completed)
  const pendingPercent = parseFloat(dashboardData.boutProgress.pending)
  const boutProgress = [
    { name: 'Completed', value: completedPercent, color: '#10b981' },
    { name: 'Pending', value: pendingPercent, color: '#f59e0b' },
  ]

  return (
    <div className='bg-slate-900 p-6 rounded-xl m-6'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold'>Event Analytics</h2>
        <div className='flex items-center gap-4'>
          <div className='flex gap-2 bg-slate-800 rounded-lg p-1'>
            {['daily', 'weekly', 'monthly'].map((filter) => (
              <button
                key={filter}
                className={`px-3 py-1 rounded-md text-sm ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
          <button className='flex items-center gap-2 text-slate-400 hover:text-white text-sm'>
            <Filter size={16} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Event Participation Trend */}
        <div className='lg:col-span-2 bg-slate-800 p-4 rounded-lg'>
          <div className='flex items-center gap-2 mb-4 text-slate-300'>
            <LineChartIcon size={16} />
            <h3 className='font-medium'>Event Participation Trend</h3>
          </div>
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={participationData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
                <XAxis
                  dataKey='date'
                  stroke='#64748b'
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis stroke='#64748b' tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    borderRadius: '0.375rem',
                  }}
                />
                <Line
                  type='monotone'
                  dataKey='count'
                  stroke='#22d3ee'
                  strokeWidth={2}
                  activeDot={{ r: 6, fill: '#082f49' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Types Breakdown */}
        <div className='bg-slate-800 p-4 rounded-lg'>
          <div className='flex items-center gap-2 mb-4 text-slate-300'>
            <PieChartIcon size={16} />
            <h3 className='font-medium'>Ticket Types Breakdown</h3>
          </div>
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={ticketTypes}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='value'
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {ticketTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    borderRadius: '0.375rem',
                  }}
                  formatter={(value) => [value, 'Tickets']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Ticket Sales */}
        <div className='bg-slate-800 p-4 rounded-lg'>
          <div className='flex items-center gap-2 mb-4 text-slate-300'>
            <LineChart size={16} />
            <h3 className='font-medium'>Daily Ticket Sales</h3>
          </div>
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
                <XAxis
                  dataKey='date'
                  stroke='#64748b'
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis stroke='#64748b' tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    borderRadius: '0.375rem',
                  }}
                />
                <Bar dataKey='sales' fill='#8b5cf6' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue vs Redemption */}
        <div className='lg:col-span-2 bg-slate-800 p-4 rounded-lg'>
          <div className='flex items-center gap-2 mb-4 text-slate-300'>
            <BarChart2 size={16} />
            <h3 className='font-medium'>Revenue vs Redemption</h3>
          </div>
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
                <XAxis
                  dataKey='date'
                  stroke='#64748b'
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis stroke='#64748b' tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    borderRadius: '0.375rem',
                  }}
                />
                <Legend />
                <Bar dataKey='revenue' fill='#10b981' name='Revenue ($)' />
                <Bar dataKey='redemption' fill='#f59e0b' name='Redeemed ($)' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bout Result Progress Tracker */}
        <div className='bg-slate-800 p-4 rounded-lg'>
          <div className='flex items-center gap-2 mb-4 text-slate-300'>
            <GanttChart size={16} />
            <h3 className='font-medium'>Bout Result Progress</h3>
          </div>
          <div className='flex flex-col items-center justify-center h-64'>
            <div className='relative w-48 h-48'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={boutProgress}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey='value'
                  >
                    {boutProgress.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className='absolute inset-0 flex flex-col items-center justify-center'>
                <span className='text-3xl font-bold'>
                  {completedPercent.toFixed(0)}%
                </span>
                <span className='text-slate-400 text-sm'>Completed</span>
              </div>
            </div>
            <div className='flex gap-4 mt-4'>
              {boutProgress.map((item) => (
                <div key={item.name} className='flex items-center gap-2'>
                  <div
                    className='w-3 h-3 rounded-full'
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className='text-sm text-slate-400'>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weight Class Distribution */}
        <div className='lg:col-span-3 bg-slate-800 p-4 rounded-lg'>
          <div className='flex items-center gap-2 mb-4 text-slate-300'>
            <BarChart2 size={16} />
            <h3 className='font-medium'>Weight Class Distribution</h3>
          </div>
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={weightClasses}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
                <XAxis
                  dataKey='class'
                  stroke='#64748b'
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis stroke='#64748b' tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    borderRadius: '0.375rem',
                  }}
                />
                <Legend />
                <Bar dataKey='male' stackId='a' fill='#3b82f6' name='Male' />
                <Bar
                  dataKey='female'
                  stackId='a'
                  fill='#ec4899'
                  name='Female'
                />
                <Bar dataKey='other' stackId='a' fill='#10b981' name='Other' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tables Section
function DashboardTables({ dashboardData }) {
  const [selectedAction, setSelectedAction] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)

  const handleAddResult = (bout) => {
    setSelectedItem(bout)
    setSelectedAction('addResult')
    // TODO: Open Add Result modal
    alert(
      `Add result for bout ${bout.id}: ${bout.fighter1} vs ${bout.fighter2}`
    )
  }

  const handleFixFighter = (fighter) => {
    setSelectedItem(fighter)
    setSelectedAction('fix')
    // TODO: Open Fix Fighter modal
    alert(`Fix issues for fighter: ${fighter.name} - ${fighter.issue}`)
  }

  const handleSuspendFighter = (fighter) => {
    setSelectedItem(fighter)
    setSelectedAction('suspend')
    // TODO: Open Suspend Fighter modal
    alert(`Suspend fighter: ${fighter.name} - ${fighter.issue}`)
  }

  const handleViewProfile = (fighter) => {
    setSelectedItem(fighter)
    setSelectedAction('viewProfile')
    // TODO: Navigate to fighter profile
    alert(`View profile for fighter: ${fighter.name}`)
  }

  const handleManageBrackets = (event) => {
    setSelectedItem(event)
    setSelectedAction('manageBrackets')
    // TODO: Navigate to bracket management
    alert(`Manage brackets for event: ${event.name}`)
  }

  const handleViewDetails = (ticket) => {
    setSelectedItem(ticket)
    setSelectedAction('viewDetails')
    // TODO: Open ticket details modal
    alert(`View details for ticket: ${ticket.type} - ${ticket.event}`)
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
        <h2 className='text-xl font-semibold'>Operational Data</h2>
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
            onClick={() =>
              alert(
                'PDF export functionality will be implemented with a PDF library'
              )
            }
            className='flex items-center gap-2 text-slate-400 hover:text-white text-sm'
          >
            <Download size={16} />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() =>
              alert(
                'Email report functionality will be implemented with email service integration'
              )
            }
            className='flex items-center gap-2 text-slate-400 hover:text-white text-sm'
          >
            <Mail size={16} />
            <span>Email Report</span>
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Upcoming Events */}
        <div className='bg-slate-800 p-4 rounded-lg'>
          <div className='flex items-center gap-2 mb-4 text-slate-300'>
            <Calendar size={16} />
            <h3 className='font-medium'>Upcoming Events</h3>
          </div>
          <div className='overflow-x-auto'>
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
                {upcomingEvents.map((event, index) => (
                  <tr
                    key={event.id || event._id || `event-${index}`}
                    className='border-b border-slate-700 hover:bg-slate-750'
                  >
                    <td className='px-4 py-3 font-medium text-white'>
                      {event.eventName || event.name}
                    </td>
                    <td className='px-4 py-3'>{event.eventDate ? new Date(event.eventDate).toLocaleDateString() : (event.date ? new Date(event.date).toLocaleDateString() : 'N/A')}</td>
                    <td className='px-4 py-3'>{event.venueName || (event.venue?.name || event.venue)}</td>
                    <td className='px-4 py-3'>{event.fighterCount || event.fighters}</td>
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
        <div className='bg-slate-800 p-4 rounded-lg'>
          <div className='flex items-center gap-2 mb-4 text-slate-300'>
            <User size={16} />
            <h3 className='font-medium'>Recent Fighter Registrations</h3>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm text-left text-slate-400'>
              <thead className='text-xs uppercase bg-slate-700 text-slate-400'>
                <tr>
                  <th scope='col' className='px-4 py-3'>
                    Name
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Age
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
                      {fighter.fighterName || fighter.name}
                    </td>
                    <td className='px-4 py-3'>{fighter.age}</td>
                    <td className='px-4 py-3'>{fighter.weightClass || fighter.class}</td>
                    <td className='px-4 py-3'>{fighter.gymName || (fighter.gym?.name || fighter.gym)}</td>
                    <td className='px-4 py-3'>{fighter.registrationDate ? new Date(fighter.registrationDate).toLocaleDateString() : (fighter.date ? new Date(fighter.date).toLocaleDateString() : 'N/A')}</td>
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
        <div className='bg-slate-800 p-4 rounded-lg'>
          <div className='flex items-center gap-2 mb-4 text-slate-300'>
            <Clock size={16} />
            <h3 className='font-medium'>Bouts Missing Results</h3>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm text-left text-slate-400'>
              <thead className='text-xs uppercase bg-slate-700 text-slate-400'>
                <tr>
                  <th scope='col' className='px-4 py-3'>
                    Bout ID
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
                    key={bout.id || bout._id || bout.boutId || `bout-${index}`}
                    className='border-b border-slate-700 hover:bg-slate-750'
                  >
                    <td className='px-4 py-3 font-medium text-white'>
                      {bout.boutId || bout.id}
                    </td>
                    <td className='px-4 py-3'>{bout.fighter1Name || bout.fighter1}</td>
                    <td className='px-4 py-3'>{bout.fighter2Name || bout.fighter2}</td>
                    <td className='px-4 py-3'>{bout.scheduledTime || bout.time}</td>
                    <td className='px-4 py-3'>
                      <button
                        onClick={() => handleAddResult(bout)}
                        className='bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-sm'
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
        <div className='bg-slate-800 p-4 rounded-lg'>
          <div className='flex items-center gap-2 mb-4 text-slate-300'>
            <ShieldAlert size={16} />
            <h3 className='font-medium'>Fighters with Alerts</h3>
          </div>
          <div className='overflow-x-auto'>
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
                    <td className='px-4 py-3'>{fighter.alertType || fighter.issue}</td>
                    <td className='px-4 py-3'>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          (fighter.alertLevel || fighter.status) === 'Critical'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {fighter.alertLevel || fighter.status}
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
                    Time
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {ticketLogs.map((ticket, index) => (
                  <tr
                    key={ticket.id || ticket._id || `ticket-${index}`}
                    className='border-b border-slate-700 hover:bg-slate-750'
                  >
                    <td className='px-4 py-3 font-medium text-white'>
                      {ticket.ticketType || ticket.type}
                    </td>
                    <td className='px-4 py-3'>{ticket.quantity || ticket.qty}</td>
                    <td className='px-4 py-3'>{ticket.totalAmount ? `$${ticket.totalAmount}` : ticket.revenue}</td>
                    <td className='px-4 py-3'>{ticket.eventName || (ticket.event?.name || ticket.event)}</td>
                    <td className='px-4 py-3'>{ticket.purchaseTime ? new Date(ticket.purchaseTime).toLocaleString() : (ticket.time ? new Date(ticket.time).toLocaleString() : 'N/A')}</td>
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
      </div>
    </div>
  )
}

// Export functionality
const exportToCSV = (dashboardData) => {
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

const exportToPDF = (dashboardData) => {
  if (!dashboardData) return
  alert(
    'PDF export functionality will be implemented with a PDF library like jsPDF or react-pdf'
  )
}

const sendEmailReport = (dashboardData) => {
  if (!dashboardData) return
  alert(
    'Email report functionality will be implemented with email service integration'
  )
}

// Export Controls
function ExportControls({ onRefresh, loading, dashboardData }) {
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

          <div className='relative group'>
            <button className='flex items-center gap-2 text-slate-300 hover:text-white text-sm px-3 py-1.5 bg-slate-800 rounded-md'>
              <Download size={16} />
              <span>Export</span>
              <ChevronDown size={16} />
            </button>
            <div className='absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg hidden group-hover:block'>
              <button
                onClick={() => exportToCSV(dashboardData)}
                className='w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2'
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => exportToPDF(dashboardData)}
                className='w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2'
              >
                <Download size={14} />
                <span>Export PDF</span>
              </button>
              <button
                onClick={() => sendEmailReport(dashboardData)}
                className='w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2'
              >
                <Mail size={14} />
                <span>Email Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Dashboard Page
export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const currentDate = new Date()
      const startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      )
        .toISOString()
        .split('T')[0]
      const endDate = currentDate.toISOString().split('T')[0]

      const response = await fetch(
        `http://localhost:5000/api/dashboard?startDate=${startDate}&endDate=${endDate}`
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
  }, [])

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

  return (
    <div className='bg-slate-950 min-h-screen'>
      <div className='container mx-auto'>
        <div className='flex justify-between items-center p-6'>
          <h1 className='text-2xl font-bold text-white'>IKF Admin Dashboard</h1>
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
        <DashboardGraphs dashboardData={dashboardData} />
        <DashboardTables dashboardData={dashboardData} />
      </div>
    </div>
  )
}
